"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { ServiceCard } from "@/components/content/service-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Search as SearchIcon } from "lucide-react"
import type { Service } from "@/lib/content"
import { Suspense } from "react"

// This function now correctly expects a direct array of Service objects
const fetchSearchResults = async (query: string, location: string): Promise<Service[]> => {
  if (!query) return []
  const params = new URLSearchParams({ q: query, location })
  const response = await fetch(`/api/services?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return response.json() // This will be the direct array: Service[]
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const location = searchParams.get("location") || ""

  const {
    data: services,
    isLoading,
    isError,
  } = useQuery<Service[]>({
    queryKey: ["searchResults", query, location],
    queryFn: () => fetchSearchResults(query, location),
    enabled: !!query, // Only run the query if 'q' exists
  })

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
              Search Results for &quot;{query}&quot;
            </h1>
            {location && <p className="text-muted-foreground">in {location}</p>}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2"><Skeleton className="h-48 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load search results.</AlertDescription></Alert>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-gray-600">No services found matching your search.</p></div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Wrap with Suspense for better loading behavior with useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  )
}