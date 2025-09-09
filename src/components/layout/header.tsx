"use client"

import Link from "next/link"
import { Search, MapPin, ShoppingCart, User, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { authService } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setUser(authService.getUser())
      } else {
        setUser(null)
      }
    }

    checkAuth()

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    window.location.href = "/"
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">UC</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-foreground">Urban</span>
              <span className="text-xl font-bold text-primary ml-1">Company</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/category/womens-salon-spa"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Beauty
            </Link>
            <Link
              href="/category/ac-appliance-repair"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Revamp
            </Link>
            <Link
              href="/category/native-water-purifier"
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Native
            </Link>
          </nav>

          {/* Location Selector - Hidden on mobile */}
          <div className="hidden xl:flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Dadar, Mumbai</span>
          </div>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input type="text" placeholder="Search for 'Facial'" className="pl-10 pr-4 py-2 w-full" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button variant="ghost" size="sm" className="p-2 md:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile - Updated to show user info or login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 hidden sm:flex">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/consumer/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/consumer/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/consumer/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4 space-y-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input type="text" placeholder="Search for 'Facial'" className="pl-10 pr-4 py-2 w-full" />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                href="/category/womens-salon-spa"
                className="block py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Beauty
              </Link>
              <Link
                href="/category/ac-appliance-repair"
                className="block py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Revamp
              </Link>
              <Link
                href="/category/native-water-purifier"
                className="block py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Native
              </Link>
            </nav>

            {/* Mobile Location */}
            <div className="xl:hidden flex items-center space-x-2 text-muted-foreground py-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Dadar, Mumbai</span>
            </div>

            {/* Mobile Profile Link - Updated */}
            <div className="sm:hidden pt-2 border-t">
              {user ? (
                <div className="space-y-2">
                  <div className="py-2">
                    <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/consumer/dashboard"
                    className="block py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="block py-2 text-destructive font-medium transition-colors w-full text-left"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
