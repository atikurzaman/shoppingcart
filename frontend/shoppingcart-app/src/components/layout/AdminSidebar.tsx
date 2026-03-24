import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Package, ShoppingCart, Tags, Building2, 
  Warehouse, Users, BarChart3, Settings, LogOut, Boxes, Star, 
  Truck, CreditCard, Ticket, ChevronDown, ChevronRight,
  Image, PenTool, FileText, Mail, Megaphone, ShieldCheck, Wallet, RefreshCw, Briefcase, PlusCircle
} from 'lucide-react'
import { useAppDispatch } from '../../hooks/useStore'
import { logout } from '../../store/authSlice'

interface NavSubItem {
  to: string
  label: string
}

interface NavItem {
  label: string
  icon: any
  to?: string
  subItems?: NavSubItem[]
}

// ... existing code down to navSections

const navSections: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Media', icon: Image, to: '/admin/media' },
  {
    label: 'Blogs',
    icon: PenTool,
    subItems: [
      { to: '/admin/blogs/write', label: 'Write New Blog' },
      { to: '/admin/blogs', label: 'All Blogs' },
      { to: '/admin/blogs/categories', label: 'Categories' },
      { to: '/admin/blogs/tags', label: 'Tags' },
      { to: '/admin/blogs/comments', label: 'Comments' },
    ]
  },
  {
    label: 'Pages',
    icon: FileText,
    subItems: [
      { to: '/admin/pages', label: 'All Pages' },
      { to: '/admin/pages/add', label: 'Add New' },
    ]
  },
  { label: 'Messages', icon: Mail, to: '/admin/messages' },
  {
    label: 'Products',
    icon: Package,
    subItems: [
      { to: '/admin/products/add', label: 'Add New' },
      { to: '/admin/products', label: 'Inhouse Products' },
      { to: '/admin/products/seller', label: 'Seller Products' },
      { to: '/admin/colors', label: 'Colors' },
      { to: '/admin/brands', label: 'Brands' },
      { to: '/admin/categories', label: 'Categories' },
      { to: '/admin/attributes', label: 'Attributes' },
      { to: '/admin/units', label: 'Measurement Units' },
      { to: '/admin/reviews', label: 'Product Reviews' },
      { to: '/admin/tags', label: 'Product Tags' },
      { to: '/admin/collections', label: 'Collections' },
    ]
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    subItems: [
      { to: '/admin/orders', label: 'Inhouse Orders' },
      { to: '/admin/orders/seller', label: 'Seller Orders' },
      { to: '/admin/orders/pickup', label: 'Pickup Point Orders' },
    ]
  },
  {
    label: 'Customers',
    icon: Users,
    subItems: [
      { to: '/admin/customers', label: 'Customer List' },
    ]
  },
  {
    label: 'Shippings',
    icon: Truck,
    subItems: [
      { to: '/admin/shipping-config', label: 'Shipping Configuration' },
      { to: '/admin/shipping-methods', label: 'Shipping Methods' },
      { to: '/admin/pickup-points', label: 'Pickup Points' },
    ]
  },
  {
    label: 'Payments',
    icon: CreditCard,
    subItems: [
      { to: '/admin/payments', label: 'Payment Methods' },
      { to: '/admin/transactions', label: 'Transaction History' },
    ]
  },
  {
    label: 'Marketing',
    icon: Megaphone,
    subItems: [
      { to: '/admin/coupons', label: 'Coupons' },
      { to: '/admin/newsletters', label: 'Newsletters' },
      { to: '/admin/notifications', label: 'Push Notifications' },
      { to: '/admin/flash-deals', label: 'Flash Deals' },
    ]
  },
  {
    label: 'Reports',
    icon: BarChart3,
    subItems: [
      { to: '/admin/reports/products', label: 'Product Reports' },
      { to: '/admin/reports/keywords', label: 'Keyword Search' },
    ]
  },
  {
    label: 'Settings',
    icon: Settings,
    subItems: [
      { to: '/admin/settings/products', label: 'Product Settings' },
      { to: '/admin/settings/checkout', label: 'Checkout Features' },
      { to: '/admin/settings/taxes', label: 'Taxes' },
      { to: '/admin/settings/shop', label: 'Shop Settings' },
      { to: '/admin/settings/currencies', label: 'Currencies' },
      { to: '/admin/settings/general', label: 'General Settings' },
      { to: '/admin/settings/smtp', label: 'SMTP Settings' },
      { to: '/admin/settings/email-templates', label: 'Email Templates' },
      { to: '/admin/settings/seo', label: 'SEO Config' },
    ]
  },
  {
    label: 'Users',
    icon: ShieldCheck,
    subItems: [
      { to: '/admin/users', label: 'User List' },
    ]
  },
  {
    label: 'Addons',
    icon: PlusCircle,
    subItems: [
      { to: '/admin/wallet', label: 'Wallet' },
      { to: '/admin/refunds', label: 'Refunds' },
      { to: '/admin/sellers', label: 'Sellers' },
    ]
  }
]

export default function AdminSidebar() {
  const dispatch = useAppDispatch()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Product Management': true,
    'Order Management': true
  })

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#111827] text-gray-300 flex flex-col z-50">
      <div className="p-6 border-b border-gray-800/50">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          Shopping Admin
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            {section.subItems ? (
              <>
                <button
                  onClick={() => toggleSection(section.label)}
                  className={`w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors group ${
                    openSections[section.label] ? 'text-white' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <section.icon className={`h-5 w-5 mr-3 transition-colors ${
                      openSections[section.label] ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-300'
                    }`} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  {openSections[section.label] ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {openSections[section.label] && (
                  <div className="bg-black/20 py-1">
                    {section.subItems.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center pl-14 pr-6 py-2 text-sm transition-colors hover:text-white ${
                            isActive ? 'text-primary-500 font-medium' : 'text-gray-400'
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={section.to!}
                end={section.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 transition-colors hover:bg-white/5 group ${
                    isActive ? 'bg-primary-600/10 text-white' : ''
                  }`
                }
              >
                <section.icon className={`h-5 w-5 mr-3 transition-colors ${
                  section.to === '/admin' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-300'
                }`} />
                <span className="text-sm font-medium">{section.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut className="h-5 w-5 mr-3 group-hover:text-red-500" />
          <span className="text-sm font-medium">Logout System</span>
        </button>
      </div>
    </aside>
  )
}
