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

export default function ProductCard({ product, isList }: ProductCardProps) {
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
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap()
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add to cart')
    }
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    wishlistMutation.mutate(product.id)
  }

  if (isList) {
    return (
      <div className="bg-white border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow group">
        <Link to={`/products/${product.slug}`} className="w-24 h-24 shrink-0 bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
          {product.mainImageUrl ? (
            <img src={product.mainImageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link to={`/products/${product.slug}`} className="text-sm font-medium text-gray-800 hover:text-primary-600 line-clamp-2 transition-colors">{product.name}</Link>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.round(product.ratingAverage) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary-600 font-bold">Tk {product.price.toLocaleString()}</span>
            {hasDiscount && <span className="text-xs text-gray-400 line-through">Tk {product.oldPrice!.toLocaleString()}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 group hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Discount badge */}
      {hasDiscount && (
        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">
          -{discountPercent}%
        </span>
      )}

      {/* Quick action buttons (appear on hover) */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Link to={`/products/${product.slug}`}
          className="w-8 h-8 bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
          <Eye className="h-4 w-4" />
        </Link>
        <button onClick={handleAddToWishlist}
          className="w-8 h-8 bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
          <Heart className="h-4 w-4" />
        </button>
        <button onClick={handleAddToCart}
          className="w-8 h-8 bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block aspect-square bg-[#F8F8F8] overflow-hidden">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Image</div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.ratingAverage) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
        </div>

        {/* Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm text-gray-700 hover:text-primary-600 transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-primary-600 font-bold text-base">
            Tk {product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              Tk {product.oldPrice!.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
