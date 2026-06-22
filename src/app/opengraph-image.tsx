import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bloom English";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #efeafd 0%, #e3efff 45%, #e6fbf1 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* sprout mark */}
        <div
          style={{
            display: "flex",
            width: 132,
            height: 132,
            borderRadius: 36,
            background: "#6F5AE6",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <svg width="84" height="84" viewBox="0 0 32 32">
            <path d="M16 27V14" stroke="#7BE0A8" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M16 18C16 12.2 11.6 8.6 5.8 8.2C5.4 14 9.4 17.7 16 18Z" fill="#7BE0A8" />
            <path d="M16 14.5C16 8.2 20.6 4.6 26.4 4.2C26.8 10 22.6 13.9 16 14.5Z" fill="#FBD0E0" />
            <circle cx="16" cy="9" r="2.4" fill="#FFE08A" />
          </svg>
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, color: "#2b2740" }}>
          Bloom English
        </div>
        <div style={{ fontSize: 34, color: "#5b5470", marginTop: 14 }}>
          Aprendé inglés, florecé a tu ritmo
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6F5AE6",
            marginTop: 36,
            fontWeight: 600,
          }}
        >
          A1 · A2 · B1 · B2 · C1 · FCE · Phonetics
        </div>
      </div>
    ),
    size,
  );
}
