import ProviderPayout from "@/database/providerPayoutModel";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";
import { IBooking } from "@/database/bookingModel";
import { IPayment } from "@/database/paymentModel";

export const createProviderPayout = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId).populate("providerId");
  if (!booking) {
    throw new Error("Booking not found");
  }

  const payment = await Payment.findOne({ bookingId: booking._id });
  if (!payment) {
    throw new Error("Payment not found for the booking");
  }

  if (!booking.providerId) {
    throw new Error("Provider not assigned to the booking");
  }

  const totalAmount = payment.amount;
  const commissionAmount = totalAmount * 0.1; // 10% commission
  const netPayout = totalAmount - commissionAmount;

  const providerPayout = new ProviderPayout({
    providerId: booking.providerId._id,
    bookingId: booking._id,
    totalAmount,
    commissionAmount,
    netPayout,
    status: "pending", // The payout is pending until processed by an admin
    paymentMethod: payment.paymentMethod,
    requestedAt: new Date(),
  });

  await providerPayout.save();
  return providerPayout;
};