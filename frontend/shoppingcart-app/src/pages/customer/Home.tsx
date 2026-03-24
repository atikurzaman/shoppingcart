import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Headphones, ShieldCheck, Truck, Mail } from 'lucide-react'
import { productService, categoryService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'
import { useState, useEffect, useRef } from 'react'

// ── Slides ───────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    subtitle: 'UP TO 50% OFF',
    title: 'You have reached\nthe right sales site',
    discount: '50% OFF',
    cta: 'SHOP NOW',
    bg: 'linear-gradient(135deg, #6B9FDF 0%, #295EB7 100%)',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  },
  {
    id: 2,
    subtitle: 'NEW ARRIVAL',
    title: 'Discover Latest\nTrends in Fashion',
    discount: '30% OFF',
    cta: 'SHOP NOW',
    bg: 'linear-gradient(135deg, #82b4f0 0%, #1a4ea0 100%)',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80',
  },
]

// ── Trust features ────────────────────────────────────────
const FEATURES = [
  { icon: Truck, title: 'Fast Delivery', desc: '2–5 business days' },
  { icon: RotateCcw, title: '7 Day Return', desc: 'Easy hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round the clock help' },
]

function useProductScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const scrollLeft = () => ref.current?.scrollBy({ left: -600, behavior: 'smooth' })
  const scrollRight = () => ref.current?.scrollBy({ left: 600, behavior: 'smooth' })
  return { ref, scrollLeft, scrollRight }
}

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Link to={link}
        className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-5 py-2 transition-colors">
        View All Products
      </Link>
    </div>
  )
}

