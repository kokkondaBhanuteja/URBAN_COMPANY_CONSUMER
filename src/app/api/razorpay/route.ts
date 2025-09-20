import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import logger from "@/lib/logger";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();

    const options = {
      amount: amount,
      currency: currency,
      receipt: `receipt_${nanoid()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    logger.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { message: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}