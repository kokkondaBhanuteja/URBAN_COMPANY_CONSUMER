import Link from "next/link"
import Image from "next/image"
import type { Category } from "@/lib/content"

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`} className="group text-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 relative mb-2 flex items-center justify-center">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <h3 className="font-medium text-xs sm:text-sm text-gray-700 group-hover:text-primary transition-colors text-balance leading-tight">
          {category.title}
        </h3>
      </div>
    </Link>
  )
}
