import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12100d",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 18,
            border: "4px solid rgba(255, 106, 0, 0.28)",
            borderRadius: 28,
          }}
        />
        <div
          style={{
            position: "relative",
            width: 92,
            height: 118,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", bottom: 0, width: 112, height: 24, borderRadius: 8, background: "#ff6a00" }} />
          <div style={{ position: "absolute", bottom: 18, width: 78, height: 96, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", background: "#ff6a00" }} />
          <div style={{ position: "absolute", bottom: 42, width: 62, height: 12, background: "#fff4df", transform: "rotate(-5deg)" }} />
          <div style={{ position: "absolute", bottom: 72, width: 34, height: 9, background: "#fff4df", transform: "rotate(4deg)" }} />
        </div>
      </div>
    ),
    size,
  );
}
