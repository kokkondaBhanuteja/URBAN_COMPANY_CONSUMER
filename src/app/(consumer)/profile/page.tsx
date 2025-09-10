"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Calendar, MapPin, Mail, LogOut, Settings, ShieldCheck } from "lucide-react"
import { authService } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface UserProfile {
  consumer: {
    userId: {
      _id: string
      userName: string
      email: string
      mobileNumber: string
    }
    address?: {
      addressLine1: string
      city: string
      pincode: string
      state: string
    }
  }
  addresses: any[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch("/api/consumer/profile", {
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            authService.logout()
            router.push("/login?error=Session expired")
            return
          }
          throw new Error("Failed to fetch profile data.")
        }

        const data = await response.json()
        setProfile(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleLogout = async () => {
    await authService.logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <Skeleton className="h-8 rounded w-1/3 mb-2" />
              <Skeleton className="h-4 rounded w-1/2 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="rounded-lg h-64" />
                <Skeleton className="rounded-lg h-64" />
              </div>
              <Skeleton className="rounded-lg h-40 mt-6" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  if (!profile?.consumer) {
    // This case will likely be handled by the auth check, but it's good practice.
    return (
       <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile Not Found</h2>
          <p className="text-muted-foreground mt-2">Could not find your profile information.</p>
          <Button onClick={handleLogout} className="mt-4">
            Login Again
          </Button>
        </div>
      </div>
    )
  }

  const { consumer } = profile
  const mainAddress = consumer.address || (profile.addresses.length > 0 ? profile.addresses[0] : null)

  return (
    <div className="min-h-screen bg-muted/40">
      <NavigationHeader />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your account and bookings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{consumer.userId.userName}</p>
                  </div>
                </div>
                 <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{consumer.userId.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Address</p>
                    <p className="font-medium">
                      {mainAddress
                        ? `${mainAddress.addressLine1}, ${mainAddress.city}, ${mainAddress.state} - ${mainAddress.pincode}`
                        : "No address set"}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <div className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                     <ShieldCheck className="w-5 h-5" />
                     <span>Account</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                    <Button variant="ghost" className="justify-start">Change Password</Button>
                    <Button variant="ghost" className="justify-start">Notification Settings</Button>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base">
                        <Calendar className="w-5 h-5" />
                        <span>My Bookings</span>
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">View your past and upcoming service bookings.</p>
                     <Button variant="outline" className="w-full" asChild>
                         <Link href="/bookings">View All Bookings</Link>
                     </Button>
                 </CardContent>
              </Card>

               <div>
                 <Button variant="destructive" onClick={handleLogout} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
