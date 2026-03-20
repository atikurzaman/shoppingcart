import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { shippingApi } from '../../services/shippingApi';
import { formatDate } from '../../utils/formatDate';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  NotShipped: { label: 'Not Shipped', color: 'bg-gray-100 text-gray-700', icon: Package },
  Shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck },
  Delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  Returned: { label: 'Returned', color: 'bg-orange-100 text-orange-700', icon: Clock },
};

export default function Shipments() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [pageIndex, setPageIndex] = useState(0);

  const status = filter === 'all' ? undefined : filter;

  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['admin-shipments', pageIndex, status],
    queryFn: () => shippingApi.getShipments(pageIndex, 20, status),
  });

  const shipments = shipmentsData?.data?.items || [];
  const totalPages = shipmentsData?.data?.totalPages || 0;

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.NotShipped;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipments Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading shipments...</div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No shipments found</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipped</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map((shipment) => {
                  const config = getStatusConfig(shipment.status);
                  const StatusIcon = config.icon;
                  return (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {shipment.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {shipment.shippingMethodName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {shipment.trackingNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {shipment.carrierName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {shipment.shippedDate ? formatDate(shipment.shippedDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {shipment.deliveredDate ? formatDate(shipment.deliveredDate) : '-'}
                      </td>
                    </tr>
                  );
                })}
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
