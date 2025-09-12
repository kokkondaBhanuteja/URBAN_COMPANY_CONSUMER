import { sendBookingConfirmationEmail } from "@/services/notificationService";
import User from "@/database/userModel";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import { IBooking } from "@/database/bookingModel";
import { IProvider } from "@/database/ProviderModel";
import mongoose, { Types } from "mongoose";

/**
 * Finds providers who are available for a given booking.
 * @param booking The booking to find providers for.
 * @returns A promise that resolves to an array of available providers.
 */
async function findAvailableProviders(booking: IBooking): Promise<IProvider[]> {
    const { serviceId, serviceAddress, scheduledAt } = booking;

    // Step 1: Initial Filtering (Service, Location, Active Status)
    const potentialProviders = await Provider.find({
        servicesOffered: serviceId,
        serviceableLocations: { $regex: new RegExp(serviceAddress.city, "i") },
        isActive: true,
        isVerified: true,
    });

    // Step 2: Availability Check (Schedule and Conflicting Bookings)
    const availableProviders = [];
    for (const provider of potentialProviders) {
        // Check for conflicting bookings around the same time (e.g., within a 2-hour window)
        const conflictingBooking = await Booking.findOne({
            providerId: provider._id,
            bookingStatus: { $in: ["assigned", "confirmed", "in_progress"] },
            scheduledAt: {
                $gte: new Date(scheduledAt.getTime() - 60 * 60 * 1000), // 1 hour before
                $lt: new Date(scheduledAt.getTime() + 60 * 60 * 1000)   // 1 hour after
            }
        });

        if (!conflictingBooking) {
            availableProviders.push(provider);
        }
    }

    return availableProviders;
}

/**
 * Ranks a list of providers based on rating and workload.
 * @param providers The list of providers to rank.
 * @returns A promise that resolves to a sorted array of providers.
 */
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
        // Rank by average rating first (descending)
        if (a.averageRating !== b.averageRating) {
            return b.averageRating - a.averageRating;
        }
        // Then, by workload (ascending)
        return a.upcomingBookings - b.upcomingBookings;
    });

    return providersWithWorkload.map(p => new Provider(p));
}

/**
 * Main function to assign a provider to a booking.
 * @param bookingId The ID of the booking to assign.
 */
export async function assignProviderToBooking(bookingId: string) {
    const booking = await Booking.findById(bookingId).populate('serviceId');

    if (!booking) {
        throw new Error("Booking not found.");
    }

    if (booking.providerId || (booking.bookingStatus !== 'requested' && booking.bookingStatus !== 'confirmed')) {        console.warn(`Booking ${bookingId} is not in a 'requested' state. Current state: ${booking.bookingStatus}`);
        return;
    }


    const availableProviders = await findAvailableProviders(booking);

    if (availableProviders.length === 0) {
        console.warn(`No available providers found for booking: ${bookingId}`);
        // Optional: Handle this case, e.g., by setting booking status to 'pending_assignment'
        return;
    }

    const rankedProviders = await rankProviders(availableProviders);
    const bestProvider = rankedProviders[0];

    booking.providerId = bestProvider._id;
    booking.bookingStatus = 'assigned';
    await booking.save();

    console.log(`Successfully assigned provider ${bestProvider._id} to booking ${bookingId}`);

    const user = await User.findById(booking.userId);
    if(user) {
      await sendBookingConfirmationEmail(user, booking);
    }

    // await sendNewBookingNotificationToProvider(bestProvider, booking);

    return booking;
}