import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldPay — Field Service CRM",
  description: "Manage leads, clients, jobs, and revenue for your field service business.",
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
