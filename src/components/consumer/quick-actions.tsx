"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, MessageCircle, User } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Book a Service",
      description: "Find and book home services",
      icon: Search,
      href: "/",
      variant: "default" as const,
    },
    {
      title: "My Bookings",
      description: "View and manage bookings",
      icon: Calendar,
      href: "/consumer/bookings",
      variant: "outline" as const,
    },
    {
      title: "Contact Support",
      description: "Get help with your services",
      icon: MessageCircle,
      href: "/support",
      variant: "outline" as const,
    },
    {
      title: "Edit Profile",
      description: "Update your information",
      icon: User,
      href: "/consumer/profile",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant={action.variant}
                  className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-balance">{action.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left text-pretty">{action.description}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
