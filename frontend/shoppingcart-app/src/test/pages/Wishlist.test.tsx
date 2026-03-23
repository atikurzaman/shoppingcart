import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer from '../../store/authSlice'
import Wishlist from '../../pages/customer/Wishlist'
import api from '../../services/api'

vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(() => Promise.resolve({ data: { data: [] } })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} })),
    },
  }
})

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  })
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('Wishlist Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  const renderWishlist = (store = createTestStore()) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Wishlist />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )
  }

  describe('Authentication', () => {
    it('should show login prompt when not authenticated', () => {
      const store = createTestStore({
        auth: { user: null, isAuthenticated: false, isLoading: false },
      })

      renderWishlist(store)

      expect(screen.getByText(/please login/i)).toBeInTheDocument()
      expect(screen.getByText(/go to login/i)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty wishlist message when authenticated but no items', async () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Customer',
          },
          isAuthenticated: true,
          isLoading: false,
        },
      })

      renderWishlist(store)

      await waitFor(() => {
        expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument()
      })
    })
  })

  describe('Wishlist Items', () => {
    it('should display wishlist items when present', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          data: {
            items: [
              {
                id: 1,
                productId: 1,
                productName: 'Test Product',
                productImage: null,
                price: 99.99,
                addedAt: new Date().toISOString(),
              },
            ],
          }
        },
      })

      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Customer',
          },
          isAuthenticated: true,
          isLoading: false,
        },
      })

      renderWishlist(store)

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument()
      })
    })
  })
})
