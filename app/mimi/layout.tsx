import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Mimi Coiffure — Planning",
  description: "Réservations du salon Mimi Coiffure",
  manifest: "/mimi-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mimi Planning",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a0a00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MimiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href="/mimi-manifest.json" />
      <link rel="apple-touch-icon" href="/mimi-icon-192.png" />
      {children}
    </>
  );
}
