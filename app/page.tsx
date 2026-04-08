import { HeroSection } from '@/components/landing/HeroSection'
import { CinematicStoryClient } from '@/components/landing/CinematicStoryClient'

export default function LandingPage() {
  return (
    <div className="bg-[#010206] min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      <CinematicStoryClient />
    </div>
  )
}
