import { type NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";
import Refund from "@/database/refundModel";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
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

    const booking = await Booking.findById(params.bookingId);

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (booking.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Rule 1: Check if booking is in a cancellable state
    const cancellableStatuses = ["requested", "confirmed", "assigned"];
    if (!cancellableStatuses.includes(booking.bookingStatus)) {
      return NextResponse.json(
        { message: `Cannot cancel a booking with status: ${booking.bookingStatus}` },
        { status: 400 }
      );
    }

    // Rule 2: Check if within 24 hours of creation
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const timeDifference = new Date().getTime() - new Date(booking.createdAt).getTime();
    if (timeDifference > twentyFourHours) {
      return NextResponse.json(
        { message: "Booking cannot be cancelled after 24 hours" },
        { status: 400 }
      );
    }

    // Find the associated payment
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment || !payment.transactionId) {
      return NextResponse.json({ message: "Payment for this booking not found or is incomplete." }, { status: 404 });
    }
    
    // Rule 3: Calculate 10% refund
    const refundAmount = payment.amount * 0.10;
    const refundAmountInSubunits = Math.round(refundAmount * 100);

    // Initiate refund with Razorpay
    const refund = await razorpay.payments.refund(payment.transactionId, {
      amount: refundAmountInSubunits,
      speed: "normal",
      notes: {
        reason: "User cancelled booking within 24 hours.",
        bookingId: booking._id.toString(),
      },
    });

    // Save refund details to our database
    const newRefund = new Refund({
      bookingId: booking._id,
      paymentId_razorpay: payment.transactionId,
      userId: booking.userId,
      refundAmount: refundAmount,
      status: "processed", 
      refundId_razorpay: refund.id,
      processedAt: new Date(),
    });
    await newRefund.save();

    // Update the booking status
    booking.bookingStatus = "cancelled_by_user";
    await booking.save();

    return NextResponse.json({
      message: "Booking cancelled successfully. A 10% refund has been initiated.",
      refundDetails: newRefund,
    });

  } catch (error: any) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

