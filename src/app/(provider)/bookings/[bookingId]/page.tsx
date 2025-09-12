"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, User, Phone } from "lucide-react";

export default function ProviderBookingPage() {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId;

    useEffect(() => {
        const fetchBooking = async () => {
            if (bookingId) {
                try {
                    const response = await fetch(`/api/provider/bookings/${bookingId}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch booking details");
                    }
                    const data = await response.json();
                    setBooking(data);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBooking();
    }, [bookingId]);

    const handleCompleteBooking = async () => {
        try {
            const response = await fetch(`/api/provider/bookings/${bookingId}/complete`, {
                method: "POST"
            });
            if (!response.ok) {
                throw new Error("Failed to complete booking");
            }
            router.push("/provider/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!booking) {
        return <div>Booking not found</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">{booking.serviceId.serviceName}</h3>
                                <Badge>{booking.bookingStatus}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                                <Clock className="w-4 h-4" />
                                <span>{new Date(booking.scheduledAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.serviceAddress.addressLine1}, {booking.serviceAddress.city}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{booking.userId.userName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{booking.userId.mobileNumber}</span>
                            </div>
                            <div>
                                <h4 className="font-semibold">Special Instructions</h4>
                                <p>{booking.specialInstructions || "None"}</p>
                            </div>
                            <Button onClick={handleCompleteBooking}>Mark as Completed</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}