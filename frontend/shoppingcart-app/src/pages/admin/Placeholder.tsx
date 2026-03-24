import { MessageSquarePlus } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function AdminPlaceholder() {
  const location = useLocation()
  
  // Create a human readable title from the route path (e.g. /admin/blogs/write -> Blogs Write)
  const pathParts = location.pathname.split('/').filter(p => p !== '' && p !== 'admin')
  const title = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')).join(' / ')

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 h-[calc(100vh-80px)]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquarePlus className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {title || "Module"}
        </h2>
        <p className="text-gray-500 text-lg">
          This administrative module is currently being provisioned. Features will be available shortly.
        </p>
      </div>
    </div>
  )
}
