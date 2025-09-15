"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { PaymentSheet } from "@/components/commerce/payment-sheet"
import { AuthGuard } from "@/components/consumer/auth-guard"
import type { PaymentResult } from "@/lib/payments"
import { authService } from "@/services/authService"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query" // Import useQuery

// Fetch wallet balance
const fetchWalletBalance = async () => {
    const response = await fetch("/api/wallet/balance", { credentials: "include" });
    if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
    }
    return response.json();
};


export default function CheckoutPage() {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const user = authService.getUser()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  // Fetch wallet balance using react-query
  const { data: wallet } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: fetchWalletBalance,
    enabled: !!user,
  });

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId) {
        setLoading(true)
        try {
          const response = await fetch(`/api/consumer/bookings/${bookingId}`, {
            credentials: "include",
          })
          if (!response.ok) {
            throw new Error("Failed to fetch booking details")
          }
          const data = await response.json()
          setBooking(data)
        } catch (err: any) {
          toast.error("Error", { description: err.message })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchBooking()
  }, [bookingId])

  const handlePaymentSuccess = async (result: PaymentResult) => {
    if (!result.success || !result.paymentId || !booking?._id) {
      toast.error("Payment processing failed", {
        description: "Could not get required payment or booking details. Please contact support.",
      })
      return
    }

    try {
        setPaymentLoading(true)

      const paymentDetailsResponse = await fetch(`/api/razorpay/${result.paymentId}`)
      const paymentDetails = await paymentDetailsResponse.json()

      await fetch("/api/consumer/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: booking.orderId,
          bookingIds: [booking._id],
          amount: booking.pricing.finalAmount,
          paymentMethod: paymentDetails.method || 'online',
          paymentStatus: "successful",
          transactionId: result.paymentId,
        }),
      })

      await fetch(`/api/consumer/bookings/${booking._id}/assign-provider`, {
        method: "POST",
        credentials: "include",
      })

      await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: booking._id }),
      })

      toast.success("Payment successful!", {
        description: "We are now assigning a top-rated professional for your service.",
      })
    } catch (error) {
      console.error("Post-payment processing failed:", error)
      toast.error("Payment Recording Failed", {
        description: "Your payment was successful but we had trouble recording it. Please contact support.",
      })
    } finally {
        setPaymentLoading(false)
      router.push('/bookings')
    }
  }
  
    const handleCancelBooking = async () => {
    if (!bookingId) return;
    try {
      const response = await fetch(`/api/consumer/bookings/${bookingId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel booking");
      }
      toast.success("Booking Cancelled", {
        description: "Your booking has been successfully cancelled.",
      });
      router.push("/bookings");
    } catch (error: any) {
      toast.error("Cancellation Failed", {
        description: error.message,
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>Booking not found.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const paymentItems = [{
    title: booking.serviceId.serviceName,
    quantity: 1,
    unitPrice: booking.pricing.finalAmount * 100,
  }]

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuthGuard>
            <PaymentSheet
              amountSubunits={booking.pricing.finalAmount * 100}
              currency="INR"
              items={paymentItems}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancelBooking} // Use the new cancel handler
              prefill={{
                name: user?.fullName,
                email: user?.email,
              }}
              walletBalance={wallet?.balance}
              isPaymentLoading={paymentLoading}
            />
          </AuthGuard>
        </div>
      </main>
      <Footer />
    </div>
  )
}