import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";
import { Types } from "mongoose";
import { nanoid } from "nanoid";

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

    const { bookingIds, amount } = await req.json();

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 });
    }

    // --- FIX START ---
    // 1. Capture the balance *before* the transaction.
    const balanceBefore = wallet.balance;

    // 2. Debit the wallet
    wallet.balance -= amount;
    await wallet.save();
    
    // The new balance is the balance *after* the transaction.
    const balanceAfter = wallet.balance;

    // 3. Create a wallet transaction record with all required fields.
    await WalletTransaction.create({
      walletId: wallet._id,
      amount: amount,
      type: "debit",
      reason: "booking_payment",
      balanceBefore,
      balanceAfter,
      description: `Payment for booking(s) associated with order.`, // Add a meaningful description
      relatedBookingId: bookingIds[0], // Link to the first booking for reference
    });
    // --- FIX END ---

    const orderId = nanoid();

    // Create a payment record
    const newPayment = new Payment({
        orderId: orderId,
        bookingId: bookingIds[0], // Link to the first booking for reference
        bookingIds: bookingIds.map((id: string) => new Types.ObjectId(id)),
        userId: new Types.ObjectId(userId),
        amount,
        paymentMethod: 'wallet',
        paymentStatus: 'successful',
        transactionId: `wallet_${nanoid()}`,
    });
    await newPayment.save();

    // Update booking status
    await Booking.updateMany(
        { _id: { $in: bookingIds.map((id: string) => new Types.ObjectId(id)) } },
        { $set: { bookingStatus: 'confirmed' } }
    );
    
    // Assign providers to the bookings
    for (const bookingId of bookingIds) {
        await fetch(`${req.nextUrl.origin}/api/consumer/bookings/${bookingId}/assign-provider`, {
            method: 'POST',
            headers: req.headers,
        });
    }

    return NextResponse.json({ message: "Payment from wallet successful" });

  } catch (error: any) {
    console.error("Wallet payment error:", error);
    return NextResponse.json({ message: error.message || "Failed to process wallet payment" }, { status: 500 });
  }
}