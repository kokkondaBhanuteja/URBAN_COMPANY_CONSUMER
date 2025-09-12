"use client"

import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/content/hero-section"
import { getCategories, type Category } from "@/lib/content"
import { useLocation } from "@/lib/location-context"
import { useQuery } from "@tanstack/react-query"

export default function HomePage() {
  const { location, loading: locationLoading } = useLocation()

  // Fetches categories based on the user's location
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories", location?.city],
    queryFn: () => getCategories(location?.city),
    enabled: !locationLoading && !!location,
  })

  // Combines loading states for a seamless skeleton loading experience
  const isLoading = locationLoading || categoriesLoading

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main>
        {/* The new HeroSection now receives the data and handles all layout and display logic */}
        <HeroSection categories={categories} isLoading={isLoading} />
      </main>
      <Footer />
    </div>
  )
}
