import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { productService, categoryService, brandService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'
import { ChevronLeft, ChevronRight, LayoutGrid, List, ChevronRight as ChevronRightIcon, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Local state for filters to avoid excessive re-renders during input
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const pageIndex = parseInt(searchParams.get('page') || '0')
  const pageSize = 12
  const search = searchParams.get('search') || undefined
  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined
  const brandId = searchParams.get('brandId') ? parseInt(searchParams.get('brandId')!) : undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined
  const bestSeller = searchParams.get('bestSeller') === 'true' ? true : undefined
  const newArrival = searchParams.get('newArrival') === 'true' ? true : undefined
  const sortBy = searchParams.get('sortBy') || undefined

  const { data, isLoading } = useQuery({
    queryKey: ['products', pageIndex, search, categoryId, brandId, featured, bestSeller, newArrival, sortBy, searchParams.get('minPrice'), searchParams.get('maxPrice')],
    queryFn: () => productService.getProducts({ 
      pageIndex, 
      pageSize, 
      search, 
      categoryId, 
      brandId,
      isFeatured: featured, 
      isBestSeller: bestSeller,
      isNewArrival: newArrival,
      sortBy,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    }),
  })

  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  const { data: allBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getBrands(),
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

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    if (minPrice) newParams.set('minPrice', minPrice)
    else newParams.delete('minPrice')
    
    if (maxPrice) newParams.set('maxPrice', maxPrice)
    else newParams.delete('maxPrice')
    
    newParams.set('page', '0')
    setSearchParams(newParams)
  }

  const selectedCategory = allCategories?.find(c => c.id === categoryId)

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-16">
      {/* Breadcrumbs Banner */}
      <div className="bg-[#FFF2E3] py-12 mb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            {selectedCategory ? selectedCategory.name : (search ? `Search: ${search}` : 'All Products')}
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-400">Products</span>
            {selectedCategory && (
              <>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-primary-600">{selectedCategory.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[300px] shrink-0 space-y-8">
            {/* Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Product Categories</h3>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => updateParams('categoryId', undefined)}
                    className={`text-sm font-semibold transition-colors ${!categoryId ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
                  >
                    All Categories
                  </button>
                </li>
                {allCategories?.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => updateParams('categoryId', String(cat.id))}
                      className={`text-sm font-semibold transition-colors flex items-center justify-between w-full group ${categoryId === cat.id ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 px-2 py-0.5 rounded-full transition-colors">{cat.productCount || 0}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Min</label>
                    <input 
                      type="number" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Max</label>
                    <input 
                      type="number" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handlePriceFilter}
                  className="w-full bg-[#FFBB38] hover:bg-[#ffb11f] text-gray-900 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-yellow-100"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Brands */}
            <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Brands</h3>
              <ul className="space-y-4">
                {allBrands?.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={brandId === brand.id}
                        onChange={() => updateParams('brandId', brandId === brand.id ? undefined : String(brand.id))}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                      />
                      <span className={`text-sm font-semibold transition-colors ${brandId === brand.id ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-600'}`}>
                        {brand.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm font-bold text-gray-500">
                {data && (
                  <span>Showing <span className="text-gray-900">{data.pageIndex * data.pageSize + 1}-{Math.min((data.pageIndex + 1) * data.pageSize, data.totalCount)}</span> of <span className="text-gray-900">{data.totalCount}</span> results</span>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400">Sort by:</span>
                  <select
                    value={sortBy || ''}
                    onChange={(e) => updateParams('sortBy', e.target.value || undefined)}
                    className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer"
                  >
                    <option value="">Default Sorting</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-gray-100 hidden md:block"></div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400 hidden sm:block">View:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#FFBB38] text-gray-900 shadow-lg shadow-yellow-100' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#FFBB38] text-gray-900 shadow-lg shadow-yellow-100' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-premium animate-pulse h-[350px]"></div>
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-premium border border-gray-100">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 font-medium">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-8 text-primary-600 font-bold border-b-2 border-primary-600 pb-1"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {data?.items.map((product) => (
                  <ProductCard key={product.id} product={product} isList={viewMode === 'list'} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-16">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.set('page', String(pageIndex - 1))
                    setSearchParams(newParams)
                  }}
                  disabled={!data.hasPrevious}
                  className="w-12 h-12 rounded-xl bg-white shadow-premium border border-gray-100 center text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
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
                    className={`w-12 h-12 rounded-xl font-bold transition-all ${
                      i === data.pageIndex
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                        : 'bg-white text-gray-500 hover:bg-gray-50 shadow-premium border border-gray-100'
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
                  className="w-12 h-12 rounded-xl bg-white shadow-premium border border-gray-100 center text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
