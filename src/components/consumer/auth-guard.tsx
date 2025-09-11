"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, fallback, redirectTo = "/login" }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
    }

    checkAuth()

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-balance">Sign In Required</CardTitle>
          <p className="text-muted-foreground text-pretty">Please sign in to continue with your booking</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href={redirectTo}>
            <Button className="w-full">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="w-full bg-transparent">
              Create Account
            </Button>
          </Link>
          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Continue browsing services
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
