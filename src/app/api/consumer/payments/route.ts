import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Payment from "@/database/paymentModel";
import Booking from "@/database/bookingModel";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 });
    }

    const {
      orderId,
      bookingIds,
      amount,
      paymentMethod,
      paymentStatus,
      transactionId,
    } = await req.json();

    const newPayment = new Payment({
      orderId,
      bookingId: bookingIds[0], // Link to the first booking for reference
      bookingIds,
      userId: new Types.ObjectId(userId),
      amount,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    await newPayment.save();

    await Booking.updateMany({ orderId }, {
      $set: { bookingStatus: "confirmed" },
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}