import { HeroSection } from '@/components/landing/HeroSection'
import { CinematicStoryClient } from '@/components/landing/CinematicStoryClient'

export default function LandingPage() {
  return (
    <div className="bg-[#010206] min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      {/* La historia cinemática solo se muestra en desktop */}
      <div className="hidden sm:block">
        <CinematicStoryClient />
      </div>
    </div>
  )
}
