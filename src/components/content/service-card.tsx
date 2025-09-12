import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Service } from "@/lib/content"

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const startingPrice = Math.min(...service.options.map((opt) => opt.priceSubunits))
  const formattedPrice = (startingPrice / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-uc-purple hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative h-40 sm:h-48 w-full overflow-hidden">
          <Image
            src={service.images[0] || "/placeholder.svg"}
            alt={service.title}
            fill
            className="object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 text-balance leading-tight">
            {service.title}
          </h3>
          {service.summary && (
            <p className="text-xs sm:text-sm text-gray-600 mb-3 text-pretty line-clamp-2">{service.summary}</p>
          )}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium">{service.rating}</span>
            </div>
            <span className="text-xs text-gray-500">
              ({service.ratingCount > 1000 ? `${Math.floor(service.ratingCount / 1000)}K` : service.ratingCount}{" "}
              reviews)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-lg font-bold text-gray-900">{formattedPrice}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1">onwards</span>
            </div>
            <Link href={`/service/${service.id}`}>
              <Button
                size="sm"
                className="bg-uc-purple hover:bg-uc-purple-dark text-white text-xs sm:text-sm px-3 sm:px-4 shadow-md hover:shadow-lg transition-all duration-200"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}