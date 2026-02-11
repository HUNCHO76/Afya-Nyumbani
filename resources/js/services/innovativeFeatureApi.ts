/**
 * API Service for Innovative Healthcare Features
 * Handles all HTTP requests to backend endpoints
 */

import axios from 'axios';
import {
  PractitionerArrivalConfirmation,
  SymptomSnapshot,
  EmergencyEscalation,
  MicroFeedback,
  HealthAccessToken,
  CareCode,
  ComfortReport,
  AppointmentSwap,
  VisitTimeline,
  SmartAssignmentLog,
  PostVisitReport,
  SystemAuditLog,
  VisitWithActivities,
  CreateSymptomSnapshotPayload,
  CreateMicroFeedbackPayload,
  CreateComfortReportPayload,
  CreateHealthAccessTokenPayload,
  CreatePostVisitReportPayload,
  ApiResponse,
  PaginatedResponse,
} from '@/types/InnovativeFeatures';

const API_BASE_URL = '/api';

// ===== ARRIVAL CONFIRMATION API =====
export const arrivalConfirmationApi = {
  confirmArrival: (visitId: number, latitude: number, longitude: number, accuracy: number) =>
    axios.post<ApiResponse<PractitionerArrivalConfirmation>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/confirm-arrival`,
      { latitude, longitude, accuracy_meters: accuracy }
    ),

  getConfirmation: (visitId: number) =>
    axios.get<ApiResponse<PractitionerArrivalConfirmation>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/arrival-confirmation`
    ),

  uploadArrivalPhoto: (visitId: number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return axios.post<ApiResponse<PractitionerArrivalConfirmation>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/arrival-photo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

// ===== SYMPTOM SNAPSHOT API =====
export const symptomSnapshotApi = {
  create: (payload: CreateSymptomSnapshotPayload) =>
    axios.post<ApiResponse<SymptomSnapshot>>(
      `${API_BASE_URL}/client/appointments/symptom-snapshot`,
      payload
    ),

  getByAppointment: (appointmentId: string) =>
    axios.get<ApiResponse<SymptomSnapshot[]>>(
      `${API_BASE_URL}/client/appointments/${appointmentId}/symptom-snapshots`
    ),

  update: (id: number, payload: Partial<CreateSymptomSnapshotPayload>) =>
    axios.put<ApiResponse<SymptomSnapshot>>(
      `${API_BASE_URL}/client/symptom-snapshots/${id}`,
      payload
    ),
};

// ===== EMERGENCY ESCALATION API =====
export const emergencyEscalationApi = {
  create: (visitId: number, escalationData: any) =>
    axios.post<ApiResponse<EmergencyEscalation>>(
      `${API_BASE_URL}/client/visits/${visitId}/emergency-escalation`,
      escalationData
    ),

  getByVisit: (visitId: number) =>
    axios.get<ApiResponse<EmergencyEscalation[]>>(
      `${API_BASE_URL}/client/visits/${visitId}/emergency-escalations`
    ),

  list: (filters?: any) =>
    axios.get<PaginatedResponse<EmergencyEscalation>>(
      `${API_BASE_URL}/client/emergency-escalations`,
      { params: filters }
    ),
};

// ===== MICRO FEEDBACK API =====
export const microFeedbackApi = {
  create: (payload: CreateMicroFeedbackPayload) =>
    axios.post<ApiResponse<MicroFeedback>>(
      `${API_BASE_URL}/client/visits/${payload.visit_id}/micro-feedback`,
      payload
    ),

  getByVisit: (visitId: number) =>
    axios.get<ApiResponse<MicroFeedback[]>>(
      `${API_BASE_URL}/client/visits/${visitId}/micro-feedbacks`
    ),

  listByClient: () =>
    axios.get<PaginatedResponse<MicroFeedback>>(
      `${API_BASE_URL}/client/micro-feedbacks`
    ),
};

// ===== HEALTH ACCESS TOKEN API =====
export const healthAccessTokenApi = {
  create: (clientId: number, payload: CreateHealthAccessTokenPayload) =>
    axios.post<ApiResponse<HealthAccessToken>>(
      `${API_BASE_URL}/client/${clientId}/health-tokens`,
      payload
    ),

  getMyTokens: () =>
    axios.get<PaginatedResponse<HealthAccessToken>>(
      `${API_BASE_URL}/client/health-tokens`
    ),

  revokeToken: (tokenId: number) =>
    axios.post<ApiResponse<HealthAccessToken>>(
      `${API_BASE_URL}/client/health-tokens/${tokenId}/revoke`
    ),

  getAccessLogs: (tokenId: number) =>
    axios.get<PaginatedResponse<any>>(
      `${API_BASE_URL}/client/health-tokens/${tokenId}/access-logs`
    ),
};

// ===== CARE CODE API =====
export const careCodeApi = {
  generateForVisit: (visitId: number) =>
    axios.post<ApiResponse<CareCode>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/generate-care-code`
    ),

  getByVisit: (visitId: number) =>
    axios.get<ApiResponse<CareCode[]>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/care-codes`
    ),

  confirmCode: (careCodeId: number, code: string) =>
    axios.post<ApiResponse<CareCode>>(
      `${API_BASE_URL}/client/care-codes/${careCodeId}/confirm`,
      { code }
    ),

  revokeCode: (careCodeId: number) =>
    axios.post<ApiResponse<CareCode>>(
      `${API_BASE_URL}/practitioner/care-codes/${careCodeId}/revoke`
    ),
};

