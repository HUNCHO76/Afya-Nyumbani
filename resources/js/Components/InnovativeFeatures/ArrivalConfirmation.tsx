/**
 * Arrival Confirmation - Real-time GPS-verified arrival tracking
 * Confirms practitioner has arrived at client's location
 */

import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import arrivalConfirmationApi from '@/services/innovativeFeatureApi';

interface ArrivalConfirmationProps {
  visitId: number;
  onSuccess?: () => void;
}

export default function ArrivalConfirmation({ visitId, onSuccess }: ArrivalConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);

  useEffect(() => {
    // Try to get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (err) => setError('Unable to access location. Please enable GPS.')
      );
    }
  }, []);

  const handleConfirmArrival = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await arrivalConfirmationApi.confirmArrival(
        visitId,
        location.latitude,
        location.longitude,
        location.accuracy
      );
      setIsConfirmed(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm arrival');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <h3 className="font-bold text-green-800">Arrival Confirmed</h3>
            <p className="text-sm text-green-700">Your location has been recorded successfully</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin size={24} className="text-blue-600" />
        Confirm Your Arrival
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {location && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
          <p className="text-sm text-blue-900">
            📍 Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            <br />
            Accuracy: ±{Math.round(location.accuracy)}m
          </p>
        </div>
      )}

      <button
        onClick={handleConfirmArrival}
        disabled={isLoading || !location}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {isLoading ? '⏳ Confirming Location...' : '✓ Confirm Arrival'}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your GPS location will be recorded and securely transmitted
      </p>
    </div>
  );
}
