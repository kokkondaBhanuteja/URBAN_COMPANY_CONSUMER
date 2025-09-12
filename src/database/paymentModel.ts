import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  orderId: string; // Replaced bookingId
  userId: Types.ObjectId;
  amount: number;
  paymentMethod: string; // Changed from enum to string
  paymentStatus: "pending" | "successful" | "failed";
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { // Replaced bookingId
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String, // Changed from enum to string
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

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
  
export default Payment;