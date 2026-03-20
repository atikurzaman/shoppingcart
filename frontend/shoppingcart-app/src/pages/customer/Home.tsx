import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Truck, Shield, CreditCard } from 'lucide-react'
import { productService, categoryService } from '../../services/productService'
import ProductCard from '../../components/common/ProductCard'

export default function Home() {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getFeaturedProducts(8),
  })

  const { data: newArrivals } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => productService.getNewArrivals(8),
  })

  const { data: categories } = useQuery({
    queryKey: ['featuredCategories'],
    queryFn: () => categoryService.getFeaturedCategories(),
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Quality Products at <span className="text-yellow-300">Amazing Prices</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Shop from thousands of products across multiple categories. Fast delivery, secure payment, and excellent customer service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full inline-flex items-center gap-2">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/products?featured=true" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-full">
                View Deals
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over Tk 500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Star, title: 'Quality Guarantee', desc: 'Verified products' },
              { icon: CreditCard, title: 'Easy Returns', desc: '7-day return policy' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?categoryId=${category.id}`}
                  className="card p-4 text-center hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                >
                  {category.iconUrl && (
                    <img src={category.iconUrl} alt={category.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
                  )}
                  <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.productCount} products</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-500 mt-1">Handpicked just for you</p>
              </div>
              <Link to="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
                <p className="text-gray-500 mt-1">Fresh products just added</p>
              </div>
              <Link to="/products?isNewArrival=true" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover amazing deals every day.
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full inline-flex items-center gap-2">
            Create an Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
