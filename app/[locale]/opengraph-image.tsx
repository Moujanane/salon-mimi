import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Salon Mimi — Tresses africaines Marrakech";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? "fr";

  const titles: Record<string, string> = {
    fr: "Tresses africaines & Rasta",
    en: "African & Rasta Braids",
    es: "Trenzas africanas & Rasta",
  };

  const subtitles: Record<string, string> = {
    fr: "Salon Mimi · Place Jamaa El Fna · Marrakech",
    en: "Salon Mimi · Jamaa El Fna Square · Marrakech",
    es: "Salon Mimi · Plaza Jamaa El Fna · Marrakech",
  };

  return new ImageResponse(
    <div
      style={{
        background: "#1A0D05",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, serif",
        padding: "80px",
      }}
    >
      <div
        style={{
          color: "#D4A843",
          fontSize: 24,
          letterSpacing: "6px",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}
      >
        SALON MIMI
      </div>
      <div
        style={{
          color: "#FFFFFF",
          fontSize: 64,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.2,
          marginBottom: "32px",
        }}
      >
        {titles[locale] ?? titles.fr}
      </div>
      <div
        style={{
          color: "#C17B3F",
          fontSize: 24,
          letterSpacing: "2px",
        }}
      >
        {subtitles[locale] ?? subtitles.fr}
      </div>
    </div>,
    { ...size },
  );
}
