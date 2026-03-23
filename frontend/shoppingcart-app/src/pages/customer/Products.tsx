import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { productService, categoryService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'
import { ChevronLeft, ChevronRight, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const pageIndex = parseInt(searchParams.get('page') || '0')
  const pageSize = 12
  const search = searchParams.get('search') || undefined
  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined
  const sortBy = searchParams.get('sortBy') || undefined

  const { data, isLoading } = useQuery({
    queryKey: ['products', pageIndex, search, categoryId, featured, sortBy],
    queryFn: () => productService.getProducts({ pageIndex, pageSize, search, categoryId, isFeatured: featured, sortBy }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  const updateParams = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '0')
    setSearchParams(newParams)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {search ? `Search results for "${search}"` : 'All Products'}
            </h1>
            {data && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Showing {data.pageIndex * data.pageSize + 1}-{Math.min((data.pageIndex + 1) * data.pageSize, data.totalCount)} of {data.totalCount} products
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <select
              value={sortBy || ''}
              onChange={(e) => updateParams('sortBy', e.target.value || undefined)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
            >
              <option value="">Default Sorting</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="newest">Newest First</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filters:</span>
            </div>
            
            {/* Category Dropdown */}
            <select
              value={categoryId || ''}
              onChange={(e) => updateParams('categoryId', e.target.value || undefined)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => setSearchParams({})}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-100 hover:bg-gray-200 dark:hover:bg-dark-300 rounded-lg text-sm transition-colors text-gray-700 dark:text-gray-300"
            >
              Clear All
            </button>
            <button
              onClick={() => updateParams('featured', featured ? undefined : 'true')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                featured ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-100 hover:bg-gray-200 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300'
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse dark:bg-dark-200 dark:border-gray-700">
                <div className="aspect-square bg-gray-200 dark:bg-dark-100"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {data?.items.map((product) => (
                <ProductCard key={product.id} product={product} isList={viewMode === 'list'} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.set('page', String(pageIndex - 1))
                    setSearchParams(newParams)
                  }}
                  disabled={!data.hasPrevious}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {[...Array(data.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams)
                      newParams.set('page', String(i))
                      setSearchParams(newParams)
                    }}
                    className={`w-10 h-10 rounded-lg ${
                      i === data.pageIndex
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.set('page', String(pageIndex + 1))
                    setSearchParams(newParams)
                  }}
                  disabled={!data.hasNext}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
