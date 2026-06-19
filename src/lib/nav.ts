import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Users,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LineChart,
  Wallet,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/roles";

export type NavItem = {
  href: string;
  /** translation key under the "nav" namespace */
  labelKey: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const ALL: UserRole[] = ["owner", "teacher", "student"];
const STAFF: UserRole[] = ["owner", "teacher"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/app", labelKey: "dashboard", icon: LayoutDashboard, roles: ALL },
  { href: "/app/students", labelKey: "students", icon: Users, roles: STAFF },
  { href: "/app/curriculum", labelKey: "curriculum", icon: BookOpen, roles: ALL },
  { href: "/app/schedule", labelKey: "schedule", icon: CalendarDays, roles: ALL },
  { href: "/app/homework", labelKey: "homework", icon: ClipboardList, roles: ALL },
  { href: "/app/exams", labelKey: "exams", icon: FileCheck2, roles: ALL },
  { href: "/app/grades", labelKey: "grades", icon: GraduationCap, roles: ALL },
  { href: "/app/progress", labelKey: "progress", icon: LineChart, roles: ["student"] },
  { href: "/app/payments", labelKey: "payments", icon: Wallet, roles: ALL },
  { href: "/app/settings", labelKey: "settings", icon: Settings, roles: ["owner"] },
];

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
