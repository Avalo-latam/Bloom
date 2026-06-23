import {
  IcHome,
  IcStudents,
  IcBook,
  IcCalendar,
  IcHomework,
  IcExam,
  IcAward,
  IcProgress,
  IcWallet,
  IcSettings,
  IcLibrary,
  IcChat,
} from "@/components/brand/icons";
import type { UserRole } from "@/lib/roles";

export type BloomIcon = (props: { className?: string }) => React.ReactElement;

export type NavItem = {
  href: string;
  /** translation key under the "nav" namespace */
  labelKey: string;
  icon: BloomIcon;
  roles: UserRole[];
};

const ALL: UserRole[] = ["owner", "teacher", "student"];
const STAFF: UserRole[] = ["owner", "teacher"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/app", labelKey: "dashboard", icon: IcHome, roles: ALL },
  { href: "/app/students", labelKey: "students", icon: IcStudents, roles: STAFF },
  { href: "/app/curriculum", labelKey: "curriculum", icon: IcBook, roles: ALL },
  { href: "/app/resources", labelKey: "resources", icon: IcLibrary, roles: ALL },
  { href: "/app/messages", labelKey: "messages", icon: IcChat, roles: ALL },
  { href: "/app/schedule", labelKey: "schedule", icon: IcCalendar, roles: ALL },
  { href: "/app/homework", labelKey: "homework", icon: IcHomework, roles: ALL },
  { href: "/app/exams", labelKey: "exams", icon: IcExam, roles: ALL },
  { href: "/app/grades", labelKey: "grades", icon: IcAward, roles: ALL },
  { href: "/app/progress", labelKey: "progress", icon: IcProgress, roles: ["student"] },
  { href: "/app/payments", labelKey: "payments", icon: IcWallet, roles: ALL },
  { href: "/app/settings", labelKey: "settings", icon: IcSettings, roles: ["owner"] },
];

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
