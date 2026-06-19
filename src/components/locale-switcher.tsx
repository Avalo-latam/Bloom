"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setUserLocale } from "@/i18n/locale";
import { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    const next: Locale = locale === "es" ? "en" : "es";
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={pending}
      className="gap-1.5 font-medium uppercase"
      aria-label="Language"
    >
      <Languages className="size-4" />
      {locale}
    </Button>
  );
}
