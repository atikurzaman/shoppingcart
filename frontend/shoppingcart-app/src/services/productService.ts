import api from './api'

export interface Product {
  id: number
  name: string
  slug: string
  sku?: string
  price: number
  oldPrice?: number
  shortDescription?: string
  description?: string
  categoryName: string
  brandName?: string
  isFeatured: boolean
  isBestSeller: boolean
  isNewArrival: boolean
  stockQuantity: number
  stockStatus: string
  ratingAverage: number
  reviewCount: number
  viewCount: number
  images: { id: number; imageUrl: string; isMain: boolean }[]
  mainImageUrl?: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: number
  name: string
  sku?: string
  price: number
  stockQuantity: number
  imageUrl?: string
  isActive: boolean
  attributeValues: { attributeId: number; attributeName: string; value: string }[]
}

export interface CreateVariantRequest {
  productId: number
  name: string
  sku?: string
  barcode?: string
  price: number
  costPrice: number
  stockQuantity: number
  imageUrl?: string
  isActive: boolean
  attributes: { attributeId: number; value: string }[]
}

export interface Category {
  id: number
  name: string
  slug: string
  iconUrl?: string
  imageUrl?: string
  isFeatured: boolean
  productCount: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface CreateProductRequest {
  name: string
  sku?: string
  barcode?: string
  shortDescription?: string
  description?: string
  price: number
  oldPrice?: number
  costPrice: number
  categoryId: number
  brandId?: number
  supplierId?: number
  isFeatured: boolean
  isBestSeller: boolean
  isNewArrival: boolean
  minimumStockLevel: number
  reorderLevel: number
  weight: number
  dimensions?: string
  images?: { imageUrl: string; altText?: string; displayOrder: number; isMain: boolean }[]
}

export const productService = {
  getProducts: async (params?: {
    pageIndex?: number
    pageSize?: number
    search?: string
    categoryId?: number
    brandId?: number
    sortBy?: string
    isFeatured?: boolean
    isBestSeller?: boolean
    isNewArrival?: boolean
  }): Promise<PagedResult<Product>> => {
    const { data } = await api.get('/products', { params })
    return data.data
  },

  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    const { data } = await api.post('/products', product)
    return data.data
  },

  getProduct: async (idOrSlug: string, isSlug = false): Promise<Product> => {
    const url = isSlug ? `/products/slug/${idOrSlug}` : `/products/${idOrSlug}`
    const { data } = await api.get(url)
    return data.data
  },

  getFeaturedProducts: async (count = 10): Promise<Product[]> => {
    const { data } = await api.get('/products/featured', { params: { count } })
    return data.data
  },

  getBestSellers: async (count = 10): Promise<Product[]> => {
    const { data } = await api.get('/products/best-sellers', { params: { count } })
    return data.data
  },

  getNewArrivals: async (count = 10): Promise<Product[]> => {
    const { data } = await api.get('/products/new-arrivals', { params: { count } })
    return data.data
  },

  getRelatedProducts: async (productId: number, count = 8): Promise<Product[]> => {
    const { data } = await api.get(`/products/${productId}/related`, { params: { count } })
    return data.data
  },

  searchProducts: async (query: string, count = 20): Promise<Product[]> => {
    const { data } = await api.get('/products/search', { params: { query, count } })
    return data.data
  },
}

export const variantService = {
  getVariantsByProduct: async (productId: number): Promise<ProductVariant[]> => {
    const { data } = await api.get(`/variants/product/${productId}`)
    return data.data
  },

  getVariant: async (id: number): Promise<ProductVariant> => {
    const { data } = await api.get(`/variants/${id}`)
    return data.data
  },

  createVariant: async (variant: CreateVariantRequest): Promise<ProductVariant> => {
    const { data } = await api.post('/variants', variant)
    return data.data
  },

  updateVariant: async (id: number, variant: Omit<CreateVariantRequest, 'productId'>): Promise<ProductVariant> => {
    const { data } = await api.put(`/variants/${id}`, variant)
    return data.data
  },

  deleteVariant: async (id: number): Promise<void> => {
    await api.delete(`/variants/${id}`)
  },
}

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories/all')
    return data.data
  },

  getFeaturedCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories/featured')
    return data.data
  },

  getCategory: async (idOrSlug: string, isSlug = false): Promise<Category> => {
    const url = isSlug ? `/categories/slug/${idOrSlug}` : `/categories/${idOrSlug}`
    const { data } = await api.get(url)
    return data.data
  },
}
