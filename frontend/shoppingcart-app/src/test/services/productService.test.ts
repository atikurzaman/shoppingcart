import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../../services/api'
import { productService, categoryService } from '../../services/productService'

vi.mock('../../services/api')

describe('Product Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProducts', () => {
    it('should call api with correct params', async () => {
      const mockResponse = {
        data: {
          data: {
            items: [],
            totalCount: 0,
            pageIndex: 0,
            pageSize: 10,
          },
        },
      }
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      await productService.getProducts({ pageIndex: 0, pageSize: 10, search: 'test' })

      expect(api.get).toHaveBeenCalledWith('/products', {
        params: { pageIndex: 0, pageSize: 10, search: 'test' },
      })
    })

    it('should return paginated products', async () => {
      const mockProducts = {
        items: [
          { id: 1, name: 'Product 1', price: 99.99 },
          { id: 2, name: 'Product 2', price: 149.99 },
        ],
        totalCount: 2,
        pageIndex: 0,
        pageSize: 10,
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProducts } })

      const result = await productService.getProducts()

      expect(result.items).toHaveLength(2)
      expect(result.totalCount).toBe(2)
    })
  })

  describe('createProduct', () => {
    it('should call api with product data', async () => {
      const newProduct = {
        name: 'New Product',
        price: 99.99,
        categoryId: 1,
      }
      const mockResponse = {
        data: { data: { id: 1, ...newProduct } },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await productService.createProduct(newProduct)

      expect(api.post).toHaveBeenCalledWith('/products', newProduct)
      expect(result.id).toBe(1)
    })
  })

  describe('getProduct', () => {
    it('should fetch product by id', async () => {
      const mockProduct = { id: 1, name: 'Test Product', price: 99.99 }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProduct } })

      const result = await productService.getProduct('1', false)

      expect(api.get).toHaveBeenCalledWith('/products/1')
      expect(result.name).toBe('Test Product')
    })

    it('should fetch product by slug', async () => {
      const mockProduct = { id: 1, name: 'Test Product', slug: 'test-product' }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProduct } })

      const result = await productService.getProduct('test-product', true)

      expect(api.get).toHaveBeenCalledWith('/products/slug/test-product')
      expect(result.slug).toBe('test-product')
    })
  })

  describe('getFeaturedProducts', () => {
    it('should fetch featured products', async () => {
      const mockProducts = [
        { id: 1, name: 'Featured 1', isFeatured: true },
        { id: 2, name: 'Featured 2', isFeatured: true },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProducts } })

      const result = await productService.getFeaturedProducts(5)

      expect(api.get).toHaveBeenCalledWith('/products/featured', { params: { count: 5 } })
      expect(result).toHaveLength(2)
    })
  })

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const mockProducts = [{ id: 1, name: 'Laptop' }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockProducts } })

      const result = await productService.searchProducts('laptop')

      expect(api.get).toHaveBeenCalledWith('/products/search', {
        params: { query: 'laptop', count: 20 },
      })
      expect(result).toHaveLength(1)
    })
  })
})

describe('Category Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should fetch all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Clothing' },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })

      const result = await categoryService.getCategories()

      expect(api.get).toHaveBeenCalledWith('/categories/all')
      expect(result).toHaveLength(2)
    })
  })

  describe('getFeaturedCategories', () => {
    it('should fetch featured categories', async () => {
      const mockCategories = [{ id: 1, name: 'Featured Category', isFeatured: true }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })

      const result = await categoryService.getFeaturedCategories()

      expect(api.get).toHaveBeenCalledWith('/categories/featured')
      expect(result).toHaveLength(1)
    })
  })

  describe('getCategory', () => {
    it('should fetch category by id', async () => {
      const mockCategory = { id: 1, name: 'Electronics' }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategory } })

      const result = await categoryService.getCategory('1', false)

      expect(api.get).toHaveBeenCalledWith('/categories/1')
      expect(result.name).toBe('Electronics')
    })

    it('should fetch category by slug', async () => {
      const mockCategory = { id: 1, name: 'Electronics', slug: 'electronics' }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategory } })

      const result = await categoryService.getCategory('electronics', true)

      expect(api.get).toHaveBeenCalledWith('/categories/slug/electronics')
      expect(result.slug).toBe('electronics')
    })
  })
})
