/**
 * Post-Visit Report - Comprehensive visit documentation
 * Practitioner records diagnosis, treatment, and follow-up
 */

import React, { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { CreatePostVisitReportPayload } from '@/types/InnovativeFeatures';
import postVisitReportApi from '@/services/innovativeFeatureApi';

interface PostVisitReportProps {
  visitId: number;
  clientName?: string;
  onSuccess?: () => void;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
}

export default function PostVisitReport({ visitId, clientName, onSuccess }: PostVisitReportProps) {
  const [data, setData] = useState<CreatePostVisitReportPayload>({
    visit_id: visitId,
    chief_complaint: '',
    vital_signs_recorded: {
      temperature: undefined,
      blood_pressure: '',
      heart_rate: undefined,
      respiratory_rate: undefined,
    },
    examination_findings: '',
    diagnosis: '',
    recommended_treatment: '',
    medications_prescribed: [],
    follow_up_date: '',
    referral_needed: false,
    referral_hospital: '',
    special_instructions: '',
    client_education_provided: '',
    next_visit_scheduled: '',
  });

  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentMed, setCurrentMed] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    duration_days: 7,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addMedication = () => {
    if (currentMed.name && currentMed.dosage && currentMed.frequency) {
      setMedications([...medications, currentMed]);
      setCurrentMed({ name: '', dosage: '', frequency: '', duration_days: 7 });
    } else {
      alert('Please fill all medication fields');
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreatePostVisitReportPayload = {
      ...data,
      medications_prescribed: medications,
    };

    setIsSubmitting(true);

    try {
      await postVisitReportApi.create(payload);
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h3 className="font-bold text-green-800">Report Submitted Successfully</h3>
        <p className="text-sm text-green-700">The post-visit report has been recorded</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <FileText className="text-blue-600" size={28} />
        Post-Visit Report
      </h2>
      {clientName && <p className="text-gray-600 mb-6">Patient: {clientName}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chief Complaint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chief Complaint *
          </label>
          <input
            type="text"
            value={data.chief_complaint}
            onChange={(e) => setData({ ...data, chief_complaint: e.target.value })}
            placeholder="Patient's main reason for visit"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Vital Signs */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Vital Signs</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={(data.vital_signs_recorded as any)?.temperature || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    vital_signs_recorded: {
                      ...data.vital_signs_recorded,
                      temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="36.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Pressure
              </label>
              <input
                type="text"
                value={(data.vital_signs_recorded as any)?.blood_pressure || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    vital_signs_recorded: {
                      ...data.vital_signs_recorded,
                      blood_pressure: e.target.value,
                    },
                  })
                }
                placeholder="120/80"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={(data.vital_signs_recorded as any)?.heart_rate || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    vital_signs_recorded: {
                      ...data.vital_signs_recorded,
                      heart_rate: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="72"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Respiratory Rate
              </label>
              <input
                type="number"
                value={(data.vital_signs_recorded as any)?.respiratory_rate || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    vital_signs_recorded: {
                      ...data.vital_signs_recorded,
                      respiratory_rate: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="16"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Examination Findings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Examination Findings *
          </label>
          <textarea
            value={data.examination_findings}
            onChange={(e) => setData({ ...data, examination_findings: e.target.value })}
            placeholder="Document physical examination findings..."
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnosis *
          </label>
          <textarea
            value={data.diagnosis}
            onChange={(e) => setData({ ...data, diagnosis: e.target.value })}
            placeholder="Primary and differential diagnoses..."
            rows={3}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Treatment Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommended Treatment
          </label>
          <textarea
            value={data.recommended_treatment || ''}
            onChange={(e) => setData({ ...data, recommended_treatment: e.target.value })}
            placeholder="Treatment recommendations and procedures..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Medications */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Medications Prescribed</h3>

          {medications.length > 0 && (
            <div className="space-y-2 mb-4">
              {medications.map((med, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-600">
                      {med.dosage} • {med.frequency} • {med.duration_days} days
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={currentMed.name}
              onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
              placeholder="Medication name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={currentMed.dosage}
              onChange={(e) => setCurrentMed({ ...currentMed, dosage: e.target.value })}
              placeholder="Dosage (e.g., 500mg)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={currentMed.frequency}
              onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}
              placeholder="Frequency (e.g., Twice daily)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              value={currentMed.duration_days}
              onChange={(e) => setCurrentMed({ ...currentMed, duration_days: parseInt(e.target.value) })}
              placeholder="Duration (days)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={addMedication}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Medication
            </button>
          </div>
        </div>

        {/* Follow-up & Referral */}
        <div className="border-t pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={data.follow_up_date || ''}
                onChange={(e) => setData({ ...data, follow_up_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.referral_needed || false}
                  onChange={(e) => setData({ ...data, referral_needed: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">Referral Needed</span>
              </label>
            </div>
          </div>

          {data.referral_needed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital/Facility Name
              </label>
              <input
                type="text"
                value={data.referral_hospital || ''}
                onChange={(e) => setData({ ...data, referral_hospital: e.target.value })}
                placeholder="Referral destination"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions
          </label>
          <textarea
            value={data.special_instructions || ''}
            onChange={(e) => setData({ ...data, special_instructions: e.target.value })}
            placeholder="Any special care instructions for the patient..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Client Education */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Education Provided
          </label>
          <textarea
            value={data.client_education_provided || ''}
            onChange={(e) => setData({ ...data, client_education_provided: e.target.value })}
            placeholder="Health education and counseling provided..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Next Visit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Next Visit Scheduled
          </label>
          <input
            type="date"
            value={data.next_visit_scheduled || ''}
            onChange={(e) => setData({ ...data, next_visit_scheduled: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {isSubmitting ? '⏳ Submitting...' : '✓ Submit Report'}
        </button>
      </form>
    </div>
  );
}
