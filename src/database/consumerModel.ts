import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface IConsumer extends Document {
  userId: Types.ObjectId // Ref to User
  preferredCategories: Types.ObjectId[] // Ref to ServiceCategory
  totalBookings: number
  averageRating: number // Rating given by providers
  isActive: boolean
  joinedDate: Date
  lastActiveAt: Date
  createdAt: Date
  updatedAt: Date
}

const consumerSchema = new Schema<IConsumer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferredCategories: [{ type: Schema.Types.ObjectId, ref: "ServiceCategory" }],
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    joinedDate: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const Consumer = mongoose.models.Consumer || mongoose.model<IConsumer>("Consumer", consumerSchema)

export default Consumer