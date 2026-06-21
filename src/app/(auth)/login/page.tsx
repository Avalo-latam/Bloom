import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { BloomLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { AuthForm } from "@/components/auth/auth-form";
import { HeroBackdrop } from "@/components/brand/hero-backdrop";
import { BloomScene } from "@/components/brand/illustrations";
import { LEVEL_CODES } from "@/lib/levels";
import { LevelBadge } from "@/components/level-badge";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  const t = await getTranslations("landing");
  const tb = await getTranslations("brand");
  const ta = await getTranslations("auth");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel */}
      <aside className="bg-bloom relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <HeroBackdrop />
        <BloomLogo />

        <div className="relative">
          <div className="mx-auto mb-8 max-w-sm">
            <div className="animate-float">
              <BloomScene />
            </div>
          </div>
          <h2 className="max-w-md text-balance font-heading text-4xl font-extrabold leading-[1.1]">
            {t("heroTitleA")}{" "}
            <span className="text-gradient">{t("heroTitleHi")}</span>{" "}
            {t("heroTitleB")}
          </h2>
          <p className="mt-4 max-w-sm text-lg text-muted-foreground">
            {tb("tagline")}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {LEVEL_CODES.map((code) => (
              <LevelBadge key={code} code={code} size="lg" />
            ))}
          </div>
        </div>

        <p className="relative text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bloom English
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-brand-mint/10 via-background to-brand-lila/10 px-5 py-6">
        <div className="relative flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="lg:hidden">
              <BloomLogo showText={false} />
            </span>
            <span className="hidden lg:inline">{t("loginCta")}</span>
          </Link>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="mb-7 text-center lg:text-left">
            <span className="lg:hidden">
              <BloomLogo className="mb-4 justify-center" />
            </span>
            <h1 className="font-heading text-3xl font-bold">{ta("welcome")}</h1>
            <p className="mt-1.5 text-muted-foreground">{tb("tagline")}</p>
          </div>
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <AuthForm />
          </div>
        </div>
      </main>
    </div>
  );
}
