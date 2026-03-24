import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Building, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react'
import { vendorApi, Seller } from '../../services/cmsApi'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const response = await vendorApi.getSellers()
      if (response && response.data) {
        setSellers(response.data)
      }
    } catch (error) {
      toast.error('Failed to load sellers')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multivendor Sellers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all registered third-party merchants and their balances.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Seller
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search store name or seller slug..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium text-lg">No Sellers Found</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Your marketplace hasn't onboarded any third-party merchants yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Store Profile</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4">Approval</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                          {seller.storeName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{seller.storeName}</div>
                          <div className="text-xs text-gray-500">/{seller.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {seller.commissionRate}% Base
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900 flex items-center justify-end font-mono">
                        <DollarSign className="w-3 h-3 text-gray-400 mr-0.5" />
                        {seller.balance.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {seller.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {seller.isActive ? (
                         <ToggleRight className="w-8 h-8 text-primary-600 cursor-pointer hover:text-primary-700 drop-shadow-sm" />
                       ) : (
                         <ToggleLeft className="w-8 h-8 text-gray-300 cursor-pointer hover:text-gray-400 drop-shadow-sm" />
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Manage Seller">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove Seller">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
