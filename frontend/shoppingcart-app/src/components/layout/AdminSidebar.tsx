import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Tags, Building2, Warehouse, Users, BarChart3, Settings, LogOut, Boxes, Star, Truck, CreditCard, Ticket, MessageSquare } from 'lucide-react'
import { useAppDispatch } from '../../hooks/useStore'
import { logout } from '../../store/authSlice'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/brands', icon: Building2, label: 'Brands' },
  { to: '/admin/suppliers', icon: Building2, label: 'Suppliers' },
  { to: '/admin/warehouses', icon: Warehouse, label: 'Warehouses' },
  { to: '/admin/inventory', icon: Boxes, label: 'Inventory' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/shipments', icon: Truck, label: 'Shipments' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar() {
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-300'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  )
}
