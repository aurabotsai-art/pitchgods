import { ImageResponse } from "next/og";

export const runtime = "edge";

// 1080x1080 Instagram carousel slide renderer.
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
  const glow = gold
    ? "radial-gradient(820px 620px at 50% -8%, rgba(251,191,36,0.22) 0%, #070a08 60%)"
    : "radial-gradient(820px 620px at 50% -8%, rgba(47,224,126,0.22) 0%, #070a08 60%)";

  // size the headline to the text length so it always fits
  const L = title.length;
  const titleSize = L <= 16 ? 132 : L <= 28 ? 104 : L <= 44 ? 82 : L <= 70 ? 64 : 52;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: glow,
          padding: "84px",
          color: "#f4f7f4",
          fontFamily: "sans-serif",
        }}
      >
        {/* giant faded index watermark */}
        <div
          style={{
            position: "absolute",
            top: "120px",
            right: "60px",
            fontSize: "420px",
            fontWeight: 900,
            color: "rgba(255,255,255,0.035)",
            lineHeight: 1,
          }}
        >
          {String(i).padStart(2, "0")}
        </div>

        {/* top row: wordmark + counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                border: `4px solid ${accent}`,
                fontSize: "24px",
                fontWeight: 900,
                color: accent,
              }}
            >
              PG
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "5px",
                color: accent,
              }}
            >
              PITCH GODS
            </div>
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "3px",
              color: "#71717a",
            }}
          >
            {String(i).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </div>
        </div>

        {/* center: kicker + title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "5px",
              color: accent,
            }}
          >
            {kicker.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-1px",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: "40px",
                lineHeight: 1.25,
                color: "#c7ccc7",
              }}
            >
              {subtitle}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.08)",
            paddingTop: "28px",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#f4f7f4" }}>
            pitchgods.com
          </div>
          <div style={{ fontSize: "26px", color: "#71717a" }}>
            free · no betting · pure glory
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
