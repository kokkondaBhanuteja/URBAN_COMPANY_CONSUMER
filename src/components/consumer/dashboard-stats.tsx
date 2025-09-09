"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CreditCard, Star } from "lucide-react"

interface DashboardStatsProps {
  upcomingBookings: number
  totalBookings: number
  monthlySpending: number
  averageRating?: number
}

export function DashboardStats({
  upcomingBookings,
  totalBookings,
  monthlySpending,
  averageRating,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      title: "Upcoming Bookings",
      value: upcomingBookings,
      icon: Clock,
      description: "Services scheduled",
      color: "text-primary",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      description: "All time bookings",
      color: "text-accent",
    },
    {
      title: "Monthly Spending",
      value: formatCurrency(monthlySpending),
      icon: CreditCard,
      description: "This month",
      color: "text-chart-1",
    },
    {
      title: "Your Rating",
      value: averageRating ? `${averageRating.toFixed(1)}★` : "N/A",
      icon: Star,
      description: "Average rating",
      color: "text-chart-2",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-balance">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
