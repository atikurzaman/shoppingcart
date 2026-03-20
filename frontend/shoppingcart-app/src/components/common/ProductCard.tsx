import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    oldPrice?: number
    mainImageUrl?: string
    ratingAverage: number
    reviewCount: number
    stockQuantity: number
  }
  onAddToCart?: (productId: number) => void
  onAddToWishlist?: (productId: number) => void
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0

  return (
    <div className="card group overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <Eye className="h-5 w-5 text-gray-700" />
          </Link>
          <button
            onClick={() => onAddToWishlist?.(product.id)}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={() => onAddToCart?.(product.id)}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.ratingAverage)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">
              Tk {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                Tk {product.oldPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => onAddToCart?.(product.id)}
            className="w-full btn-primary text-sm py-2"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
