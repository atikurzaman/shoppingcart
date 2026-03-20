import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Review } from '../../types/review';
import { formatDate } from '../../utils/formatDate';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: number, isHelpful: boolean) => void;
}

export default function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {review.customerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.customerName}</p>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(review.rating)}</div>
              {review.isVerifiedPurchase && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
      </div>

      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-gray-600 mb-4">{review.comment}</p>
      )}

      {review.adminResponse && (
        <div className="bg-gray-50 border-l-4 border-primary-500 p-3 rounded-r mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Response from Seller:</p>
          <p className="text-sm text-gray-600">{review.adminResponse}</p>
          {review.adminResponseDate && (
            <p className="text-xs text-gray-400 mt-1">{formatDate(review.adminResponseDate)}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Was this review helpful?</span>
        <button
          onClick={() => onHelpful?.(review.id, true)}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{review.helpfulCount}</span>
        </button>
        <button
          onClick={() => onHelpful?.(review.id, false)}
          className="flex items-center gap-1 hover:text-red-600 transition-colors"
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{review.notHelpfulCount}</span>
        </button>
      </div>
    </div>
  );
}
