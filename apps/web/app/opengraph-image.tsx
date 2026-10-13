import { ImageResponse } from "next/og";

/** The share card for every page that does not set its own: the promise and the four dots. */
export const alt = "Maicro: wat zegt AI over jouw bedrijf?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const dots = ["#E11D48", "#F59E0B", "#9CA3AF", "#2F855A"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #FBF6EE 0%, #EEF4FF 60%, #EDF7F1 100%)", color: "#111827" }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>maicro</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900 }}>Wat zegt AI over jouw bedrijf?</div>
          <div style={{ fontSize: 34, color: "#374151", maxWidth: 900 }}>Je klanten vragen het aan ChatGPT. Wij zorgen dat het antwoord klopt.</div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {dots.map((c) => (
            <div key={c} style={{ width: 44, height: 44, borderRadius: 44, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
