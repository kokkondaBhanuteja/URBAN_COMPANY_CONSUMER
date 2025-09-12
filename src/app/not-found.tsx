"use client"

import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/404_error.svg" alt="Page Not Found" width={400} className="mx-auto mb-6" />
          <p className="text-lg text-gray-600 mb-8 text-pretty">
            Sorry, the page you are looking for does not exist.
          </p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}