import { ImageResponse } from "next/og";

export const alt =
  "Praneeth Annapureddy. Quantitative models, companies, and tools.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#050607",
          color: "#f2f3f4",
          backgroundImage:
            "radial-gradient(70% 70% at 24% 26%, rgba(74,222,128,0.16), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 8, color: "#5c6166" }}>
          PRANEETH ANNAPUREDDY
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              fontSize: 74,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.12,
            }}
          >
            <span style={{ marginRight: 20 }}>Genius.</span>
            <span style={{ textDecoration: "line-through", color: "#9ba1a6", marginRight: 16 }}>
              Billionaire.
            </span>
            <span style={{ fontSize: 22, letterSpacing: 6, color: "#4ade80", marginRight: 20 }}>
              PENDING
            </span>
            <span>Philanthropist.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 27,
              color: "#9ba1a6",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            I build quantitative models, companies, and tools for people locked
            out of the systems that could help them.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 4,
            color: "#4ade80",
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: 9,
              backgroundColor: "#4ade80",
              marginRight: 14,
            }}
          />
          QUANTLAB / BTC-USDT ORDER FLOW
        </div>
      </div>
    ),
    { ...size },
  );
}
