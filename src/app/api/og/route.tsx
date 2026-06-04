import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "A challenger").slice(0, 24);
  const glory = (searchParams.get("glory") ?? "0").slice(0, 8);
  const level = (searchParams.get("level") ?? "1").slice(0, 4);
  const tagline = (searchParams.get("tag") ?? "Out-predict me.").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(900px 500px at 50% -10%, #064e2b 0%, #0a0e0a 60%)",
          padding: "72px",
          color: "#f5f7f5",
          fontFamily: "sans-serif",
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
              borderRadius: "16px",
              border: "4px solid #16a34a",
              fontSize: "26px",
              fontWeight: 900,
              color: "#16a34a",
            }}
          >
            PG
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "6px",
              color: "#16a34a",
            }}
          >
            PITCH GODS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "34px", color: "#a1a1aa" }}>{tagline}</div>
          <div style={{ fontSize: "96px", fontWeight: 900, lineHeight: 1 }}>
            {name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "20px",
              marginTop: "18px",
            }}
          >
            <div style={{ fontSize: "120px", fontWeight: 900, color: "#fbbf24" }}>
              {glory}
            </div>
            <div style={{ fontSize: "40px", color: "#a1a1aa" }}>
              {`Glory · Level ${level}`}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "30px", color: "#71717a" }}>
          World Cup 2026 · play free · no money, pure glory
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
