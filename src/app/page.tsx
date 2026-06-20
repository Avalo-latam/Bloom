import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BloomLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LevelBadge } from "@/components/level-badge";
import { Button } from "@/components/ui/button";
import { Reveal, HoverLift } from "@/components/motion";
import { HeroBackdrop } from "@/components/brand/hero-backdrop";
import { PlansSection } from "@/components/landing/plans";
import {
  BloomScene,
  ArtClassroom,
  ArtGames,
  ArtProgress,
  ArtLevels,
  ArtPhonetics,
  ArtFeedback,
} from "@/components/brand/illustrations";
import { LEVEL_CODES, type LevelCode } from "@/lib/levels";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tl = await getTranslations("levels");

  const features = [
    { Art: ArtClassroom, title: t("f1Title"), body: t("f1Body") },
    { Art: ArtGames, title: t("f2Title"), body: t("f2Body") },
    { Art: ArtProgress, title: t("f3Title"), body: t("f3Body") },
    { Art: ArtLevels, title: t("f4Title"), body: t("f4Body") },
    { Art: ArtPhonetics, title: t("f5Title"), body: t("f5Body") },
    { Art: ArtFeedback, title: t("f6Title"), body: t("f6Body") },
  ];

  const stats = [
    { v: t("stat1"), l: t("stat1l") },
    { v: t("stat2"), l: t("stat2l") },
    { v: t("stat3"), l: t("stat3l") },
  ];

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <BloomLogo />
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
            <Button asChild size="sm" className="ml-1.5 rounded-full px-5">
              <Link href="/login">{t("loginCta")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <HeroBackdrop />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-12 lg:grid-cols-2 lg:pb-24 lg:pt-20">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-leaf opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-brand-leaf" />
                  </span>
                  {t("badge")}
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-5 text-balance font-heading text-4xl font-extrabold leading-[1.05] sm:text-6xl">
                  {t("heroTitleA")}{" "}
                  <span className="text-gradient">{t("heroTitleHi")}</span>{" "}
                  {t("heroTitleB")}
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground lg:mx-0">
                  {t("heroSubtitle")}
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Button asChild size="lg" className="group rounded-full px-7 text-base shadow-lg shadow-primary/20">
                    <Link href="/login">
                      {t("heroPrimary")}
                      <span className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-7 text-base">
                    <Link href="#features">{t("heroSecondary")}</Link>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <p className="mt-6 text-sm text-muted-foreground">{t("trust")}</p>
              </Reveal>
            </div>

            {/* Hero illustration */}
            <Reveal delay={0.1} y={28} className="mx-auto w-full max-w-md">
              <div className="animate-float">
                <BloomScene />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats band */}
        <section className="mx-auto w-full max-w-6xl px-5">
          <Reveal className="grid grid-cols-3 gap-3 rounded-3xl border bg-card/70 p-6 shadow-sm backdrop-blur sm:gap-6 sm:p-8">
            {stats.map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-heading text-2xl font-extrabold text-primary sm:text-4xl">
                  {s.v}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {s.l}
                </div>
              </div>
            ))}
          </Reveal>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-3 text-balance text-muted-foreground">
              {t("featuresSubtitle")}
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Art, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.08}>
                <HoverLift className="group h-full rounded-3xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-xl">
                  <div className="mb-4 inline-flex rounded-2xl bg-muted/60 p-3 transition-transform group-hover:-rotate-6">
                    <Art />
                  </div>
                  <h3 className="font-heading text-lg font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
                </HoverLift>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Levels ladder */}
        <section className="relative overflow-hidden bg-bloom py-20">
          <div className="mx-auto w-full max-w-6xl px-5">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">
                {t("levelsTitle")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("levelsSubtitle")}</p>
            </Reveal>
            <div className="mt-12 flex flex-wrap items-end justify-center gap-3">
              {LEVEL_CODES.map((code, i) => (
                <Reveal key={code} delay={i * 0.06} y={24}>
                  <HoverLift className="flex flex-col items-center gap-2 rounded-2xl border bg-card/80 px-5 py-4 shadow-sm backdrop-blur">
                    <LevelBadge code={code as LevelCode} size="lg" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {tl(code)}
                    </span>
                  </HoverLift>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <PlansSection />

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <Reveal className="relative overflow-hidden rounded-[2rem] border bg-primary px-6 py-14 text-center shadow-xl">
            <div className="absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -right-8 size-56 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative font-heading text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-balance text-primary-foreground/85">
              {t("ctaBody")}
            </p>
            <div className="relative mt-8">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 text-base shadow-lg">
                <Link href="/login">{t("ctaButton")}</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <BloomLogo />
          <p>{t("footer")}</p>
          <p>© {new Date().getFullYear()} Bloom English</p>
        </div>
      </footer>
    </div>
  );
}
