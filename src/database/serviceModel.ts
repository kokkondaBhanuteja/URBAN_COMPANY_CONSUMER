import mongoose, { Document, Schema, Types } from "mongoose";

export interface IService extends Document {
  category: Types.ObjectId; // Reference to ServiceCategory
  serviceName: string;
  description?: string;
  basePrice: number;
  iconUrl?: string;
  priceUnit: "fixed" | "hourly" | "per_item";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    serviceName: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    priceUnit: {
      type: String,
      enum: ["fixed", "hourly", "per_item"],
      required: true,
    },
    iconUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster lookups by category
serviceSchema.index({ category: 1 });

const Service = mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);

export default Service;
