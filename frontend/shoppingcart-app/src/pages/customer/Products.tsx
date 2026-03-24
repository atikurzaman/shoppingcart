import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { productService, categoryService, brandService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star, SlidersHorizontal, X } from 'lucide-react'
import { useState, useEffect } from 'react'

// ── Collapsible sidebar section ───────────────────────────
function SideSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border-b border-gray-100"
      >
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

// ── Radio item ────────────────────────────────────────────
function RadioItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5 group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors
          ${checked ? 'border-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}
      >
        {checked && <div className="w-2 h-2 bg-primary-600 rounded-full" />}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-primary-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
        {label}
      </span>
    </label>
  )
}

// ── Price range presets ───────────────────────────────────
const PRICE_RANGES = [
  { label: '$0.00 - $100.00', min: 0, max: 100 },
  { label: '$100.00 - $500.00', min: 100, max: 500 },
  { label: '$500.00 - $1,000.00', min: 500, max: 1000 },
  { label: '$1,000.00 - $2,000.00', min: 1000, max: 2000 },
  { label: '$2,000.00 - $5,000.00', min: 2000, max: 5000 },
  { label: '$5,000.00 - $10,000.00', min: 5000, max: 10000 },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCatMore, setShowCatMore] = useState(false)
  const [showBrandMore, setShowBrandMore] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [priceSlider, setPriceSlider] = useState(300000)

  const pageIndex = parseInt(searchParams.get('page') || '0')
  const pageSize = 12
  const search = searchParams.get('search') || undefined
  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined
  const brandId = searchParams.get('brandId') ? parseInt(searchParams.get('brandId')!) : undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined
  const bestSeller = searchParams.get('bestSeller') === 'true' ? true : undefined
  const newArrival = searchParams.get('newArrival') === 'true' ? true : undefined
  const sortBy = searchParams.get('sortBy') || undefined
  const ratingFilter = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined

  const { data, isLoading } = useQuery({
    queryKey: ['products', pageIndex, search, categoryId, brandId, featured, bestSeller, newArrival, sortBy, searchParams.get('minPrice'), searchParams.get('maxPrice'), ratingFilter],
    queryFn: () => productService.getProducts({
      pageIndex, pageSize, search, categoryId, brandId,
      isFeatured: featured, isBestSeller: bestSeller, isNewArrival: newArrival, sortBy,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    }),
  })

  const { data: allCategories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getCategories() })
  const { data: allBrands } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.getBrands() })

  const updateParam = (key: string, value: string | undefined) => {
    const p = new URLSearchParams(searchParams)
    if (value !== undefined) p.set(key, value); else p.delete(key)
    p.set('page', '0')
    setSearchParams(p)
  }

  const handlePriceRange = (min: number, max: number) => {
    const p = new URLSearchParams(searchParams)
    p.set('minPrice', String(min))
    p.set('maxPrice', String(max))
    p.set('page', '0')
    setSearchParams(p)
    setPriceSlider(max)
  }

  const selectedCategory = allCategories?.find(c => c.id === categoryId)
  const visibleCats = showCatMore ? allCategories : allCategories?.slice(0, 7)
  const visibleBrands = showBrandMore ? allBrands : allBrands?.slice(0, 5)

  const hasActiveFilters = !!(categoryId || brandId || searchParams.get('minPrice') || searchParams.get('maxPrice') || ratingFilter)

  // ── SIDEBAR ──────────────────────────────────────────────
  const Sidebar = () => (
    <div className="space-y-2 w-full">
      {/* Top Categories */}
      <SideSection title="Top Categories">
        <div className="space-y-0.5">
          <RadioItem label="All Categories" checked={!categoryId} onChange={() => updateParam('categoryId', undefined)} />
          {visibleCats?.map(cat => (
            <RadioItem key={cat.id} label={cat.name} checked={categoryId === cat.id} onChange={() => updateParam('categoryId', String(cat.id))} />
          ))}
        </div>
        {allCategories && allCategories.length > 7 && (
          <button onClick={() => setShowCatMore(!showCatMore)} className="text-sm font-bold text-primary-600 mt-2 hover:underline">
            {showCatMore ? 'View Less' : 'View More'}
          </button>
        )}
      </SideSection>

      {/* Brand */}
      <SideSection title="Brand">
        <div className="space-y-0.5">
          <RadioItem label="All Brands" checked={!brandId} onChange={() => updateParam('brandId', undefined)} />
          {visibleBrands?.map(brand => (
            <RadioItem key={brand.id} label={brand.name} checked={brandId === brand.id} onChange={() => updateParam('brandId', String(brand.id))} />
          ))}
        </div>
        {allBrands && allBrands.length > 5 && (
          <button onClick={() => setShowBrandMore(!showBrandMore)} className="text-sm font-bold text-primary-600 mt-2 hover:underline">
            {showBrandMore ? 'View Less' : 'View More'}
          </button>
        )}
      </SideSection>

      {/* Rating */}
      <SideSection title="Rating">
        <div className="space-y-0.5">
          {[5, 4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center gap-2.5 cursor-pointer py-1.5 group">
              <div
                onClick={() => updateParam('rating', ratingFilter === rating ? undefined : String(rating))}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors
                  ${ratingFilter === rating ? 'border-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}
              >
                {ratingFilter === rating && <div className="w-2 h-2 bg-primary-600 rounded-full" />}
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                ))}
                <span className="text-xs text-gray-500 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </SideSection>

      {/* Price Range */}
      <SideSection title="Price Range">
        <div className="space-y-0.5 mb-4">
          {PRICE_RANGES.map(r => {
            const active = searchParams.get('minPrice') === String(r.min) && searchParams.get('maxPrice') === String(r.max)
            return (
              <RadioItem
                key={r.label}
                label={r.label}
                checked={active}
                onChange={() => active ? (() => { updateParam('minPrice', undefined); updateParam('maxPrice', undefined) })() : handlePriceRange(r.min, r.max)}
              />
            )
          })}
        </div>
        {/* Slider */}
        <div className="pt-2">
          <input
            type="range"
            min={0}
            max={300000}
            step={500}
            value={priceSlider}
            onChange={e => {
              setPriceSlider(Number(e.target.value))
              handlePriceRange(0, Number(e.target.value))
            }}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Tk 0.00</span>
            <span>Tk {priceSlider.toLocaleString()}.00</span>
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={() => { setSearchParams({}); setPriceSlider(300000) }}
            className="mt-3 text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
            <X className="h-3 w-3" /> Clear all filters
          </button>
        )}
      </SideSection>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#EEF0F5] pb-16">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span className="text-gray-300">&gt;</span>
            <span className="text-primary-600 font-semibold">
              {selectedCategory ? selectedCategory.name : search ? `Search: "${search}"` : 'Products'}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4">

          {/* ── Sidebar — desktop ── */}
          <aside className="hidden lg:block w-[260px] shrink-0 space-y-2">
            <Sidebar />
          </aside>

          {/* ── Main ── */}
          <main className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="bg-white border border-gray-100 px-5 py-4 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-bold text-xl text-gray-900">
                  {selectedCategory ? selectedCategory.name : search ? `"${search}"` : 'Products'}
                </h1>
                {data && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {data.totalCount} item{data.totalCount !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileSidebar(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-200 px-3 py-2 hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>

                {/* Sort */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 font-medium whitespace-nowrap">Sort By :</span>
                  <select
                    value={sortBy || 'newest'}
                    onChange={e => updateParam('sortBy', e.target.value === 'newest' ? undefined : e.target.value)}
                    className="border border-gray-200 text-sm text-gray-700 font-semibold py-1.5 pl-3 pr-8 outline-none focus:border-primary-600 bg-white cursor-pointer"
                  >
                    <option value="newest">Newest items</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 animate-pulse h-[300px]" />
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="bg-white border border-gray-100 p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={() => setSearchParams({})}
                  className="bg-primary-600 text-white px-6 py-2 text-sm font-bold hover:bg-primary-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-0">
                {data?.items.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button
                  onClick={() => updateParam('page', String(pageIndex - 1))}
                  disabled={!data.hasPrevious}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-primary-600 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {[...Array(Math.min(data.totalPages, 7))].map((_, i) => {
                  const p = data.totalPages <= 7 ? i : Math.max(0, Math.min(data.totalPages - 7, pageIndex - 3)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => updateParam('page', String(p))}
                      className={`w-9 h-9 text-sm font-bold transition-colors border ${
                        p === pageIndex
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-600 hover:text-primary-600'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                })}

                <button
                  onClick={() => updateParam('page', String(pageIndex + 1))}
                  disabled={!data.hasNext}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-primary-600 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebar(false)} />
          <div className="relative bg-white w-[300px] overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-gray-900">Filters</h2>
              <button onClick={() => setMobileSidebar(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  )
}
