"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardStats } from "@/components/consumer/dashboard-stats"
import { RecentBookings } from "@/components/consumer/recent-bookings"
import { QuickActions } from "@/components/consumer/quick-actions"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"

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
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          router.push("/login")
          return
        }

        const token = authService.getAuthToken()
        const response = await fetch("/api/consumer/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

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
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg h-32"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg h-64"></div>
                <div className="bg-muted rounded-lg h-64"></div>
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
        <Header />
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
    return null
  }

  const user = authService.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
