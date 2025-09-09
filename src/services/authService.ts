// src/services/authService.ts
import User, { type IUser } from "@/database/userModel"
import jwt from "jsonwebtoken"
import type { Types } from "mongoose"
import { createConsumerProfile } from "@/services/consumer/consumerService"

interface ConsumerRegisterParams {
  userName: string
  email: string
  password: string
  mobileNumber: string
  address?: {
    addressLine1: string
    city: string
    pincode: string
    state: string
    country?: string
    addressType?: "home" | "work" | "other"
  }
}

export const registerConsumer = async (data: ConsumerRegisterParams): Promise<IUser> => {
  const { userName, email, password, mobileNumber, address } = data

  // Step 1: Save User as consumer
  const user = new User({
    userName,
    email,
    password,
    mobileNumber,
    userType: "consumer",
  })
  await user.save()

  // Step 2: Create consumer profile and address
  await createConsumerProfile(user._id.toString(), address)

  return user
}

export const loginUser = async (email: string, password?: string, userType?: string) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error("Invalid email or password")
  }

  if (userType && user.userType !== userType) {
    throw new Error("You are not authorized to access this page")
  }

  if (password) {
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error("Invalid email or password")
    }
  }

  const token = jwt.sign(
    { id: user._id, userType: user.userType, name: user.userName },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  )
  return { token, user }
}