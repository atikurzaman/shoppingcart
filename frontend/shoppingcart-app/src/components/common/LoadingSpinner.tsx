import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-gray-500 text-sm font-medium">Loading data...</p>
    </div>
  )
}
