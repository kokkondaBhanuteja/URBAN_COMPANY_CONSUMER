"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"

export default function AuthSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/consumer/profile", {
          credentials: "include",
        })

        if (response.ok) {
          const profileData = await response.json()

          if (profileData.consumer && profileData.consumer.userId) {
            const user = {
              id: profileData.consumer.userId._id,
              fullName: profileData.consumer.userId.userName,
              email: profileData.consumer.userId.email,
              userType: "consumer",
            }
            authService.setUser(user)
            router.push("/dashboard")
          } else {
            throw new Error("Invalid profile data received.")
          }
        } else {
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          })

          if (response.ok) {
            const userData = await response.json()
            authService.setUser({
              id: userData.id,
              fullName: userData.fullName,
              email: userData.email,
              userType: userData.userType,
            })
            router.push("/dashboard")
          } else {
            throw new Error("Failed to fetch user data.")
          }
        }
      } catch (error) {
        console.error("Auth success error:", error)
        router.push("/login?error=Could not complete sign in.")
      }
    }

    fetchUser()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-foreground">Signing you in...</p>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
