import { sendBookingConfirmationEmail } from "@/services/notificationService";
import User from "@/database/userModel";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import { IBooking } from "@/database/bookingModel";
import { IProvider } from "@/database/ProviderModel";
import mongoose, { Types } from "mongoose";

async function findAvailableProviders(booking: IBooking, excludedProviderIds: string[] = []): Promise<IProvider[]> {
    const { serviceId, serviceAddress, scheduledAt } = booking;

    const potentialProviders = await Provider.find({
        _id: { $nin: excludedProviderIds }, // Exclude already assigned providers
        servicesOffered: serviceId,
        serviceableLocations: { $regex: new RegExp(serviceAddress.city, "i") },
        isActive: true,
        isVerified: true,
    });

    const availableProviders = [];
    for (const provider of potentialProviders) {
        const conflictingBooking = await Booking.findOne({
            providerId: provider._id,
            bookingStatus: { $in: ["assigned", "confirmed", "in_progress"] },
            scheduledAt: {
                $gte: new Date(scheduledAt.getTime() - 60 * 60 * 1000), 
                $lt: new Date(scheduledAt.getTime() + 60 * 60 * 1000)
            }
        });

        if (!conflictingBooking) {
            availableProviders.push(provider);
        }
    }

    return availableProviders;
}

async function rankProviders(providers: IProvider[]): Promise<IProvider[]> {
    const providersWithWorkload = await Promise.all(providers.map(async (provider) => {
        const upcomingBookings = await Booking.countDocuments({
            providerId: provider._id,
            bookingStatus: { $in: ["assigned", "confirmed"] },
            scheduledAt: { $gte: new Date() }
        });
        return { ...provider.toObject(), upcomingBookings };
    }));

    providersWithWorkload.sort((a, b) => {
        if (a.averageRating !== b.averageRating) {
            return b.averageRating - a.averageRating;
        }
        return a.upcomingBookings - b.upcomingBookings;
    });

    return providersWithWorkload.map(p => new Provider(p));
}

export async function assignProviderToBooking(bookingId: string, excludedProviderIds: string[] = []) {
    const booking = await Booking.findById(bookingId).populate('serviceId');

    if (!booking) {
        throw new Error("Booking not found.");
    }

    if (booking.providerId || (booking.bookingStatus !== 'requested' && booking.bookingStatus !== 'confirmed')) {
        console.warn(`Booking ${bookingId} is not in a 'requested' or 'confirmed' state. Current state: ${booking.bookingStatus}`);
        return;
    }

    // Check if a provider is already assigned to another booking in the same order
    const existingBookingInOrder = await Booking.findOne({
        orderId: booking.orderId,
        providerId: { $exists: true, $ne: null }
    });

    let bestProvider;

    if (existingBookingInOrder && existingBookingInOrder.providerId) {
        const existingProvider = await Provider.findById(existingBookingInOrder.providerId);
        if (existingProvider && existingProvider.servicesOffered.includes(booking.serviceId)) {
            bestProvider = existingProvider;
        }
    }

    if (!bestProvider) {
        const availableProviders = await findAvailableProviders(booking, excludedProviderIds);
        if (availableProviders.length === 0) {
            console.warn(`No new available providers found for booking: ${bookingId}`);
            return;
        }
        const rankedProviders = await rankProviders(availableProviders);
        bestProvider = rankedProviders[0];
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    booking.providerId = bestProvider._id;
    booking.bookingStatus = 'assigned';
    booking.bookingOtp = otp; // Save OTP to booking
    await booking.save();

    console.log(`Successfully assigned provider ${bestProvider._id} to booking ${bookingId}`);

    const user = await User.findById(booking.userId);
    if (user) {
        await sendBookingConfirmationEmail(user, booking); // Pass the whole booking object
    }

    return booking;
}