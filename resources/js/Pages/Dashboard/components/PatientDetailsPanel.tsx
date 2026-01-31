import React, { useState } from 'react';
import Icon from '@/Components/AppIcon';
import { Button } from '@/Components/ui/button';

interface PatientDetailsPanelProps {
  patient: any;
  onClose: () => void;
}

const PatientDetailsPanel: React.FC<PatientDetailsPanelProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'appointments' | 'vitals'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'text-success';
      case 'Warning':
        return 'text-warning';
      case 'Critical':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 md:p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={patient.profileImage}
                alt={patient.profileImageAlt}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-background shadow-md"
              />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{patient.name}</h2>
                <p className="text-sm text-muted-foreground">{patient.patientId}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    patient.carePlanStatus === 'Active' ? 'bg-success/10 text-success' :
                    patient.carePlanStatus === 'Pending' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>
                    {patient.carePlanStatus}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    patient.priority === 'High' ? 'bg-error/10 text-error' :
                    patient.priority === 'Medium' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    {patient.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="X" size={24} className="text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'medical'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Medical History
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'vitals'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vital Signs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Contact Information */}
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="User" size={20} className="text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground font-medium">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground font-medium">{patient.email}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground font-medium">{patient.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Date of Birth</p>
                    <p className="text-foreground font-medium">{patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Gender</p>
                    <p className="text-foreground font-medium">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Blood Type</p>
                    <p className="text-foreground font-medium">{patient.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Insurance</p>
                    <p className="text-foreground font-medium">{patient.insuranceProvider}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="Phone" size={20} className="text-error" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Name</p>
                    <p className="text-foreground font-medium">{patient.emergencyContact?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Relationship</p>
                    <p className="text-foreground font-medium">{patient.emergencyContact?.relationship}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground font-medium">{patient.emergencyContact?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Active Care Plan */}
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="ClipboardList" size={20} className="text-primary" />
                  Active Care Plan
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Service</p>
                    <p className="text-foreground font-semibold">{patient.activeCare}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Assigned Practitioner</p>
                    <p className="text-foreground font-medium">{patient.assignedPractitioner}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Start Date</p>
                      <p className="text-foreground font-medium">{patient.carePlan?.startDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">End Date</p>
                      <p className="text-foreground font-medium">{patient.carePlan?.endDate}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-muted-foreground text-sm">Progress</p>
                      <p className="text-foreground font-semibold">{patient.carePlan?.progress}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${patient.carePlan?.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Care Plan Goals */}
              {patient.carePlan?.goals && patient.carePlan.goals.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="Target" size={20} className="text-primary" />
                    Care Plan Goals
                  </h3>
                  <div className="space-y-3">
                    {patient.carePlan.goals.map((goal: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`mt-0.5 ${goal.completed ? 'text-success' : 'text-muted-foreground'}`}>
                          <Icon name={goal.completed ? 'CheckCircle' : 'Circle'} size={20} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium mb-1 ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {goal.description}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: {goal.targetDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'medical' && (
            <>
              {/* Medical Conditions */}
              {patient.medicalHistory?.conditions && patient.medicalHistory.conditions.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="Activity" size={20} className="text-error" />
                    Medical Conditions
                  </h3>
                  <div className="space-y-4">
                    {patient.medicalHistory.conditions.map((condition: any, index: number) => (
                      <div key={index} className="border-l-4 border-error pl-4 py-2">
                        <h4 className="font-semibold text-foreground mb-1">{condition.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{condition.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Diagnosed: {condition.diagnosedDate}</span>
                          <span>By: {condition.diagnosedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={20} className="text-warning" />
                    Known Allergies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.allergies.map((allergy: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-warning/10 text-warning rounded-full text-sm font-medium border border-warning/20"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Medications */}
              {patient.medicalHistory?.medications && patient.medicalHistory.medications.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="Pill" size={20} className="text-success" />
                    Current Medications
                  </h3>
                  <div className="space-y-3">
                    {patient.medicalHistory.medications.map((medication: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">{medication.name}</h4>
                        <p className="text-sm text-muted-foreground mb-1">Dosage: {medication.dosage}</p>
                        <p className="text-xs text-muted-foreground">Prescribed by: {medication.prescribedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'appointments' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Calendar" size={20} className="text-primary" />
                Appointment History
              </h3>
              <div className="space-y-3">
                {patient.appointments?.map((appointment: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      appointment.status === 'Completed'
                        ? 'bg-success/5 border-success'
                        : appointment.status === 'Scheduled'
                        ? 'bg-primary/5 border-primary'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{appointment.type}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.practitioner}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'Completed'
                            ? 'bg-success/10 text-success'
                            : appointment.status === 'Scheduled'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        {appointment.time}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground italic">{appointment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="space-y-4">
              {patient.vitalSigns?.map((vital: any, index: number) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        vital.status === 'Normal' ? 'bg-success/10' :
                        vital.status === 'Warning' ? 'bg-warning/10' :
                        'bg-error/10'
                      }`}>
                        <Icon name={vital.icon} size={20} className={getStatusColor(vital.status)} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{vital.label}</h4>
                        <p className="text-xs text-muted-foreground">Last: {vital.lastRecorded}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getStatusColor(vital.status)}`}>
                        {vital.value}
                      </p>
                      <span className={`text-xs font-medium ${getStatusColor(vital.status)}`}>
                        {vital.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              className="flex-1"
            >
              <Icon name="Calendar" size={16} className="mr-2" />
              Schedule Appointment
            </Button>
            <Button
              variant="outline"
              className="flex-1"
            >
              <Icon name="FileEdit" size={16} className="mr-2" />
              Update Records
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetailsPanel;
