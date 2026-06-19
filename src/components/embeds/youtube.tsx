import { cn } from "@/lib/utils";

/** Extracts a YouTube video id from the common URL shapes. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function YouTubeEmbed({
  url,
  title = "YouTube video",
  start,
  className,
}: {
  url: string;
  title?: string;
  start?: number;
  className?: string;
}) {
  const id = youtubeId(url);
  if (!id) return null;
  const src = `https://www.youtube-nocookie.com/embed/${id}${
    start ? `?start=${start}` : ""
  }`;
  return (
    <div
      className={cn(
        "aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-sm",
        className,
      )}
    >
      <iframe
        src={src}
        title={title}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
