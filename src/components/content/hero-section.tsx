import { Button } from "@/components/ui/button"
import { MapPin, ChevronDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 lg:mb-6 text-balance leading-tight">
              Home services at your <span className="text-uc-purple">doorstep</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8 text-pretty max-w-2xl mx-auto lg:mx-0">
              Quality services by trusted professionals. Book online and get your work done hassle-free.
            </p>

            {/* Location Selector */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 lg:mb-8">
              <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-3 border border-gray-200 w-full sm:w-auto sm:min-w-[200px] shadow-sm">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 flex-1">Dadar, Mumbai</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <Button className="bg-uc-purple hover:bg-uc-purple-dark text-white px-6 sm:px-8 py-3 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200">
                Book Now
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center max-w-sm mx-auto lg:mx-0">
              <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-bold text-uc-purple">4.8★</div>
                <div className="text-xs sm:text-sm text-gray-600">Service Rating</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-bold text-uc-purple">12M+</div>
                <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-first lg:order-last">
            <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/professional-service-provider-at-customer-home.jpg"
                alt="Professional service at home"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
