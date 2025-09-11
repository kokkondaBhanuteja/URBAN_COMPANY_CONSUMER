"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"

export default function AuthSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    async function fetchAndSetUser() {
      try {
        // First, try to get the full user profile data
        const profileResponse = await fetch("/api/consumer/profile", {
          credentials: "include",
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData.consumer && profileData.consumer.userId) {
            const user = {
              id: profileData.consumer.userId._id,
              fullName: profileData.consumer.userId.userName,
              email: profileData.consumer.userId.email,
              userType: "consumer",
            }
            authService.setUser(user)
            window.location.href = "/" // Force a full page reload to the homepage
            return
          }
        }

        // Fallback to the /api/auth/me endpoint if profile is not ready
        const meResponse = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (meResponse.ok) {
          const userData = await meResponse.json()
          authService.setUser({
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            userType: userData.userType,
          })
          window.location.href = "/" // Force a full page reload to the homepage
        } else {
          throw new Error("Failed to fetch user data after authentication.")
        }
      } catch (error) {
        console.error("Auth success error:", error)
        router.push("/login?error=Could not complete sign in.")
      }
    }

    fetchAndSetUser()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-foreground">Finalizing login...</p>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}