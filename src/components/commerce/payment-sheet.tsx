"use client"

import { useState } from "react"
import { CheckCircle, ArrowLeft, Wallet } from "lucide-react" // Import Wallet icon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentButton } from "./payment-button"
import { formatCurrency, validatePaymentResult, type PaymentResult } from "@/lib/payments"

interface PaymentSheetProps {
  amountSubunits: number
  currency?: "INR"
  items: Array<{
    title: string
    quantity: number
    unitPrice: number
  }>
  onSuccess?: (result: PaymentResult) => void
  onCancel?: () => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  walletBalance?: number; // Add wallet balance
  onPayWithWallet?: () => void; // Add wallet payment handler
  isPaymentLoading?: boolean; // To show loading state
}

export function PaymentSheet({ amountSubunits, currency = "INR", items, onSuccess, onCancel, prefill, walletBalance, onPayWithWallet, isPaymentLoading }: PaymentSheetProps) {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const handlePaymentResult = (result: PaymentResult) => {
    setPaymentResult(result)

    if (result.success && validatePaymentResult(result)) {
      setShowReceipt(true)
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }

  const handleBackToShopping = () => {
    setShowReceipt(false)
    setPaymentResult(null)
    if (onCancel) {
      onCancel()
    }
  }

  if (showReceipt && paymentResult?.success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-mono text-xs">{paymentResult.paymentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-xs">{paymentResult.orderId}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Amount Paid</span>
              <span className="text-green-600">{formatCurrency(amountSubunits, currency)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Order Summary</h4>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>{formatCurrency(item.unitPrice * item.quantity, currency)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4">
            <Button onClick={handleBackToShopping} className="w-full bg-uc-purple hover:bg-uc-purple-dark text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Complete Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold">Order Summary</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.title} × {item.quantity}
                </span>
                <span>{formatCurrency(item.unitPrice * item.quantity, currency)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-uc-purple">{formatCurrency(amountSubunits, currency)}</span>
            </div>
          </div>
        </div>

        {/* Wallet Payment Option */}
        {walletBalance && walletBalance >= amountSubunits / 100 && (
          <div className="space-y-2">
             <Button onClick={onPayWithWallet} className="w-full" disabled={isPaymentLoading}>
                <Wallet className="w-4 h-4 mr-2" />
                {isPaymentLoading ? "Processing..." : `Pay with Wallet (${formatCurrency(walletBalance * 100)})`}
            </Button>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
        )}

        {/* Card Payment Button */}
        <PaymentButton
          amountSubunits={amountSubunits}
          currency={currency}
          prefill={prefill}
          notes={{
            order_type: "home_service",
            items_count: items.length.toString(),
          }}
          onResult={handlePaymentResult}
          disabled={isPaymentLoading}
        >
          Pay {formatCurrency(amountSubunits, currency)}
        </PaymentButton>

        {/* Trust Indicators */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-center space-x-4">
            <span>🔒 Secure Payment</span>
            <span>💳 All Cards Accepted</span>
          </div>
          <p className="text-center">Your payment information is encrypted and secure</p>
        </div>

        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full bg-transparent">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}