"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Menu, MapPin, User, LogOut, Briefcase, ShoppingBag } from "lucide-react"
import { authService } from "@/services/authService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCart } from "@/lib/cart-context"

// Define user type
interface AuthUser {
  id: string
  fullName: string
  email: string
  userType: string
}

export function NavigationHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { totalItems } = useCart()

  useEffect(() => {
    setIsClient(true)
    const checkUser = () => {
      const currentUser = authService.getUser()
      setUser(currentUser)
    }

    checkUser()

    window.addEventListener("authChange", checkUser)

    return () => {
      window.removeEventListener("authChange", checkUser)
    }
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    // Directly update state and redirect to trigger re-render properly
    window.location.href = "/"
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const UserNav = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookings">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">UC</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">Urban Company</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search for services..." className="pl-10 pr-4" />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Hanamkonda
              </Button>
            </div>

            {/* Cart Icon */}
             <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {isClient && totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </Link>

            {/* Auth section */}
            <div className="hidden md:flex">
               {isClient && user ? (
                <UserNav />
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login / Sign Up
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs">
                  <div className="flex flex-col space-y-4 mt-8">
                    {isClient && user ? (
                       <div className="space-y-2">
                         <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/profile" onClick={() => setIsOpen(false)}>
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Link>
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/bookings" onClick={() => setIsOpen(false)}>
                              <Briefcase className="h-4 w-4 mr-2" />
                              My Bookings
                            </Link>
                          </Button>
                          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                            <LogOut className="h-4 w-4 mr-2" />
                            Log Out
                          </Button>
                       </div>
                    ) : (
                       <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Login / Sign Up</Button>
                        </Link>
                    )}
                     <div className="border-t pt-4 space-y-2">
                        <Button variant="ghost" className="w-full justify-start">
                          <MapPin className="h-4 w-4 mr-2" />
                          Hanamkonda
                        </Button>
                     </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}