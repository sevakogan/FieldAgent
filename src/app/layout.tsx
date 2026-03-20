import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KleanHQ — Field Service CRM",
    template: "%s | KleanHQ",
  },
  description:
    "Schedule jobs, send invoices, and manage your crew. Built for lawn care, pool service, property cleaning, pressure washing, and more.",
  metadataBase: new URL("https://kleanhq.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-sm text-gray-900 bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
