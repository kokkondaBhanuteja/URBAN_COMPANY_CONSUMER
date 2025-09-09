import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Category } from "@/lib/content"

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 hover:border-uc-purple hover:-translate-y-1">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 relative">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.title}
              fill
              className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-uc-purple transition-colors text-balance leading-tight">
            {category.title}
          </h3>
          {category.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-pretty line-clamp-2">
              {category.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
