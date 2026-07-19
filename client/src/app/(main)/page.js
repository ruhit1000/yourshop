import HeroSection from "@/components/Home/HeroSection";
import CategoryLanes from "@/components/Home/CategoryLanes";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import FlashDeals from "@/components/Home/FlashDeals";
import WhyChooseUs from "@/components/Home/WhyChooseUs";
import StatsCounter from "@/components/Home/StatsCounter";
import Testimonials from "@/components/Home/Testimonials";
import Newsletter from "@/components/Home/Newsletter";
import FaqAccordion from "@/components/Home/FaqAccordion";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryLanes />
      <FeaturedProducts />
      <FlashDeals />
      <WhyChooseUs />
      <StatsCounter />
      <Testimonials />
      <Newsletter />
      <FaqAccordion />
    </>
  );
}
