import { type NextRequest, NextResponse } from "next/server";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";
import { Types, startSession } from "mongoose";
import { nanoid } from "nanoid";
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

    const { bookingIds, amount } = await req.json();

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { message: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    const balanceBefore = wallet.balance;

    wallet.balance -= amount;
    await wallet.save({ session });

    const balanceAfter = wallet.balance;

    await WalletTransaction.create(
      [
        {
          walletId: wallet._id,
          amount: amount,
          type: "debit",
          reason: "booking_payment",
          balanceBefore,
          balanceAfter,
          description: `Payment for booking(s) associated with order.`,
          relatedBookingId: bookingIds[0],
        },
      ],
      { session }
    );

    const orderId = nanoid();

    const newPayment = new Payment({
      orderId: orderId,
      bookingId: bookingIds[0],
      bookingIds: bookingIds.map((id: string) => new Types.ObjectId(id)),
      userId: new Types.ObjectId(userId),
      amount,
      paymentMethod: "wallet",
      paymentStatus: "successful",
      transactionId: `wallet_${nanoid()}`,
    });
    await newPayment.save({ session });

    await Booking.updateMany(
      { _id: { $in: bookingIds.map((id: string) => new Types.ObjectId(id)) } },
      { $set: { bookingStatus: "confirmed" } },
      { session }
    );

    for (const bookingId of bookingIds) {
      await fetch(
        `${req.nextUrl.origin}/api/consumer/bookings/${bookingId}/assign-provider`,
        {
          method: "POST",
          headers: req.headers,
        }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ message: "Payment from wallet successful" });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Wallet payment error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process wallet payment" },
      { status: 500 }
    );
  }
}