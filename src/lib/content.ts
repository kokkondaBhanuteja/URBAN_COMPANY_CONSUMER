export interface Category {
  id: string
  slug: string
  title: string
  image: string
  description?: string
}

export interface Service {
  id: string
  slug: string
  categorySlug: string
  title: string
  city: string
  rating: number
  ratingCount: number
  images: string[]
  options: Array<{
    id: string
    title: string
    priceSubunits: number
  }>
  summary?: string
}

export interface FAQ {
  q: string
  a: string
}

export interface Review {
  user: string
  rating: number
  text: string
  createdAt: string
}

export interface Template {
  id: string
  type: string
  title: string
  subtitle?: string
  image?: string
  bodyHtml?: string
  bullets?: string[]
  actions?: Array<{
    label: string
    href?: string
    variant?: "primary" | "secondary"
  }>
}

// Artificial latency for realistic loading states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories")
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  return response.json()
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories()
  return categories.find((cat) => cat.slug === slug) || null
}

export async function getServices(categorySlug?: string): Promise<Service[]> {
  const params = new URLSearchParams()
  if (categorySlug) {
    params.append("category", categorySlug)
  }

  const response = await fetch(`/api/services?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch services")
  }
  return response.json()
}

export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices()
  return services.find((service) => service.slug === slug) || null
}

export async function getFAQs(): Promise<FAQ[]> {
  // Static FAQ data for now
  return [
    {
      q: "How do I book a service?",
      a: "Simply browse our services, select what you need, choose a time slot, and confirm your booking. Our professionals will arrive at your doorstep.",
    },
    {
      q: "Are the service providers verified?",
      a: "Yes, all our service providers go through a rigorous background verification process and are trained professionals.",
    },
    {
      q: "What if I'm not satisfied with the service?",
      a: "We offer a satisfaction guarantee. If you're not happy with the service, we'll make it right or provide a refund.",
    },
  ]
}

export async function getReviews(): Promise<Review[]> {
  // Static review data for now
  return [
    {
      user: "Priya S.",
      rating: 5,
      text: "Excellent service! The cleaner was professional and thorough.",
      createdAt: "2024-01-15",
    },
    {
      user: "Rahul M.",
      rating: 4,
      text: "Good experience overall. Will book again.",
      createdAt: "2024-01-10",
    },
  ]
}

export async function getTemplate(id: string): Promise<Template | null> {
  // Static template data for now
  const templates: Template[] = [
    {
      id: "hero-main",
      type: "hero",
      title: "Quality Home Services",
      subtitle: "At Your Doorstep",
      image: "/home-services-hero-image.jpg",
    },
  ]
  return templates.find((template) => template.id === id) || null
}
