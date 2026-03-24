import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useStore'
import { login } from '../../store/authSlice'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ShoppingCart, ArrowRight, Star } from 'lucide-react'
import { useState } from 'react'

interface LoginForm {
  email: string
  password: string
}

const TESTIMONIALS = [
  { name: 'Sarah K.', text: 'Best shopping experience ever! Fast delivery and great products.', rating: 5 },
  { name: 'James M.', text: 'Amazing deals and top-notch customer support. Highly recommend!', rating: 5 },
]

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await dispatch(login(data)).unwrap()
      toast.success('Welcome back! 👋')
      if (result.user.roles.includes('Admin') || result.user.roles.includes('Manager')) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      toast.error(err || 'Invalid email or password')
    }
  }

  if (isAuthenticated) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">ShopCart</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-white">
          <div className="mb-4">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Welcome Back
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            Your favourite<br />
            products are<br />
            <span className="text-yellow-300">waiting for you.</span>
          </h2>
          <p className="text-primary-200 text-base leading-relaxed max-w-xs">
            Sign in to access your cart, track orders, and discover exclusive deals tailored just for you.
          </p>

          {/* Testimonials */}
          <div className="mt-10 space-y-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="flex gap-1 mb-2">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed">"{t.text}"</p>
                <p className="text-primary-200 text-xs font-bold mt-2">{t.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { val: '50K+', label: 'Happy Customers' },
            { val: '10K+', label: 'Products' },
            { val: '4.9★', label: 'Average Rating' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-primary-200 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-[#F8F8F8] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="bg-primary-600 p-2 rounded-xl">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">ShopCart</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">Sign In</h1>
            <p className="text-gray-500 mt-1">Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline">Create one</Link></p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">⚠</span> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-600 font-medium">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary-600 font-bold hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 font-bold hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
