import api from './api'

export interface PurchaseOrder {
  id: number
  orderNumber: string
  supplierId: number
  supplierName: string
  orderDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  status: string
  totalAmount: number
  totalItems: number
  notes?: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: number
  productId: number
  productName: string
  variantId?: number
  variantName?: string
  quantity: number
  receivedQuantity: number
  unitPrice: number
  totalPrice: number
}

export interface CreatePurchaseOrderRequest {
  supplierId: number
  expectedDeliveryDate?: string
  notes?: string
  items: {
    productId: number
    variantId?: number
    quantity: number
    unitPrice: number
  }[]
}

export interface GoodsReceipt {
  id: number
  purchaseOrderId: number
  purchaseOrderNumber: string
  receiptNumber: string
  receiptDate: string
  warehouseId: number
  warehouseName: string
  notes?: string
  items: GoodsReceiptItem[]
}

export interface GoodsReceiptItem {
  id: number
  productId: number
  productName: string
  variantId?: number
  quantity: number
  batchNumber?: string
  expiryDate?: string
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: number
  warehouseId: number
  notes?: string
  items: {
    purchaseOrderItemId: number
    productId: number
    variantId?: number
    quantity: number
    batchNumber?: string
    expiryDate?: string
  }[]
}

export const procurementApi = {
  getPurchaseOrders: async (params?: {
    pageIndex?: number
    pageSize?: number
    search?: string
    supplierId?: number
    status?: string
  }) => {
    const { data } = await api.get('/procurement/purchase-orders', { params })
    return data.data
  },

  getPurchaseOrder: async (id: number) => {
    const { data } = await api.get(`/procurement/purchase-orders/${id}`)
    return data.data
  },

  createPurchaseOrder: async (request: CreatePurchaseOrderRequest) => {
    const { data } = await api.post('/procurement/purchase-orders', request)
    return data
  },

  updateStatus: async (id: number, status: string) => {
    const { data } = await api.put(`/procurement/purchase-orders/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    })
    return data
  },

  createGoodsReceipt: async (request: CreateGoodsReceiptRequest) => {
    const { data } = await api.post('/procurement/goods-receipts', request)
    return data
  },

  getGoodsReceipts: async (params?: {
    pageIndex?: number
    pageSize?: number
    search?: string
    warehouseId?: number
  }) => {
    const { data } = await api.get('/procurement/goods-receipts', { params })
    return data.data
  }
}
