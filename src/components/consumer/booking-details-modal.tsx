import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
  
interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdate: () => void;
}
  
export function BookingDetailsModal({ booking, isOpen, onClose, onBookingUpdate }: BookingDetailsModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  if (!booking) return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary text-primary-foreground"
      case "completed":
        return "bg-accent text-accent-foreground"
      case "requested":
        return "bg-secondary text-secondary-foreground"
      case "cancelled_by_user":
      case "cancelled_by_provider":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCancelBooking = async () => {
      setIsCancelling(true);
      try {
          const response = await fetch(`/api/consumer/bookings/${booking._id}/cancel`, {
              method: 'POST',
              credentials: 'include',
          });
          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.message || 'Failed to cancel booking');
          }
          toast.success("Booking Cancelled", {
              description: result.message,
          });
          onBookingUpdate(); // Trigger refetch
          onClose(); // Close the modal
      } catch (error: any) {
          toast.error("Cancellation Failed", {
              description: error.message,
          });
      } finally {
          setIsCancelling(false);
      }
  }

  // Check if the booking is cancellable
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const timeDifference = new Date().getTime() - new Date(booking.createdAt).getTime();
  const isCancellable = 
      !["completed", "cancelled_by_user", "cancelled_by_provider"].includes(booking.bookingStatus) &&
      timeDifference < twentyFourHours;
  
  const refundAmount = booking.pricing.finalAmount * 0.10;
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Details for your booking of {booking.serviceId.serviceName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service</span>
            <span className="font-semibold">{booking.serviceId.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge className={getStatusColor(booking.bookingStatus)}>
              {booking.bookingStatus.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider</span>
            <span>{booking.providerId ? booking.providerId.userId.userName : "Not Assigned"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid</span>
            <span>{formatCurrency(booking.pricing.finalAmount)}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span>Credit Card</span>
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
            {isCancellable ? (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isCancelling}>
                          {isCancelling ? "Cancelling..." : "Cancel Booking"}
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. You will be refunded 10% of the total amount, which is approximately{' '}
                              <span className="font-bold">{formatCurrency(refundAmount)}</span>.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Back</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive hover:bg-destructive/90">
                              Continue
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            ) : <div />} 
            <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

