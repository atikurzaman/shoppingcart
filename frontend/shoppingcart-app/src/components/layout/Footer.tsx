import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, ShoppingCart, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white">
      {/* Main footer */}
      <div className="bg-[#1C2434] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-5">
                <div className="bg-primary-600 p-1.5 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">ShopCart</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                We're the most professional e-commerce platform in Bangladesh. Providing the best quality products for our valuable customers since 2024.
              </p>
              <div className="flex gap-2">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-white/10 hover:bg-primary-600 flex items-center justify-center transition-colors">
                    <Icon className="h-4 w-4 text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold text-base mb-5">Support</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Contact Us', to: '/contact' },
                  { label: 'Blogs', to: '/blogs' },
                  { label: 'Order Tracking', to: '/orders' },
                  { label: 'About Us', to: '/about' },
                  { label: 'FAQ', to: '/faq' },
                ].map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="text-white font-bold text-base mb-5">Policies</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Return Policy', to: '/return-policy' },
                  { label: 'Privacy Policy', to: '/privacy-policy' },
                  { label: 'Terms & Conditions', to: '/terms' },
                  { label: 'Become a Seller', to: '/seller-signup' },
                  { label: 'Refund Policy', to: '/refund-policy' },
                ].map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-white font-bold text-base mb-5">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-gray-400 text-sm">Gulshan-1, Dhaka-1212, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary-400 shrink-0" />
                  <span className="text-gray-400 text-sm">+880 1234 567 890</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary-400 shrink-0" />
                  <span className="text-gray-400 text-sm">support@shopcart.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} <span className="text-white font-bold">ShopCart</span>. All rights reserved.
            </p>
            <img
              src="https://shopo-ecom.vercel.app/assets/images/payment-getway.png"
              alt="Payment Methods"
              className="h-6 opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
