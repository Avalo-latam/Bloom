import { getTranslations } from "next-intl/server";
import { BloomLogo } from "@/components/brand/logo";
import { NavLinks } from "@/components/app/nav-links";
import { MobileNav } from "@/components/app/mobile-nav";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NotificationsBell } from "@/components/app/notifications-bell";
import { getProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const t = await getTranslations("roles");
  const name = profile.full_name || profile.email || "Bloom";

  return (
    <div className="flex min-h-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <BloomLogo className="px-2 pt-1" />
        <NavLinks role={profile.role} />
        <div className="mt-auto px-2 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bloom English
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <MobileNav role={profile.role} />
          <div className="flex-1" />
          <LocaleSwitcher />
          <ThemeToggle />
          <NotificationsBell />
          <UserMenu
            name={name}
            email={profile.email ?? ""}
            avatarUrl={profile.avatar_url}
            roleLabel={t(profile.role)}
          />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
