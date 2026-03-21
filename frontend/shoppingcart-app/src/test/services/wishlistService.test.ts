import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../../services/api'
import { wishlistService } from '../../services/wishlistService'

vi.mock('../../services/api')

describe('Wishlist Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getWishlist', () => {
    it('should fetch wishlist items', async () => {
      const mockItems = {
        items: [
          { id: 1, productId: 1, productName: 'Product 1', price: 99.99 },
          { id: 2, productId: 2, productName: 'Product 2', price: 149.99 },
        ],
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockItems } })

      const result = await wishlistService.getWishlist()

      expect(api.get).toHaveBeenCalledWith('/wishlists')
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no items', async () => {
      const mockItems = { items: [] }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockItems } })

      const result = await wishlistService.getWishlist()

      expect(result).toHaveLength(0)
    })
  })

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      const mockItem = {
        id: 1,
        productId: 1,
        productName: 'Test Product',
        price: 99.99,
      }
      vi.mocked(api.post).mockResolvedValue({ data: { data: mockItem } })

      const result = await wishlistService.addToWishlist(1)

      expect(api.post).toHaveBeenCalledWith('/wishlists', { productId: 1 })
      expect(result.productName).toBe('Test Product')
    })
  })

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} })

      await wishlistService.removeFromWishlist(1)

      expect(api.delete).toHaveBeenCalledWith('/wishlists/1')
    })
  })

  describe('checkInWishlist', () => {
    it('should return true when product is in wishlist', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: true } })

      const result = await wishlistService.checkInWishlist(1)

      expect(api.get).toHaveBeenCalledWith('/wishlists/check/1')
      expect(result).toBe(true)
    })

    it('should return false when product is not in wishlist', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: false } })

      const result = await wishlistService.checkInWishlist(999)

      expect(result).toBe(false)
    })
  })
})
