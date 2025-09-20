// src/lib/payments.ts
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  razorpayResponse?: any; // Added to hold the full response
}

export interface PaymentOptions {
  amountSubunits: number;
  currency?: "INR";
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

let razorpayLoaded = false;
let razorpayLoading = false;

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (razorpayLoaded) {
      resolve(true);
      return;
    }

    if (razorpayLoading) {
      const checkLoaded = () => {
        if (razorpayLoaded) {
          resolve(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    razorpayLoading = true;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      razorpayLoaded = true;
      razorpayLoading = false;
      resolve(true);
    };
    script.onerror = () => {
      razorpayLoading = false;
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  options: PaymentOptions
): Promise<PaymentResult> {
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!razorpayKey) {
    return {
      success: false,
      error:
        "Razorpay key not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable.",
    };
  }

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return {
      success: false,
      error:
        "Failed to load Razorpay script. Please check your internet connection.",
    };
  }

  // Create order on the server
  const orderResponse = await fetch("/api/razorpay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: options.amountSubunits,
      currency: options.currency || "INR",
    }),
  });

  if (!orderResponse.ok) {
    return {
      success: false,
      error: "Failed to create Razorpay order.",
    };
  }
  
  const order = await orderResponse.json();


  return new Promise((resolve) => {
    const razorpayOptions = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: "Urban Company",
      description: "Home Services Payment",
      image: "/favicon.ico",
      order_id: order.id,
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
          });
        },
        confirm_close: true,
      },
      handler: (response: any) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          razorpayResponse: response, // Include the full response
        });
      },
    };

    // @ts-ignore - Razorpay is loaded dynamically
    const rzp = new window.Razorpay(razorpayOptions);

    rzp.on("payment.failed", (response: any) => {
      resolve({
        success: false,
        error: response.error.description || "Payment failed",
        razorpayResponse: response, // Include the full response on failure too
      });
    });

    rzp.open();
  });
}

export function formatCurrency(
  amountSubunits: number,
  currency: "INR" = "INR"
): string {
  return (amountSubunits / 100).toLocaleString("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function validatePaymentResult(result: PaymentResult): boolean {
  return !!(result.success && result.paymentId && result.orderId);
}