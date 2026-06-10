import { ImageResponse } from "next/og";

export const alt =
  "QuantLab. Bivariate Hawkes modeling of BTC-USDT order flow.";
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
            "radial-gradient(65% 65% at 22% 24%, rgba(74,222,128,0.18), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 23, letterSpacing: 7, color: "#5c6166" }}>
          MARKET MICROSTRUCTURE / POINT PROCESSES
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            Order flow, modeled.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 28,
              color: "#9ba1a6",
            }}
          >
            Bivariate Hawkes on BTC-USDT market orders.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 23, letterSpacing: 2 }}>
          <span style={{ color: "#4ade80", marginRight: 18 }}>ρ 0.62 branching</span>
          <span style={{ color: "#5c6166", marginRight: 18 }}>·</span>
          <span style={{ color: "#9ba1a6", marginRight: 18 }}>+0.9 nats/event holdout</span>
          <span style={{ color: "#5c6166", marginRight: 18 }}>·</span>
          <span style={{ color: "#9ba1a6" }}>28/28 windows</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
