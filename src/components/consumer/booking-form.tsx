"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, PlusCircle } from "lucide-react"
import { authService } from "@/services/authService"

interface BookingFormProps {
  cartItems: any[]
  totalAmount: number
  onSubmit: (bookingData: any) => void
  loading?: boolean
}

interface Address {
  _id: string;
  addressLine1: string;
  city: string;
  pincode: string;
  state: string;
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
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);


  useEffect(() => {
    const fetchAddresses = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await fetch("/api/consumer/profile", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setAddresses(data.addresses);
            if (data.addresses.length > 0) {
              setSelectedAddress(data.addresses[0]._id);
              setFormData(prev => ({ ...prev, serviceAddress: data.addresses[0] }));
            } else {
              setShowNewAddressForm(true);
            }
          }
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
        }
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
        if (formData.scheduledDate && cartItems.length > 0) {
            setSlotsLoading(true);
            try {
                const serviceId = cartItems[0].serviceId;
                const location = formData.serviceAddress.city;
                const response = await fetch(`/api/consumer/services/${serviceId}/availability?date=${formData.scheduledDate}&location=${location}`);
                if(response.ok) {
                    const slots = await response.json();
                    setAvailableSlots(slots);
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                console.error("Failed to fetch availability:", error);
                setAvailableSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        }
    };

    fetchAvailability();
  }, [formData.scheduledDate, formData.serviceAddress.city, cartItems]);


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
    // ... (rest of the validation)

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

  const handleAddressSelection = (addressId: string) => {
    if (addressId === "new") {
      setShowNewAddressForm(true);
      setSelectedAddress("new");
      setFormData(prev => ({
        ...prev,
        serviceAddress: { addressLine1: "", city: "", pincode: "", state: "" }
      }));
    } else {
      const address = addresses.find(a => a._id === addressId);
      if (address) {
        setFormData(prev => ({ ...prev, serviceAddress: address }));
        setShowNewAddressForm(false);
        setSelectedAddress(addressId);
      }
    }
  };


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
                  disabled={slotsLoading || availableSlots.length === 0}
                >
                  <SelectTrigger className={errors.scheduledTime ? "border-destructive" : ""}>
                    <SelectValue placeholder={slotsLoading ? "Loading slots..." : "Select time"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
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
              <Select onValueChange={handleAddressSelection} value={selectedAddress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map(address => (
                    <SelectItem key={address._id} value={address._id}>
                      {address.addressLine1}, {address.city}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <div className="flex items-center">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add a new address
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {showNewAddressForm && (
                <div className="space-y-4 border p-4 rounded-md">
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
              )}
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