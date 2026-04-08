import { HeroSection } from '@/components/landing/HeroSection'
import { CinematicStory } from '@/components/landing/CinematicStory'

export default function LandingPage() {
  return (
    <div className="bg-[#010206] min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      <CinematicStory />
    </div>
  )
}
