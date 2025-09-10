import nodemailer from "nodemailer";
import Otp from "@/database/otpModel";
import User, { IUser } from "@/database/userModel";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtp = async (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email, otp });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Urban Company",
    text: `Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await Otp.findOne({ email, otp });
  if (otpRecord) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return true;
  }
  return false;
};
