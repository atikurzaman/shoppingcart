import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Send, ShoppingCart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Newsletter Section */}
      <div className="bg-[#E3E8FF] py-12">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-primary-600 p-4 rounded-2xl shadow-xl shadow-primary-200">
              <Send className="h-8 w-8 text-white rotate-[-20deg]" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Sign Up for Newsletter</h3>
              <p className="text-gray-600 font-medium">Get the latest news, offers and coupons.</p>
            </div>
          </div>
          <div className="w-full lg:w-auto flex-1 max-w-xl">
            <form className="flex w-full items-center bg-white rounded-xl overflow-hidden shadow-sm p-1">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-6 py-3 outline-none text-gray-700 bg-transparent font-medium" 
              />
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-3 rounded-lg font-bold transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 font-black text-xl text-gray-900 tracking-tight">Shop<span className="text-primary-600">Cart</span></span>
            </Link>
            <p className="text-gray-500 leading-relaxed font-medium">
              We're the most professional e-commerce platform in Bangladesh. Providing the best quality products for our valuable customers since 2024.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-primary-600 hover:text-white rounded-lg transition-all border border-gray-100">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Feature Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-6">Feature</h4>
            <ul className="space-y-4 text-gray-500 font-medium tracking-wide">
              <li><Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600 transition-colors">Terms Conditions</Link></li>
              <li><Link to="/seller-signup" className="hover:text-primary-600 transition-colors">Become a Seller</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary-600 transition-colors">Support / FAQ</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-500 font-medium tracking-wide">
              <li><Link to="/products" className="hover:text-primary-600 transition-colors">Shop</Link></li>
              <li><Link to="/cart" className="hover:text-primary-600 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary-600 transition-colors">Wishlist</Link></li>
              <li><Link to="/compare" className="hover:text-primary-600 transition-colors">Compare</Link></li>
              <li><Link to="/track-order" className="hover:text-primary-600 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-5 text-gray-500 font-medium italic">
              <li className="flex items-start gap-4 not-italic">
                <div className="w-10 h-10 shrink-0 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary-600" />
                </div>
                <span>Gulshan-1, Dhaka-1212, <br />Bangladesh</span>
              </li>
              <li className="flex items-center gap-4 not-italic">
                <div className="w-10 h-10 shrink-0 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary-600" />
                </div>
                <span>support@shopcart.com</span>
              </li>
              <li className="flex items-center gap-4 not-italic">
                <div className="w-10 h-10 shrink-0 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary-600" />
                </div>
                <span>+880 1234 567 890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 font-medium text-sm tracking-wide">
            &copy; {new Date().getFullYear()} <span className="text-gray-900 font-bold">ShopCart</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
             <img src="https://shopo-ecom.vercel.app/assets/images/payment-getway.png" alt="Payment" className="h-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  )
}
