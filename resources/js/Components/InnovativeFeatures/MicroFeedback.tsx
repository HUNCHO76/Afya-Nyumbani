/**
 * Micro Feedback - Quick post-visit 5-star rating system
 * Fast feedback capture after each visit
 */

import React, { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { CreateMicroFeedbackPayload } from '@/types/InnovativeFeatures';
import microFeedbackApi from '@/services/innovativeFeatureApi';

interface MicroFeedbackProps {
  visitId: number;
  practitionerName?: string;
  onSuccess?: () => void;
}

export default function MicroFeedback({ visitId, practitionerName, onSuccess }: MicroFeedbackProps) {
  const [ratings, setRatings] = useState({
    overall: 0,
    response_time: 0,
    professionalism: 0,
    care_quality: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [willRecommend, setWillRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (ratings.overall === 0 || willRecommend === null) {
      alert('Please rate the visit and answer if you would recommend');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateMicroFeedbackPayload = {
        visit_id: visitId,
        rating_1_to_5: ratings.overall,
        response_time_rating: ratings.response_time || ratings.overall,
        professionalism_rating: ratings.professionalism || ratings.overall,
        care_quality_rating: ratings.care_quality || ratings.overall,
        would_recommend: willRecommend,
        quick_comment: comment || undefined,
      };

      await microFeedbackApi.create(payload);
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-center gap-3">
          <ThumbsUp className="text-green-600" size={24} />
          <div>
            <h3 className="font-bold text-green-800">Thank You!</h3>
            <p className="text-sm text-green-700">Your feedback has been recorded</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (category: string, value: number) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
          {category.replace(/_/g, ' ')} Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [category]: star,
                }))
              }
              className="transition"
            >
              <Star
                size={32}
                className={
                  star <= (hoverRating || value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Rate Your Visit</h2>

      {practitionerName && (
        <p className="text-gray-600 mb-6">How was your experience with {practitionerName}?</p>
      )}

      {/* Overall Rating */}
      {renderStars('overall', ratings.overall)}

      {/* Additional Ratings */}
      <div className="space-y-4 border-t pt-4">
        {renderStars('response_time', ratings.response_time)}
        {renderStars('professionalism', ratings.professionalism)}
        {renderStars('care_quality', ratings.care_quality)}
      </div>

      {/* Recommendation */}
      <div className="border-t pt-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Would you recommend this practitioner?
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setWillRecommend(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              willRecommend === true
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            👍 Yes
          </button>
          <button
            onClick={() => setWillRecommend(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              willRecommend === false
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            👎 No
          </button>
        </div>
      </div>

      {/* Optional Comment */}
      <div className="border-t pt-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any comments? (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your feedback..."
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/200</p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {isSubmitting ? '⏳ Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}
