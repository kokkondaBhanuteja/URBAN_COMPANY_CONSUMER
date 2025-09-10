"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentSheet } from "@/components/commerce/payment-sheet"
import { AuthGuard } from "@/components/consumer/auth-guard"
import { BookingForm } from "@/components/consumer/booking-form"
import { useCart } from "@/lib/cart-context"
import type { PaymentResult } from "@/lib/payments"

export default function CartPage() {
  const { items, totalItems, totalAmountSubunits, updateQuantity, removeItem, clearCart } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const formatPrice = (priceSubunits: number) => {
    return (priceSubunits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
  }

  const handleQuantityChange = (serviceId: string, optionId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(serviceId, optionId)
    } else {
      updateQuantity(serviceId, optionId, newQty)
    }
  }

  const handleProceedToBooking = () => {
    setShowBookingForm(true)
  }

  const handleBookingSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const firstItem = items[0]
      const response = await fetch("/api/consumer/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Use cookies instead of Authorization header
        body: JSON.stringify({
          serviceId: firstItem.serviceId,
          serviceAddress: formData.serviceAddress,
          scheduledAt: formData.scheduledAt,
          totalPrice: totalAmountSubunits / 100,
          specialInstructions: formData.specialInstructions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create booking")
      }

      const result = await response.json()
      setBookingData({ ...formData, bookingId: result.bookingId })
      setShowCheckout(true)
      setShowBookingForm(false)
    } catch (error: any) {
      console.error("Booking creation error:", error)
      alert(error.message || "Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (result: PaymentResult) => {
    // Clear cart after successful payment
    clearCart()
    setShowCheckout(false)
    setShowBookingForm(false)
    setBookingData(null)

    console.log("Payment successful:", result)
  }

  const paymentItems = items.map((item) => ({
    title: `${item.title} - ${item.optionTitle}`,
    quantity: item.qty,
    unitPrice: item.unitPriceSubunits,
  }))

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <PaymentSheet
              amountSubunits={totalAmountSubunits}
              currency="INR"
              items={paymentItems}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowCheckout(false)}
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setShowBookingForm(false)} className="mb-4">
                ← Back to Cart
              </Button>
              <h1 className="text-2xl font-bold text-foreground text-balance">Complete Your Booking</h1>
            </div>

            <AuthGuard>
              <BookingForm
                cartItems={items}
                totalAmount={totalAmountSubunits}
                onSubmit={handleBookingSubmit}
                loading={loading}
              />
            </AuthGuard>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="py-12">
              <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4 text-balance">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8 text-pretty">Add some services to get started</p>
              <Link href="/">
                <Button>Browse Services</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground text-balance">Your Cart</h1>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
            >
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={`${item.serviceId}-${item.optionId}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Service Image */}
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      </div>

                      {/* Service Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-balance">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.optionTitle}</p>
                        <p className="text-lg font-bold text-primary mt-2">{formatPrice(item.unitPriceSubunits)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.serviceId, item.optionId, item.qty - 1)}
                            className="p-2 h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{item.qty}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.serviceId, item.optionId, item.qty + 1)}
                            className="p-2 h-8 w-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.serviceId, item.optionId)}
                          className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Subtotal ({item.qty} item{item.qty > 1 ? "s" : ""})
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatPrice(item.unitPriceSubunits * item.qty)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items ({totalItems})</span>
                      <span className="font-medium">{formatPrice(totalAmountSubunits)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-foreground">Total</span>
                        <span className="text-lg font-bold text-primary">{formatPrice(totalAmountSubunits)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleProceedToBooking} className="w-full">
                      Proceed to Booking
                    </Button>
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full bg-transparent">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>100% Quality Assured</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>Transparent Pricing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>Expert Professionals</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
