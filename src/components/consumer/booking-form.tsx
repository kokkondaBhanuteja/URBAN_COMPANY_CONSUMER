"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin } from "lucide-react"

interface BookingFormProps {
  cartItems: any[]
  totalAmount: number
  onSubmit: (bookingData: any) => void
  loading?: boolean
}

export function BookingForm({ cartItems, totalAmount, onSubmit, loading = false }: BookingFormProps) {
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    serviceAddress: {
      addressLine1: "",
      city: "",
      pincode: "",
      state: "",
    },
    specialInstructions: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Please select a date"
    }
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Please select a time"
    }
    if (!formData.serviceAddress.addressLine1) {
      newErrors.addressLine1 = "Address is required"
    }
    if (!formData.serviceAddress.city) {
      newErrors.city = "City is required"
    }
    if (!formData.serviceAddress.pincode) {
      newErrors.pincode = "Pincode is required"
    }
    if (!formData.serviceAddress.state) {
      newErrors.state = "State is required"
    }

    // Validate date is not in the past
    if (formData.scheduledDate) {
      const selectedDate = new Date(formData.scheduledDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.scheduledDate = "Please select a future date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      onSubmit({
        ...formData,
        scheduledAt: scheduledAt.toISOString(),
        totalPrice: totalAmount,
      })
    }
  }

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith("serviceAddress.")) {
      const addressField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        serviceAddress: {
          ...prev.serviceAddress,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount / 100)
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-balance">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.optionTitle}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.unitPriceSubunits * item.qty)}</p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-bold">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Your Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Service Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  min={minDate}
                  value={formData.scheduledDate}
                  onChange={(e) => updateFormData("scheduledDate", e.target.value)}
                  className={errors.scheduledDate ? "border-destructive" : ""}
                />
                {errors.scheduledDate && <p className="text-sm text-destructive mt-1">{errors.scheduledDate}</p>}
              </div>

              <div>
                <Label htmlFor="scheduledTime">Preferred Time</Label>
                <Select
                  value={formData.scheduledTime}
                  onValueChange={(value) => updateFormData("scheduledTime", value)}
                >
                  <SelectTrigger className={errors.scheduledTime ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
                {errors.scheduledTime && <p className="text-sm text-destructive mt-1">{errors.scheduledTime}</p>}
              </div>
            </div>

            {/* Service Address */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Service Address
              </h3>

              <div>
                <Label htmlFor="addressLine1">Complete Address</Label>
                <Textarea
                  id="addressLine1"
                  value={formData.serviceAddress.addressLine1}
                  onChange={(e) => updateFormData("serviceAddress.addressLine1", e.target.value)}
                  placeholder="Enter your complete address"
                  className={errors.addressLine1 ? "border-destructive" : ""}
                  rows={2}
                />
                {errors.addressLine1 && <p className="text-sm text-destructive mt-1">{errors.addressLine1}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.serviceAddress.city}
                    onChange={(e) => updateFormData("serviceAddress.city", e.target.value)}
                    placeholder="City"
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.serviceAddress.pincode}
                    onChange={(e) => updateFormData("serviceAddress.pincode", e.target.value)}
                    placeholder="Pincode"
                    className={errors.pincode ? "border-destructive" : ""}
                  />
                  {errors.pincode && <p className="text-sm text-destructive mt-1">{errors.pincode}</p>}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.serviceAddress.state}
                    onChange={(e) => updateFormData("serviceAddress.state", e.target.value)}
                    placeholder="State"
                    className={errors.state ? "border-destructive" : ""}
                  />
                  {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => updateFormData("specialInstructions", e.target.value)}
                placeholder="Any specific requirements or instructions for the service provider"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
