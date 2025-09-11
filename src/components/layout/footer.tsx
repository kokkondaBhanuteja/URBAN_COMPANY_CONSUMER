import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">UC</span>
              </div>
              <span className="text-xl font-bold">Urban Company</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm">
              Quality home services at your doorstep. Book trusted professionals for beauty, cleaning, repairs, and
              more.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-300 hover:text-white">Careers</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link href="/help" className="text-sm text-gray-300 hover:text-white">Help & Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">© 2024 Urban Company Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}