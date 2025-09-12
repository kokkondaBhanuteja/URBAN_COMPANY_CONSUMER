"use client"

import Image from "next/image"
import { CategoryCard } from "@/components/content/category-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/content"

// The Hero Section now accepts categories and their loading state as props
interface HeroSectionProps {
  categories: Category[] | undefined
  isLoading: boolean
}

export function HeroSection({ categories, isLoading }: HeroSectionProps) {
  return (
    <section className="bg-background  py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: Heading and Categories */}
          <div className="flex flex-col text-center lg:text-left">
            <h1 className="text-3xl font-900 text-black mb-8 text-balance leading-tight">
              Home services at your doorstep
            </h1>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-left">
                What are you looking for?
              </h2>

              {isLoading ? (
                // A clean skeleton loader for a better loading experience
                <div className="grid grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                // The grid of category cards, displayed when data is ready
                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                  {categories?.slice(0, 8).map((category) => ( // Show up to 8 categories
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              ) : (
                // Empty state when no categories are found
                <div className="text-center py-8">
                  <img src="/no_data.svg" alt="No services available" width={250} className="mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No services available for the selected location.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: The Image Collage */}
          <div className="relative order-first lg:order-last h-[500px] lg:h-[600px]">
            {/* Outer wrapper with rounded corners */}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full rounded-2xl overflow-hidden shadow-lg">
              {/* Main vertical image */}
              <div className="relative col-span-1 row-span-2 group overflow-hidden">
                <Image
                  src="/office_cleaning.jpg"
                  alt="A professional Office Cleaning service in action"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Top-right image */}
              <div className="relative col-span-1 row-span-1 group overflow-hidden ">
                <Image
                  src="/air_conditioning.jpg"
                  alt="A person receiving a relaxing massage"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Bottom-right image */}
              <div className="relative col-span-1 row-span-1 group overflow-hidden">
                <Image
                  src="/plumber.jpg"
                  alt="A technician repairing an air conditioner unit"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}