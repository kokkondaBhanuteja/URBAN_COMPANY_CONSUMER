"use client"

import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button" 
import { Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="py-12">
            <Search className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
              404 - Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-pretty">
              Sorry, the page you are looking for does not exist.
            </p>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
