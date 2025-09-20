import nodemailer from "nodemailer";
import Otp from "@/database/otpModel";
import logger from "@/lib/logger";
// This is now the single source of truth for the Nodemailer transporter.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Using the correct env variable
  },
});

/**
 * Generates and sends a 6-digit OTP to the specified email.
 * @param email The recipient's email address.
 */
export const sendOtp = async (email: string) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    logger.error("Missing Gmail credentials in environment variables.");
    throw new Error("Server is not configured for sending emails.");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete any existing OTP for this email to ensure only the latest is valid
  await Otp.deleteMany({ email: email.toLowerCase() });

  // Save new OTP with a 10-minute expiry (defined in the model)
  await Otp.create({ email: email.toLowerCase(), otp });

  const mailOptions = {
    from: `"Urban Company" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #0e0e0e; text-align: center;">Welcome to Urban Company!</h2>
        <p style="text-align: center;">Please use the following verification code to complete your registration.</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
          <h1 style="color: #0e0e0e; font-size: 36px; letter-spacing: 4px; margin: 0;">${otp}</h1>
        </div>
        <p style="text-align: center;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`OTP sent to ${email}`);
};

/**
 * Verifies the provided OTP for the given email.
 * @param email The user's email address.
 * @param otp The 6-digit OTP to verify.
 * @returns {Promise<boolean>} True if the OTP is valid, otherwise false.
 */
export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });
  if (otpRecord) {
    // OTP is correct, delete it so it can't be used again
    await Otp.deleteOne({ _id: otpRecord._id });
    logger.info(`OTP verified successfully for ${email}`);

    return true;
  }
  logger.warn(`Invalid OTP attempt for ${email}`);
  return false;
};
