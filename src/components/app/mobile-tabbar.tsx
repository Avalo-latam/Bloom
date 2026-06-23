"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IcHome,
  IcStudents,
  IcBook,
  IcCalendar,
  IcHomework,
  IcProgress,
  IcWallet,
} from "@/components/brand/icons";
import type { UserRole } from "@/lib/roles";
import type { BloomIcon } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Tab = { href: string; labelKey: string; icon: BloomIcon };

const STUDENT: Tab[] = [
  { href: "/app", labelKey: "dashboard", icon: IcHome },
  { href: "/app/curriculum", labelKey: "curriculum", icon: IcBook },
  { href: "/app/homework", labelKey: "homework", icon: IcHomework },
  { href: "/app/progress", labelKey: "progress", icon: IcProgress },
  { href: "/app/payments", labelKey: "payments", icon: IcWallet },
];
const STAFF: Tab[] = [
  { href: "/app", labelKey: "dashboard", icon: IcHome },
  { href: "/app/students", labelKey: "students", icon: IcStudents },
  { href: "/app/curriculum", labelKey: "curriculum", icon: IcBook },
  { href: "/app/schedule", labelKey: "schedule", icon: IcCalendar },
  { href: "/app/payments", labelKey: "payments", icon: IcWallet },
];

export function MobileTabBar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tabs = role === "student" ? STUDENT : STAFF;

  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-30 flex border-t border-border/60 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map(({ href, labelKey, icon: Icon }) => {
        const active =
          href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("size-5", active && "text-primary")} />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
