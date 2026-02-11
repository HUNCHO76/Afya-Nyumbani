/**
 * Health Access Token Management - Secure health record sharing
 * Clients can share health data with specialists, insurance, caregivers
 */

import React, { useState, useEffect } from 'react';
import { Lock, Share2, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { HealthAccessToken, CreateHealthAccessTokenPayload } from '@/types/InnovativeFeatures';
import healthAccessTokenApi from '@/services/innovativeFeatureApi';

interface HealthAccessTokenManagementProps {
  clientId: number;
  onSuccess?: () => void;
}

const RECORD_TYPES = [
  'lab_results',
  'prescriptions',
  'medical_history',
  'vital_signs',
  'appointment_notes',
  'immunization_records',
  'allergy_information',
];

export default function HealthAccessTokenManagement({
  clientId,
  onSuccess,
}: HealthAccessTokenManagementProps) {
  const [tokens, setTokens] = useState<HealthAccessToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<number[]>([]);

  const [formData, setFormData] = useState<CreateHealthAccessTokenPayload>({
    authorized_entity_id: 0,
    authorized_entity_type: 'specialist',
    allowed_record_types: [],
    expires_at: '',
    access_limit: undefined,
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const response = await healthAccessTokenApi.getMyTokens();
      setTokens(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tokens:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      allowed_record_types: prev.allowed_record_types.includes(type)
        ? prev.allowed_record_types.filter((t) => t !== type)
        : [...prev.allowed_record_types, type],
    }));
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.authorized_entity_id || formData.allowed_record_types.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await healthAccessTokenApi.create(clientId, formData);
      setShowForm(false);
      setFormData({
        authorized_entity_id: 0,
        authorized_entity_type: 'specialist',
        allowed_record_types: [],
        expires_at: '',
        access_limit: undefined,
      });
      fetchTokens();
      onSuccess?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create token');
    }
  };

  const handleRevokeToken = async (tokenId: number) => {
    if (confirm('Are you sure you want to revoke this token? Access cannot be restored.')) {
      try {
        await healthAccessTokenApi.revokeToken(tokenId);
        fetchTokens();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to revoke token');
      }
    }
  };

  const toggleTokenVisibility = (tokenId: number) => {
    setVisibleTokens((prev) =>
      prev.includes(tokenId) ? prev.filter((id) => id !== tokenId) : [...prev, tokenId]
    );
  };

  const maskToken = (token: string) => {
    if (token.length > 8) {
      return token.slice(0, 4) + '*'.repeat(Math.max(4, token.length - 8)) + token.slice(-4);
    }
    return '*'.repeat(token.length);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Lock className="text-blue-600" size={28} />
        Health Data Access Tokens
      </h2>
      <p className="text-gray-600 mb-6">Manage who can access your health records</p>

      {/* Create Token Section */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-6 flex items-center gap-2"
        >
          <Share2 size={20} /> Create New Access Token
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-bold mb-4">Create New Access Token</h3>

          <form onSubmit={handleCreateToken} className="space-y-4">
            {/* Entity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sharing With *
              </label>
              <select
                value={formData.authorized_entity_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authorized_entity_type: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="specialist">Specialist</option>
                <option value="insurance">Insurance Company</option>
                <option value="caregiver">Family Caregiver</option>
              </select>
            </div>

            {/* Entity ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Number *
              </label>
              <input
                type="number"
                value={formData.authorized_entity_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authorized_entity_id: parseInt(e.target.value),
                  })
                }
                placeholder="Enter ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Record Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allow Access To *
              </label>
              <div className="space-y-2">
                {RECORD_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.allowed_record_types.includes(type)}
                      onChange={() => handleRecordTypeChange(type)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expires_at: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Access Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Accesses (Leave empty for unlimited)
              </label>
              <input
                type="number"
                value={formData.access_limit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    access_limit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="e.g., 5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Create Token
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Tokens List */}
      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="inline animate-spin text-blue-600" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No active access tokens</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-3">Active Tokens ({tokens.length})</h3>
          {tokens.map((token) => {
            const isVisible = visibleTokens.includes(token.id);
            const isExpired = new Date(token.expires_at) < new Date();
            const isRevoked = token.revoked_at !== null;

            return (
              <div
                key={token.id}
                className={`p-4 rounded-lg border-l-4 ${
                  isExpired || isRevoked
                    ? 'bg-gray-50 border-gray-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold capitalize">
                      {token.authorized_entity_type} #{token.authorized_entity_id}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Status:{' '}
                      {isRevoked ? (
                        <span className="text-red-600 font-bold">Revoked</span>
                      ) : isExpired ? (
                        <span className="text-orange-600 font-bold">Expired</span>
                      ) : (
                        <span className="text-green-600 font-bold">Active</span>
                      )}
                    </p>
                  </div>
                  {!isRevoked && !isExpired && (
                    <button
                      onClick={() => handleRevokeToken(token.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Revoke token"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                {/* Token Display */}
                <div className="bg-white p-3 rounded mb-3 font-mono text-sm flex items-center justify-between">
                  <span>
                    {isVisible ? token.token_hash : maskToken(token.token_hash)}
                  </span>
                  <button
                    onClick={() => toggleTokenVisibility(token.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Records Accessible:</p>
                    <p className="font-medium">
                      {token.allowed_record_types.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      Expires: {new Date(token.expires_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Accesses: {token.access_count}
                      {token.access_limit && ` / ${token.access_limit}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
