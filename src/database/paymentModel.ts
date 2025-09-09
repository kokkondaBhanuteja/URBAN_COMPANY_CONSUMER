import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  bookingId: Types.ObjectId; // Ref to Booking
  amount: number;
  paymentMethod: "credit_card" | "upi" | "net_banking" | "cod";
  paymentStatus: "pending" | "successful" | "failed";
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "upi", "net_banking", "cod"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
      index: true,
    },
    transactionId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
