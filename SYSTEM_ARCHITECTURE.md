# System Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                              │
├──────────────┬──────────────┬──────────────┬──────────────────────────┤
│  Mobile App  │  Web Browser │  USSD Menu   │  SMS Reply (Feature Phone)│
│   (React)    │   (React)    │ (AT Gateway) │    (AT Gateway)          │
└──────────────┴──────────────┴──────────────┴──────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LARAVEL 12.0 REST API                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐        ┌──────────────────────┐           │
│  │ CLIENT ACTIVITY      │        │ PRACTITIONER ACTIVITY│           │
│  │ CONTROLLER           │        │ CONTROLLER           │           │
│  ├──────────────────────┤        ├──────────────────────┤           │
│  │ • Arrival Confirm    │        │ • Appointment Swaps  │           │
│  │ • Symptom Snapshot   │        │ • Visit Timeline     │           │
│  │ • Emergency Escalate │        │ • Smart Assignment   │           │
│  │ • Micro-Feedback     │        │ • Post-Visit Report  │           │
│  │ • Health Tokens      │        │ • Token Requests     │           │
│  │ • Care Codes         │        └──────────────────────┘           │
│  │ • Comfort Reports    │                                            │
│  └──────────────────────┘        ┌──────────────────────┐           │
│                                  │  AUDIT CONTROLLER    │           │
│        ┌──────────────────────┐  ├──────────────────────┤           │
│        │ SERVICE LAYER        │  │ • Access Logs        │           │
│        ├──────────────────────┤  │ • Emergency Logs     │           │
│        │ • SMS Service        │  │ • Swap History       │           │
│        │ • Health Data Access │  │ • Visit Validations  │           │
│        │ • Encryption Utils   │  │ • Fraud Detection    │           │
│        └──────────────────────┘  └──────────────────────┘           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  MySQL DATABASE  │      │  AFRICA'S TALKING │      │  CACHE (Redis)   │
├──────────────────┤      │      API          │      ├──────────────────┤
│ • Visits         │      ├──────────────────┤      │ • Tokens          │
│ • Appointments   │      │ • SMS Sending     │      │ • Ratings         │
│ • Confirmations  │      │ • USSD Gateway    │      │ • Assignment      │
│ • Feedback       │      │ • Voice Calls     │      │ • Session Data    │
│ • Tokens         │      │ • Airtime Topup   │      └──────────────────┘
│ • Audit Logs     │      └──────────────────┘
│ • More (13 tables)│
└──────────────────┘
```

## Data Flow: Complete Visit Workflow

```
VISIT LIFECYCLE WITH DATA FLOW
═══════════════════════════════════════════════════════════════════

1. BOOKING PHASE
   ┌────────────────┐
   │ Client Books   │─────────> [CREATE Appointment]
   │ Appointment    │           └─> Smart Assignment Algorithm
   │ with Symptoms  │               • Score all practitioners
   └────────────────┘               • Recommend best match
                                    └─> [CREATE SmartAssignmentLog]

2. PRE-VISIT PHASE (2 hrs before)
   ┌────────────────┐
   │ System Sends   │─────────> SMS: "Rate your symptoms 1-10"
   │ Reminder SMS   │
   └────────────────┘     ▼
   ┌────────────────┐
   │ Client Replies │─────────> [CREATE SymptomSnapshot]
   │ with Symptoms  │           └─> Notify practitioner via SMS
   └────────────────┘

3. VISIT START
   ┌────────────────┐
   │ Practitioner   │─────────> [CREATE VisitTimeline]
   │ Starts Visit   │           └─> Set practitioner_started_at
   │ (App)          │
   └────────────────┘     ▼
                     SMS to Client: "Dr. X arrived, confirm YES/NO"
                                        │
                     ┌──────────────────┘
                     ▼
   ┌────────────────┐
   │ Client         │─────────> [UPDATE VisitTimeline]
   │ Confirms       │           └─> Set client_start_confirmed_at
   │ Arrival        │           [CREATE PractitionerArrivalConfirmation]
   └────────────────┘

4. DURING VISIT (Every 20 minutes)
   ┌────────────────┐
   │ System Sends   │─────────> SMS: "Care quality? 1(Poor) 4(Excellent)"
   │ Quality Prompt │
   └────────────────┘     ▼
   ┌────────────────┐
   │ Client         │─────────> [CREATE MicroFeedback]
   │ Submits Rating │           └─> Notify practitioner real-time
   └────────────────┘

   Optional: Safety/Comfort Concerns
   ┌────────────────┐
   │ Client Has     │─────────> [CREATE ComfortReport]
   │ Safety Concern │           or [CREATE EmergencyEscalation]
   └────────────────┘           └─> Alert supervisor immediately

