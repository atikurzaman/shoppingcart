import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, ChevronDown, Phone, Mail, RotateCcw, LayoutGrid } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/useStore'
import { logout } from '../../store/authSlice'
import { toggleTheme } from '../../store/themeSlice'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { cart } = useAppSelector((state) => state.cart)
  const { mode } = useAppSelector((state) => state.theme)

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
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 hidden lg:block">
        <div className="container mx-auto px-4 h-10 flex items-center justify-between text-xs font-medium text-gray-600">
          <div className="flex items-center space-x-6">
            <Link to="/account" className="hover:text-primary-600 transition-colors">Account</Link>
            <Link to="/orders" className="hover:text-primary-600 transition-colors">Track Order</Link>
            <Link to="/support" className="hover:text-primary-600 transition-colors">Support</Link>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-primary-600" />
              <span>+880 1234 567 890</span>
            </div>
            <div className="flex items-center gap-2 border-l pl-6">
              <Mail className="h-3 w-3 text-primary-600" />
              <span>support@shopcart.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="bg-white py-5 border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-8 h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <div className="bg-primary-600 p-2 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 font-black text-2xl text-gray-900 tracking-tight">Shop<span className="text-primary-600">Cart</span></span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
              <div className="flex w-full items-center border-2 border-primary-600 rounded-lg overflow-hidden focus-within:ring-4 focus-within:ring-primary-50 transition-all">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-5 py-2.5 outline-none text-sm text-gray-800"
                />
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 font-bold transition-colors">
                  Search
                </button>
              </div>
            </form>

            {/* Icons */}
            <div className="flex items-center gap-5">
              <button onClick={() => dispatch(toggleTheme())} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all">
                {mode === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              
              <Link to="/compare" className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all relative group">
                <RotateCcw className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">0</span>
              </Link>

              <Link to="/wishlist" className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all relative group">
                <Heart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">0</span>
              </Link>

              <Link to="/cart" className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all relative group">
                <ShoppingCart className="h-6 w-6" />
                {cart?.itemCount ? (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                    {cart.itemCount}
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">0</span>
                )}
              </Link>

              <div className="relative group pl-2">
                <button className="flex items-center gap-2 p-1 text-gray-600 hover:text-primary-600 transition-colors">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                </button>
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100]">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-50 mb-2">
                        <p className="text-xs text-gray-400">Welcome,</p>
                        <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <Link to="/account" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Wishlist</Link>
                      {user?.roles?.includes('Admin') && (
                        <Link to="/admin" className="block px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors">Admin Panel</Link>
                      )}
                      <hr className="my-2 border-gray-50" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors">Logout</button>
                    </>
                  ) : (
                    <div className="px-4 py-2 flex flex-col gap-2">
                      <Link to="/login" className="center w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors">Sign In</Link>
                      <Link to="/register" className="center w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Sign Up</Link>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Bar */}
      <div className="bg-[#FFBB38] h-12 hidden lg:block overflow-visible relative z-40">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center h-full">
            {/* Categories Dropdown */}
            <div className="h-full relative group">
              <button className="bg-white h-full px-8 flex items-center gap-3 text-sm font-bold text-gray-900 min-w-[280px]">
                <LayoutGrid className="h-5 w-5 text-primary-600" />
                All Categories
                <ChevronDown className="h-4 w-4 ml-auto group-hover:rotate-180 transition-transform" />
              </button>
              {/* Simple Mock Categories List */}
              <div className="absolute top-full left-0 w-full bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100 transform translate-y-2 group-hover:translate-y-0 py-2">
                <Link to="/products?category=electronics" className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Electronics</Link>
                <Link to="/products?category=fashion" className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Fashion & Apparel</Link>
                <Link to="/products?category=home" className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Home & Living</Link>
                <Link to="/products?category=beauty" className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Beauty & Health</Link>
                <Link to="/products?category=sports" className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">Sports & Outdoors</Link>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex items-center ml-8 space-x-8 text-sm font-bold text-gray-900">
              <Link to="/" className="hover:text-white transition-colors">HOME</Link>
              <Link to="/products" className="hover:text-white transition-colors">SHOP</Link>
              <Link to="/sellers" className="hover:text-white transition-colors">SELLERS</Link>
              <Link to="/blogs" className="hover:text-white transition-colors">BLOGS</Link>
              <Link to="/about" className="hover:text-white transition-colors">ABOUT</Link>
              <Link to="/contact" className="hover:text-white transition-colors">CONTACT</Link>
            </nav>
          </div>

          <Link to="/seller-signup" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors">
            Become a Seller
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white pt-16">
          <div className="p-4 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 outline-none focus:ring-2 focus:ring-primary-600"
              />
            </form>
            <nav className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Home</Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Shop</Link>
              <Link to="/products?featured=true" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Featured</Link>
              <Link to="/products?isNewArrival=true" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">New Arrivals</Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-primary-600">Sign In</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
