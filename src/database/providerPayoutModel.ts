import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProviderPayout extends Document {
  providerId: Types.ObjectId; // Ref to Provider
  amount: number;
  status: "pending" | "processed" | "failed";
  processedAt?: Date;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const providerPayoutSchema = new Schema<IProviderPayout>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      index: true,
    },
    processedAt: { type: Date },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast queries
providerPayoutSchema.index({ providerId: 1 });

const ProviderPayout = mongoose.models.ProviderPayout || mongoose.model<IProviderPayout>(
  "ProviderPayout",
  providerPayoutSchema
);

export default ProviderPayout;
