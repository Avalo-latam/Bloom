"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";

export function CopyAlias({ alias }: { alias: string }) {
  const t = useTranslations("payments");
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(alias);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 font-mono text-base font-semibold text-primary transition-colors hover:bg-primary/15"
    >
      {alias}
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
