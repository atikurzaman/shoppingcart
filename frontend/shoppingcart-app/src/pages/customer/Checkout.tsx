import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useStore'
import { fetchCart, clearCart } from '../../store/cartSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, CreditCard, Truck, CheckCircle, X, Plus } from 'lucide-react'

interface Address {
  id: number
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface AddressFormData {
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { cart } = useAppSelector((state) => state.cart)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Bangladesh',
    isDefault: false,
  })
  const [savingAddress, setSavingAddress] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in to checkout</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to complete your order.</p>
          <Link to="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to your cart first.</p>
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phoneNumber || !addressForm.addressLine1 || !addressForm.city || !addressForm.postalCode) {
      toast.error('Please fill in all required fields')
      return
    }

    setSavingAddress(true)
    try {
      const response = await api.post('/addresses', {
        fullName: addressForm.fullName,
        phoneNumber: addressForm.phoneNumber,
        addressLine1: addressForm.addressLine1,
        addressLine2: addressForm.addressLine2,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
        addressType: 'Both',
        isDefault: addressForm.isDefault,
      })
      
      const newAddress = {
        id: response.data.data.id,
        ...addressForm,
      }
      setAddresses([...addresses, newAddress])
      setSelectedAddress(newAddress.id)
      setShowAddressModal(false)
      setAddressForm({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
        isDefault: false,
      })
      toast.success('Address added successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setSavingAddress(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/orders', {
        shippingAddressId: selectedAddress,
        billingAddressId: selectedAddress,
        paymentMethod: paymentMethod,
        customerNote: customerNote
      })
      
      setOrderNumber(response.data.data.orderNumber)
      setOrderComplete(true)
      dispatch(clearCart())
      toast.success('Order placed successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order number is <strong>{orderNumber}</strong>.
            </p>
            <p className="text-gray-500 mb-8">
              You will receive an email confirmation shortly with your order details.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="btn-secondary">
                Back to Home
              </Link>
              <Link to="/products" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8">
          <ArrowLeft className="h-5 w-5" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-gray-500">No addresses found. Please add an address.</p>
                ) : (
                  addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === address.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={() => setSelectedAddress(address.id)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium">{address.fullName}</p>
                        <p className="text-sm text-gray-500">{address.phoneNumber}</p>
                        <p className="text-sm text-gray-500">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {address.city}{address.state && `, ${address.state}`} {address.postalCode}
                        </p>
                      </div>
                    </label>
                  ))
                )}
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add New Address
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>
                
                <label className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay with Visa, Mastercard, or other cards</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Notes (Optional)</h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Add any special instructions for your order..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                rows={3}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">Tk {item.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Tk {cart.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{cart.shippingAmount > 0 ? `Tk ${cart.shippingAmount.toLocaleString()}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (15%)</span>
                  <span>Tk {cart.taxAmount.toLocaleString()}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-Tk {cart.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>Tk {cart.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full btn-primary py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Address</h2>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="input w-full"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                  className="input w-full"
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  className="input w-full"
                  placeholder="House/Flat, Road, Area"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className="input w-full"
                  placeholder="Additional address info"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="input w-full"
                    placeholder="Dhaka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="input w-full"
                    placeholder="Dhaka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="input w-full"
                    placeholder="1200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="input w-full"
                    disabled
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isDefault" className="text-sm">Set as default address</label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-4">
              <button
                onClick={() => setShowAddressModal(false)}
                className="btn-secondary px-6 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="btn-primary px-6 py-2"
              >
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
