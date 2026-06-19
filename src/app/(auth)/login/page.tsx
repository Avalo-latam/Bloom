import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { BloomLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { AuthForm } from "@/components/auth/auth-form";
import { LEVEL_CODES } from "@/lib/levels";
import { LevelBadge } from "@/components/level-badge";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  const t = await getTranslations("landing");
  const tb = await getTranslations("brand");

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="bg-bloom relative hidden flex-col justify-between p-10 lg:flex">
        <BloomLogo />
        <div>
          <h2 className="max-w-md text-balance font-heading text-3xl font-extrabold leading-tight">
            {t("heroTitleA")}{" "}
            <span className="text-gradient">{t("heroTitleHi")}</span>{" "}
            {t("heroTitleB")}
          </h2>
          <p className="mt-3 max-w-sm text-muted-foreground">{tb("tagline")}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {LEVEL_CODES.map((code) => (
              <LevelBadge key={code} code={code} />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">© Bloom English</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="lg:hidden">
              <BloomLogo showText={false} />
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="mb-1 font-heading text-2xl font-bold">
            {tb("name")}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">{tb("tagline")}</p>
          <AuthForm />
        </div>
      </main>
    </div>
  );
}
