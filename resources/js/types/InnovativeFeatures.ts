/**
 * TypeScript types for Innovative Healthcare Features
 * Used across all frontend components
 */

// ===== ARRIVAL CONFIRMATION =====
export interface PractitionerArrivalConfirmation {
  id: number;
  visit_id: number;
  practitioner_id: number;
  confirmed_at: string | null;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  device_info: string;
  arrival_photo_url?: string;
  confirmation_method: 'GPS' | 'manual';
  created_at: string;
  updated_at: string;
}

// ===== SYMPTOM SNAPSHOT =====
export interface SymptomSnapshot {
  id: number;
  appointment_id: string; // UUID
  client_id: number;
  primary_symptom: string;
  symptom_duration_days: number;
  severity_1_to_10: number;
  pain_location?: string;
  symptom_onset_description: string;
  recent_triggers?: string;
  medication_taken?: string;
  created_at: string;
  updated_at: string;
}

// ===== EMERGENCY ESCALATION =====
export interface EmergencyEscalation {
  id: number;
  visit_id: number;
  client_id: number;
  escalation_reason: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  action_taken: string;
  ambulance_called: boolean;
  hospital_name?: string;
  referral_reason: string;
  escalated_to_practitioner_id?: number;
  created_at: string;
  updated_at: string;
}

