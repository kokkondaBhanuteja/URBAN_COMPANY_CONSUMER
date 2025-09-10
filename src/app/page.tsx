"use client"

import { useEffect, useState } from "react"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/content/hero-section"
import { CategoryCard } from "@/components/content/category-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories, type Category } from "@/lib/content"

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />

      <main>
        <HeroSection />

        {/* What are you looking for? */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-balance text-center lg:text-left">
              What are you looking for?
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-32 sm:h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-3 w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
