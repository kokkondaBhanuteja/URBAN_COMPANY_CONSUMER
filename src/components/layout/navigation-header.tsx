"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Menu, MapPin, User, LogOut, Briefcase, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from "@/services/authService"
import { useCart } from "@/lib/cart-context"
import { useDebounce } from "@/hooks/use-debounce"
import type { IService } from "@/database/serviceModel"

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

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("Warangal") // <-- Changed to Warangal
  const [searchResults, setSearchResults] = useState<IService[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    setIsClient(true)
    const checkUser = () => setUser(authService.getUser())
    checkUser()
    window.addEventListener("storage", checkUser)
    return () => window.removeEventListener("storage", checkUser)
  }, [])

  // Effect for handling debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([])
        setIsSearchPopoverOpen(false)
        return
      }

      setIsSearchLoading(true)
      try {
        const params = new URLSearchParams({
          q: debouncedSearchQuery,
          location: locationQuery,
        })
        const response = await fetch(`/api/services?${params.toString()}`)
        const data = await response.json()
        setSearchResults(data)
        setIsSearchPopoverOpen(true)
      } catch (error) {
        console.error("Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearchLoading(false)
      }
    }
    performSearch()
  }, [debouncedSearchQuery, locationQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&location=${encodeURIComponent(locationQuery.trim())}`)
      setIsSearchPopoverOpen(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
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
        <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" /><span>Profile</span></Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/bookings"><Briefcase className="mr-2 h-4 w-4" /><span>My Bookings</span></Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { authService.logout(); window.location.href = '/'; }}><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2"><div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">UC</span></div><span className="font-bold text-xl hidden sm:inline-block">Urban Company</span></Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="flex w-full items-center rounded-lg border bg-background shadow-sm">
              <div className="flex items-center pl-3 pr-2 border-r"><MapPin className="h-4 w-4 text-muted-foreground" /><Input placeholder="Location" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-32 text-sm" /></div>
              <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}><PopoverTrigger asChild><form onSubmit={handleSearchSubmit} className="relative w-full"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search for services..." className="pl-10 pr-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => searchQuery.length > 1 && setIsSearchPopoverOpen(true)} /></form></PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  {isSearchLoading ? (<div className="p-4 text-sm text-muted-foreground">Searching...</div>) : searchResults.length > 0 ? (<div className="max-h-96 overflow-y-auto">{searchResults.map((service) => (<Link key={service._id} href={`/service/${service.serviceName.toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center gap-4 p-3 hover:bg-muted" onClick={() => setIsSearchPopoverOpen(false)}><Image src={service.imageUrl || "/placeholder.svg"} alt={service.serviceName} width={40} height={40} className="rounded-md object-cover" /><span className="text-sm">{service.serviceName}</span></Link>))}</div>) : (<div className="p-4 text-sm text-muted-foreground">No results found.</div>)}
                  {searchQuery && (<div className="p-2 border-t"><Button variant="link" className="w-full justify-start p-2 h-auto" asChild><Link href={`/search?q=${encodeURIComponent(searchQuery)}`}><Search className="h-4 w-4 mr-2" />View all results for &quot;{searchQuery}&quot;</Link></Button></div>)}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="icon" className="relative"><Link href="/cart"><ShoppingBag className="h-5 w-5" />{isClient && totalItems > 0 && (<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{totalItems}</span>)}</Link></Button>
            <div className="hidden md:flex">{isClient && user ? (<UserNav />) : (<Button asChild variant="ghost" size="sm"><Link href="/login">Login / Sign Up</Link></Button>)}</div>
            <div className="md:hidden"><Sheet open={isOpen} onOpenChange={setIsOpen}><SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="right" className="w-full max-w-xs"></SheetContent></Sheet></div>
          </div>
        </div>
      </div>
    </header>
  )
}