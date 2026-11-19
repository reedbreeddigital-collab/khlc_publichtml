import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import AboutSection from "@/components/AboutSection";
import PopularCoursesSection from "@/components/PopularCoursesSection";
import CampusSection from "@/components/CampusSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import VideoContactSection from "@/components/VideoContactSection";
import ArticlesSection from "@/components/ArticlesSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      <PopularCoursesSection />
      <CampusSection />
      <TestimonialsSection />
      <VideoContactSection />
      <ArticlesSection />
      <FooterSection />
    </main>
  );
}
