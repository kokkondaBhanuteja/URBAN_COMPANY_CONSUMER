import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import logger from "@/lib/logger";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const paymentId = params.paymentId;

    if (!paymentId) {
      return NextResponse.json(
        { message: "Payment ID is required" },
        { status: 400 }
      );
    }

    const payment = await razorpay.payments.fetch(paymentId);

    return NextResponse.json(payment);
  } catch (error) {
    logger.error("Razorpay payment fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch Razorpay payment details" },
      { status: 500 }
    );
  }
}