import { LandingNav } from '../components/landing/nav';
import { Hero } from '../components/landing/hero';
import { StatsBar } from '../components/landing/stats-bar';
import { Features } from '../components/landing/features';
import { AiCallout } from '../components/landing/ai-callout';
import { PaintsStrip } from '../components/landing/paints-strip';
import { Community } from '../components/landing/community';
import { Pricing } from '../components/landing/pricing';
import { FinalCta } from '../components/landing/final-cta';
import { LandingFooter } from '../components/landing/footer';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-background font-dm-sans text-ink">
      {/* Fixed ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-[5%] -top-[10%] h-[700px] w-[700px] rounded-full bg-vault-blob-purple" />
        <div className="absolute -bottom-[5%] -left-[5%] h-[500px] w-[500px] rounded-full bg-vault-blob-gold" />
        <div className="bg-vault-grid absolute inset-0 opacity-[.02]" />
      </div>

      <LandingNav />
      <Hero />
      <StatsBar />
      <Features />
      <AiCallout />
      <PaintsStrip />
      <Community />
      <Pricing />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
