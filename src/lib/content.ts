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
  await delay(300)
  const response = await fetch("/data/categories.json")
  return response.json()
}

export async function getCategory(slug: string): Promise<Category | null> {
  await delay(200)
  const categories = await getCategories()
  return categories.find((cat) => cat.slug === slug) || null
}

export async function getServices(categorySlug?: string): Promise<Service[]> {
  await delay(400)
  const response = await fetch("/data/services.json")
  const services = await response.json()

  if (categorySlug) {
    return services.filter((service: Service) => service.categorySlug === categorySlug)
  }

  return services
}

export async function getService(slug: string): Promise<Service | null> {
  await delay(300)
  const services = await getServices()
  return services.find((service) => service.slug === slug) || null
}

export async function getFAQs(): Promise<FAQ[]> {
  await delay(200)
  const response = await fetch("/data/faqs.json")
  return response.json()
}

export async function getReviews(): Promise<Review[]> {
  await delay(250)
  const response = await fetch("/data/reviews.json")
  return response.json()
}

export async function getTemplate(id: string): Promise<Template | null> {
  await delay(150)
  const response = await fetch("/data/templates.json")
  const templates = await response.json()
  return templates.find((template: Template) => template.id === id) || null
}
