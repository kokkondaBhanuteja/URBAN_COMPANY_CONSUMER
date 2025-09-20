import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Payment from "@/database/paymentModel";
import Booking from "@/database/bookingModel";
import { Types, startSession } from "mongoose";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  await connectDb();
  const session = await startSession();
  session.startTransaction();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found" },
        { status: 401 }
      );
    }

    const {
      orderId,
      bookingIds,
      amount,
      paymentMethod,
      paymentStatus,
      transactionId,
      razorpayResponse,
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
      razorpayResponse,
    });

    await newPayment.save({ session });

    await Booking.updateMany(
      { orderId },
      {
        $set: { bookingStatus: "confirmed" },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Payment creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}