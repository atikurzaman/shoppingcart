import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer, { logout, clearError } from '../../store/authSlice'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  })
}

describe('Auth Slice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should clear user on logout', () => {
    const store = createTestStore({
      auth: {
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          roles: ['Customer'],
        },
        accessToken: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    })

    store.dispatch(logout())

    const state = store.getState().auth
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
  })

  it('should clear error on clearError', () => {
    const store = createTestStore({
      auth: {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Some error',
      },
    })

    store.dispatch(clearError())

    const state = store.getState().auth
    expect(state.error).toBeNull()
  })

  it('should handle initial state', () => {
    const store = createTestStore()
    const state = store.getState().auth

    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
  })
})
