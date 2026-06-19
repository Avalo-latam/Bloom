import { cn } from "@/lib/utils";

/**
 * Bespoke Bloom icon set (hand-drawn, currentColor line style with small
 * leaf/petal touches). Replaces generic icon-library glyphs across the campus.
 */
type P = { className?: string };
const base = "size-[1.15rem]";

function S({ children, className }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(base, className)}
    >
      {children}
    </svg>
  );
}

/** Home with a sprouting roof. */
export const IcHome = ({ className }: P) => (
  <S className={className}>
    <path d="M4 11.5 12 5l8 6.5" />
    <path d="M6 10.5V19h12v-8.5" />
    <path d="M12 19v-4.5" />
    <path d="M12 6.5c0-1.6-1-2.7-2.6-2.9C9.2 5.2 10.4 6.4 12 6.5Z" fill="currentColor" stroke="none" />
  </S>
);

/** Two learners. */
export const IcStudents = ({ className }: P) => (
  <S className={className}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6" />
    <path d="M17 14.4A5.5 5.5 0 0 1 20.5 19" />
  </S>
);

/** Open book / curriculum. */
export const IcBook = ({ className }: P) => (
  <S className={className}>
    <path d="M12 6.5C10 5 7 4.5 4 5v12c3-.5 6 0 8 1.5" />
    <path d="M12 6.5C14 5 17 4.5 20 5v12c-3-.5-6 0-8 1.5" />
    <path d="M12 6.5v12" />
  </S>
);

/** Calendar / schedule with a bloom dot. */
export const IcCalendar = ({ className }: P) => (
  <S className={className}>
    <rect x="4" y="5.5" width="16" height="14" rx="3" />
    <path d="M4 9.5h16M8 4v3M16 4v3" />
    <circle cx="12" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
  </S>
);

/** Clipboard with check — homework. */
export const IcHomework = ({ className }: P) => (
  <S className={className}>
    <rect x="5" y="4.5" width="14" height="16" rx="3" />
    <path d="M9 4.5a3 3 0 0 1 6 0" />
    <path d="M8.5 13l2 2 3.5-3.5" />
  </S>
);

/** Document with a star — exams. */
export const IcExam = ({ className }: P) => (
  <S className={className}>
    <path d="M6 3.5h7l5 5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M13 3.5V8.5h5" />
    <path d="m11 12 .9 1.8 2 .3-1.45 1.4.35 2-1.8-1-1.8 1 .35-2L8.1 14.1l2-.3L11 12Z" fill="currentColor" stroke="none" />
  </S>
);

/** Rosette / award — grades. */
export const IcAward = ({ className }: P) => (
  <S className={className}>
    <circle cx="12" cy="9" r="5" />
    <path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5" />
    <path d="m12 6.5.9 1.7 1.9.3-1.4 1.3.35 1.9L12 11l-1.7.9.35-1.9L9.2 8.5l1.9-.3L12 6.5Z" fill="currentColor" stroke="none" />
  </S>
);

/** Sprout rising in a chart — progress. */
export const IcProgress = ({ className }: P) => (
  <S className={className}>
    <path d="M4 4v15a1 1 0 0 0 1 1h15" />
    <path d="M8 16c-1-3-3-4-5-4 .2 3 2 4.2 5 4Z" fill="currentColor" stroke="none" />
    <path d="M12 14c1-4 4-5.5 7.5-5.2C19.3 12 16.5 14 12 14Z" fill="currentColor" stroke="none" />
    <path d="M12 20v-6" />
  </S>
);

/** Wallet / payments. */
export const IcWallet = ({ className }: P) => (
  <S className={className}>
    <path d="M4 8a2.5 2.5 0 0 1 2.5-2.5H17a1 1 0 0 1 1 1V8" />
    <rect x="4" y="8" width="16" height="11" rx="3" />
    <circle cx="15.5" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
  </S>
);

/** Flower-gear — settings. */
export const IcSettings = ({ className }: P) => (
  <S className={className}>
    <circle cx="12" cy="12" r="3" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <path
        key={a}
        d="M12 4.5v2.2"
        transform={`rotate(${a} 12 12)`}
      />
    ))}
  </S>
);

/** Bell. */
export const IcBell = ({ className }: P) => (
  <S className={className}>
    <path d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6l1.5 2H5l1.5-2Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </S>
);

/** Sign out — door + arrow. */
export const IcSignOut = ({ className }: P) => (
  <S className={className}>
    <path d="M14 5.5H7a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7" />
    <path d="M11 12h9M17 9l3 3-3 3" />
  </S>
);

/** Plus inside a soft square. */
export const IcPlus = ({ className }: P) => (
  <S className={className}>
    <path d="M12 6v12M6 12h12" />
  </S>
);
