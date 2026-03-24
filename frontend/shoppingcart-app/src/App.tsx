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
      </Route>
    </Routes>
  )
}

export default App
