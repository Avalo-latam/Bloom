import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/roles";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  locale: string;
  teacher_id: string | null;
  phone: string | null;
  is_active: boolean;
};

/**
 * Returns the signed-in user's profile, or redirects to /login.
 * Cached per-request so multiple components share one round-trip.
 */
export const getProfile = cache(async (): Promise<Profile> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, email, avatar_url, locale, teacher_id, phone, is_active",
    )
    .eq("id", user.id)
    .single();

  if (!data) redirect("/login");
  return data as Profile;
});

/** Like getProfile but requires owner/teacher; redirects students to /app. */
export const requireStaff = cache(async (): Promise<Profile> => {
  const profile = await getProfile();
  if (profile.role === "student") redirect("/app");
  return profile;
});
