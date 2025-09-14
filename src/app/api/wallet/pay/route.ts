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

    // 1. Debit the wallet
    wallet.balance -= amount;
    await wallet.save();

    // 2. Create a wallet transaction record
    await WalletTransaction.create({
      walletId: wallet._id,
      amount: amount,
      type: "debit",
      reason: "booking_payment",
      bookingId: bookingIds[0], // Assuming one booking for now
    });

    const orderId = nanoid();

    // 3. Create a payment record
    const newPayment = new Payment({
        orderId: orderId,
        bookingIds: bookingIds.map((id: string) => new Types.ObjectId(id)),
        userId: new Types.ObjectId(userId),
        amount,
        paymentMethod: 'wallet',
        paymentStatus: 'successful',
        transactionId: `wallet_${nanoid()}`,
    });
    await newPayment.save();

    // 4. Update booking status
    await Booking.updateMany(
        { _id: { $in: bookingIds.map((id: string) => new Types.ObjectId(id)) } },
        { $set: { bookingStatus: 'confirmed' } }
    );
    
    // 5. Assign providers to the bookings
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