import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";
import { consumerMiddleware } from "@/middlewares/consumerMiddleware";

export async function GET(req: NextRequest) {
  await connectDb();
  try {
    const middlewareResponse = await consumerMiddleware(req);
    if (middlewareResponse instanceof NextResponse) {
      return middlewareResponse;
    }
    const userId = middlewareResponse.get("x-user-id");

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }

    const transactions = await WalletTransaction.find({ walletId: wallet._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      balance: wallet.balance,
      transactions,
    });
  } catch (error) {
    console.error("Wallet balance fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}