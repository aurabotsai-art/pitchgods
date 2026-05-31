"use client";

export function ShareButton({
  url,
  text,
  label = "Share on WhatsApp",
  variant = "primary",
}: {
  url: string;
  text: string;
  label?: string;
  variant?: "primary" | "ghost";
}) {
  async function share() {
    const nav = navigator as Navigator & {
      share?: (d: { text?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({ text, url });
        return;
      } catch {
        // fell through to WhatsApp
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <button
      onClick={share}
      className={
        variant === "primary"
          ? "flex h-14 w-full items-center justify-center rounded-2xl bg-pitch text-base font-bold text-black transition active:scale-[0.98]"
          : "flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 text-sm font-semibold text-zinc-200 transition active:scale-[0.98]"
      }
    >
      {label}
    </button>
  );
}
