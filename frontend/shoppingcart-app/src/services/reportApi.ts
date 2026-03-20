import api from './api';
import { ApiResponse } from '../types/common';

export interface SalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
}

export interface ProductReport {
  productId: number;
  productName: string;
  sku: string;
  totalSold: number;
  totalRevenue: number;
  currentStock: number;
}

export interface CustomerReport {
  customerId: number;
  customerName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
}

export interface InventoryReport {
  productId: number;
  productName: string;
  sku: string;
  warehouseName: string;
  quantityOnHand: number;
  reservedQuantity: number;
  reorderLevel: number;
  status: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: {
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  salesData: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  warehouseId?: number;
}

export const reportApi = {
  getDashboardSummary: async () => {
    const response = await api.get<ApiResponse<DashboardSummary>>('/api/reports/dashboard');
    return response.data.data;
  },

  getSalesReport: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<SalesReport[]>>('/api/reports/sales', { params });
    return response.data.data || [];
  },

  getProductReport: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<ProductReport[]>>('/api/reports/products', { params });
    return response.data.data || [];
  },

  getCustomerReport: async (pageIndex = 0, pageSize = 20) => {
    const response = await api.get<ApiResponse<{
      items: CustomerReport[];
      pageIndex: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    }>>('/api/reports/customers', { params: { pageIndex, pageSize } });
    return response.data.data;
  },

  getInventoryReport: async (lowStockOnly = false) => {
    const response = await api.get<ApiResponse<InventoryReport[]>>('/api/reports/inventory', {
      params: { lowStockOnly }
    });
    return response.data.data || [];
  },

  getRevenueByCategory: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<{
      categoryName: string;
      totalRevenue: number;
      orderCount: number;
    }[]>>('/api/reports/revenue-by-category', { params });
    return response.data.data || [];
  },

  exportReport: async (reportType: string, format: 'csv' | 'excel', filters?: ReportFilter) => {
    const response = await api.get(`/api/reports/export/${reportType}`, {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  },
};
