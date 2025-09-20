import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import logger from "@/lib/logger";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    const { amount } = await req.json();

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_wallet_${nanoid()}`,
      notes: {
        userId,
        purpose: "wallet_topup",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    logger.error("Razorpay wallet topup error:", error);
    return NextResponse.json(
      { message: "Failed to create Razorpay order for wallet topup" },
      { status: 500 }
    );
  }
}