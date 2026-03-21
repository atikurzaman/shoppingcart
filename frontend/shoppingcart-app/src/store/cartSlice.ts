import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface CartItem {
  id: number
  productId: number
  productName: string
  slug: string
  variantId?: number
  variantName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imageUrl?: string
  stockQuantity: number
  isInStock: boolean
}

export interface Cart {
  id: number
  customerId?: number
  sessionId?: string
  subTotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  couponCode?: string
  appliedCoupon?: any
  items: CartItem[]
  itemCount: number
}

export interface CartState {
  cart: Cart | null
  isLoading: boolean
  error: string | null
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
}

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/carts', { headers: getAuthHeader() })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: { productId: number; variantId?: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/carts/items', data, { headers: getAuthHeader() })
      return response.data.data
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data || 'Failed to add to cart'
      return rejectWithValue(typeof message === 'string' ? message : 'Failed to add to cart')
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: { cartItemId: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/carts/items', data, { headers: getAuthHeader() })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart')
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId: number, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/carts/items/${cartItemId}`, { headers: getAuthHeader() })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart')
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload
        state.error = null
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload
      })
  },
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer
