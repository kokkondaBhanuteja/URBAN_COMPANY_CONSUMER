"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConsumerAuthFormProps {
  mode: "login" | "signup"
  onSubmit: (data: any) => void
  loading?: boolean
  error?: string
}

export function ConsumerAuthForm({ mode, onSubmit, loading = false, error }: ConsumerAuthFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
    mobileNumber: "",
    address: {
      addressLine1: "",
      city: "",
      pincode: "",
      state: "",
      country: "India",
      addressType: "home" as "home" | "work" | "other",
    },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (mode === "signup") {
      if (!formData.userName) {
        newErrors.userName = "Name is required"
      }
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = "Mobile number is required"
      } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = "Please enter a valid 10-digit mobile number"
      }
      if (!formData.address.addressLine1) {
        newErrors.addressLine1 = "Address is required"
      }
      if (!formData.address.city) {
        newErrors.city = "City is required"
      }
      if (!formData.address.pincode) {
        newErrors.pincode = "Pincode is required"
      }
      if (!formData.address.state) {
        newErrors.state = "State is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      if (mode === "login") {
        onSubmit({
          email: formData.email,
          password: formData.password,
        })
      } else {
        onSubmit(formData)
      }
    }
  }

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-balance">
          {mode === "login" ? "Welcome Back" : "Join Urban Company"}
        </CardTitle>
        <p className="text-muted-foreground text-pretty">
          {mode === "login" ? "Sign in to book services" : "Create your account to get started"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  type="text"
                  value={formData.userName}
                  onChange={(e) => updateFormData("userName", e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.userName ? "border-destructive" : ""}
                />
                {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName}</p>}
              </div>

              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => updateFormData("mobileNumber", e.target.value)}
                  placeholder="Enter your mobile number"
                  className={errors.mobileNumber ? "border-destructive" : ""}
                />
                {errors.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.mobileNumber}</p>}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              placeholder="Enter your password"
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
          </div>

          {mode === "signup" && (
            <>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground">Address Information</h3>

                <div>
                  <Label htmlFor="addressLine1">Address</Label>
                  <Textarea
                    id="addressLine1"
                    value={formData.address.addressLine1}
                    onChange={(e) => updateFormData("address.addressLine1", e.target.value)}
                    placeholder="Enter your complete address"
                    className={errors.addressLine1 ? "border-destructive" : ""}
                    rows={2}
                  />
                  {errors.addressLine1 && <p className="text-sm text-destructive mt-1">{errors.addressLine1}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateFormData("address.city", e.target.value)}
                      placeholder="City"
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => updateFormData("address.pincode", e.target.value)}
                      placeholder="Pincode"
                      className={errors.pincode ? "border-destructive" : ""}
                    />
                    {errors.pincode && <p className="text-sm text-destructive mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => updateFormData("address.state", e.target.value)}
                      placeholder="State"
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <Label htmlFor="addressType">Address Type</Label>
                    <Select
                      value={formData.address.addressType}
                      onValueChange={(value) => updateFormData("address.addressType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => {
              alert("Google sign-in integration coming soon!")
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
