import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hoistthecone.com"),
  title: "Hoist the Cone | Unofficial Buccos Traffic Report",
  description: "A dry municipal traffic report for Pirates cone conditions, powered by live MLB data.",
  openGraph: {
    title: "Hoist the Cone",
    description: "The unofficial Buccos traffic report.",
    url: "https://hoistthecone.com",
    siteName: "Hoist the Cone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoist the Cone",
    description: "The unofficial Buccos traffic report.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
