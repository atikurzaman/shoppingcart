import api from './api';
import { PaginatedResponse, ApiResponse } from '../types/common';

export interface ShippingMethodDto {
  id: number;
  name: string;
  description?: string;
  carrierName?: string;
  baseCost: number;
  costPerKg: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  isFreeShipping: boolean;
  freeShippingThreshold?: number;
  displayOrder: number;
}

export interface ShipmentDto {
  id: number;
  orderId: number;
  orderNumber: string;
  shippingMethodId?: number;
  shippingMethodName?: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: string;
  warehouseId?: number;
  warehouseName?: string;
  shippedDate?: string;
  deliveredDate?: string;
  carrierName?: string;
  deliveryNotes?: string;
  shippingCost: number;
  weight: number;
  createdAt: string;
}

export interface CreateShipmentRequest {
  orderId: number;
  shippingMethodId?: number;
  trackingNumber?: string;
  warehouseId?: number;
  weight?: number;
}

export interface UpdateShipmentRequest {
  id: number;
  shippingMethodId?: number;
  trackingNumber?: string;
  carrierName?: string;
  warehouseId?: number;
  weight?: number;
  status?: string;
  deliveryNotes?: string;
}

export const shippingApi = {
  getShippingMethods: async () => {
    const response = await api.get<ApiResponse<ShippingMethodDto[]>>('/api/shipping/methods');
    return response.data.data || [];
  },

  getShipment: async (id: number) => {
    const response = await api.get<ApiResponse<ShipmentDto>>(`/api/shipping/shipments/${id}`);
    return response.data.data;
  },

  getShipments: async (pageIndex = 0, pageSize = 20, status?: string) => {
    const params: Record<string, number | string> = { pageIndex, pageSize };
    if (status) params.status = status;
    const response = await api.get<PaginatedResponse<ShipmentDto>>('/api/shipping/shipments', { params });
    return response.data;
  },

  createShipment: async (data: CreateShipmentRequest) => {
    const response = await api.post<ApiResponse<ShipmentDto>>('/api/shipping/shipments', data);
    return response.data.data;
  },

  updateShipment: async (data: UpdateShipmentRequest) => {
    const response = await api.put<ApiResponse<ShipmentDto>>(`/api/shipping/shipments/${data.id}`, data);
    return response.data.data;
  },

  updateShipmentStatus: async (id: number, status: string, trackingNumber?: string) => {
    const response = await api.put<ApiResponse<ShipmentDto>>(`/api/shipping/shipments/${id}/status`, { status, trackingNumber });
    return response.data.data;
  },

  deleteShipment: async (id: number) => {
    await api.delete(`/api/shipping/shipments/${id}`);
  },

  createShippingMethod: async (data: Partial<ShippingMethodDto>) => {
    const response = await api.post<ApiResponse<ShippingMethodDto>>('/api/shipping/methods', data);
    return response.data.data;
  },

  updateShippingMethod: async (id: number, data: Partial<ShippingMethodDto>) => {
    const response = await api.put<ApiResponse<ShippingMethodDto>>(`/api/shipping/methods/${id}`, data);
    return response.data.data;
  },

  deleteShippingMethod: async (id: number) => {
    await api.delete(`/api/shipping/methods/${id}`);
  },
};
