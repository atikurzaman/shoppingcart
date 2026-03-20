export interface Review {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  customerId: number;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  adminResponse?: string;
  adminResponseDate?: string;
  helpfulCount: number;
  notHelpfulCount: number;
}

export interface ProductReviewSummary {
  productId: number;
  productName: string;
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  verifiedReviewsCount: number;
}

export interface CreateReviewRequest {
  productId: number;
  orderId: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewRequest {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewListItem {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  adminResponse?: string;
  adminResponseDate?: string;
}
