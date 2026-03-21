import api from './api'

export interface WishlistItem {
  id: number
  productId: number
  productName: string
  slug: string
  price: number
  oldPrice?: number
  imageUrl?: string
  stockQuantity: number
  isInStock: boolean
  addedAt: string
}

export const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const { data } = await api.get('/wishlists')
    return data.data.items || []
  },

  addToWishlist: async (productId: number): Promise<WishlistItem> => {
    const { data } = await api.post('/wishlists', { productId })
    return data.data
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await api.delete(`/wishlists/${productId}`)
  },

  checkInWishlist: async (productId: number): Promise<boolean> => {
    const { data } = await api.get(`/wishlists/check/${productId}`)
    return data.data
  },
}
