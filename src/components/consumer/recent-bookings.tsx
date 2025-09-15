"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { BookingDetailsModal } from "./booking-details-modal"
import { useRouter } from "next/navigation"

interface Booking {
  _id: string;
  serviceId: {
    serviceName: string;
  };
  bookingStatus: "requested" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled_by_user" | "cancelled_by_provider";
  scheduledAt: string;
  createdAt: string;
  pricing: {
    finalAmount: number;
  };
  serviceAddress: {
    addressLine1: string;
    city: string;
  };
}

interface RecentBookingsProps {
  bookings: Booking[];
  onBookingUpdate: () => void;
}

export function RecentBookings({ bookings, onBookingUpdate }: RecentBookingsProps) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();


  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handlePayNow = (booking: Booking) => {
    router.push(`/checkout/${booking._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "assigned":
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "requested":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled_by_user":
      case "cancelled_by_provider":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't booked any services yet.</p>
              <p className="text-sm text-muted-foreground text-pretty">
                Your service bookings will appear here once you make your first booking.
              </p>
              <Link href="/">
                <Button className="mt-4">Book a Service</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => handleBookingClick(booking)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-balance">{booking.serviceId.serviceName}</h4>
                        <Badge variant="outline" className={getStatusColor(booking.bookingStatus)}>
                          {booking.bookingStatus.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(booking.scheduledAt)}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(booking.scheduledAt)}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.serviceAddress.city}</div>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(booking.pricing.finalAmount)}</div>
                    </div>
                  </div>

                  {booking.bookingStatus === 'completed' && (
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/review/${booking._id}`}>Leave a Review</Link>
                      </Button>
                    </div>
                  )}

                   {booking.bookingStatus === 'requested' && (
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <Button onClick={() => handlePayNow(booking)} size="sm">
                        Pay Now
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBookingUpdate={onBookingUpdate}
      />
    </>
  );
}