import type { Metadata } from "next";
import { LandingContent } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "FieldPay — Field Service CRM for Lawn, Pool, Cleaning & More",
  description:
    "Schedule jobs, send invoices, and manage your crew — all from one app. Built for lawn care, pool service, property cleaning, pressure washing, pest control, HVAC, and more.",
  keywords: [
    "field service management",
    "lawn care software",
    "pool service CRM",
    "property cleaning management",
    "pressure washing software",
    "field service CRM",
    "job scheduling app",
    "invoicing software",
    "crew management",
    "pest control software",
    "HVAC service management",
    "window cleaning software",
    "handyman business software",
    "field service invoicing",
    "service business management",
  ],
  openGraph: {
    title: "FieldPay — The Operating System for Field Service",
    description:
      "Schedule jobs, send invoices, and manage your crew. One app for lawn care, pool service, property cleaning, pressure washing, and more.",
    type: "website",
    locale: "en_US",
    siteName: "FieldPay",
  },
  twitter: {
    card: "summary_large_image",
    title: "FieldPay — Field Service CRM",
    description:
      "Schedule jobs, send invoices, manage your crew. Built for lawn care, pool service, property cleaning, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://fieldpay.app",
  },
};

const SOFTWARE_APP_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FieldPay",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Field service CRM for lawn care, pool service, property cleaning, pressure washing, pest control, HVAC, and more. Schedule jobs, send invoices, manage crews.",
  offers: [
    {
      "@type": "Offer",
      price: "20",
      priceCurrency: "USD",
      name: "Starter",
      description: "1-10 properties",
    },
    {
      "@type": "Offer",
      price: "40",
      priceCurrency: "USD",
      name: "Growth",
      description: "11-30 properties",
    },
    {
      "@type": "Offer",
      price: "79",
      priceCurrency: "USD",
      name: "Pro",
      description: "31-75 properties",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "500",
  },
});

const ORGANIZATION_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TheLevelTeam LLC",
  brand: {
    "@type": "Brand",
    name: "FieldPay",
  },
  description:
    "Field service management software for lawn care, pool service, property cleaning, and more.",
});

export default function LandingPage() {
  return (
    <>
      {/* eslint-disable-next-line -- Static JSON-LD, no XSS risk */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SOFTWARE_APP_JSON_LD }} />
      {/* eslint-disable-next-line -- Static JSON-LD, no XSS risk */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORGANIZATION_JSON_LD }} />
      <LandingContent />
    </>
  );
}