// ===== COMFORT REPORT API =====
export const comfortReportApi = {
  create: (payload: CreateComfortReportPayload) =>
    axios.post<ApiResponse<ComfortReport>>(
      `${API_BASE_URL}/client/comfort-reports`,
      payload
    ),

  getRecent: (days: number = 30) =>
    axios.get<PaginatedResponse<ComfortReport>>(
      `${API_BASE_URL}/client/comfort-reports`,
      { params: { days } }
    ),

  getByVisit: (visitId: number) =>
    axios.get<ApiResponse<ComfortReport[]>>(
      `${API_BASE_URL}/client/visits/${visitId}/comfort-reports`
    ),
};

// ===== APPOINTMENT SWAP API =====
export const appointmentSwapApi = {
  requestSwap: (appointmentId: string, replacementPractitionerId: number, reason: string) =>
    axios.post<ApiResponse<AppointmentSwap>>(
      `${API_BASE_URL}/practitioner/appointments/${appointmentId}/request-swap`,
      { requested_replacement_practitioner_id: replacementPractitionerId, swap_reason: reason }
    ),

  getPending: () =>
    axios.get<PaginatedResponse<AppointmentSwap>>(
      `${API_BASE_URL}/practitioner/appointment-swaps`
    ),

  approveSwap: (swapId: number, reason?: string) =>
    axios.post<ApiResponse<AppointmentSwap>>(
      `${API_BASE_URL}/practitioner/appointment-swaps/${swapId}/approve`,
      { approval_reason: reason }
    ),

  rejectSwap: (swapId: number, reason?: string) =>
    axios.post<ApiResponse<AppointmentSwap>>(
      `${API_BASE_URL}/practitioner/appointment-swaps/${swapId}/reject`,
      { approval_reason: reason }
    ),
};

