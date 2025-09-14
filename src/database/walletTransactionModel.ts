import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWalletTransaction extends Document {
  walletId: Types.ObjectId;
  amount: number;
  type: "credit" | "debit";
  reason: "topup" | "booking_payment" | "refund";
  bookingId?: Types.ObjectId;
  transactionId?: string; // For Razorpay transaction ID
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    reason: {
      type: String,
      enum: ["topup", "booking_payment", "refund"],
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>(
    "WalletTransaction",
    walletTransactionSchema
  );

export default WalletTransaction;