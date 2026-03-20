import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import FullFeatureList from "@/components/landing/FullFeatureList";
import AIPreview from "@/components/landing/AIPreview";
import AppWalkthrough from "@/components/landing/AppWalkthrough";
import { MarketplacePreview } from "@/components/landing/MarketplacePreview";
import { IntegrationsMarquee } from "@/components/landing/IntegrationsMarquee";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { LiveCounter } from "@/components/landing/LiveCounter";
import { Footer } from "@/components/landing/Footer";
import { CookieConsent } from "@/components/landing/CookieConsent";
import { FloatingOrbs } from "@/components/effects/FloatingOrbs";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { GridPattern } from "@/components/effects/GridPattern";
import { FloatingIcons } from "@/components/effects/FloatingIcons";

export default function LandingPage() {
  return (
    <>
      {/* Global visual effects */}
      <ScrollProgress />
      <FloatingOrbs />
      <CursorGlow />
      <GrainOverlay />
      <GridPattern />
      <FloatingIcons />

      {/* Page sections */}
      <main className="relative z-10">
        <Hero />

        <LiveCounter />

        {/* Flow: white → light blue */}
        <div className="h-24 bg-gradient-to-b from-[#F2F2F7] via-[#EAF3FF] to-[#E0EEFF]" />

        <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-[#E0EEFF] to-[#E8F0FE]">
          <Features />
        </section>

        {/* Flow: light blue → lavender */}
        <div className="h-24 bg-gradient-to-b from-[#E8F0FE] via-[#E8E4F8] to-[#F0E6FF]" />

        <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-[#F0E6FF] to-[#F5EEFF]">
          <HowItWorks />
        </section>

        {/* Flow: lavender → peach */}
        <div className="h-24 bg-gradient-to-b from-[#F5EEFF] via-[#FFF0E8] to-[#FFF0E0]" />

        <section id="full-features" className="py-16 md:py-24 bg-gradient-to-b from-[#FFF0E0] to-[#FFECD6]">
          <FullFeatureList />
        </section>

        {/* Flow: peach → soft pink */}
        <div className="h-24 bg-gradient-to-b from-[#FFECD6] via-[#FFE4E8] to-[#FFE0EA]" />

        <section id="ai" className="py-16 md:py-24 bg-gradient-to-b from-[#FFE0EA] to-[#FFD6E8]">
          <AIPreview />
          <AppWalkthrough />
        </section>

        {/* Flow: pink → mint */}
        <div className="h-24 bg-gradient-to-b from-[#FFD6E8] via-[#E8F5F0] to-[#E0F5EE]" />

        <section id="marketplace" className="py-16 md:py-24 bg-gradient-to-b from-[#E0F5EE] to-[#D6F0EA]">
          <MarketplacePreview />
        </section>

        {/* Flow: mint → sky */}
        <div className="h-24 bg-gradient-to-b from-[#D6F0EA] via-[#E0F0FF] to-[#E4F0FF]" />

        <section id="integrations" className="py-12 md:py-20 bg-gradient-to-b from-[#E4F0FF] to-[#EAF0FF]">
          <IntegrationsMarquee />
        </section>

        {/* Flow: sky → light violet */}
        <div className="h-24 bg-gradient-to-b from-[#EAF0FF] via-[#EDE6FF] to-[#F0E8FF]" />

        <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-[#F0E8FF] to-[#F2EAFF]">
          <PricingPreview />
        </section>

        {/* Flow: violet → warm white */}
        <div className="h-24 bg-gradient-to-b from-[#F2EAFF] via-[#FFF5F0] to-[#FFF8F5]" />

        <section id="stats" className="py-12 md:py-20 bg-gradient-to-b from-[#FFF8F5] to-[#FFF5F0]">
          <StatsCounter />
        </section>

        {/* Flow: warm white → blue for CTA */}
        <div className="h-24 bg-gradient-to-b from-[#FFF5F0] via-[#EAF0FF] to-[#E0ECFF]" />

        <section id="waitlist" className="py-16 md:py-24 bg-gradient-to-b from-[#E0ECFF] to-[#F2F2F7]">
          <WaitlistForm />
        </section>

        <Footer />
      </main>

      {/* Hidden admin access */}
      <a
        href="/gate"
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
        aria-label="Admin"
      >
        <span className="text-xs text-black/30">⚙</span>
      </a>

      <CookieConsent />
    </>
  );
}
