import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useStore'
import { api } from '../../services/api'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  addedAt: string
}

export default function Wishlist() {
  const { user } = useAppSelector((state) => state.auth)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      api.get('/wishlist')
        .then(res => setItems(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const removeFromWishlist = async (id: string) => {
    try {
      await api.delete(`/wishlist/${id}`)
      setItems(items.filter(item => item.id !== id))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const addToCart = async (productId: string) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 })
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your wishlist</h2>
          <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you like by clicking the heart icon</p>
            <Link to="/products" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <Link to={`/products/${item.productId}`} className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-blue-600 truncate block">
                    {item.productName}
                  </Link>
                  <p className="text-lg font-semibold text-blue-600 mt-1">Tk {item.price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(item.productId)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
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
