import api from './api';
import { PaginatedResponse, ApiResponse } from '../types/common';

export interface CouponDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  couponType: string;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  maximumUsageCount?: number;
  maximumUsagePerUser?: number;
  currentUsageCount: number;
  applicableProductId?: number;
  applicableCategoryId?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFirstOrderOnly: boolean;
  requiresShipping: boolean;
  createdAt: string;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  couponType: string;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  maximumUsageCount?: number;
  maximumUsagePerUser?: number;
  applicableProductId?: number;
  applicableCategoryId?: number;
  startDate: string;
  endDate: string;
  isFirstOrderOnly?: boolean;
  requiresShipping?: boolean;
}

export interface UpdateCouponRequest extends CreateCouponRequest {
  id: number;
}

export interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
}

export const couponApi = {
  getCoupon: async (id: number) => {
    const response = await api.get<ApiResponse<CouponDto>>(`/api/coupons/${id}`);
    return response.data.data;
  },

  getCoupons: async (pageIndex = 0, pageSize = 20, isActive?: boolean) => {
    const params: Record<string, number | boolean> = { pageIndex, pageSize };
    if (isActive !== undefined) params.isActive = isActive;
    const response = await api.get<PaginatedResponse<CouponDto>>('/api/coupons', { params });
    return response.data;
  },

  getActiveCoupons: async () => {
    const response = await api.get<ApiResponse<CouponDto[]>>('/api/coupons/active');
    return response.data.data || [];
  },

  createCoupon: async (data: CreateCouponRequest) => {
    const response = await api.post<ApiResponse<CouponDto>>('/api/coupons', data);
    return response.data.data;
  },

  updateCoupon: async (data: UpdateCouponRequest) => {
    const response = await api.put<ApiResponse<CouponDto>>(`/api/coupons/${data.id}`, data);
    return response.data.data;
  },

  deleteCoupon: async (id: number) => {
    await api.delete(`/api/coupons/${id}`);
  },

  toggleCouponStatus: async (id: number) => {
    const response = await api.put<ApiResponse<CouponDto>>(`/api/coupons/${id}/toggle`);
    return response.data.data;
  },

  validateCoupon: async (data: ValidateCouponRequest) => {
    const response = await api.post<ApiResponse<{
      isValid: boolean;
      discountAmount: number;
      message?: string;
      coupon?: CouponDto;
    }>>('/api/coupons/validate', data);
    return response.data.data;
  },

  getCouponUsage: async (couponId: number, pageIndex = 0, pageSize = 20) => {
    const response = await api.get<PaginatedResponse<{
      userName: string;
      orderNumber: string;
      discountAmount: number;
      usedAt: string;
    }>>(`/api/coupons/${couponId}/usage`, { params: { pageIndex, pageSize } });
    return response.data;
  },
};
