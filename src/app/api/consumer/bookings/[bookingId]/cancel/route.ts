import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import logger from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  await connectDb();
  const session = await mongoose.startSession();
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

    const booking = await Booking.findById(params.bookingId).session(session);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const cancellableStatuses = ["requested", "confirmed", "assigned"];
    if (!cancellableStatuses.includes(booking.bookingStatus)) {
      return NextResponse.json(
        {
          message: `Cannot cancel a booking with status: ${booking.bookingStatus}`,
        },
        { status: 400 }
      );
    }

    const twentyFourHours = 24 * 60 * 60 * 1000;
    const timeDifference =
      new Date().getTime() - new Date(booking.createdAt).getTime();
    if (timeDifference > twentyFourHours) {
      return NextResponse.json(
        { message: "Booking cannot be cancelled after 24 hours" },
        { status: 400 }
      );
    }

    const payment = await Payment.findOne({
      bookingIds: { $in: [booking._id] },
    }).session(session);
    if (!payment) {
      return NextResponse.json(
        { message: "Payment for this booking not found." },
        { status: 404 }
      );
    }

    const refundAmount = payment.amount * 0.1;

    const wallet = await Wallet.findOne({ userId: booking.userId }).session(
      session
    );
    if (!wallet) {
      return NextResponse.json(
        { message: "User wallet not found. Cannot process refund." },
        { status: 404 }
      );
    }

    const balanceBefore = wallet.balance;
    wallet.balance += refundAmount;
    await wallet.save({ session });
    const balanceAfter = wallet.balance;

    await WalletTransaction.create(
      [
        {
          walletId: wallet._id,
          amount: refundAmount,
          type: "credit",
          reason: "booking_refund",
          balanceBefore,
          balanceAfter,
          description: `Refund for cancelled booking #${booking._id
            .toString()
            .slice(-6)}`,
          relatedBookingId: booking._id,
          externalTransactionId: `refund_${nanoid()}`,
        },
      ],
      { session }
    );

    booking.bookingStatus = "cancelled_by_user";
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      message: `Booking cancelled successfully. ${new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
        }
      ).format(refundAmount)} has been credited to your wallet.`,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Booking cancellation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}