import { ImageResponse } from "next/og";

export const runtime = "edge";

// 1080x1080 Instagram carousel slide renderer (Satori-safe: flex-only,
// hex gradient stops, no absolute positioning).
// Params: t=title, s=subtitle, k=kicker, i=index, n=total, v=variant(pitch|glory)
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const title = (p.get("t") ?? "Pitch Gods").slice(0, 120);
  const subtitle = (p.get("s") ?? "").slice(0, 160);
  const kicker = (p.get("k") ?? "WORLD CUP 2026").slice(0, 28);
  const i = Math.max(1, Math.min(20, Number(p.get("i") ?? "1")));
  const n = Math.max(1, Math.min(20, Number(p.get("n") ?? "1")));
  const gold = (p.get("v") ?? "pitch") === "glory";

  const accent = gold ? "#fbbf24" : "#2fe07e";
  const bg = gold
    ? "radial-gradient(820px 620px at 50% -8%, #4d3a0c 0%, #070a08 62%)"
    : "radial-gradient(820px 620px at 50% -8%, #0c4d2e 0%, #070a08 62%)";

  const L = title.length;
  const titleSize = L <= 16 ? 128 : L <= 28 ? 104 : L <= 44 ? 82 : L <= 70 ? 64 : 52;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          padding: "88px",
          color: "#f4f7f4",
          fontFamily: "sans-serif",
        }}
      >
        {/* top: wordmark + counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                border: `4px solid ${accent}`,
                fontSize: "26px",
                fontWeight: 900,
                color: accent,
              }}
            >
              PG
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "6px",
                color: accent,
              }}
            >
              PITCH GODS
            </div>
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "3px",
              color: "#71717a",
            }}
          >
            {String(i).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </div>
        </div>

        {/* center: kicker + title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "5px",
              color: accent,
              marginBottom: "30px",
            }}
          >
            {kicker.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 900,
              lineHeight: 1.04,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "42px",
              lineHeight: 1.25,
              color: "#c7ccc7",
              marginTop: "30px",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 700, color: "#f4f7f4" }}>
            pitchgods.com
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "#71717a" }}>
            free · no betting · pure glory
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
