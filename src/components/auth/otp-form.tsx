"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authService"

interface OtpFormProps {
  email: string
  onSubmit: (otp: string) => void
  loading?: boolean
  error?: string
}

export function OtpForm({ email, onSubmit, loading = false, error }: OtpFormProps) {
  const [otp, setOtp] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      onSubmit(otp)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    setResendLoading(true)
    setResendMessage("")

    try {
      await authService.resendOTP(email)
      setResendMessage("OTP sent successfully!")

      // Start 60-second cooldown
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      setResendMessage(error.message || "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-balance">Verify Your Email</CardTitle>
        <p className="text-muted-foreground text-pretty">
          We've sent a 6-digit verification code to <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {resendMessage && !error && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              {resendMessage}
            </div>
          )}

          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-widest font-mono"
              maxLength={6}
              autoComplete="one-time-code"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit code sent to your email</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={resendLoading || resendCooldown > 0}
              className="text-primary hover:text-primary/80"
            >
              {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>• Check your spam/junk folder if you don't see the email</p>
            <p>• The code expires in 10 minutes</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
