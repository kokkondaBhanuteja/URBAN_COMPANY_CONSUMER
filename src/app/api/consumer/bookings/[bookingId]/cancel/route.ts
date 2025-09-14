import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";
import Wallet from "@/database/walletModel"; // --- 1. IMPORT Wallet model
import WalletTransaction from "@/database/walletTransactionModel"; // --- 2. IMPORT WalletTransaction model
import { nanoid } from "nanoid";

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

    // Find the associated payment to calculate the refund from
    const payment = await Payment.findOne({ bookingIds: { $in: [booking._id] } });
    if (!payment) {
      return NextResponse.json({ message: "Payment for this booking not found." }, { status: 404 });
    }
    
    // --- 3. MODIFIED REFUND LOGIC ---

    // Calculate 10% refund
    const refundAmount = payment.amount * 0.10;

    // Find the user's wallet
    const wallet = await Wallet.findOne({ userId: booking.userId });
    if (!wallet) {
      return NextResponse.json({ message: "User wallet not found. Cannot process refund." }, { status: 404 });
    }

    // Credit the refund amount to the wallet
    wallet.balance += refundAmount;
    await wallet.save();

    // Create a wallet transaction record for the refund
    await WalletTransaction.create({
      walletId: wallet._id,
      amount: refundAmount,
      type: "credit",
      reason: "refund",
      bookingId: booking._id,
      transactionId: `refund_${nanoid()}`,
    });
    
    // --- END OF MODIFIED LOGIC ---

    // Update the booking status
    booking.bookingStatus = "cancelled_by_user";
    await booking.save();

    return NextResponse.json({
      message: `Booking cancelled successfully. ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(refundAmount)} has been credited to your wallet.`,
    });

  } catch (error: any) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to cancel booking" },
      { status: 500 }
    );
  }
}