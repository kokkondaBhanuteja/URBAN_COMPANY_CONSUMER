import jwt from "jsonwebtoken"
import User from "@/database/userModel"
import Consumer from "@/database/consumerModel"
import Otp from "@/database/otpModel"
import * as nodemailer from "nodemailer"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function loginUser(email: string, password: string, userType: string) {
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
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

    // Generate and send OTP
    await generateAndSendOTP(userData.email)

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

export async function generateAndSendOTP(email: string) {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() })

    // Save new OTP
    const newOtp = new Otp({
      email: email.toLowerCase(),
      otp,
    })
    await newOtp.save()

    // Send OTP via email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Urban Company - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0e0e0e;">Welcome to Urban Company!</h2>
          <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0e0e0e; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Urban Company - Quality home services at your doorstep</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Error sending OTP:", error)
    throw new Error("Failed to send OTP. Please try again.")
  }
}

export async function verifyOTP(email: string, otp: string) {
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

        // Create consumer profile
        const newConsumer = new Consumer({
          userId: user._id,
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
