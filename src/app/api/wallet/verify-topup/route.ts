import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
      }

      // --- FIX START ---
      const balanceBefore = wallet.balance;

      wallet.balance += amount;
      await wallet.save();

      const balanceAfter = wallet.balance;

      await WalletTransaction.create({
        walletId: wallet._id,
        amount: amount,
        type: "credit",
        reason: "wallet_topup", // Use the correct reason from the schema
        balanceBefore, // Add the balance before the transaction
        balanceAfter, // Add the balance after the transaction
        description: `Wallet top-up of ${new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)}`, // Add a meaningful description
        externalTransactionId: razorpay_payment_id, // Use the correct field for external IDs
      });
      // --- FIX END ---

      return NextResponse.json({ message: "Top-up successful", balance: wallet.balance });
    } else {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Wallet topup verification error:", error);
    return NextResponse.json(
      { message: "Failed to verify wallet topup" },
      { status: 500 }
    );
  }
}