5. VISIT END
   ┌────────────────┐
   │ Practitioner   │─────────> [UPDATE VisitTimeline]
   │ Ends Visit     │           └─> Set practitioner_ended_at
   │ (App)          │
   └────────────────┘     ▼
                     SMS to Client: "Visit complete, confirm OK"
                                        │
                     ┌──────────────────┘
                     ▼
   ┌────────────────┐
   │ Client         │─────────> [UPDATE VisitTimeline]
   │ Confirms End   │           └─> Set client_completion_confirmed_at
   │ (SMS/App)      │           [CREATE CareCode (if not SMS)]
   └────────────────┘

6. BILLING TRIGGER
   ┌────────────────┐
   │ Care Code or   │─────────> Trigger Billing Event
   │ Visit Confirm  │           └─> Payment Processing Initiated
   └────────────────┘           [CREATE Payment Record]

7. POST-VISIT REPORTING
   ┌────────────────┐
   │ Practitioner   │─────────> [CREATE PostVisitReport]
   │ Submits        │           ├─> Findings
   │ Report         │           ├─> Treatments
   │ (App)          │           ├─> Recommendations
   └────────────────┘           └─> Follow-up Decision
                                        │
                     ┌──────────────────┘
                     ▼ (if follow-up needed)
   ┌────────────────┐
   │ System Auto-   │─────────> [CREATE Appointment] (follow-up)
   │ Schedules      │           SMS: "Follow-up scheduled {date}"
   │ Follow-up      │
   └────────────────┘     ▼
   ┌────────────────┐
   │ Client         │─────────> Update PostVisitReport.
   │ Confirms or    │           auto_scheduled_appointment_id
   │ Declines       │
   └────────────────┘

8. AUDIT TRAIL
   ┌────────────────┐
   │ All Actions    │─────────> [INSERT SystemAuditLog]
   │ Throughout     │           └─> Complete record with
   │ Workflow       │               • Who
   │                │               • What
   │                │               • When
   │                │               • IP Address
   └────────────────┘               • Changes
```

## Data Access Token Flow

```
HEALTH RECORD TOKEN WORKFLOW
═══════════════════════════════════════════════════════════════════

1. TOKEN CREATION
   ┌─────────────────┐
   │ Client Wants    │
   │ to Share Data   │─────────> [CREATE HealthAccessToken]
   │ with Specialist │           ├─> Generate random token
   │                 │           ├─> Hash token for storage
   └─────────────────┘           ├─> Set expiry (48 hrs)
                                 ├─> Set record types allowed
                                 └─> Return token (once only)
                                        │
                          Client shares token securely
                                        │
                                        ▼

2. TOKEN VALIDATION & ACCESS
   ┌─────────────────┐
   │ Specialist      │
   │ Requests        │─────────> GET /health-records?token={token}
   │ Health Records  │
   └─────────────────┘     ▼
                     ┌──────────────────────────┐
                     │ VALIDATE TOKEN           │
                     ├──────────────────────────┤
                     │ ✓ Token exists           │
                     │ ✓ Not revoked            │
                     │ ✓ Not expired            │
                     │ ✓ Access limit not hit   │
                     │ ✓ Record types match     │
                     └──────────────────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────┐
                     │ FETCH RECORDS            │
                     ├──────────────────────────┤
                     │ Only allowed types       │
                     │ For this client          │
                     │ Latest 10-50 records     │
                     └──────────────────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────┐
                     │ LOG ACCESS               │
                     ├──────────────────────────┤
                     │ [INSERT TokenAccessLog]  │
                     │ • Token ID               │
                     │ • Specialist ID          │
                     │ • Timestamp              │
                     │ • IP Address             │
                     │ • User Agent             │
                     │ Increment access_count   │
                     └──────────────────────────┘
                                    │
                                    ▼
                     Return records to specialist

3. TOKEN MANAGEMENT
   a) AUTO-EXPIRY
      ┌─────────────────┐
      │ Token Created   │
      │ + 48 hours      │─────────> Token invalid
      │ = Expires       │           Specialist cannot access
      └─────────────────┘

   b) CLIENT REVOCATION
      ┌─────────────────┐
      │ Client          │
      │ Revokes Token   │─────────> [UPDATE HealthAccessToken]
      │ (Anytime)       │           └─> Set revoked_at = now()
      └─────────────────┘           Token invalid immediately
                                    SMS: "Access revoked for {entity}"

4. AUDIT TRAIL
   ┌─────────────────┐
   │ All Token       │
   │ Activities      │─────────> Complete logs in:
   │ Tracked         │           • TokenAccessLog (what was accessed)
   └─────────────────┘           • SystemAuditLog (who accessed)
                                 • Client can see all access
                                 • Specialist cannot hide access
```

## Emergency Escalation Flow

```
EMERGENCY ESCALATION WORKFLOW
═══════════════════════════════════════════════════════════════════

1. ESCALATION TRIGGER
   ┌─────────────────┐
   │ Client Feels    │
   │ Unsafe or       │─────────> [CREATE EmergencyEscalation]
   │ Health Crisis   │           ├─> Visit ID
   │ During Visit    │           ├─> Client ID
   └─────────────────┘           ├─> Practitioner ID
                                 ├─> escalation_sent_at = now()
                                 └─> status = 'pending'

