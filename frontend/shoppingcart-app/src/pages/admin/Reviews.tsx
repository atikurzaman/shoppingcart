import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';
import { ReviewListItem } from '../../types/review';
import { formatDate } from '../../utils/formatDate';

export default function Reviews() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');

  const approved = filter === 'all' ? undefined : filter === 'pending' ? false : true;

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews', approved],
    queryFn: () => reviewApi.getAllReviews(0, 50, approved),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => reviewApi.approveReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => reviewApi.rejectReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const featuredMutation = useMutation({
    mutationFn: (id: number) => reviewApi.toggleFeatured(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: number; response: string }) =>
      reviewApi.respondToReview(reviewId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setRespondingTo(null);
      setResponseText('');
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const reviews = reviewsData?.data?.items || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reviews found</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: ReviewListItem) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{review.customerName}</span>
                    <div className="flex">{renderStars(review.rating)}</div>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>

              {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
              )}

              {review.comment && (
                <p className="text-gray-600 mb-4">{review.comment}</p>
              )}

              {review.adminResponse && (
                <div className="bg-gray-50 border-l-4 border-primary-500 p-3 rounded-r mb-4">
                  <p className="text-sm text-gray-600">{review.adminResponse}</p>
                </div>
              )}

              {respondingTo === review.id && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full p-3 border rounded-lg mb-3"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondMutation.mutate({ reviewId: review.id, response: responseText })}
                      disabled={!responseText.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      Submit Response
                    </button>
                    <button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText('');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                {!review.isApproved && (
                  <>
                    <button
                      onClick={() => approveMutation.mutate(review.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(review.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setRespondingTo(review.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  Respond
                </button>
                <button
                  onClick={() => featuredMutation.mutate(review.id)}
                  className={`px-3 py-1.5 rounded-lg ${
                    review.isFeatured
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {review.isFeatured ? 'Featured' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
