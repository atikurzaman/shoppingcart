import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppSelector, useAppDispatch } from '../../hooks/useStore'
import { wishlistService } from '../../services/wishlistService'
import { addToCart } from '../../store/cartSlice'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const { user } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!user,
  })

  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.removeFromWishlist(productId),
    onSuccess: (_, productId) => {
      queryClient.setQueryData(['wishlist'], (old: any) => 
        old?.filter((item: any) => item.productId !== productId)
      )
      queryClient.invalidateQueries({ queryKey: ['wishlist-check'] })
      toast.success('Removed from wishlist')
    },
    onError: () => toast.error('Failed to remove item')
  })

  const handleAddToCart = async (productId: number) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap()
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-dark-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Please login to view your wishlist</h2>
          <Link to="/login" className="text-primary-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 dark:bg-dark-300 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Wishlist</h1>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-12 text-center border dark:border-gray-700">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Save items you like by clicking the heart icon</p>
            <Link to="/products" className="inline-block btn-primary px-6 py-2">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-4 flex gap-4 border dark:border-gray-700">
                <Link to={`/products/${item.slug}`} className="w-24 h-24 bg-gray-100 dark:bg-dark-300 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 truncate block">
                    {item.productName}
                  </Link>
                  <p className="text-lg font-semibold text-primary-600 mt-1">Tk {item.price.toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(item.productId)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                      disabled={!item.isInStock}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {item.isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(item.productId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
