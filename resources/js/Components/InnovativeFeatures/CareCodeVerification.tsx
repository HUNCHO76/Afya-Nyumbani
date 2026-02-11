/**
 * Care Code Verification - 6-digit visit confirmation code
 * Used for secure visit verification and check-in
 */

import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import careCodeApi from '@/services/innovativeFeatureApi';

interface CareCodeVerificationProps {
  careCodeId: number;
  onSuccess?: () => void;
}

export default function CareCodeVerification({ careCodeId, onSuccess }: CareCodeVerificationProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await careCodeApi.confirmCode(careCodeId, code);
      setVerified(true);
      onSuccess?.();
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setError('Too many failed attempts. Code has been locked.');
      } else {
        setError(err.response?.data?.message || 'Invalid code. Try again.');
      }

      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verified) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <h3 className="font-bold text-green-800">Verified!</h3>
            <p className="text-sm text-green-700">Visit has been confirmed and recorded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Shield className="text-blue-600" size={28} />
        Care Code Verification
      </h2>
      <p className="text-gray-600 mb-6">Enter the 6-digit code provided by your practitioner</p>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-red-800">{error}</p>
            {attempts > 0 && attempts < 3 && (
              <p className="text-sm text-red-700 mt-1">Attempts remaining: {3 - attempts}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleVerify}>
        {/* Code Input */}
        <div className="mb-6">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            maxLength={6}
            disabled={attempts >= 3}
            className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-100"
          />
        </div>

        {/* Verification Progress */}
        {code.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition ${
                    i < code.length ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || code.length !== 6 || attempts >= 3}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {isSubmitting ? '⏳ Verifying...' : '✓ Verify Code'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your visit will be securely recorded upon verification
      </p>
    </div>
  );
}
