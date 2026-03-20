import api from './api';
import { Review, ProductReviewSummary, CreateReviewRequest, UpdateReviewRequest, ReviewListItem } from '../types/review';
import { PaginatedResponse, ApiResponse } from '../types/common';

export const reviewApi = {
  getProductReviews: async (productId: number, pageIndex = 0, pageSize = 10) => {
    const response = await api.get<PaginatedResponse<Review>>(`/api/reviews/product/${productId}`, {
      params: { pageIndex, pageSize }
    });
    return response.data;
  },

  getProductReviewSummary: async (productId: number) => {
    const response = await api.get<ApiResponse<ProductReviewSummary>>(`/api/reviews/product/${productId}/summary`);
    return response.data.data;
  },

  getReview: async (id: number) => {
    const response = await api.get<ApiResponse<Review>>(`/api/reviews/${id}`);
    return response.data.data;
  },

  getMyReviews: async () => {
    const response = await api.get<ApiResponse<Review[]>>('/api/reviews/my-reviews');
    return response.data.data || [];
  },

  createReview: async (data: CreateReviewRequest) => {
    const response = await api.post<ApiResponse<Review>>('/api/reviews', data);
    return response.data.data;
  },

  updateReview: async (data: UpdateReviewRequest) => {
    const response = await api.put<ApiResponse<Review>>('/api/reviews', data);
    return response.data.data;
  },

  deleteReview: async (id: number) => {
    await api.delete(`/api/reviews/${id}`);
  },

  markHelpful: async (reviewId: number, isHelpful: boolean) => {
    await api.post('/api/reviews/helpful', { reviewId, isHelpful });
  },

  // Admin
  getAllReviews: async (pageIndex = 0, pageSize = 20, approved?: boolean) => {
    const params: Record<string, number | boolean> = { pageIndex, pageSize };
    if (approved !== undefined) params.approved = approved;
    const response = await api.get<PaginatedResponse<ReviewListItem>>('/api/reviews/admin/all', { params });
    return response.data;
  },

  approveReview: async (id: number) => {
    await api.put(`/api/reviews/admin/${id}/approve`);
  },

  rejectReview: async (id: number) => {
    await api.put(`/api/reviews/admin/${id}/reject`);
  },

  toggleFeatured: async (id: number) => {
    await api.put(`/api/reviews/admin/${id}/featured`);
  },

  respondToReview: async (reviewId: number, response: string) => {
    await api.put('/api/reviews/admin/respond', { reviewId, response });
  },
};
