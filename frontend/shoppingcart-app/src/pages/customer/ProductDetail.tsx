import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../../services/productService'
import { wishlistService } from '../../services/wishlistService'
import { useAppDispatch } from '../../hooks/useStore'
import { addToCart } from '../../store/cartSlice'
import { useAppSelector } from '../../hooks/useStore'
import toast from 'react-hot-toast'
import { Star, Heart, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../../components/common/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [displayImage, setDisplayImage] = useState<string | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProduct(slug!, true),
    enabled: !!slug,
  })

  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.id],
    queryFn: () => productService.getRelatedProducts(product!.id, 4),
    enabled: !!product?.id,
  })

  const { data: wishlistStatus } = useQuery({
    queryKey: ['wishlist-check', product?.id],
    queryFn: () => wishlistService.checkInWishlist(product!.id),
    enabled: !!product?.id && isAuthenticated,
  })

  useEffect(() => {
    if (wishlistStatus !== undefined) {
      setIsWishlisted(wishlistStatus)
    }
  }, [wishlistStatus])

  const wishlistMutation = useMutation({
    mutationFn: (productId: number) => 
      isWishlisted 
        ? wishlistService.removeFromWishlist(productId).then(() => false)
        : wishlistService.addToWishlist(productId).then(() => true),
    onSuccess: (newStatus) => {
      setIsWishlisted(newStatus)
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', product?.id] })
      toast.success(newStatus ? 'Added to wishlist!' : 'Removed from wishlist')
    },
    onError: () => {
      toast.error('Please login to add to wishlist')
    },
  })

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    wishlistMutation.mutate(product!.id)
  }

  const selectedVariant = product?.variants?.find(v => 
    v.attributeValues.every(av => selectedAttributes[av.attributeName] === av.value)
  )

  useEffect(() => {
    if (selectedVariant?.imageUrl) {
      setDisplayImage(selectedVariant.imageUrl)
    } else if (product?.images && product.images.length > 0) {
      if (selectedImage < product.images.length) {
         setDisplayImage(product.images[selectedImage].imageUrl)
      } else {
         setDisplayImage(product.images[0].imageUrl)
      }
    }
  }, [selectedVariant, product?.images, selectedImage])

  const selectVariantAttribute = (name: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }))
  }

  const getGroupedAttributes = (variants: any[]) => {
    const attrs: Record<string, Set<string>> = {}
    variants.forEach(v => {
      v.attributeValues?.forEach((av: any) => {
        if (!attrs[av.attributeName]) attrs[av.attributeName] = new Set()
        attrs[av.attributeName].add(av.value)
      })
    })
    return Object.entries(attrs).map(([name, values]) => ({ name, values: Array.from(values) }))
  }

  const handleAddToCart = async () => {
    if (!product) return
    try {
      const cartItem: any = { productId: product.id, quantity }
      if (selectedVariant) {
        cartItem.variantId = selectedVariant.id
      }
      await dispatch(addToCart(cartItem)).unwrap()
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error?.message || error || 'Failed to add to cart')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/products" className="text-primary-600 hover:underline">Back to products</Link>
        </div>
      </div>
    )
  }

  const displayPrice = selectedVariant?.price || product.price
  const displayOldPrice = selectedVariant ? product.price : product.oldPrice
  const hasDiscount = displayOldPrice && displayOldPrice > displayPrice
  const discountPercent = hasDiscount
    ? Math.round(((displayOldPrice! - displayPrice) / displayOldPrice!) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-primary-600">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white dark:bg-dark-200 rounded-xl overflow-hidden mb-4 border dark:border-gray-700">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">No Image</div>
              )}

              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-lg">
                  -{discountPercent}%
                </span>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images?.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setDisplayImage(img.imageUrl)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    displayImage === img.imageUrl ? 'border-primary-600' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {selectedVariant?.imageUrl && !product.images?.some(i => i.imageUrl === selectedVariant.imageUrl) && (
                <button
                  onClick={() => setDisplayImage(selectedVariant.imageUrl!)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    displayImage === selectedVariant.imageUrl ? 'border-primary-600' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={selectedVariant.imageUrl} alt="Variant" className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.ratingAverage)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-500">({product.reviewCount} reviews)</span>
              <span className="text-gray-300">|</span>
              <span className={`font-medium ${(selectedVariant?.stockQuantity || product.stockQuantity) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(selectedVariant?.stockQuantity || product.stockQuantity) > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-primary-600">
                Tk {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through">
                  Tk {displayOldPrice!.toLocaleString()}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 mb-6">{product.shortDescription}</p>
            )}

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Select Options</h3>
                <div className="space-y-4">
                  {getGroupedAttributes(product.variants).map((attr) => (
                    <div key={attr.name}>
                      <label className="block text-sm font-medium text-gray-600 mb-2">{attr.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => selectVariantAttribute(attr.name, value)}
                            className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                              selectedAttributes[attr.name] === value
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="mt-3 text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedVariant.name}</span> - Tk {selectedVariant.price.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={(selectedVariant?.stockQuantity || product.stockQuantity) === 0}
                className="flex-1 btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`p-3 border rounded-lg transition-colors ${
                  isWishlisted 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 py-6 mb-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary-600" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary-600" />
                <span className="text-sm">Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
