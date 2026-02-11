/**
 * Emergency Escalation - Critical health event management
 * Handles urgent situations during or between visits
 */

import React, { useState } from 'react';
import { AlertTriangle, Phone, Ambulance } from 'lucide-react';
import emergencyEscalationApi from '@/services/innovativeFeatureApi';

interface EmergencyEscalationProps {
  visitId: number;
  clientName?: string;
  emergencyNumber?: string;
  onSuccess?: () => void;
}

const ESCALATION_REASONS = [
  { id: 'severe_pain', label: '🔴 Severe Pain', severity: 'high' },
  { id: 'difficulty_breathing', label: '🔴 Difficulty Breathing', severity: 'critical' },
  { id: 'chest_pain', label: '🔴 Chest Pain', severity: 'critical' },
  { id: 'loss_consciousness', label: '🔴 Loss of Consciousness', severity: 'critical' },
  { id: 'severe_bleeding', label: '🔴 Severe Bleeding', severity: 'critical' },
  { id: 'allergic_reaction', label: '🟠 Allergic Reaction', severity: 'high' },
  { id: 'high_fever', label: '🟠 High Fever (>40°C)', severity: 'high' },
  { id: 'severe_vomiting', label: '🟠 Severe Vomiting/Diarrhea', severity: 'high' },
  { id: 'worsening_condition', label: '🟡 Condition Worsening', severity: 'medium' },
  { id: 'other', label: 'Other Emergency', severity: 'medium' },
];

export default function EmergencyEscalation({
  visitId,
  clientName,
  emergencyNumber = '112',
  onSuccess,
}: EmergencyEscalationProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [actionTaken, setActionTaken] = useState('');
  const [ambulanceCalled, setAmbulanceCalled] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = ESCALATION_REASONS.find((r) => r.id === selectedReason);
  const severity = selectedOption?.severity || 'low';

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      alert('Please select a reason for escalation');
      return;
    }

    setIsSubmitting(true);

    try {
      await emergencyEscalationApi.create(visitId, {
        escalation_reason: selectedReason,
        severity_level: severity,
        action_taken: actionTaken,
        ambulance_called: ambulanceCalled,
        hospital_name: hospitalName || null,
        referral_reason: referralReason,
      });

      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to escalate emergency');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`border-l-4 p-4 rounded ${getSeverityColor(severity)}`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={24} />
          <div>
            <h3 className="font-bold text-red-800">Emergency Reported</h3>
            <p className="text-sm text-red-700">Our team has been notified and will respond immediately</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow p-6 border-l-4 ${getSeverityColor(severity)}`}>
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <AlertTriangle className="text-red-600" size={28} />
        Emergency Escalation
      </h2>
      <p className="text-gray-600 mb-6">Report an urgent health situation</p>

      {/* Emergency Contact Info */}
      <div className="bg-white p-4 rounded mb-6 border-2 border-red-300">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-gray-900">If life-threatening:</span>
          <a
            href={`tel:${emergencyNumber}`}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
          >
            <Phone size={20} />
            Call {emergencyNumber}
          </a>
        </div>
        {clientName && <p className="text-sm text-gray-600">Patient: {clientName}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Escalation Reason */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            What is the emergency? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ESCALATION_REASONS.map((reason) => (
              <button
                key={reason.id}
                type="button"
                onClick={() => setSelectedReason(reason.id)}
                className={`p-3 rounded-lg text-left font-medium transition ${
                  selectedReason === reason.id
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Taken */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What action has been taken? *
          </label>
          <textarea
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="Describe the immediate actions taken..."
            rows={3}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Ambulance */}
        <div>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer">
            <input
              type="checkbox"
              checked={ambulanceCalled}
              onChange={(e) => setAmbulanceCalled(e.target.checked)}
              className="w-5 h-5"
            />
            <Ambulance className="text-orange-600" size={20} />
            <span className="font-medium">Ambulance has been called</span>
          </label>
        </div>

        {/* Hospital Name */}
        {ambulanceCalled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital/Facility Name
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="Enter destination hospital..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Referral Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for escalation/referral *
          </label>
          <textarea
            value={referralReason}
            onChange={(e) => setReferralReason(e.target.value)}
            placeholder="Explain why this escalation is necessary..."
            rows={3}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {isSubmitting ? '⏳ Escalating...' : '🚨 Report Emergency'}
        </button>
      </form>
    </div>
  );
}
