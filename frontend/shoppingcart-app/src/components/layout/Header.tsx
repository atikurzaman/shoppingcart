import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon } from 'lucide-react'
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
    <header className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="Shopping Cart" 
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="ml-2 text-white font-bold text-xl hidden sm:block">ShoppingCart</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/wishlist"
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart?.itemCount ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.itemCount}
                </span>
              ) : null}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{user?.firstName}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Account</Link>
                  <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Wishlist</Link>
                  <hr className="my-2" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-white border border-white rounded-full hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500"
              />
            </form>
            <nav className="space-y-2">
              <Link to="/products" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg">All Products</Link>
              <Link to="/products?featured=true" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg">Featured</Link>
              <Link to="/products?isNewArrival=true" className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg">New Arrivals</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