// ===== MICRO FEEDBACK =====
export interface MicroFeedback {
  id: number;
  visit_id: number;
  client_id: number;
  practitioner_id: number;
  rating_1_to_5: number;
  response_time_rating: number;
  professionalism_rating: number;
  care_quality_rating: number;
  would_recommend: boolean;
  quick_comment?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

// ===== HEALTH ACCESS TOKEN =====
export interface HealthAccessToken {
  id: number;
  token_hash: string;
  client_id: number;
  authorized_entity_id: number;
  authorized_entity_type: 'specialist' | 'insurance' | 'caregiver';
  allowed_record_types: string[]; // ['lab_results', 'prescriptions', 'medical_history', etc]
  expires_at: string;
  revoked_at?: string;
  access_limit?: number;
  access_count: number;
  created_at: string;
  updated_at: string;
}

// ===== TOKEN ACCESS LOG =====
export interface TokenAccessLog {
  id: number;
  token_id: number;
  entity_id: number;
  entity_type: string;
  record_type_accessed: string;
  access_timestamp: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// ===== CARE CODE =====
export interface CareCode {
  id: number;
  visit_id: number;
  client_id: number;
  practitioner_id: number;
  code_hash: string;
  generated_at: string;
  confirmed_at?: string;
  expires_at?: string;
  confirmation_method: 'SMS' | 'USSD' | 'app';
  status: 'active' | 'confirmed' | 'expired' | 'revoked';
  created_at: string;
  updated_at: string;
}

// ===== COMFORT REPORT =====
export interface ComfortReport {
  id: number;
  client_id: number;
  visit_id: number;
  wellness_score_1_to_10: number;
  mood: 'very_poor' | 'poor' | 'neutral' | 'good' | 'excellent';
  physical_discomfort?: string;
  emotional_status?: string;
  sleep_quality_1_to_10?: number;
  appetite_level?: string;
  medication_side_effects?: string;
  any_concerns?: string;
  report_date: string;
  created_at: string;
  updated_at: string;
}

// ===== APPOINTMENT SWAP =====
export interface AppointmentSwap {
  id: number;
  appointment_id: string; // UUID
  current_practitioner_id: number;
  requested_replacement_practitioner_id: number;
  swap_reason: string;
  swap_status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_by_practitioner: boolean;
  approval_reason?: string;
  appointment_new_start_time?: string;
  appointment_new_end_time?: string;
  created_at: string;
  updated_at: string;
}

// ===== VISIT TIMELINE =====
export interface VisitTimeline {
  id: number;
  visit_id: number;
  scheduled_start_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  current_phase: 'scheduled' | 'in_transit' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  phase_timestamps: {
    scheduled?: string;
    in_transit?: string;
    arrived?: string;
    in_progress?: string;
    completed?: string;
    cancelled?: string;
  };
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===== SMART ASSIGNMENT LOG =====
export interface SmartAssignmentLog {
  id: number;
  visit_id: number;
  assigned_practitioner_id: number;
  assignment_algorithm: string; // 'distance-based', 'skill-match', 'availability', 'load-balance'
  match_score_percent: number;
  distance_km?: number;
  skill_match_details?: Record<string, number>; // Skill => score
  availability_match: boolean;
  client_preferences_met: boolean;
  assignment_timestamp: string;
  created_at: string;
  updated_at: string;
}

// ===== POST-VISIT REPORT =====
export interface PostVisitReport {
  id: number;
  visit_id: number;
  practitioner_id: number;
  client_id: number;
  chief_complaint: string;
  vital_signs_recorded: {
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    respiratory_rate?: number;
  };
  examination_findings: string;
  diagnosis: string;
  recommended_treatment?: string;
  medications_prescribed?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
  }>;
  follow_up_date?: string;
  referral_needed: boolean;
  referral_hospital?: string;
  special_instructions?: string;
  client_education_provided?: string;
  next_visit_scheduled?: string;
  created_at: string;
  updated_at: string;
}

// ===== SYSTEM AUDIT LOG =====
export interface SystemAuditLog {
  id: number;
  user_id: number;
  action_type: string; // 'create', 'read', 'update', 'delete', 'export', 'access'
  entity_type: string; // 'client', 'visit', 'medical_record', etc
  entity_id: number | string;
  changes?: Record<string, unknown>; // old => new values
  ip_address: string;
  user_agent: string;
  timestamp: string;
  created_at: string;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

// ===== COMBINED/COMPOSITE TYPES =====
export interface VisitWithActivities {
  id: number;
  client_id: number;
  practitioner_id: number;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  arrival_confirmation?: PractitionerArrivalConfirmation;
  timeline?: VisitTimeline;
  symptom_snapshots?: SymptomSnapshot[];
  emergency_escalations?: EmergencyEscalation[];
  micro_feedbacks?: MicroFeedback[];
  comfort_reports?: ComfortReport[];
  care_codes?: CareCode[];
  post_visit_report?: PostVisitReport;
}

export interface ClientHealthProfile {
  id: number;
  user_id: number;
  recent_visits: VisitWithActivities[];
  access_tokens: HealthAccessToken[];
  comfort_reports: ComfortReport[];
  symptom_snapshots: SymptomSnapshot[];
  emergency_escalations: EmergencyEscalation[];
}

export interface PractitionerStats {
  total_visits: number;
  average_rating: number;
  total_arrivals_confirmed: number;
  emergency_escalations_handled: number;
  swap_requests_pending: number;
  assignments_completed: number;
}

// ===== FORM PAYLOAD TYPES =====
export interface CreateSymptomSnapshotPayload {
  appointment_id: string;
  primary_symptom: string;
  symptom_duration_days: number;
  severity_1_to_10: number;
  pain_location?: string;
  symptom_onset_description: string;
  recent_triggers?: string;
  medication_taken?: string;
}

export interface CreateMicroFeedbackPayload {
  visit_id: number;
  rating_1_to_5: number;
  response_time_rating: number;
  professionalism_rating: number;
  care_quality_rating: number;
  would_recommend: boolean;
  quick_comment?: string;
}

export interface CreateComfortReportPayload {
  visit_id: number;
  wellness_score_1_to_10: number;
  mood: 'very_poor' | 'poor' | 'neutral' | 'good' | 'excellent';
  physical_discomfort?: string;
  emotional_status?: string;
  sleep_quality_1_to_10?: number;
  appetite_level?: string;
  medication_side_effects?: string;
  any_concerns?: string;
}

export interface CreateHealthAccessTokenPayload {
  authorized_entity_id: number;
  authorized_entity_type: 'specialist' | 'insurance' | 'caregiver';
  allowed_record_types: string[];
  expires_at: string;
  access_limit?: number;
}

export interface CreatePostVisitReportPayload {
  visit_id: number;
  chief_complaint: string;
  vital_signs_recorded?: Record<string, unknown>;
  examination_findings: string;
  diagnosis: string;
  recommended_treatment?: string;
  medications_prescribed?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
  }>;
  follow_up_date?: string;
  referral_needed?: boolean;
  referral_hospital?: string;
  special_instructions?: string;
  client_education_provided?: string;
  next_visit_scheduled?: string;
}
