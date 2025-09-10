"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { ConsumerAuthForm } from "@/components/auth/consumer-auth-form"
import { authService } from "@/lib/auth"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true)
    setError("")

    try {
      await authService.login(data.email, data.password)

      // Redirect to dashboard page
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <main className="py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <ConsumerAuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}