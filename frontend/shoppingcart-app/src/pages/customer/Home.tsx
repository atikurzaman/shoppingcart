import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Truck, Shield, CreditCard, Clock, ChevronLeft, ChevronRight, Laptop, Smartphone, Headphones, Watch, Camera, Layers } from 'lucide-react'
import { productService, categoryService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'
import { useState, useEffect } from 'react'

const SLIDES = [
  {
    id: 1,
    title: "New Released",
    heading: "Apple Macbook Pro Max",
    subheading: "Best Deals for 2024",
    image: "/assets/images/hero-gadgets.png",
    accent: "bg-[#E3E8FF]"
  },
  {
    id: 2,
    title: "Trending Items",
    heading: "Fashion Summer Collection",
    subheading: "Up to 50% Off",
    image: "/assets/images/hero-fashion.png",
    accent: "bg-[#FFF2E3]"
  }
]

const FEATURE_ICONS: Record<string, any> = {
  "Electronics": Smartphone,
  "Clothing": Watch,
  "Home & Garden": Layers,
  "Sports": Camera,
  "Books": Headphones
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const { data: featuredProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getFeaturedProducts(8),
  })

  const { data: bestSellers } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => productService.getBestSellers(6),
  })

  const { data: newArrivals } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => productService.getNewArrivals(8),
  })

  const { data: categories } = useQuery({
    queryKey: ['featuredCategories'],
    queryFn: () => categoryService.getFeaturedCategories(),
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Slider */}
          <div className="lg:w-2/3 relative rounded-xl overflow-hidden shadow-sm group h-[450px]">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                  i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                } ${slide.accent}`}
              >
                <div className="pl-12 w-1/2 z-10">
                  <span className="text-secondary font-semibold uppercase tracking-wider text-sm">{slide.title}</span>
                  <h1 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 leading-tight text-gray-900">
                    {slide.heading}
                  </h1>
                  <p className="text-gray-600 mb-8 text-lg">{slide.subheading}</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                  >
                    Shop Now <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
                <div className="w-1/2 h-full flex items-center justify-center p-8">
                  <img src={slide.image} alt={slide.heading} className="max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            ))}
            
            {/* Controls */}
            <button 
              onClick={() => setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 rounded-full hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button 
              onClick={() => setCurrentSlide(prev => (prev + 1) % SLIDES.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 rounded-full hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 w-8 rounded-full transition-colors ${i === currentSlide ? 'bg-primary-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Side Banners */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="h-[213px] bg-[#E3F2FF] rounded-xl p-8 flex items-center relative overflow-hidden group">
              <div className="z-10">
                <span className="text-blue-600 font-bold text-xs uppercase">Gaming Consoles</span>
                <h3 className="text-xl font-bold mt-2 text-gray-900 leading-tight">Pro Controller <br />For Gaming</h3>
                <Link to="/products" className="text-gray-900 font-semibold border-b-2 border-primary-600 pb-1 mt-4 inline-block text-sm">Shop Now</Link>
              </div>
              <img 
                src="/assets/images/banner-gaming.png" 
                alt="Gaming" 
                className="absolute right-[-20px] bottom-[-20px] w-48 object-contain transform group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div className="h-[213px] bg-[#FFF2E3] rounded-xl p-8 flex items-center relative overflow-hidden group">
              <div className="z-10">
                <span className="text-orange-600 font-bold text-xs uppercase">Best Accessories</span>
                <h3 className="text-xl font-bold mt-2 text-gray-900 leading-tight">Smart Watch <br />Series 7</h3>
                <Link to="/products" className="text-gray-900 font-semibold border-b-2 border-primary-600 pb-1 mt-4 inline-block text-sm">Shop Now</Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1544117518-30ed5fa75cd4?w=500" 
                alt="Watch" 
                className="absolute right-[-10px] bottom-[-10px] w-40 object-contain transform group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over Tk 1000' },
            { icon: Shield, title: 'Secure Payment', desc: '100% secure payment methods' },
            { icon: Clock, title: '24/7 Support', desc: 'Fast online data support' },
            { icon: CreditCard, title: 'Money Back', desc: '30 days money back guarantee' },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center sm:flex-row sm:items-center text-center sm:text-left gap-4 p-2 border-r last:border-0 border-gray-100">
              <div className="p-3 bg-primary-50 rounded-full">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Bar */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Categories</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-sm">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories?.slice(0, 12).map((category) => {
            const Icon = FEATURE_ICONS[category.name] || Laptop
            return (
              <Link
                key={category.id}
                to={`/products?categoryId=${category.id}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary-100 group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] rounded-full flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <Icon className="h-8 w-8 text-gray-600 group-hover:text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm truncate">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.productCount} Items</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Products</h2>
              <div className="h-1 w-20 bg-primary-600 mt-2 rounded-full"></div>
            </div>
            <Link to="/products" className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold px-6 py-2 rounded-full">
              Full Showcase
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredProducts?.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Best Sellers */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Best Sellers</h2>
              <Link to="/products?bestSeller=true" className="text-primary-600 font-bold text-sm">View More</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bestSellers?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          
          {/* New Arrivals */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">New Arrivals</h2>
              <Link to="/products?newArrival=true" className="text-primary-600 font-bold text-sm">View More</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {newArrivals?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-dark-300 rounded-3xl p-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
          <div className="z-10 bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl max-w-2xl">
            <span className="text-primary-400 font-bold tracking-widest uppercase">Premium Experience</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4 mb-6 leading-tight">
              Get 20% Discount for your first Order
            </h2>
            <Link to="/register" className="inline-block bg-primary-600 text-white px-10 py-4 rounded-full font-bold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-xl shadow-primary-900/40">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
