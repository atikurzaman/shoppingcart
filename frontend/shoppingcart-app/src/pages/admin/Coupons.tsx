import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Percent, Calendar, Gift, ToggleLeft, ToggleRight, Trash2, Edit2, Plus, X } from 'lucide-react';
import { couponApi, CreateCouponRequest } from '../../services/couponApi';
import { formatDate } from '../../utils/formatDate';

const couponTypeLabels: Record<string, string> = {
  Percentage: 'Percentage',
  FixedAmount: 'Fixed Amount',
  FreeShipping: 'Free Shipping',
};

export default function Coupons() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const { data: couponsData, isLoading } = useQuery({
    queryKey: ['admin-coupons', pageIndex],
    queryFn: () => couponApi.getCoupons(pageIndex, 20),
  });

  const coupons = couponsData?.data?.items || [];
  const totalPages = couponsData?.data?.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponApi.deleteCoupon(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => couponApi.toggleCouponStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const formatDiscount = (type: string, value: number) => {
    if (type === 'Percentage') return `${value}%`;
    if (type === 'FreeShipping') return 'Free Shipping';
    return `৳${value}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No coupons found</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium text-sm">
                        <Tag className="h-3 w-3" />
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {coupon.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDiscount(coupon.couponType, coupon.discountValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {coupon.currentUsageCount}
                      {coupon.maximumUsageCount && ` / ${coupon.maximumUsageCount}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(coupon.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {coupon.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMutation.mutate(coupon.id)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                        >
                          {coupon.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(coupon.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pageIndex + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPageIndex(p => p + 1)}
                disabled={pageIndex >= totalPages - 1}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
