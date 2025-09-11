"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { User, Mail, LogOut, Briefcase, KeyRound, Home, PlusCircle, MoreVertical, Trash2, Edit } from "lucide-react"
import { authService } from "@/services/authService"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// ... (interfaces remain the same)

interface Address {
  _id: string
  addressLine1: string
  city: string
  pincode: string
  state: string
  addressType: "home" | "work" | "other"
}

interface UserProfile {
  consumer: {
    userId: {
      _id: string
      userName: string
      email: string
    }
  }
  addresses: Address[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressFormData, setAddressFormData] = useState({
    addressLine1: "",
    city: "",
    pincode: "",
    state: "",
    addressType: "home" as Address["addressType"],
  })

  // State for password change
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // ... (fetchProfile and other address functions remain the same)
  const fetchProfile = async () => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/consumer/profile", { credentials: "include" })
      if (!response.ok) throw new Error("Failed to fetch profile data.")
      const data = await response.json()
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [router])

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddressFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openNewAddressSheet = () => {
    setEditingAddress(null)
    setAddressFormData({
      addressLine1: "",
      city: "",
      pincode: "",
      state: "",
      addressType: "home",
    })
    setIsAddressSheetOpen(true)
  }

  const openEditAddressSheet = (address: Address) => {
    setEditingAddress(address)
    setAddressFormData({
      addressLine1: address.addressLine1,
      city: address.city,
      pincode: address.pincode,
      state: address.state,
      addressType: address.addressType,
    })
    setIsAddressSheetOpen(true)
  }

  const handleAddressFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingAddress
      ? `/api/consumer/addresses/${editingAddress._id}`
      : "/api/consumer/addresses"
    const method = editingAddress ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addressFormData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save address")
      }

      toast.success(`Address ${editingAddress ? "updated" : "added"} successfully!`)
      setIsAddressSheetOpen(false)
      await fetchProfile() // Re-fetch profile to show updated info
    } catch (error: any) {
      toast.error("Operation Failed", { description: error.message })
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const response = await fetch(`/api/consumer/addresses/${addressId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to delete address")

      toast.success("Address deleted successfully!")
      await fetchProfile() // Re-fetch profile
    } catch (error: any) {
      toast.error("Deletion Failed", { description: error.message })
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    try {
      const response = await fetch("/api/consumer/password/change", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to update password")
      }

      toast.success("Password updated successfully!")
      setIsPasswordSheetOpen(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }) // Clear form
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = "/"
  }

  // ... (loading and error states remain the same)
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
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !profile?.consumer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-semibold text-destructive">
            {error ? "An Error Occurred" : "Profile Not Found"}
          </h2>
          <p className="text-muted-foreground mt-2">{error || "Could not find your profile information."}</p>
          <Button onClick={handleLogout} className="mt-4">
            Login Again
          </Button>
        </div>
      </div>
    )
  }

  const { consumer, addresses } = profile

  return (
    <div className="min-h-screen bg-muted/40">
      <NavigationHeader />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your account, addresses, and bookings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ... (User and Mail sections remain the same) */}
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
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="justify-start w-full"
                      onClick={() => setIsPasswordSheetOpen(true)}
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Address Management */}
              {/* ... (Address card remains the same) */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Home className="w-5 h-5" />
                    <span>My Addresses</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={openNewAddressSheet}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                      <div
                        key={address._id}
                        className="flex items-start justify-between p-4 border rounded-md"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{address.addressType.toUpperCase()}</p>
                            {index === 0 && <span className="text-xs text-primary font-semibold">(Primary)</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {`${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditAddressSheet(address)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteAddress(address._id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No addresses saved yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            {/* ... (Right column remains the same) */}
             <div className="space-y-6">
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

      {/* Add/Edit Address Sheet */}
      {/* ... (Address sheet remains the same) */}
        <Sheet open={isAddressSheetOpen} onOpenChange={setIsAddressSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingAddress ? "Edit Address" : "Add New Address"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddressFormSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input id="addressLine1" name="addressLine1" value={addressFormData.addressLine1} onChange={handleAddressInputChange} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={addressFormData.city} onChange={handleAddressInputChange} />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" value={addressFormData.pincode} onChange={handleAddressInputChange} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={addressFormData.state} onChange={handleAddressInputChange} />
            </div>
            <Button type="submit">Save Address</Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Change Password Sheet */}
      <Sheet open={isPasswordSheetOpen} onOpenChange={setIsPasswordSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Change Password</SheetTitle>
          </SheetHeader>
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  )
}