function ProductRow({ products, title, link }: { products: any[]; title: string; link: string }) {
  const { ref, scrollLeft, scrollRight } = useProductScroll()

  return (
    <section className="bg-white py-8 mb-4">
      <div className="container mx-auto px-4">
        <SectionHeader title={title} link={link} />
        <div className="relative">
          <button onClick={scrollLeft}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-0 overflow-x-auto no-scrollbar"
            style={{ scrollbarWidth: 'none' }}>
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <button onClick={scrollRight}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

function TwoColumnSection({
  leftTitle, leftLink, leftProducts,
  rightTitle, rightLink, rightProducts
}: {
  leftTitle: string; leftLink: string; leftProducts: any[];
  rightTitle: string; rightLink: string; rightProducts: any[];
}) {
  return (
    <section className="bg-[#EEF0F5] py-6 mb-4">
      <div className="container mx-auto px-4">
        <div className="flex gap-4">
          {/* Left: stacked list */}
          <div className="w-[280px] shrink-0 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{leftTitle}</h2>
              <Link to={leftLink} className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {leftProducts?.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 group transition-colors">
                  <Link to={`/products/${p.slug}`} className="w-16 h-16 shrink-0 bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                    {p.mainImageUrl
                      ? <img src={p.mainImageUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      : <span className="text-xs text-gray-300">No img</span>
                    }
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${p.slug}`} className="text-xs text-gray-700 hover:text-primary-600 line-clamp-2 transition-colors">{p.name}</Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-primary-600 font-bold text-sm">Tk {p.price.toLocaleString()}</span>
                      {p.oldPrice && p.oldPrice > p.price && (
                        <span className="text-xs text-gray-400 line-through">Tk {p.oldPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: grid */}
          <div className="flex-1 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{rightTitle}</h2>
              <Link to={rightLink} className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
              {rightProducts?.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [flashTime] = useState(() => {
    const t = new Date()
    t.setHours(t.getHours() + 8, t.getMinutes() + 25, 0, 0)
    return t
  })
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, flashTime.getTime() - Date.now())
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  const { data: featuredProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getFeaturedProducts(12),
  })
  const { data: bestSellers } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => productService.getBestSellers(10),
  })
  const { data: newArrivals } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => productService.getNewArrivals(12),
  })
  const { data: categories } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => categoryService.getCategoryTree(),
  })

  const slide = SLIDES[currentSlide]

  return (
    <div className="min-h-screen bg-[#EEF0F5]">

      {/* ── HERO: sidebar + slider ── */}
      <section className="bg-white mb-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-0">
            {/* Category sidebar */}
            <div className="hidden lg:block w-[200px] shrink-0 border-r border-gray-100">
              {categories?.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 border-b border-gray-50 transition-colors group"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            {/* Slider */}
            <div className="flex-1 relative overflow-hidden" style={{ minHeight: '360px', background: slide.bg }}>
              <div className="absolute inset-0 flex items-center px-12 z-10">
                <div className="w-1/2 text-white">
                  <p className="text-sm font-semibold tracking-widest uppercase opacity-80 mb-3">{slide.subtitle}</p>
                  <h1 className="text-4xl font-black leading-tight mb-2 whitespace-pre-line">{slide.title}</h1>
                  <p className="text-5xl font-black mb-8 text-white">{slide.discount}</p>
                  <Link to="/products"
                    className="inline-block bg-white text-primary-600 font-black text-sm px-8 py-3 hover:bg-gray-100 transition-colors tracking-widest">
                    {slide.cta}
                  </Link>
                </div>
                <div className="w-1/2 flex items-center justify-center h-full p-8">
                  <img src={slide.image} alt="Hero" className="max-h-[280px] w-full object-contain" />
                </div>
              </div>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="bg-white mb-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-5">
                <f.icon className="h-8 w-8 text-primary-600 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900 text-sm">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH DEALS ── */}
      <section className="bg-white py-6 mb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Save up to <span className="text-red-500 font-bold">50%</span></p>
              <h2 className="text-xl font-bold text-gray-900">Flash Deal</h2>
            </div>
            <div className="flex items-center gap-3">
              {[
                { val: pad(timeLeft.d), label: 'Days' },
                { val: pad(timeLeft.h), label: 'Hours' },
                { val: pad(timeLeft.m), label: 'Minutes' },
                { val: pad(timeLeft.s), label: 'Second' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="text-center">
                    <div className="text-primary-600 font-black text-xl leading-none">{t.val}</div>
                    <div className="text-gray-400 text-[10px]">{t.label}</div>
                  </div>
                  {i < 3 && <span className="text-gray-300 font-bold text-lg">:</span>}
                </div>
              ))}
              <Link to="/products?featured=true"
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-5 py-3 transition-colors">
                View All
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-0">
            {featuredProducts?.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── TOP SALES / NEW ARRIVALS split ── */}
      <TwoColumnSection
        leftTitle="Top Sales"
        leftLink="/products?bestSeller=true"
        leftProducts={bestSellers || []}
        rightTitle="New Arrivals"
        rightLink="/products?newArrival=true"
        rightProducts={newArrivals || []}
      />

      {/* ── LATEST COLLECTION ── */}
      {newArrivals && newArrivals.length > 0 && (
        <ProductRow
          title="Latest Collection"
          link="/products?newArrival=true"
          products={newArrivals.slice(0, 12)}
        />
      )}

      {/* ── ONLY FOR YOU ── */}
      {featuredProducts && featuredProducts.length > 0 && (
        <ProductRow
          title="Only For You"
          link="/products?featured=true"
          products={featuredProducts.slice(0, 12)}
        />
      )}

      {/* ── NEWSLETTER ── */}
      <section className="bg-primary-600 py-8 mb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h2 className="text-2xl font-black">Subscribe our Newsletter</h2>
              <p className="text-primary-200 text-sm mt-1">Choose your necessary products from this feature categories</p>
            </div>
            <form className="flex gap-0 w-full md:w-auto md:min-w-[500px]" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 text-sm text-gray-700 outline-none"
              />
              <button type="submit" className="bg-nav hover:bg-gray-900 text-white px-8 py-3 font-bold text-sm uppercase tracking-wider transition-colors whitespace-nowrap">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  )
}