2. IMMEDIATE ALERTS
   ┌─────────────────┐
   │ System Sends    │
   │ Simultaneous    │────┬──────> SMS Practitioner
   │ Alerts          │    │        "EMERGENCY: Client escalated"
   │                 │    │
   └─────────────────┘    ├──────> SMS Supervisor
                          │        "EMERGENCY ESCALATION: {reason}"
                          │
                          └──────> SMS Backup Practitioner
                                   "EMERGENCY: Support needed at {address}"

3. RESPONSE TRACKING
   ┌──────────────────────────────────────────┐
   │ Supervisor/Personnel:                    │
   │ 1. Receives alert (SMS)                  │
   │ 2. Calls client immediately              │
   │ 3. Assesses situation                    │
   │ 4. Decides next action                   │
   └──────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   Manage Here    Dispatch Backup  Call Ambulance
   [UPDATE to     [CREATE New      [UPDATE to
    'addressed']   Visit + Alert]   'escalated_to_
                                     emergency']

4. AUDIT & SLA TRACKING
   ┌──────────────────────────────────────────┐
   │ [UPDATE EmergencyEscalation]             │
   │ ├─> responding_personnel_id = User ID   │
   │ ├─> resolved_at = now()                 │
   │ ├─> resolution_status = resolved        │
   │ ├─> resolution_notes = "..."            │
   │ └─> Response Time = SLA Metric          │
   │     (Target: < 5 minutes)               │
   └──────────────────────────────────────────┘

5. FOLLOW-UP
   After resolution:
   ├─> Client notified of outcome
   ├─> Incident recorded in system
   ├─> Supervisor reviews escalation
   ├─> Visit status updated
   └─> Follow-up care may be scheduled
```

## Database Relationship Diagram

```
                        CORE ENTITIES
                        ═════════════
                            
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   USERS      │         │   CLIENTS    │         │ PRACTITIONERS│
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id           │◄────────│ user_id (FK) │         │ user_id (FK) │
│ name         │         │ phone        │         │ license      │
│ email        │         │ address      │         │ specialization
│ phone        │         │ insurance    │         │ is_active    │
│ role         │         └──────────────┘         └──────────────┘
└──────────────┘                │                         │
                                │ has many                │ has many
                                ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │ APPOINTMENTS │◄────────┤  VISITS      │
                        ├──────────────┤         ├──────────────┤
                        │ id           │         │ id           │
                        │ patient_id   │         │ booking_id   │
                        │ practitioner │         │ patient_id   │
                        │ status       │         │ practitioner │
                        │ appointment_ │         │ check_in_time│
                        │ date/time    │         │ check_out    │
                        └──────────────┘         └──────────────┘
                                │                         │
                                │ has one                 │ has many
                                ▼                         ▼
INNOVATION TABLES FOR THIS VISIT/APPOINTMENT:
├─> PractitionerArrivalConfirmation
├─> SymptomSnapshot
├─> EmergencyEscalation
├─> MicroFeedback
├─> ComfortReport
├─> CareCode
├─> VisitTimeline
├─> PostVisitReport
├─> SmartAssignmentLog
└─> AppointmentSwap

CROSS-CUTTING TABLES:
├─> HealthAccessToken (Client → Entity)
├─> TokenAccessLog (Who accessed what when)
└─> SystemAuditLog (All system changes)
```

## API Endpoint Organization

```
REST API STRUCTURE
═══════════════════════════════════════════════════════════════════

/api/

├── /client/                    (Client Activity Endpoints)
│   ├── /visits/{id}/confirm-arrival
│   ├── /visits/{id}/symptom-snapshot
│   ├── /visits/{id}/emergency-escalation
│   ├── /visits/{id}/micro-feedback
│   ├── /visits/{id}/comfort-report
│   ├── /visits/{id}/generate-care-code
│   ├── /visits/{id}/confirm-care-code
│   ├── /health-tokens
│   ├── /health-tokens/{id}/revoke
│   └── /activity-history
│
├── /practitioner/              (Practitioner Activity Endpoints)
│   ├── /appointments/{id}/request-swap
│   ├── /appointment-swaps/{id}/accept
│   ├── /appointment-swaps/{id}/decline
│   ├── /visits/{id}/start-visit
│   ├── /visits/{id}/end-visit
│   ├── /visits/{id}/post-visit-report
│   ├── /appointments/{id}/smart-assignment
│   ├── /health-tokens/request
│   └── /activity-history
│
├── /audit/                     (Audit & Monitoring)
│   ├── /record-access-logs
│   ├── /emergency-logs
│   ├── /swap-history
│   └── /visit-validations
│
└── /existing/                  (Existing API Routes)
    ├── /users
    ├── /practitioners
    ├── /patients
    └── /me
```

---

**Architecture Version:** 1.0
**Last Updated:** February 9, 2026
**Status:** ✅ Production Ready
