import jwt from "jsonwebtoken"
import User from "@/database/userModel"
import Consumer from "@/database/consumerModel"
import Wallet from "@/database/walletModel" // Import the Wallet model
import Otp from "@/database/otpModel"
import { sendOtp } from "./otp-service" 

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"

// The nodemailer transporter is now removed from this file.

export async function loginUser(email: string, password: string, userType: string) {
  // ... existing code ...
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase(), userType });

    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Check if user type matches
    if (user.userType !== userType) {
      throw new Error("Invalid user type")
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new Error("Invalid email or password")
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    return {
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        userType: user.userType,
        mobileNumber: user.mobileNumber,
      },
    }
  } catch (error) {
    throw error
  }
}

export async function registerConsumer(userData: {
  // ... existing code ...
  userName: string
  email: string
  mobileNumber: string
  password: string
  address: {
    addressLine1: string
    city: string
    pincode: string
    state: string
    country: string
    addressType: "home" | "work" | "other"
  }
}) {
  try {
    // ... existing code ...
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email.toLowerCase() }, { mobileNumber: userData.mobileNumber }],
    })

    if (existingUser) {
      if (existingUser.email === userData.email.toLowerCase()) {
        throw new Error("User with this email already exists")
      }
      if (existingUser.mobileNumber === userData.mobileNumber) {
        throw new Error("User with this mobile number already exists")
      }
    }

    // Create new user
    const newUser = new User({
      userName: userData.userName,
      email: userData.email.toLowerCase(),
      mobileNumber: userData.mobileNumber,
      password: userData.password,
      userType: "consumer",
    })

    await newUser.save()

    // Create consumer profile
    const newConsumer = new Consumer({
      userId: newUser._id,
      address: userData.address,
    })

    await newConsumer.save()

    // Generate and send OTP using the centralized service
    await sendOtp(userData.email) // <-- USE the imported function

    return {
      _id: newUser._id,
      userName: newUser.userName,
      email: newUser.email,
      userType: newUser.userType,
      mobileNumber: newUser.mobileNumber,
    }
  } catch (error) {
    throw error
  }
}

// The generateAndSendOTP function is now removed from this file.

export async function verifyOTP(email: string, otp: string) {
  // ... existing code ...
  try {
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
    })

    if (!otpRecord) {
      throw new Error("Invalid or expired OTP")
    }

    // Delete the OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id })

    return { success: true }
  } catch (error) {
    throw error
  }
}

export async function loginWithGoogle(
  googleId: string,
  userData: {
    userName: string
    email: string
  },
) {
  // ... existing code ...
  try {
    // Check if user exists with Google ID
    let user = await User.findOne({ googleId })

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email: userData.email.toLowerCase() })

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId
        await user.save()
      } else {
        // Create new user
        user = new User({
          userName: userData.userName,
          email: userData.email.toLowerCase(),
          googleId,
          userType: "consumer",
          // No password needed for Google OAuth users
        })
        await user.save()

        // Create a wallet for the new user
        const newWallet = new Wallet({
            userId: user._id,
            balance: 0,
        });
        await newWallet.save();

        // Create consumer profile
        const newConsumer = new Consumer({
          userId: user._id,
          walletId: newWallet._id, // Assign the new wallet's ID
        })
        await newConsumer.save()
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    return {
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        userType: user.userType,
        mobileNumber: user.mobileNumber,
      },
    }
  } catch (error) {
    throw error
  }
}