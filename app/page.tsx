import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { StepsSection } from "@/components/steps-section"
import { CategoriesSection } from "@/components/categories-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
  <StatsSection />
        <StepsSection />
        <CategoriesSection />
      </main>
      <PublicFooter />
    </div>
  )
}
