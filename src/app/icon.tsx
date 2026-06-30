import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

function Cone() {
  return (
    <div
      style={{
        width: 38,
        height: 46,
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: 46,
          height: 10,
          borderRadius: 3,
          background: "#ff6a00",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 7,
          width: 32,
          height: 38,
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          background: "#ff6a00",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          width: 24,
          height: 5,
          background: "#fff4df",
          transform: "rotate(-5deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 28,
          width: 14,
          height: 4,
          background: "#fff4df",
          transform: "rotate(4deg)",
        }}
      />
    </div>
  );
}

export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        <Cone />
      </div>
    ),
    size,
  );
}
