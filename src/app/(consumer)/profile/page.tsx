"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { User, MapPin, Mail, LogOut, ShieldCheck, Briefcase } from "lucide-react"
import { authService } from "@/services/authService"
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
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Form state for editing
  const [formData, setFormData] = useState({
    userName: "",
    addressLine1: "",
    city: "",
    pincode: "",
    state: "",
  })

  const fetchProfile = async () => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    setLoading(true)
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
      // Pre-fill form data
      setFormData({
        userName: data.consumer.userId.userName,
        addressLine1: data.addresses[0]?.addressLine1 || "",
        city: data.addresses[0]?.city || "",
        pincode: data.addresses[0]?.pincode || "",
        state: data.addresses[0]?.state || "",
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/consumer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      setIsSheetOpen(false) // Close the sheet on success
      await fetchProfile() // Refetch profile to show updated info
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = "/"
  }

  if (loading && !profile) {
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
        <div className="text-center p-4">
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold">Profile Not Found</h2>
          <p className="text-muted-foreground mt-2">Could not find your profile information.</p>
          <Button onClick={handleLogout} className="mt-4">
            Login Again
          </Button>
        </div>
      </div>
    )
  }

  const { consumer, addresses } = profile
  const mainAddress = addresses[0]

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
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full bg-transparent">
                        Edit Profile
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                      </SheetHeader>
                      <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="userName">Full Name</Label>
                          <Input
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Account</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                  <Button variant="ghost" className="justify-start">
                    Change Password
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    Notification Settings
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Briefcase className="w-5 h-5" />
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