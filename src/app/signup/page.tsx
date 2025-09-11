"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { ConsumerAuthForm } from "@/components/auth/consumer-auth-form"
import { OtpForm } from "@/components/auth/otp-form"
import { authService } from "@/services/authService"
import {Button} from "@/components/ui/button"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  const handleSignup = async (data: any) => {
    setLoading(true)
    setError("")
    setUserData(data)

    try {
      const response = await fetch("/api/auth/consumer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message)
      }

      setStep(2)
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...userData, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed")
      }
      
      authService.setUser(data.user)
      // Redirect to homepage instead of dashboard
      router.push("/")
    } catch (error: any) {
      setError(error.message || "OTP verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToRegistration = () => {
    setStep(1)
    setError("")
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <main className="py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          {step === 1 && <ConsumerAuthForm mode="signup" onSubmit={handleSignup} loading={loading} error={error} />}

          {step === 2 && (
            <>
              <OtpForm email={userData.email} onSubmit={handleOtpSubmit} loading={loading} error={error} />

              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToRegistration}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Back to Registration
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}