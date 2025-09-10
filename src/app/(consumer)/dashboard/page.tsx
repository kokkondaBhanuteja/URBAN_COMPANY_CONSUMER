"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { DashboardStats } from "@/components/consumer/dashboard-stats"
import { RecentBookings } from "@/components/consumer/recent-bookings"
import { QuickActions } from "@/components/consumer/quick-actions"
import { authService } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"


interface DashboardData {
  upcomingBookings: number
  totalBookings: number
  monthlySpending: number
  recentBookings: any[]
  consumerProfile: any
}

export default function ConsumerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if user is authenticated client-side first
      if (!authService.isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        // Fetch data from the server. The browser will automatically send the auth cookie.
        const response = await fetch("/api/consumer/dashboard", {
          credentials: "include", // This is crucial for sending httpOnly cookies
        })

        if (response.status === 401) {
          // If the cookie is invalid or expired, the server will tell us.
          authService.logout()
          router.push("/login?error=Session expired. Please log in again.")
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error: any) {
        setError(error.message || "Failed to load dashboard")
        console.error("Dashboard fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <Skeleton className="h-8 rounded w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="rounded-lg h-32" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="rounded-lg h-64" />
                <Skeleton className="rounded-lg h-64" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
     <NavigationHeader />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Dashboard</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!dashboardData) {
    return null // or a fallback component
  }

  const user = authService.getUser()

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground text-balance">
              Welcome back, {user?.fullName || "User"}!
            </h1>
            <p className="text-muted-foreground mt-2 text-pretty">Here's an overview of your Urban Company account</p>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <DashboardStats
              upcomingBookings={dashboardData.upcomingBookings}
              totalBookings={dashboardData.totalBookings}
              monthlySpending={dashboardData.monthlySpending}
              averageRating={dashboardData.consumerProfile?.averageRating}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-1">
              <RecentBookings bookings={dashboardData.recentBookings} />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}