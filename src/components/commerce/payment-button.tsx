"use client"

import type React from "react"

import { useState } from "react"
import { CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { openRazorpayCheckout, type PaymentResult, type PaymentOptions } from "@/lib/payments"

interface PaymentButtonProps extends PaymentOptions {
  onResult?: (result: PaymentResult) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function PaymentButton({
  amountSubunits,
  currency = "INR",
  prefill,
  notes,
  onResult,
  disabled = false,
  className = "",
  children,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY
  const isTestMode = !razorpayKey || razorpayKey.startsWith("rzp_test_")

  const handlePayment = async () => {
    if (!razorpayKey) {
      setError("Payment is not configured. Please contact support.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await openRazorpayCheckout({
        amountSubunits,
        currency,
        prefill,
        notes,
      })

      if (onResult) {
        onResult(result)
      }

      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Payment error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!razorpayKey) {
    return (
      <div className="space-y-2">
        <Button disabled className={`w-full ${className}`}>
          <AlertCircle className="w-4 h-4 mr-2" />
          Payment Not Available
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To enable payments, set the <code>NEXT_PUBLIC_RAZORPAY_KEY</code> environment variable with your Razorpay
            key.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePayment}
          disabled={disabled || loading}
          className={`flex-1 bg-uc-purple hover:bg-uc-purple-dark text-white ${className}`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {loading ? "Processing..." : children || "Pay Now"}
        </Button>

        {isTestMode && (
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
            Test Mode
          </Badge>
        )}
      </div>

      {isTestMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This is test mode. No real money will be charged. Use test card: 4111 1111 1111 1111
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
