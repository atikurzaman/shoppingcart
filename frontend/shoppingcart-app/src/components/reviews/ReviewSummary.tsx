import { Star } from 'lucide-react';
import { ProductReviewSummary } from '../../types/review';

interface ReviewSummaryProps {
  summary: ProductReviewSummary;
  onWriteReview?: () => void;
}

export default function ReviewSummary({ summary, onWriteReview }: ReviewSummaryProps) {
  const getPercentage = (count: number) => {
    if (summary.totalReviews === 0) return 0;
    return Math.round((count / summary.totalReviews) * 100);
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Rating Overview */}
        <div className="flex-shrink-0 text-center md:border-r md:pr-8">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {summary.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">{renderStars(Math.round(summary.averageRating), 'lg')}</div>
          <p className="text-gray-500">{summary.totalReviews} reviews</p>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = star === 5 ? summary.fiveStarCount :
                           star === 4 ? summary.fourStarCount :
                           star === 3 ? summary.threeStarCount :
                           star === 2 ? summary.twoStarCount :
                           summary.oneStarCount;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{star} Star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${getPercentage(count)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">{getPercentage(count)}%</span>
                </div>
              );
            })}
          </div>

          {summary.verifiedReviewsCount > 0 && (
            <p className="text-sm text-green-600 mt-4">
              {summary.verifiedReviewsCount} verified purchase reviews
            </p>
          )}
        </div>

        {/* Write Review Button */}
        {onWriteReview && (
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={onWriteReview}
              className="btn btn-primary"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
