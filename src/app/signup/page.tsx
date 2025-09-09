"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ConsumerAuthForm } from "@/components/auth/consumer-auth-form"
import { authService } from "@/lib/auth"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = async (data: any) => {
    setLoading(true)
    setError("")

    try {
      await authService.register(data);

      // After successful registration, automatically log them in
      const loginResponse = await authService.login(data.email, data.password);

      // Store auth data
      authService.setAuthToken(loginResponse.token);
      authService.setUser(loginResponse.user);

      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <ConsumerAuthForm mode="signup" onSubmit={handleSignup} loading={loading} error={error} />

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