// ===== VISIT TIMELINE API =====
export const visitTimelineApi = {
  getTimeline: (visitId: number) =>
    axios.get<ApiResponse<VisitTimeline>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/timeline`
    ),

  updatePhase: (visitId: number, phase: string) =>
    axios.post<ApiResponse<VisitTimeline>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/update-phase`,
      { current_phase: phase }
    ),

  validatePhase: (visitId: number, phase: string) =>
    axios.post<ApiResponse<{ valid: boolean; errors?: string[] }>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/validate-phase`,
      { phase }
    ),
};

// ===== SMART ASSIGNMENT LOG API =====
export const smartAssignmentApi = {
  getAssignmentLog: (visitId: number) =>
    axios.get<ApiResponse<SmartAssignmentLog>>(
      `${API_BASE_URL}/admin/visits/${visitId}/assignment-log`
    ),

  listAssignments: (filters?: any) =>
    axios.get<PaginatedResponse<SmartAssignmentLog>>(
      `${API_BASE_URL}/admin/smart-assignments`,
      { params: filters }
    ),

  analyzeAssignmentQuality: () =>
    axios.get<ApiResponse<{ average_match_score: number; success_rate: number }>>(
      `${API_BASE_URL}/admin/assignment-analytics`
    ),
};

// ===== POST-VISIT REPORT API =====
export const postVisitReportApi = {
  create: (payload: CreatePostVisitReportPayload) =>
    axios.post<ApiResponse<PostVisitReport>>(
      `${API_BASE_URL}/practitioner/visits/${payload.visit_id}/post-visit-report`,
      payload
    ),

  getByVisit: (visitId: number) =>
    axios.get<ApiResponse<PostVisitReport>>(
      `${API_BASE_URL}/practitioner/visits/${visitId}/post-visit-report`
    ),

  update: (reportId: number, payload: Partial<CreatePostVisitReportPayload>) =>
    axios.put<ApiResponse<PostVisitReport>>(
      `${API_BASE_URL}/practitioner/post-visit-reports/${reportId}`,
      payload
    ),

  exportReport: (reportId: number, format: 'pdf' | 'docx' = 'pdf') =>
    axios.get(`${API_BASE_URL}/practitioner/post-visit-reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    }),
};

// ===== AUDIT LOG API =====
export const auditLogApi = {
  list: (filters?: any) =>
    axios.get<PaginatedResponse<SystemAuditLog>>(
      `${API_BASE_URL}/audit/logs`,
      { params: filters }
    ),

  getByUser: (userId: number, filters?: any) =>
    axios.get<PaginatedResponse<SystemAuditLog>>(
      `${API_BASE_URL}/audit/users/${userId}/logs`,
      { params: filters }
    ),

  detectFraud: (filters?: any) =>
    axios.get<ApiResponse<any>>(
      `${API_BASE_URL}/audit/fraud-detection`,
      { params: filters }
    ),

  exportAuditTrail: (filters?: any) =>
    axios.get(`${API_BASE_URL}/audit/export`, {
      params: filters,
      responseType: 'blob',
    }),
};

// ===== COMBINED/ANALYTICS API =====
export const analyticsApi = {
  getVisitWithActivities: (visitId: number) =>
    axios.get<ApiResponse<VisitWithActivities>>(
      `${API_BASE_URL}/visits/${visitId}/with-activities`
    ),

  getPractitionerStats: (practitionerId: number) =>
    axios.get<ApiResponse<any>>(
      `${API_BASE_URL}/practitioner/${practitionerId}/stats`
    ),

  getClientHealthProfile: (clientId: number) =>
    axios.get<ApiResponse<any>>(
      `${API_BASE_URL}/client/${clientId}/health-profile`
    ),

  getDashboardStats: () =>
    axios.get<ApiResponse<any>>(
      `${API_BASE_URL}/dashboard/stats`
    ),
};

export default {
  arrivalConfirmation: arrivalConfirmationApi,
  symptomSnapshot: symptomSnapshotApi,
  emergencyEscalation: emergencyEscalationApi,
  microFeedback: microFeedbackApi,
  healthAccessToken: healthAccessTokenApi,
  careCode: careCodeApi,
  comfortReport: comfortReportApi,
  appointmentSwap: appointmentSwapApi,
  visitTimeline: visitTimelineApi,
  smartAssignment: smartAssignmentApi,
  postVisitReport: postVisitReportApi,
  auditLog: auditLogApi,
  analytics: analyticsApi,
};
