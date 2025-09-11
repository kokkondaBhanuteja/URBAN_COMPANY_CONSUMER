import nodemailer from "nodemailer";
import { IBooking } from "@/database/bookingModel";
import { IUser } from "@/database/userModel";
import { IProvider } from "@/database/ProviderModel";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendBookingConfirmationEmail = async (user: IUser, booking: IBooking) => {
  const mailOptions = {
    from: `"Urban Company" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "Your Booking is Confirmed!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #0e0e0e; text-align: center;">Booking Confirmed!</h2>
        <p>Hi ${user.userName},</p>
        <p>Your booking for <strong>${booking.serviceId.serviceName}</strong> has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #0e0e0e;">Booking Details:</h3>
          <p><strong>Service:</strong> ${booking.serviceId.serviceName}</p>
          <p><strong>Date:</strong> ${new Date(booking.scheduledAt).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(booking.scheduledAt).toLocaleTimeString()}</p>
          <p><strong>Address:</strong> ${booking.serviceAddress.addressLine1}, ${booking.serviceAddress.city}, ${booking.serviceAddress.state} - ${booking.serviceAddress.pincode}</p>
        </div>
        <p>We look forward to serving you!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendNewBookingNotificationToProvider = async (
  provider: IProvider,
  booking: IBooking
) => {
  const providerUser = (await mongoose
    .model("User")
    .findById(provider.userId)) as IUser;
  if (!providerUser) {
    throw new Error("Provider user not found");
  }

  const mailOptions = {
    from: `"Urban Company" <${process.env.GMAIL_USER}>`,
    to: providerUser.email,
    subject: "You have a new booking!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #0e0e0e; text-align: center;">New Booking!</h2>
        <p>Hi ${providerUser.userName},</p>
        <p>You have a new booking for <strong>${
          booking.serviceId.serviceName
        }</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #0e0e0e;">Booking Details:</h3>
          <p><strong>Service:</strong> ${booking.serviceId.serviceName}</p>
          <p><strong>Date:</strong> ${new Date(
            booking.scheduledAt
          ).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(
            booking.scheduledAt
          ).toLocaleTimeString()}</p>
          <p><strong>Address:</strong> ${
            booking.serviceAddress.addressLine1
          }, ${booking.serviceAddress.city}, ${
      booking.serviceAddress.state
    } - ${booking.serviceAddress.pincode}</p>
        </div>
        <p>Please prepare for the service.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
