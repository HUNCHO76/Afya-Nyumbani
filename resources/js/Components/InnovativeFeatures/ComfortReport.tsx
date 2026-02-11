/**
 * Comfort Report - Daily wellness check-in for monitoring
 * Tracks client's daily wellness status between visits
 */

import React, { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { CreateComfortReportPayload } from '@/types/InnovativeFeatures';
import comfortReportApi from '@/services/innovativeFeatureApi';

interface ComfortReportProps {
  clientId: number;
  visitId?: number;
  onSuccess?: () => void;
}

const MOOD_OPTIONS = [
  { value: 'very_poor', emoji: '😞', label: 'Very Poor' },
  { value: 'poor', emoji: '😟', label: 'Poor' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'excellent', emoji: '😄', label: 'Excellent' },
];

const APPETITE_OPTIONS = ['None', 'Reduced', 'Normal', 'Increased'];

export default function ComfortReport({ clientId, visitId, onSuccess }: ComfortReportProps) {
  const [data, setData] = useState<CreateComfortReportPayload>({
    visit_id: visitId || 0,
    wellness_score_1_to_10: 5,
    mood: 'neutral',
    physical_discomfort: '',
    emotional_status: '',
    sleep_quality_1_to_10: 5,
    appetite_level: 'Normal',
    medication_side_effects: '',
    any_concerns: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await comfortReportApi.create(data);
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit comfort report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-center gap-3">
          <Heart className="text-green-600" size={24} />
          <div>
            <h3 className="font-bold text-green-800">Thank You</h3>
            <p className="text-sm text-green-700">Your wellness report has been recorded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Heart size={28} className="text-red-500" />
        Daily Wellness Check-In
      </h2>
      <p className="text-gray-600 mb-6">Tell us how you're feeling today</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wellness Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Wellness: {data.wellness_score_1_to_10}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={data.wellness_score_1_to_10}
            onChange={(e) => setData({ ...data, wellness_score_1_to_10: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">How is your mood?</label>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setData({ ...data, mood: mood.value as any })}
                className={`p-3 rounded-lg text-center transition ${
                  data.mood === mood.value
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="text-2xl">{mood.emoji}</div>
                <div className="text-xs font-medium mt-1">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sleep Quality: {data.sleep_quality_1_to_10}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={data.sleep_quality_1_to_10}
            onChange={(e) => setData({ ...data, sleep_quality_1_to_10: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Appetite Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Appetite Level</label>
          <div className="flex gap-2">
            {APPETITE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setData({ ...data, appetite_level: option })}
                className={`flex-1 py-2 rounded-lg transition ${
                  data.appetite_level === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Physical Discomfort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any physical discomfort?
          </label>
          <textarea
            value={data.physical_discomfort || ''}
            onChange={(e) => setData({ ...data, physical_discomfort: e.target.value })}
            placeholder="Describe any pain or discomfort..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Emotional Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emotional status (Optional)
          </label>
          <textarea
            value={data.emotional_status || ''}
            onChange={(e) => setData({ ...data, emotional_status: e.target.value })}
            placeholder="How are you feeling emotionally?"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Medication Side Effects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any medication side effects?
          </label>
          <input
            type="text"
            value={data.medication_side_effects || ''}
            onChange={(e) => setData({ ...data, medication_side_effects: e.target.value })}
            placeholder="Describe any side effects..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Concerns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any concerns or questions?
          </label>
          <textarea
            value={data.any_concerns || ''}
            onChange={(e) => setData({ ...data, any_concerns: e.target.value })}
            placeholder="Let us know about any concerns..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {isSubmitting ? '⏳ Submitting...' : 'Submit Wellness Report'}
        </button>
      </form>
    </div>
  );
}
