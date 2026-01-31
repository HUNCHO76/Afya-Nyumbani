import React from 'react';
import Icon from '@/Components/AppIcon';
import { Button } from '@/Components/ui/button';

interface Patient {
  patientId: string;
  name: string;
  profileImage: string;
  profileImageAlt: string;
  phone: string;
  email: string;
  location: string;
  activeCare: string;
  assignedPractitioner: string;
  carePlanStatus: string;
  priority: string;
  lastAppointmentDate: string;
  lastAppointmentType: string;
}

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
  onUpdateRecords: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onViewDetails,
  onScheduleAppointment,
  onUpdateRecords
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success border-success/20';
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Completed':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-error/10 text-error border-error/20';
      case 'Medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Patient Avatar & Basic Info */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={patient.profileImage}
              alt={patient.profileImageAlt}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-background shadow-md"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
              patient.priority === 'High' ? 'bg-error' : patient.priority === 'Medium' ? 'bg-warning' : 'bg-success'
            }`}>
              <Icon name="AlertCircle" size={14} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-bold text-foreground">{patient.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(patient.priority)}`}>
                {patient.priority}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">ID: {patient.patientId}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Phone" size={16} className="text-primary" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Mail" size={16} className="text-primary" />
                <span className="truncate">{patient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <Icon name="MapPin" size={16} className="text-primary" />
                <span>{patient.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Care Information */}
        <div className="flex-1 lg:border-l lg:border-border lg:pl-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Care Plan</p>
              <p className="text-sm font-semibold text-foreground">{patient.activeCare}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Assigned Practitioner</p>
              <div className="flex items-center gap-2">
                <Icon name="Stethoscope" size={16} className="text-success" />
                <p className="text-sm font-medium text-foreground">{patient.assignedPractitioner}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                  <p className="text-sm font-medium text-foreground">{patient.lastAppointmentDate}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(patient.carePlanStatus)}`}>
                {patient.carePlanStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex lg:flex-col gap-2 lg:justify-center">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewDetails(patient)}
            className="flex-1 lg:flex-none lg:w-full"
          >
            <Icon name="Eye" size={16} className="mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onScheduleAppointment(patient)}
            className="flex-1 lg:flex-none lg:w-full"
          >
            <Icon name="Calendar" size={16} className="mr-2" />
            Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateRecords(patient)}
            className="flex-1 lg:flex-none lg:w-full"
          >
            <Icon name="FileEdit" size={16} className="mr-2" />
            Update
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
