import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  
  interface BookingDetailsModalProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
  }
  
  export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
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
              <span>{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>- {formatCurrency(0)}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>Credit Card</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }