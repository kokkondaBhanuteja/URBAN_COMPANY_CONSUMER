// Frontend-only Razorpay integration with mock order creation

export interface PaymentResult {
  success: boolean
  paymentId?: string
  orderId?: string
  signature?: string
  error?: string
}

export interface MockOrder {
  id: string
  amount: number
  currency: "INR"
}

export interface PaymentOptions {
  amountSubunits: number
  currency?: "INR"
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
}

// Create mock order for test mode
export function createMockOrder(amountSubunits: number, currency: "INR" = "INR"): MockOrder {
  return {
    id: `order_mock_${Date.now()}`,
    amount: amountSubunits,
    currency,
  }
}

// Load Razorpay script dynamically
let razorpayLoaded = false
let razorpayLoading = false

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (razorpayLoaded) {
      resolve(true)
      return
    }

    if (razorpayLoading) {
      // Wait for existing load to complete
      const checkLoaded = () => {
        if (razorpayLoaded) {
          resolve(true)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    razorpayLoading = true

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => {
      razorpayLoaded = true
      razorpayLoading = false
      resolve(true)
    }
    script.onerror = () => {
      razorpayLoading = false
      resolve(false)
    }

    document.body.appendChild(script)
  })
}

// Open Razorpay checkout
export async function openRazorpayCheckout(options: PaymentOptions): Promise<PaymentResult> {
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY

  if (!razorpayKey) {
    return {
      success: false,
      error: "Razorpay key not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY environment variable.",
    }
  }

  const scriptLoaded = await loadRazorpayScript()
  if (!scriptLoaded) {
    return {
      success: false,
      error: "Failed to load Razorpay script. Please check your internet connection.",
    }
  }

  const mockOrder = createMockOrder(options.amountSubunits, options.currency)

  return new Promise((resolve) => {
    const razorpayOptions = {
      key: razorpayKey,
      amount: options.amountSubunits,
      currency: options.currency || "INR",
      name: "Urban Company",
      description: "Home Services Payment",
      image: "/favicon.ico",
      order_id: mockOrder.id,
      prefill: options.prefill || {},
      notes: options.notes || {},
      theme: {
        color: "#6c5ce7", // UC purple
      },
      modal: {
        ondismiss: () => {
          resolve({
            success: false,
            error: "Payment cancelled by user",
          })
        },
        confirm_close: true,
      },
      handler: (response: any) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        })
      },
    }

    // @ts-ignore - Razorpay is loaded dynamically
    const rzp = new window.Razorpay(razorpayOptions)

    rzp.on("payment.failed", (response: any) => {
      resolve({
        success: false,
        error: response.error.description || "Payment failed",
      })
    })

    rzp.open()
  })
}

// Format currency for display
export function formatCurrency(amountSubunits: number, currency: "INR" = "INR"): string {
  return (amountSubunits / 100).toLocaleString("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
}

// Validate payment result (in real app, this would be done on server)
export function validatePaymentResult(result: PaymentResult): boolean {
  // In a real application, you would verify the signature on the server
  // For this demo, we just check if we have the required fields
  return !!(result.success && result.paymentId && result.orderId)
}
