"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { getService, type Service } from "@/lib/content"

export default function ServicePage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem } = useCart()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function loadService() {
      try {
        const serviceData = await getService(slug)
        setService(serviceData)
      } catch (error) {
        console.error("Failed to load service:", error)
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [slug])

  const handleAddToCart = (optionId: string) => {
    if (!service) return

    const option = service.options.find((opt) => opt.id === optionId)
    if (!option) return

    addItem({
      serviceId: service.id,
      optionId: option.id,
      title: service.title,
      optionTitle: option.title,
      unitPriceSubunits: option.priceSubunits,
      currency: "INR",
      image: service.images[0],
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-gray-200 rounded-lg h-96"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationHeader />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600">The service you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                <Image
                  src={service.images[selectedImage] || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>

              {service.images.length > 1 && (
                <div className="flex space-x-2">
                  {service.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 relative rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? "border-uc-purple" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${service.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-balance">{service.title}</h1>

              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{service.city}</span>
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{service.rating}</span>
                </div>
                <span className="text-gray-600">({service.ratingCount.toLocaleString()} reviews)</span>
              </div>

              {service.summary && <p className="text-gray-700 mb-8 text-pretty">{service.summary}</p>}

              {/* Pricing Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Choose Your Service</h3>

                {service.options.map((option) => {
                  const formattedPrice = (option.priceSubunits / 100).toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })

                  return (
                    <Card key={option.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{option.title}</h4>
                            <p className="text-lg font-bold text-uc-purple">{formattedPrice}</p>
                          </div>
                          <Button
                            onClick={() => handleAddToCart(option.id)}
                            className="bg-uc-purple hover:bg-uc-purple-dark text-white"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
