import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/customer/Home'
import ProductDetail from './pages/customer/ProductDetail'
import Products from './pages/customer/Products'
import Cart from './pages/customer/Cart'
import Login from './pages/customer/Login'
import Register from './pages/customer/Register'
import Account from './pages/customer/Account'
import Orders from './pages/customer/Orders'
import Wishlist from './pages/customer/Wishlist'
import Checkout from './pages/customer/Checkout'
import FlashDeal from './pages/customer/FlashDeal'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'
import AdminBrands from './pages/admin/Brands'
import AdminSuppliers from './pages/admin/Suppliers'
import AdminWarehouses from './pages/admin/Warehouses'
import AdminInventory from './pages/admin/Inventory'
import AdminReviews from './pages/admin/Reviews'
import AdminShipments from './pages/admin/Shipments'
import AdminPayments from './pages/admin/Payments'
import AdminCoupons from './pages/admin/Coupons'
import AdminReports from './pages/admin/Reports'
import AdminPurchaseOrders from './pages/admin/PurchaseOrders'
import AdminFlashDeals from './pages/admin/FlashDeals'
import AdminNewsletters from './pages/admin/Newsletters'
import AdminUnits from './pages/admin/Units'
import AdminShippingConfig from './pages/admin/ShippingConfig'
import AdminCollections from './pages/admin/Collections'
import AdminAttributes from './pages/admin/Attributes'
import AdminColors from './pages/admin/Colors'
import AdminTags from './pages/admin/Tags'
import AdminSupport from './pages/admin/Support'
import AdminMarketingBulk from './pages/admin/MarketingBulk'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import AdminPlaceholder from './pages/admin/Placeholder'
import AdminBlogs from './pages/admin/Blogs'
import AdminBlogWrite from './pages/admin/BlogWrite'
import AdminSellers from './pages/admin/Sellers'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAppSelector, useAppDispatch } from './hooks/useStore'
import { checkAuth } from './store/authSlice'

function App() {
  const dispatch = useAppDispatch()
  const { mode } = useAppSelector((state) => state.theme)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<Account />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/deals/flash-deal" element={<FlashDeal />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute roles={['Admin', 'Manager']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="shipments" element={<AdminShipments />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
        <Route path="flash-deals" element={<AdminFlashDeals />} />
        <Route path="newsletters" element={<AdminNewsletters />} />
        <Route path="units" element={<AdminUnits />} />
        <Route path="shipping-config" element={<AdminShippingConfig />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="attributes" element={<AdminAttributes />} />
        <Route path="colors" element={<AdminColors />} />
        <Route path="tags" element={<AdminTags />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="marketing-bulk" element={<AdminMarketingBulk />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="blogs/write" element={<AdminBlogWrite />} />
        <Route path="sellers" element={<AdminSellers />} />
        
        {/* Wildcard Fallback for all newly mapped Kartly menus (Blogs, Pages, Wallet, Sellers, Media, etc) */}
        <Route path="*" element={<AdminPlaceholder />} />
      </Route>
    </Routes>
  )
}

export default App
