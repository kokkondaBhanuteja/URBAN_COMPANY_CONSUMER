import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-uc-purple rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">UC</span>
              </div>
              <div>
                <span className="text-xl font-bold">Urban</span>
                <span className="text-xl font-bold text-uc-purple ml-1">Company</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm sm:text-base">
              Quality home services at your doorstep. Book trusted professionals for beauty, cleaning, repairs, and
              more.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/category/womens-salon-spa"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Women's Salon & Spa
                </Link>
              </li>
              <li>
                <Link
                  href="/category/mens-salon-massage"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Men's Salon & Massage
                </Link>
              </li>
              <li>
                <Link
                  href="/category/cleaning-pest-control"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cleaning & Pest Control
                </Link>
              </li>
              <li>
                <Link
                  href="/category/ac-appliance-repair"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  AC & Appliance Repair
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">© 2024 Urban Company Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
