import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";
import { LandingHashScroll } from "./landing/LandingHashScroll";
import HeroSection from "./landing/HeroSection";
import HeroFeature from "./landing/HeroFeature";
import PlatformStats from "./landing/PlatformStats";
import CallToAction from "./landing/CallToAction";

export default function Home() {
  return (
    <>
      <Header />
      <LandingHashScroll />
      <main>
        <HeroSection />
        <HeroFeature />
        <PlatformStats />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
 