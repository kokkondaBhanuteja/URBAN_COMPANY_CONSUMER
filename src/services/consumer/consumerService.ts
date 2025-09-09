import Consumer, { type IConsumer } from "@/database/consumerModel"
import Address from "@/database/addressmodel"
import { Types } from "mongoose"

// Create consumer profile during registration
export const createConsumerProfile = async (
  userId: string,
  addressData?: {
    addressLine1: string
    city: string
    pincode: string
    state: string
    country?: string
    addressType?: "home" | "work" | "other"
  },
) => {
  const consumer = new Consumer({
    userId: new Types.ObjectId(userId),
    isActive: true,
    joinedDate: new Date(),
    lastActiveAt: new Date(),
  })

  await consumer.save()

  // Create default address if provided
  if (addressData) {
    const address = new Address({
      userId: new Types.ObjectId(userId),
      addressLine1: addressData.addressLine1,
      city: addressData.city,
      pincode: addressData.pincode,
      state: addressData.state,
      country: addressData.country || "India",
      addressType: addressData.addressType || "home",
    })
    await address.save()
  }

  return consumer
}

// Get consumer profile with user details
export const getConsumerProfile = async (userId: string) => {
  const consumer = await Consumer.findOne({ userId })
    .populate("userId", "userName email mobileNumber")
    .populate("preferredCategories")

  const addresses = await Address.find({ userId })

  return {
    consumer,
    addresses,
  }
}

// Update consumer profile
export const updateConsumerProfile = async (userId: string, profileData: Partial<IConsumer>) => {
  return Consumer.findOneAndUpdate({ userId }, { ...profileData, lastActiveAt: new Date() }, { new: true })
}

// Add preferred category
export const addPreferredCategory = async (userId: string, categoryId: string) => {
  const consumer = await Consumer.findOne({ userId })
  if (!consumer) throw new Error("Consumer not found")

  if (!consumer.preferredCategories.includes(new Types.ObjectId(categoryId))) {
    consumer.preferredCategories.push(new Types.ObjectId(categoryId))
    await consumer.save()
  }

  return consumer
}

// Update consumer activity
export const updateLastActive = async (userId: string) => {
  return Consumer.findOneAndUpdate({ userId }, { lastActiveAt: new Date() }, { new: true })
}
