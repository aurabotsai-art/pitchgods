export function Flag({
  slug,
  logo,
  emoji,
  size = 28,
}: {
  slug?: string | null;
  logo?: string | null;
  emoji?: string | null;
  size?: number;
}) {
  if (slug) {
    const h = Math.round(size * 0.75);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://flagcdn.com/w80/${slug}.png`}
        srcSet={`https://flagcdn.com/w160/${slug}.png 2x`}
        width={size}
        height={h}
        alt=""
        loading="lazy"
        decoding="async"
        className="rounded-sm object-cover ring-1 ring-white/10"
        style={{ width: size, height: h }}
      />
    );
  }
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        width={size}
        height={size}
        alt=""
        loading="lazy"
        decoding="async"
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span style={{ fontSize: size }} className="leading-none">
      {emoji ?? "⚽"}
    </span>
  );
}
