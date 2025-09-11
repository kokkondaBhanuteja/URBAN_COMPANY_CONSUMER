import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Urban Company - Home Services at Your Doorstep",
  description:
    "Quality home services including beauty, cleaning, repairs, and more. Book trusted professionals online.",
  generator: "Urban Company Clone",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <CartProvider>{children}</CartProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}