import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/useStore'
import { addToCart } from '../../store/cartSlice'
import { wishlistService } from '../../services/wishlistService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

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
    isFeatured?: boolean
    isBestSeller?: boolean
    isNewArrival?: boolean
  }
  onAddToCart?: (productId: number) => void
  onAddToWishlist?: (productId: number) => void
  isList?: boolean
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist, isList }: ProductCardProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()

  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0

  const wishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Added to wishlist!')
    },
    onError: () => toast.error('Please login to add to wishlist'),
  })

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (onAddToCart) {
      onAddToCart(product.id)
      return
    }
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap()
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add to cart')
    }
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onAddToWishlist) {
      onAddToWishlist(product.id)
      return
    }
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    wishlistMutation.mutate(product.id)
  }

  return (
    <div className={`card group overflow-hidden bg-white dark:bg-dark-200 dark:border-gray-700 transition-shadow ${
      isList ? 'flex flex-col sm:flex-row' : ''
    }`}>
      <div className={`relative overflow-hidden bg-gray-100 dark:bg-dark-300 ${
        isList ? 'w-full sm:w-64 sm:h-auto min-h-[200px] flex-shrink-0' : 'aspect-square'
      }`}>
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            No Image
          </div>
        )}

        {/* Ribbons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          {product.isFeatured && (
            <span className="bg-primary-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
              Featured
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
              New Arrival
            </span>
          )}
        </div>

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
          <Link
            to={`/products/${product.slug}`}
            className="p-2 bg-white dark:bg-dark-100 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
          >
            <Eye className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Link>
          <button
            onClick={handleAddToWishlist}
            className="p-2 bg-white dark:bg-dark-100 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
          >
            <Heart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-white dark:bg-dark-100 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className={`flex flex-col ${isList ? 'p-6 flex-1 justify-center' : 'p-4'}`}>
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className={`font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors line-clamp-2 ${isList ? 'text-lg mb-2' : 'mb-2'}`}>
            {product.name}
          </h3>
        </Link>

        <div className={`flex items-center gap-1 ${isList ? 'mb-4' : 'mb-2'}`}>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.ratingAverage)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-primary-600 dark:text-primary-400 ${isList ? 'text-2xl' : 'text-lg'}`}>
              Tk {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                Tk {product.oldPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className={`mt-4 ${isList ? 'flex gap-3' : ''}`}>
          <button
            onClick={handleAddToCart}
            className={`btn-primary text-sm py-2 ${isList ? 'px-8' : 'w-full'}`}
          >
            Add to Cart
          </button>
          
          {isList && (
            <button
              onClick={handleAddToWishlist}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
