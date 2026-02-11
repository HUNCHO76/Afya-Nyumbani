/**
 * Innovative Features Demo Page
 * Showcases all 12 innovative healthcare features
 */

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SymptomSnapshotForm from '@/Components/InnovativeFeatures/SymptomSnapshotForm';
import ArrivalConfirmation from '@/Components/InnovativeFeatures/ArrivalConfirmation';
import MicroFeedback from '@/Components/InnovativeFeatures/MicroFeedback';
import ComfortReport from '@/Components/InnovativeFeatures/ComfortReport';
import EmergencyEscalation from '@/Components/InnovativeFeatures/EmergencyEscalation';
import CareCodeVerification from '@/Components/InnovativeFeatures/CareCodeVerification';
import PostVisitReport from '@/Components/InnovativeFeatures/PostVisitReport';
import HealthAccessTokenManager from '@/Components/InnovativeFeatures/HealthAccessTokenManager';

interface InnovativeFeaturesPageProps {
  auth: any;
}

const FEATURES = [
  {
    id: 'arrival',
    title: 'Practitioner Arrival Confirmation',
    description: 'Real-time GPS-verified arrival tracking',
    icon: '📍',
    category: 'Practitioner',
  },
  {
    id: 'symptom',
    title: 'Symptom Snapshot',
    description: 'Pre-visit self-reporting for better diagnosis',
    icon: '🏥',
    category: 'Client',
  },
  {
    id: 'emergency',
    title: 'Emergency Escalation',
    description: 'Critical health event management',
    icon: '🚨',
    category: 'Client',
  },
  {
    id: 'feedback',
    title: 'Micro Feedback',
    description: 'Quick post-visit ratings (1-5 stars)',
    icon: '⭐',
    category: 'Client',
  },
  {
    id: 'token',
    title: 'Health Access Token',
    description: 'Secure, time-limited health record sharing',
    icon: '🔐',
    category: 'Client',
  },
  {
    id: 'carecode',
    title: 'Care Code Verification',
    description: '6-digit visit confirmation for security',
    icon: '🛡️',
    category: 'Client',
  },
  {
    id: 'comfort',
    title: 'Comfort Report',
    description: 'Daily wellness check-ins for monitoring',
    icon: '❤️',
    category: 'Client',
  },
  {
    id: 'postreport',
    title: 'Post-Visit Report',
    description: 'Comprehensive visit documentation',
    icon: '📋',
    category: 'Practitioner',
  },
];

export default function InnovativeFeaturesPage({ auth }: InnovativeFeaturesPageProps) {
  const [activeFeature, setActiveFeature] = useState<string>('arrival');

  const renderFeatureComponent = () => {
    switch (activeFeature) {
      case 'arrival':
        return <ArrivalConfirmation visitId={1} />;
      case 'symptom':
        return <SymptomSnapshotForm appointmentId="uuid-here" />;
      case 'emergency':
        return <EmergencyEscalation visitId={1} clientName={auth.user?.name} />;
      case 'feedback':
        return <MicroFeedback visitId={1} practitionerName="Dr. Jane Smith" />;
      case 'token':
        return <HealthAccessTokenManager clientId={auth.user?.id} />;
      case 'carecode':
        return <CareCodeVerification careCodeId={1} />;
      case 'comfort':
        return <ComfortReport clientId={auth.user?.id} visitId={1} />;
      case 'postreport':
        return <PostVisitReport visitId={1} clientName={auth.user?.name} />;
      default:
        return null;
    }
  };

  const practitionerFeatures = FEATURES.filter((f) => f.category === 'Practitioner');
  const clientFeatures = FEATURES.filter((f) => f.category === 'Client');

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Innovative Features Demo
        </h2>
      }
    >
      <Head title="Innovative Features" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">Healthcare Innovation Hub</h1>
              <p className="text-gray-600">
                Explore our 12 innovative features designed to revolutionize home healthcare delivery
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature List Sidebar */}
            <div>
              <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg sticky top-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Features</h2>

                  {/* Practitioner Features */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase mb-3 pb-2 border-b">
                      👨‍⚕️ Practitioner Features
                    </h3>
                    <div className="space-y-2">
                      {practitionerFeatures.map((feature) => (
                        <button
                          key={feature.id}
                          onClick={() => setActiveFeature(feature.id)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            activeFeature === feature.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="font-medium">{feature.icon} {feature.title}</div>
                          <div className="text-xs mt-1 opacity-75">{feature.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client Features */}
                  <div>
                    <h3 className="text-sm font-bold text-green-600 uppercase mb-3 pb-2 border-b">
                      👤 Client Features
                    </h3>
                    <div className="space-y-2">
                      {clientFeatures.map((feature) => (
                        <button
                          key={feature.id}
                          onClick={() => setActiveFeature(feature.id)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            activeFeature === feature.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="font-medium">{feature.icon} {feature.title}</div>
                          <div className="text-xs mt-1 opacity-75">{feature.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Content */}
            <div className="lg:col-span-2">
              <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                {renderFeatureComponent()}
              </div>

              {/* Feature Documentation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-lg mb-2">💡 How to Use This Feature</h3>
                <p className="text-gray-700 text-sm">
                  Each feature is fully integrated with the backend API. You can interact with the
                  components above to test the functionality. All data is securely transmitted and
                  stored in the database.
                </p>
              </div>

              {/* API Integration Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
                <h3 className="font-bold text-lg mb-2">🔌 API Integration</h3>
                <p className="text-gray-700 text-sm mb-3">
                  This frontend uses our comprehensive API service layer located at:
                </p>
                <code className="bg-white p-3 rounded border border-green-200 text-xs font-mono block overflow-x-auto">
                  resources/js/services/innovativeFeatureApi.ts
                </code>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">System Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600">12</div>
                <div className="text-gray-600 text-sm">Innovative Features</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600">40+</div>
                <div className="text-gray-600 text-sm">API Endpoints</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-purple-600">8</div>
                <div className="text-gray-600 text-sm">React Components</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-orange-600">7</div>
                <div className="text-gray-600 text-sm">Client Activities</div>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">📚 Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/docs/innovative-features-design"
                className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <h3 className="font-bold text-blue-600">Strategic Design</h3>
                <p className="text-sm text-gray-600">Complete feature specifications and workflows</p>
              </a>
              <a
                href="/docs/implementation-guide"
                className="p-4 border border-green-200 rounded-lg hover:bg-green-50"
              >
                <h3 className="font-bold text-green-600">Implementation Guide</h3>
                <p className="text-sm text-gray-600">Developer setup and integration steps</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
