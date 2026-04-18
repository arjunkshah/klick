import { SiteHeader } from "./components/SiteHeader";
import { HeroSection } from "./components/HeroSection";
import { LogoGarden } from "./components/LogoGarden";
import { FeatureRows } from "./components/FeatureRows";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ResearchCareersRow } from "./components/ResearchCareersRow";
import { FrontierSection } from "./components/FrontierSection";
import { ChangelogSection } from "./components/ChangelogSection";
import { BlogHighlights } from "./components/BlogHighlights";
import { FinalCta } from "./components/FinalCta";
import { SiteFooter } from "./components/SiteFooter";

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <LogoGarden />
        <FeatureRows />
        <TestimonialsSection />
        <ResearchCareersRow />
        <FrontierSection />
        <ChangelogSection />
        <BlogHighlights />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
