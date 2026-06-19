import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Gamepad2, LineChart } from "lucide-react";
import { BloomLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LevelBadge } from "@/components/level-badge";
import { Button } from "@/components/ui/button";
import { LEVEL_CODES } from "@/lib/levels";

export default function LandingPage() {
  const t = useTranslations("landing");

  const features = [
    { icon: BookOpen, title: t("feature1Title"), body: t("feature1Body") },
    { icon: Gamepad2, title: t("feature2Title"), body: t("feature2Body") },
    { icon: LineChart, title: t("feature3Title"), body: t("feature3Body") },
  ];

  return (
    <div className="bg-bloom flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <BloomLogo />
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1">
            <Link href="/login">{t("loginCta")}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5">
        <section className="flex flex-col items-center pt-12 pb-16 text-center sm:pt-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
            🌱 Ms. Pau &amp; Ms. Jime
          </span>
          <h1 className="max-w-3xl text-balance font-heading text-4xl font-extrabold leading-[1.1] sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                {t("heroPrimary")} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#levels">{t("heroSecondary")}</Link>
            </Button>
          </div>

          <div
            id="levels"
            className="mt-12 flex flex-wrap items-center justify-center gap-2 scroll-mt-24"
          >
            {LEVEL_CODES.map((code) => (
              <LevelBadge key={code} code={code} size="lg" />
            ))}
          </div>
        </section>

        <section className="grid gap-5 pb-24 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl bg-card/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur dark:ring-white/10"
            >
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-heading text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bloom English
      </footer>
    </div>
  );
}
