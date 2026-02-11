import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Button } from '@/Components/ui/button';
import { 
  User, Calendar, Phone, Heart, Activity, FileText, 
  Stethoscope, TrendingUp, ArrowLeft, Plus 
} from 'lucide-react';

interface Patient {
  id: string;
  user: {
    name: string;
    email: string;
  };
  date_of_birth: string;
  blood_type: string;
  allergies: string[];
  medical_conditions: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  vitals: Vital[];
  medicalHistories: MedicalHistory[];
  visits: Visit[];
}

interface Vital {
  id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  temperature: number;
  oxygen_saturation: number;
  weight: number;
  notes: string;
  created_at: string;
}

interface MedicalHistory {
  id: string;
  condition: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  severity: string;
  notes: string;
  created_at: string;
}

interface Visit {
  id: string;
  booking_date: string;
  booking_time: string;
  service: {
    name: string;
  };
  status: string;
  check_in_time: string;
  check_out_time: string;
}

interface Props {
  patient: Patient;
}

const PractitionerPatientShow = ({ patient }: Props) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'history' | 'visits'>('overview');

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const latestVitals = patient.vitals?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
      
      <MainSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/practitioner/patients">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patients
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{patient.user.name}</h1>
                  <p className="text-muted-foreground">
                    {calculateAge(patient.date_of_birth)} years old • {patient.blood_type || 'Blood type not recorded'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/practitioner/patients/${patient.id}/vitals/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Vitals
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b">
              <nav className="flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === 'vitals'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Activity className="h-4 w-4 inline mr-2" />
                  Vitals History
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Medical History
                </button>
                <button
                  onClick={() => setActiveTab('visits')}
                  className={`pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === 'visits'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Visit History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Patient Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Contact Information */}
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contact Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{patient.user.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{formatDate(patient.date_of_birth)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Emergency Contact
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{patient.emergency_contact_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{patient.emergency_contact_phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Latest Vitals */}
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Latest Vitals
                    </h3>
                    {latestVitals ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BP:</span>
                          <span className="font-medium">
                            {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic} mmHg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heart Rate:</span>
                          <span className="font-medium">{latestVitals.heart_rate} bpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temperature:</span>
                          <span className="font-medium">{latestVitals.temperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SpO2:</span>
                          <span className="font-medium">{latestVitals.oxygen_saturation}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Recorded: {formatDateTime(latestVitals.created_at)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-red-500" />
                      Allergies
                    </h3>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No known allergies</p>
                    )}
                  </div>

                  {/* Medical Conditions */}
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Medical Conditions
                    </h3>
                    {patient.medical_conditions && patient.medical_conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.medical_conditions.map((condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recorded conditions</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {patient.notes && (
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Notes
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {patient.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="rounded-lg border bg-card">
                <div className="p-6 border-b">
                  <h3 className="font-semibold">Vitals History</h3>
                </div>
                <div className="overflow-x-auto">
                  {patient.vitals && patient.vitals.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">BP</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">HR</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Temp</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">SpO2</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Weight</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {patient.vitals.map((vital) => (
                          <tr key={vital.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm">{formatDateTime(vital.created_at)}</td>
                            <td className="px-4 py-3 text-sm">
                              {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                            </td>
                            <td className="px-4 py-3 text-sm">{vital.heart_rate} bpm</td>
                            <td className="px-4 py-3 text-sm">{vital.temperature}°C</td>
                            <td className="px-4 py-3 text-sm">{vital.oxygen_saturation}%</td>
                            <td className="px-4 py-3 text-sm">{vital.weight} kg</td>
                            <td className="px-4 py-3 text-sm">{vital.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No vitals recorded yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {patient.medicalHistories && patient.medicalHistories.length > 0 ? (
                  patient.medicalHistories.map((history) => (
                    <div key={history.id} className="rounded-lg border bg-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{history.condition}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(history.created_at)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          history.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          history.severity === 'severe' ? 'bg-orange-100 text-orange-700' :
                          history.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {history.severity}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm">
                        {history.diagnosis && (
                          <div>
                            <p className="font-medium text-muted-foreground">Diagnosis:</p>
                            <p>{history.diagnosis}</p>
                          </div>
                        )}
                        {history.treatment && (
                          <div>
                            <p className="font-medium text-muted-foreground">Treatment:</p>
                            <p>{history.treatment}</p>
                          </div>
                        )}
                        {history.medications && (
                          <div>
                            <p className="font-medium text-muted-foreground">Medications:</p>
                            <p>{history.medications}</p>
                          </div>
                        )}
                        {history.notes && (
                          <div>
                            <p className="font-medium text-muted-foreground">Notes:</p>
                            <p className="text-muted-foreground">{history.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-card rounded-lg border">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No medical history recorded yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="rounded-lg border bg-card">
                <div className="p-6 border-b">
                  <h3 className="font-semibold">Visit History</h3>
                </div>
                <div className="overflow-x-auto">
                  {patient.visits && patient.visits.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Service</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Check In</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Check Out</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {patient.visits.map((visit) => (
                          <tr key={visit.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm">
                              {formatDate(visit.booking?.booking_date || visit.created_at)} at {visit.booking?.booking_time || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">{visit.booking?.service?.name || visit.service?.name || '-'}</td>
                            <td className="px-4 py-3 text-sm">{visit.check_in_time || '-'}</td>
                            <td className="px-4 py-3 text-sm">{visit.check_out_time || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                visit.check_out_time ? 'bg-green-100 text-green-700' :
                                visit.check_in_time ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {visit.check_out_time ? 'Completed' : (visit.check_in_time ? 'In Progress' : 'Scheduled')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No visit history</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PractitionerPatientShow;
