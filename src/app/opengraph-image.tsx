import { ImageResponse } from "next/og";

export const alt = "Hoist the Cone — The unofficial Buccos traffic report";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function ConeMark() {
  return (
    <div
      style={{
        position: "relative",
        width: 190,
        height: 230,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "absolute", bottom: 0, width: 230, height: 42, borderRadius: 12, background: "#ff6a00" }} />
      <div style={{ position: "absolute", bottom: 34, width: 150, height: 190, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "#ff6a00" }} />
      <div style={{ position: "absolute", bottom: 78, width: 118, height: 22, background: "#fff4df", transform: "rotate(-5deg)" }} />
      <div style={{ position: "absolute", bottom: 138, width: 66, height: 18, background: "#fff4df", transform: "rotate(4deg)" }} />
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#fff4df",
          color: "#12100d",
          overflow: "hidden",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,106,0,0.20) 0%, rgba(255,244,223,0) 42%), repeating-linear-gradient(90deg, rgba(18,16,13,0.06) 0 2px, transparent 2px 72px), repeating-linear-gradient(0deg, rgba(18,16,13,0.05) 0 2px, transparent 2px 72px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -110,
            top: -40,
            width: 430,
            height: 430,
            borderRadius: 430,
            background: "#12100d",
            opacity: 0.96,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 68,
            top: 96,
            display: "flex",
          }}
        >
          <ConeMark />
        </div>
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 58,
            right: 430,
            bottom: 58,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "13px 18px",
                border: "3px solid rgba(255,106,0,0.45)",
                borderRadius: 999,
                color: "#c84b00",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Cone status: pending traffic
            </div>
            <div
              style={{
                marginTop: 42,
                display: "flex",
                flexDirection: "column",
                fontSize: 112,
                lineHeight: 0.86,
                letterSpacing: -8,
                fontWeight: 900,
              }}
            >
              <div>Hoist</div>
              <div>the Cone</div>
            </div>
            <div
              style={{
                marginTop: 30,
                fontSize: 36,
                lineHeight: 1.18,
                color: "rgba(18,16,13,0.72)",
                fontWeight: 800,
              }}
            >
              The unofficial Buccos traffic report.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontSize: 24,
              fontWeight: 800,
              color: "rgba(18,16,13,0.66)",
            }}
          >
            <div style={{ width: 58, height: 8, background: "#ff6a00", borderRadius: 99 }} />
            Live Pirates data. Deeply unofficial cone rulings.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
