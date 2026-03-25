import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, RotateCcw, ChevronRight, Mail } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/useStore'
import { logout } from '../../store/authSlice'
import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../../services/productService'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [isCatOpen, setIsCatOpen] = useState(false)

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { cart } = useAppSelector((state) => state.cart)

  const { data: categoryTree } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => categoryService.getCategoryTree(),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="w-full bg-white shadow-sm">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 hidden lg:block">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-primary-600">ENGLISH</span>
            <span className="cursor-pointer hover:text-primary-600">USD</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-primary-600">ORDER TRACKING</span>
            <Link to="/seller-signup" className="hover:text-primary-600 font-medium">BECOME A SELLER</Link>
          </div>
        </div>
      </div>


      {/* ── Main bar ─────────────────────────────────────────── */}
      <div className="bg-white py-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-primary-600 p-1.5 rounded-full">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-xl text-primary-600 tracking-tight">ShopCart</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full border border-gray-300 rounded overflow-hidden focus-within:border-primary-600 transition-colors">
                <input
                  type="text"
                  placeholder="Enter your search key"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-700"
                />
                <button type="submit" className="bg-nav hover:bg-gray-800 text-white px-5 py-2.5 transition-colors">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Account */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors text-sm">
                  <User className="h-5 w-5" />
                  <span className="hidden lg:block">
                    {isAuthenticated ? `${user?.firstName}` : 'My Account'}
                  </span>
                  <ChevronDown className="h-3 w-3 hidden lg:block" />
                </button>
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <Link to="/account" className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">Wishlist</Link>
                      {user?.roles?.includes('Admin') && (
                        <Link to="/admin" className="block px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50">Admin Panel</Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                    </>
                  ) : (
                    <div className="px-4 py-3 flex flex-col gap-2">
                      <Link to="/login" className="w-full text-center py-2 bg-primary-600 text-white rounded text-sm font-bold hover:bg-primary-700">Sign In</Link>
                      <Link to="/register" className="w-full text-center py-2 border border-gray-200 text-gray-600 rounded text-sm font-bold hover:bg-gray-50">Sign Up</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Compare */}
              <Link to="/compare" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                <RotateCcw className="h-5 w-5" />
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cart?.itemCount ? (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cart.itemCount}
                  </span>
                ) : null}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 hover:text-primary-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 hidden lg:block relative z-40">
        <div className="container mx-auto px-4 h-12 flex items-center">
          {/* All Categories button */}
          <div className="relative group">
            <button
              className="h-12 px-5 flex items-center gap-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors min-w-[215px]"
              onClick={() => setIsCatOpen(!isCatOpen)}
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block w-[18px] h-0.5 bg-white"></span>
                <span className="block w-[18px] h-0.5 bg-white"></span>
                <span className="block w-[18px] h-0.5 bg-white"></span>
              </span>
              ALL CATEGORIES
            </button>

            {/* Mega dropdown */}
            <div className="absolute top-full left-0 w-[820px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 flex">
              {/* L1 */}
              <div className="w-[215px] border-r border-gray-100 py-2 bg-gray-50">
                {categoryTree?.map((root) => (
                  <div
                    key={root.id}
                    onMouseEnter={() => setActiveCategory(root.id)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${activeCategory === root.id ? 'bg-white text-primary-600 font-bold border-l-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
                  >
                    <span>{root.name}</span>
                    {root.subCategories && root.subCategories.length > 0 && (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                ))}
              </div>
              {/* L2 + L3 */}
              <div className="flex-1 p-6 grid grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto max-h-[500px]">
                {activeCategory && categoryTree?.find(c => c.id === activeCategory)?.subCategories?.map((sub) => (
                  <div key={sub.id}>
                    <Link to={`/products?categoryId=${sub.id}`} className="text-sm font-bold text-gray-800 hover:text-primary-600 block border-b border-gray-100 pb-1.5 mb-2">
                      {sub.name}
                    </Link>
                    <ul className="space-y-1.5">
                      {sub.subCategories?.map((item) => (
                        <li key={item.id}>
                          <Link to={`/products?categoryId=${item.id}`} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {!activeCategory && (
                  <div className="col-span-2 flex items-center justify-center h-full text-gray-400 text-sm">
                    Hover a category to see subcategories
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center h-12 ml-2">
            {[
              { label: 'Home', to: '/' },
              { label: 'Flash Deal', to: '/deals/flash-deal' },
              { label: 'All Products', to: '/products' },
              { label: 'Seller Shop', to: '/sellers' },
              { label: 'Compare', to: '/compare' },
              { label: 'Blogs', to: '/blogs' },
              { label: 'Contact Us', to: '/contact' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-primary-600 text-sm font-medium px-4 h-full flex items-center hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Info email — right side */}
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Mail className="h-3.5 w-3.5" />
            <span>info@shopcart.com</span>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white pt-16 overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="mb-2">
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                />
                <button type="submit" className="bg-nav text-white px-4">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              {[
                { label: 'Home', to: '/' },
                { label: 'Flash Deal', to: '/products?featured=true' },
                { label: 'All Products', to: '/products' },
                { label: 'Seller Shop', to: '/sellers' },
                { label: 'Blogs', to: '/blogs' },
                { label: 'Contact Us', to: '/contact' },
              ].map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}
                  className="py-3 border-b border-gray-100 text-base font-semibold text-gray-700">
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={handleLogout} className="mt-4 py-3 text-left text-red-500 font-semibold">Logout</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-4 text-center py-3 bg-primary-600 text-white rounded font-bold">Sign In</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
