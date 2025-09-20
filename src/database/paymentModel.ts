import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  orderId: string;
  bookingId?: Types.ObjectId; // Add this optional field
  bookingIds: Types.ObjectId[];
  userId: Types.ObjectId;
  amount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "successful" | "failed";
  transactionId?: string;
  razorpayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    // Add the bookingId to satisfy the database's unique index
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      unique: true,
      // sparse: true allows multiple documents to have a null value,
      // which is good practice for optional unique fields.
      sparse: true,
    },
    bookingIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    }],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
      index: true,
    },
    transactionId: { type: String, unique: true, sparse: true },
    razorpayResponse: { type: Object }, // Added to store the Razorpay response

  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;