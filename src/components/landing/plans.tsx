import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Reveal, HoverLift } from "@/components/motion";
import { cn } from "@/lib/utils";

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="var(--brand-mint)" />
      <path
        d="M6 10.5l2.5 2.5L14 7.5"
        fill="none"
        stroke="var(--brand-leaf)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function PlansSection() {
  const t = await getTranslations("plans");

  const guided = {
    name: t("guidedName"),
    price: t("guidedPrice"),
    per: t("guidedPer"),
    tag: t("guidedTag"),
    features: [t("gP1"), t("gP2"), t("gP3"), t("gP4")],
    featured: false,
  };
  const async_ = {
    name: t("asyncName"),
    price: t("asyncPrice"),
    per: t("asyncPer"),
    tag: t("asyncTag"),
    features: [t("aP1"), t("aP2"), t("aP3"), t("aP4"), t("aP5")],
    featured: true,
  };

  return (
    <section id="plans" className="mx-auto w-full max-w-5xl scroll-mt-20 px-5 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <div className="mt-12 grid items-start gap-6 md:grid-cols-2">
        {[guided, async_].map((p) => (
          <Reveal key={p.name} delay={p.featured ? 0.08 : 0}>
            <HoverLift
              className={cn(
                "glass-card relative flex h-full flex-col rounded-3xl p-7",
                p.featured && "ring-2 ring-primary md:scale-[1.03]",
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  {t("popular")}
                </span>
              )}
              <span className="text-sm font-medium text-muted-foreground">
                {p.tag}
              </span>
              <h3 className="mt-1 font-heading text-2xl font-bold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-4xl font-extrabold text-primary">
                  {p.price}
                </span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={p.featured ? "default" : "outline"}
                className="mt-7 w-full rounded-full"
              >
                <Link href="/login">{t("cta")}</Link>
              </Button>
            </HoverLift>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
