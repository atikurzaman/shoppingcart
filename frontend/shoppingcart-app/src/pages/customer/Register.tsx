import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useStore'
import { register as registerUser } from '../../store/authSlice'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, Eye, EyeOff, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

const PERKS = [
  'Exclusive member-only discounts',
  'Track your orders in real-time',
  'Wishlist & comparison tools',
  'Priority customer support',
]

export default function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()

  const onSubmit = async (data: RegisterForm) => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions')
      return
    }
    try {
      await dispatch(registerUser(data)).unwrap()
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/')
    } catch (err: any) {
      toast.error(err || 'Registration failed')
    }
  }

  if (isAuthenticated) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Benefits */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-900 to-gray-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-40 left-0 w-64 h-64 bg-primary-600/10 rounded-full -translate-x-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary-600 p-3 rounded-xl">
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">ShopCart</span>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="mb-4">
            <span className="bg-primary-600/20 text-primary-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-primary-600/30">
              Join Our Community
            </span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Start your<br />
            shopping<br />
            <span className="text-primary-400">journey today.</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs mb-10">
            Create a free account and unlock a world of incredible products and exclusive deals.
          </p>

          {/* Perks */}
          <div className="space-y-4">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-600/20 border border-primary-600/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary-400" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo card */}
        <div className="relative z-10 bg-primary-600/20 border border-primary-600/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-black text-white">20% Off</span>
            <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">NEW USER</span>
          </div>
          <p className="text-primary-200 text-sm">Your first order discount is waiting. Register now and start saving!</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-[#F8F8F8] px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="bg-primary-600 p-2 rounded-xl">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">ShopCart</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link></p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      {...register('firstName', { required: 'Required' })}
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Required' })}
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                    })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phoneNumber')}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === watch('password') || 'Passwords do not match'
                    })}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 font-bold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 font-bold hover:underline">Privacy Policy</a>
                </span>
              </label>

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
                    Creating Account...
                  </>
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
