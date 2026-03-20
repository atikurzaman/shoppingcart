import api from './api';
import { PaginatedResponse, ApiResponse } from '../types/common';

export interface PaymentDto {
  id: number;
  orderId: number;
  orderNumber: string;
  amount: number;
  transactionAmount: number;
  refundedAmount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  gatewayResponse?: string;
  failureReason?: string;
  processedAt?: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface CreatePaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: string;
}

export interface UpdatePaymentStatusRequest {
  id: number;
  status: string;
  transactionId?: string;
  gatewayResponse?: string;
}

export interface RefundRequest {
  id: number;
  amount: number;
  reason?: string;
}

export const paymentApi = {
  getPayment: async (id: number) => {
    const response = await api.get<ApiResponse<PaymentDto>>(`/api/payments/${id}`);
    return response.data.data;
  },

  getPayments: async (pageIndex = 0, pageSize = 20, status?: string) => {
    const params: Record<string, number | string> = { pageIndex, pageSize };
    if (status) params.status = status;
    const response = await api.get<PaginatedResponse<PaymentDto>>('/api/payments', { params });
    return response.data;
  },

  getPaymentsByOrder: async (orderId: number) => {
    const response = await api.get<ApiResponse<PaymentDto[]>>(`/api/payments/order/${orderId}`);
    return response.data.data || [];
  },

  createPayment: async (data: CreatePaymentRequest) => {
    const response = await api.post<ApiResponse<PaymentDto>>('/api/payments', data);
    return response.data.data;
  },

  updatePaymentStatus: async (data: UpdatePaymentStatusRequest) => {
    const response = await api.put<ApiResponse<PaymentDto>>(`/api/payments/${data.id}/status`, data);
    return response.data.data;
  },

  processRefund: async (data: RefundRequest) => {
    const response = await api.post<ApiResponse<PaymentDto>>(`/api/payments/${data.id}/refund`, data);
    return response.data.data;
  },

  getPaymentStats: async () => {
    const response = await api.get<ApiResponse<{
      totalRevenue: number;
      pendingPayments: number;
      completedPayments: number;
      refundedAmount: number;
    }>>('/api/payments/stats');
    return response.data.data;
  },
};
