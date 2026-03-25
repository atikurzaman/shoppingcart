import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { productService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'
import { useState, useEffect } from 'react'

function useCountdown(targetHours = 72) {
  const [target] = useState(() => {
    const t = new Date()
    t.setHours(t.getHours() + targetHours, 0, 0, 0)
    return t
  })
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, target.getTime() - Date.now())
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [target])

  return timeLeft
}

export default function FlashDeal() {
  const [page, setPage] = useState(0)
  const pageSize = 18
  const { d, h, m, s } = useCountdown(72)
  const pad = (n: number) => String(n).padStart(2, '0')

  const { data, isLoading } = useQuery({
    queryKey: ['flashDeals', page],
    queryFn: () => productService.getProducts({
      pageIndex: page,
      pageSize,
      isFeatured: true,
    }),
  })

  return (
    <div className="min-h-screen bg-[#EEF0F5] pb-16">

      {/* ── Hero Banner ── */}
      <div
        className="w-full py-16 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fce4e4 0%, #fde8d8 50%, #fce4e4 100%)' }}
      >
        {/* Background lightning hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <Zap className="text-yellow-500" style={{ width: 400, height: 400 }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase mb-2">Special Offer</p>

          {/* Main text with lightning bolt */}
          <div className="flex items-center gap-0">
            <span className="text-5xl md:text-7xl font-black text-red-600 leading-none tracking-tight">FLASH</span>
            <div className="relative mx-1">
              {/* Lightning bolt */}
              <svg width="80" height="80" viewBox="0 0 80 100" className="text-yellow-400 fill-yellow-400">
                <polygon points="45,0 10,55 38,55 35,100 70,40 42,40" />
              </svg>
              {/* "DISCOUNT UP TO 70% OFF" badge */}
              <div className="absolute bottom-1 right-0 translate-x-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 leading-tight whitespace-nowrap">
                DISCOUNT<br />UP TO 70% OFF
              </div>
            </div>
            <span className="text-5xl md:text-7xl font-black text-gray-900 leading-none tracking-tight">DEAL'S</span>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span className="text-gray-300">&gt;</span>
            <span className="text-primary-600 font-semibold">Deals</span>
          </div>
        </div>
      </div>

      {/* ── Product Section ── */}
      <div className="container mx-auto px-4 py-6">

        {/* Section header with countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-black text-gray-900">Flash Deal</h1>

          {/* Countdown */}
          <div className="flex items-center gap-1.5">
            {[
              { val: pad(d), label: 'Days' },
              { val: pad(h), label: 'Hours' },
              { val: pad(m), label: 'Minutes' },
              { val: pad(s), label: 'Seconds' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="text-center">
                  <div className="text-2xl font-black text-primary-600 leading-none w-12 text-center">{t.val}</div>
                  <div className="text-[10px] text-gray-400 text-center">{t.label}</div>
                </div>
                {i < 3 && <span className="text-gray-300 font-black text-xl mb-3">:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal scrollbar like Kartly */}
        <div className="w-full bg-gray-200 h-0.5 mb-6 rounded-full">
          <div className="bg-primary-600 h-0.5 rounded-full" style={{ width: '15%' }} />
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-0">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 animate-pulse h-[260px]" />
            ))}
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-0">
              {data.items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-primary-600 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {[...Array(Math.min(data.totalPages, 7))].map((_, i) => {
                  const p = data.totalPages <= 7 ? i : Math.max(0, Math.min(data.totalPages - 7, page - 3)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 text-sm font-bold transition-colors border ${
                        p === page
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-600 hover:text-primary-600'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-primary-600 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-gray-100 py-20 text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-12 w-12 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Flash Deals Active</h3>
            <p className="text-gray-500 text-sm mb-6">Check back soon for exciting limited-time offers!</p>
            <Link to="/products" className="bg-primary-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-primary-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
