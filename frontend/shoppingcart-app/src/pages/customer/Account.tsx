import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useStore'
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react'

export default function Account() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your account</h2>
          <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
              <span className="inline-block mt-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.address && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{user.address}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Link 
              to="/logout"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
