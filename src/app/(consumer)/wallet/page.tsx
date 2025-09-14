"use client";

import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/layout/navigation-header";
import { Footer } from "@/components/layout/footer";
import { AuthGuard } from "@/components/consumer/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { openRazorpayCheckout } from "@/lib/payments";
import { authService } from "@/services/authService";

const fetchWalletData = async () => {
  const response = await fetch("/api/wallet/balance", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch wallet data");
  }
  return response.json();
};

export default function WalletPage() {
  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['walletData'],
    queryFn: fetchWalletData,
  });

  const [topupAmount, setTopupAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const user = authService.getUser();


  const handleTopup = async () => {
    const amount = parseInt(topupAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsToppingUp(true);
    try {
        const orderResponse = await fetch('/api/wallet/topup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ amount })
        });

        if (!orderResponse.ok) {
            throw new Error("Failed to create Razorpay order");
        }

        const { order } = await orderResponse.json();

        const result = await openRazorpayCheckout({
            amountSubunits: order.amount,
            currency: 'INR',
            prefill: {
                name: user?.fullName,
                email: user?.email,
            },
            notes: {
                purpose: 'wallet_topup'
            }
        });

        if (result.success && result.paymentId && result.orderId && result.signature) {
            const verifyResponse = await fetch('/api/wallet/verify-topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    razorpay_order_id: result.orderId,
                    razorpay_payment_id: result.paymentId,
                    razorpay_signature: result.signature,
                    amount,
                }),
            });

            if (!verifyResponse.ok) {
                throw new Error("Failed to verify topup");
            }
            toast.success("Top-up successful!");
            refetch();
        }


    } catch (error: any) {
        toast.error("Top-up failed", { description: error.message });
    } finally {
        setIsToppingUp(false);
        setTopupAmount("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuthGuard>
            <h1 className="text-3xl font-bold text-foreground mb-8">My Wallet</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <p className="text-4xl font-bold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(walletData?.balance || 0)}
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Add Money to Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            value={topupAmount}
                            onChange={(e) => setTopupAmount(e.target.value)}
                            disabled={isToppingUp}
                        />
                        <Button onClick={handleTopup} disabled={isToppingUp}>
                            {isToppingUp ? "Processing..." : "Top-up"}
                        </Button>
                        </div>
                    </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {walletData?.transactions.map((tx: any) => (
                          <div key={tx._id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium capitalize">{tx.reason.replace("_", " ")}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <p className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.type === 'credit' ? '+' : '-'}
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                              }).format(tx.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </AuthGuard>
        </div>
      </main>
      <Footer />
    </div>
  );
}