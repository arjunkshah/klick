import { SiteHeader } from "./components/SiteHeader";
import { HeroSection } from "./components/HeroSection";
import { LogoGarden } from "./components/LogoGarden";
import { FeatureRows } from "./components/FeatureRows";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ResearchCareersRow } from "./components/ResearchCareersRow";
import { FrontierSection } from "./components/FrontierSection";
import { SiteFooter } from "./components/SiteFooter";

export function LandingPage() {
  return (
    <div className="bg-theme-bg text-theme-text">
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <LogoGarden />
        <FeatureRows />
        <TestimonialsSection />
        <ResearchCareersRow />
        <FrontierSection />
      </main>
      <SiteFooter />
    </div>
  );
}
