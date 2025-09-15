import ProviderPayout from "@/database/providerPayoutModel";
import Booking from "@/database/bookingModel";
import Payment from "@/database/paymentModel";

export const createProviderPayout = async (bookingId: string) => {
  // 1. Find the specific booking and include provider details
  const booking = await Booking.findById(bookingId).populate("providerId");
  if (!booking) {
    throw new Error("Booking not found");
  }

  // 2. CORRECTED QUERY: Find the payment by searching for the bookingId
  // inside the 'bookingIds' array.
  const payment = await Payment.findOne({ bookingIds: booking._id });

  if (!payment) {
    throw new Error("Payment not found for the booking");
  }

  if (!booking.providerId) {
    throw new Error("Provider not assigned to the booking");
  }

  // 3. IMPROVED CALCULATION: Use the price from the individual booking,
  // not the total payment amount for the whole order.
  const bookingPrice = booking.pricing.finalAmount;
  const commissionAmount = bookingPrice * 0.1; // 10% commission
  const netPayout = bookingPrice - commissionAmount;

  const providerPayout = new ProviderPayout({
    providerId: booking.providerId._id,
    bookingId: booking._id,
    totalAmount: bookingPrice, // Use the specific booking price for accuracy
    commissionAmount,
    netPayout,
    status: "pending",
    paymentMethod: payment.paymentMethod,
    requestedAt: new Date(),
  });

  await providerPayout.save();
  return providerPayout;
};