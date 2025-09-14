"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { authService } from "@/services/authService"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

// Fetch wallet balance
const fetchWalletBalance = async () => {
    const response = await fetch("/api/wallet/balance", { credentials: "include" });
    if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
    }
    return response.json();
};


export default function CartPage() {
  const { items, totalItems, totalAmountSubunits, updateQuantity, removeItem, clearCart } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const user = authService.getUser()
  const router = useRouter()

  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: fetchWalletBalance,
    enabled: !!user, // Only fetch if user is logged in
  });


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
      const servicesPayload = items.map(item => ({
        serviceId: item.serviceId,
        totalPrice: (item.unitPriceSubunits * item.qty) / 100,
      }));

      const response = await fetch("/api/consumer/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          services: servicesPayload,
          serviceAddress: formData.serviceAddress,
          scheduledAt: formData.scheduledAt,
          specialInstructions: formData.specialInstructions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create booking")
      }

      const result = await response.json()

      setBookingData({
        ...formData,
        orderId: result.orderId,
        bookingIds: result.bookingIds,
      })

      setShowCheckout(true)
      setShowBookingForm(false)
    } catch (error: any) {
      toast.error("Booking creation failed", {
        description: error.message || "Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (result: PaymentResult) => {
    if (!result.success || !result.paymentId || !bookingData?.orderId) {
      toast.error("Payment processing failed", {
        description: "Could not get required payment or booking details. Please contact support.",
      })
      return
    }

    try {
      setLoading(true)

      const paymentDetailsResponse = await fetch(`/api/razorpay/${result.paymentId}`)
      const paymentDetails = await paymentDetailsResponse.json()

      await fetch("/api/consumer/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: bookingData.orderId,
          bookingIds: bookingData.bookingIds,
          amount: totalAmountSubunits / 100,
          paymentMethod: paymentDetails.method || 'online',
          paymentStatus: "successful",
          transactionId: result.paymentId,
        }),
      })

      for (const bookingId of bookingData.bookingIds) {
        await fetch(`/api/consumer/bookings/${bookingId}/assign-provider`, {
          method: "POST",
          credentials: "include",
        })

        await fetch("/api/payouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ bookingId: bookingId }),
        })
      }

      toast.success("Payment successful!", {
        description: "We are now assigning a top-rated professional for your service.",
      })
    } catch (error) {
      console.error("Post-payment processing failed:", error)
      toast.error("Payment Recording Failed", {
        description: "Your payment was successful but we had trouble recording it. Please contact support.",
      })
    } finally {
      setLoading(false)
      handleCheckoutClose()
    }
  }

  const handlePayWithWallet = async () => {
    if (!wallet || wallet.balance < totalAmountSubunits / 100) {
        toast.error("Insufficient wallet balance");
        return;
    }

    setLoading(true);
    try {
        const response = await fetch("/api/wallet/pay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                bookingIds: bookingData.bookingIds,
                amount: totalAmountSubunits / 100,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Wallet payment failed");
        }
        
        toast.success("Payment successful with wallet!");
        handleCheckoutClose();

    } catch (error: any) {
        toast.error("Wallet Payment Failed", {
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
};

  const handleCheckoutClose = () => {
    clearCart()
    setShowCheckout(false)
    setShowBookingForm(false)
    setBookingData(null)
    router.push('/bookings')
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
            {wallet && wallet.balance >= totalAmountSubunits / 100 && (
                <div className="mb-4">
                    <Button onClick={handlePayWithWallet} className="w-full" disabled={loading}>
                        {loading ? "Processing..." : `Pay with Wallet (${formatPrice(wallet.balance * 100)})`}
                    </Button>
                </div>
            )}
            <PaymentSheet
              amountSubunits={totalAmountSubunits}
              currency="INR"
              items={paymentItems}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCheckoutClose}
              prefill={{
                name: user?.fullName,
                email: user?.email,
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ... (the rest of your component remains the same)
  // ...
}