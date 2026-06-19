export type UserRole = "owner" | "teacher" | "student";

export const isStaff = (role: UserRole) =>
  role === "owner" || role === "teacher";

export const isOwner = (role: UserRole) => role === "owner";

/** Landing path after login per role (all share the /app dashboard for now). */
export const homePathForRole = (_role: UserRole) => "/app";
