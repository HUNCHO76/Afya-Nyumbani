/**
 * Symptom Snapshot - Pre-visit self-reporting component
 * Allows clients to describe symptoms before practitioner visit
 */

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CreateSymptomSnapshotPayload } from '@/types/InnovativeFeatures';
import symptomSnapshotApi from '@/services/innovativeFeatureApi';

interface SymptomSnapshotProps {
  appointmentId: string;
  onSubmitSuccess?: () => void;
}

export default function SymptomSnapshotForm({ appointmentId, onSubmitSuccess }: SymptomSnapshotProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, setData, processing } = useForm<CreateSymptomSnapshotPayload>({
    appointment_id: appointmentId,
    primary_symptom: '',
    symptom_duration_days: 1,
    severity_1_to_10: 5,
    pain_location: '',
    symptom_onset_description: '',
    recent_triggers: '',
    medication_taken: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await symptomSnapshotApi.create(data);
      onSubmitSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit symptom snapshot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Pre-Visit Symptom Report</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Symptom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Symptom *
          </label>
          <input
            type="text"
            placeholder="e.g., Headache, Fever, Cough"
            value={data.primary_symptom}
            onChange={(e) => setData('primary_symptom', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Symptom Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration: {data.symptom_duration_days} days
          </label>
          <input
            type="range"
            min="1"
            max="365"
            value={data.symptom_duration_days}
            onChange={(e) => setData('symptom_duration_days', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Severity Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity (1-10): {data.severity_1_to_10}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setData('severity_1_to_10', rating)}
                className={`w-10 h-10 rounded font-bold transition ${
                  data.severity_1_to_10 === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Pain Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pain Location (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Lower back, Right shoulder"
            value={data.pain_location || ''}
            onChange={(e) => setData('pain_location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Symptom Onset Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How did it start? *
          </label>
          <textarea
            placeholder="Describe when and how the symptom started..."
            value={data.symptom_onset_description}
            onChange={(e) => setData('symptom_onset_description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Recent Triggers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recent Triggers (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Stress, Certain foods, Physical activity"
            value={data.recent_triggers || ''}
            onChange={(e) => setData('recent_triggers', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Medication Taken */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any Medication Taken? (Optional)
          </label>
          <input
            type="text"
            placeholder="List any medications you've taken for this..."
            value={data.medication_taken || ''}
            onChange={(e) => setData('medication_taken', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || processing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {isLoading ? 'Submitting...' : 'Submit Symptom Report'}
        </button>
      </form>
    </div>
  );
}
