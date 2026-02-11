# Quick Reference - Innovative Healthcare Features

## Feature Summary Matrix

| Feature | Actor | Trigger | Output | Business Value |
|---------|-------|---------|--------|-----------------|
| **Arrival Confirmation** | Client | Visit start | SMS confirmation | Fraud prevention, accountability |
| **Symptom Snapshot** | Client | 2 hrs before | Health baseline | Diagnosis accuracy, care planning |
| **Emergency Escalation** | Client | During visit | Immediate alert | Safety, liability protection |
| **Micro-Feedback** | Client | Every 20 min | Quality rating | Real-time quality monitoring |
| **Health Tokens** | Client | On demand | Time-limited access | Privacy, data control |
| **Care Codes** | Both | Visit end | Billing trigger | Fraud prevention, payment automation |
| **Comfort Reporting** | Client | During/after | Satisfaction metrics | Comfort monitoring, service quality |
| **Appointment Swaps** | Practitioner | On demand | Reassignment | Work-life balance, scheduling optimization |
| **Visit Timeline** | Both | Visit lifecycle | Verified duration | Time fraud prevention, billing accuracy |
| **Smart Assignment** | System | On booking | Recommendation | Better outcomes, resource optimization |
| **Post-Visit Reports** | Practitioner | After visit | Auto follow-ups | Care continuity, engagement |
| **Token Access** | Practitioner | On demand | Audit logs | Data governance, compliance |

## API Endpoint Quick Reference

### Client Activities (Prefix: `/api/client/`)

```
POST    /visits/{visit}/confirm-arrival           - Confirm practitioner arrival
POST    /visits/{visit}/symptom-snapshot          - Submit pre-visit symptoms
GET     /visits/{visit}/symptom-snapshots         - Get symptom history
POST    /visits/{visit}/emergency-escalation      - Trigger emergency alert
GET     /emergencies                              - Get escalation history
POST    /visits/{visit}/micro-feedback            - Submit care quality rating
GET     /visits/{visit}/feedback-history          - Get feedback timeline
POST    /health-tokens                            - Create access token
GET     /health-tokens                            - List client's tokens
PATCH   /health-tokens/{token}/revoke             - Revoke token access
POST    /visits/{visit}/generate-care-code        - Generate completion code
POST    /visits/{visit}/confirm-care-code         - Confirm care completion
GET     /visits/{visit}/completion-proof          - Get billing proof
POST    /visits/{visit}/comfort-report            - Submit comfort/safety rating
GET     /visits/{visit}/comfort-timeline          - Get comfort history
GET     /activity-history                         - Get client activity summary
```

### Practitioner Activities (Prefix: `/api/practitioner/`)

```
POST    /appointments/{appointment}/request-swap  - Request appointment swap
GET     /swap-requests                            - Get pending swap requests
PATCH   /appointment-swaps/{swap}/accept          - Accept swap request
PATCH   /appointment-swaps/{swap}/decline         - Decline swap request
GET     /appointment-swaps/history                - Get swap history
POST    /visits/{visit}/start-visit               - Initiate visit start
POST    /visits/{visit}/confirm-start             - Confirm visit start (client)
POST    /visits/{visit}/end-visit                 - Initiate visit end
POST    /visits/{visit}/confirm-completion        - Confirm visit end (client)
GET     /visits/{visit}/timeline                  - Get visit timeline
GET     /appointments/{appointment}/smart-assignment - Get recommendations
POST    /appointments/{appointment}/assign        - Assign practitioner
POST    /visits/{visit}/post-visit-report         - Submit findings & recommendations
GET     /visits/{visit}/report                    - Get post-visit report
POST    /follow-ups/auto-schedule                 - Auto-schedule follow-up
POST    /health-tokens/request                    - Request health access token
GET     /health-records                           - Get records using token
GET     /activity-history                         - Get practitioner activity summary
```

### Audit & Monitoring (Prefix: `/api/audit/`)

```
GET     /record-access-logs                       - Get health record access logs
GET     /emergency-logs                           - Get emergency escalation logs
GET     /swap-history                             - Get appointment swap history
GET     /visit-validations                        - Get visit timeline logs
```

## SMS Message Templates

### Client-Facing Messages

```
[Arrival Confirmation]
"Dr. {name} has arrived for your visit. Reply YES/NO to confirm."

[Pre-Visit Reminder]
"Your healthcare visit is in 2 hours. Quick symptom check: Rate pain (1-10), temperature, energy. Reply with numbers separated by commas."

[Micro-Feedback Prompt]
"How is your care quality? Reply: 1(Poor) 2(Fair) 3(Good) 4(Excellent)"

[Comfort/Safety Prompt]
"Comfort level (1-5)? Also note safety (1-5). Reply: C:X S:Y"

[Care Code]
"Your visit is complete! Confirm with code: {code} (Valid for 120 minutes)"

[Visit Start Confirmation]
"Dr. {name} is starting your visit. Reply YES to confirm."

[Visit End Confirmation]
"Visit with Dr. {name} is complete. Reply OK to confirm end of service."

[Follow-Up Offer]
"Dr. {name} recommends follow-up on {date}. Reply YES to book or NO to decline."

[Token Created]
"You've granted {entity} access to your health records for {hours} hours. Revoke anytime in app."

[Token Access Notification]
"{entity} accessed your health records ({records}) at {time}. View full audit in app."
```

### Practitioner-Facing Messages

```
[Swap Request]
"Dr. {initiator} requests to swap appointment on {date}. Check app to accept/decline."

[Swap Accepted]
"Dr. {responder} accepted your appointment swap request. Details updated."

[Symptom Update]
"Client symptom update for visit {id}: Pain level: {pain}, Energy: {energy}"

[Feedback Received]
"Care quality feedback: {rating}"

[Safety Concern]
"Safety concern reported: {rating}"

[Emergency Alert]
"EMERGENCY: Client has escalated during your visit {id}"
```

## Common Workflows

### Complete Visit Workflow (With Both Actors)

```
1. BOOKING
   - Client books appointment
   - System runs smart assignment
   - Recommended practitioner assigned
   
2. PRE-VISIT (2 hours before)
   - SMS: Symptom snapshot reminder sent to client
   - Client submits symptoms via USSD/app
   - Symptoms available on practitioner dashboard

3. VISIT START
   - Practitioner: POST /practitioner/visits/{id}/start-visit
   - System: Sends SMS to client for confirmation
   - Client: Replies YES
   - Practitioner: Notified "Client confirmed, begin care"

4. DURING VISIT
   - Every 20 min: SMS quality rating prompt to client
   - Client submits ratings
   - Practitioner: Immediately sees feedback
   - If safety concern: Alert sent to supervisor

5. VISIT END
   - Practitioner: POST /practitioner/visits/{id}/end-visit
   - System: Sends SMS to client for completion confirmation
   - Client: Replies OK
   - System: Records verified visit duration

6. POST-VISIT
   - Practitioner: Submits post-visit report
   - If follow-up needed: System auto-schedules
   - Client: Receives SMS with follow-up offer
   - Client: Can accept/decline follow-up

7. COMPLETION
   - System generates completion proof
   - Triggers billing/payment
   - Audit trail complete with all confirmations
```

### Emergency Escalation Workflow

```
1. Client: POST /client/visits/{id}/emergency-escalation
2. SMS Alert: Sent to practitioner and supervisor
3. Supervisor: Receives alert and can:
   - Call client directly
   - Call emergency services
   - Dispatch backup practitioner
4. Resolution: Supervisor updates escalation status
5. Audit: Complete record with timestamps maintained
```

### Health Token Workflow

```
1. Client: POST /client/health-tokens
   {
     "authorized_entity_id": 5,
     "authorized_entity_type": "specialist",
     "allowed_record_types": ["lab_results", "medical_history"],
     "duration_hours": 48
   }

2. System: Generates token (returned only once)
3. Client: Shares token with specialist securely
4. Specialist: GET /practitioner/health-records?token={token}
5. System: Logs access with timestamp
6. Auto-Expiry: Token invalid after 48 hours
7. Revocation: Client can revoke anytime: PATCH /client/health-tokens/{id}/revoke
```

## Database Quick Lookup

### Most Important Fields by Table

**practitioner_arrival_confirmations**
- `status`: pending, confirmed, timeout
- `confirmed_at`: timestamp of client confirmation
- Key indicator: visit frauds if status = timeout

**symptom_snapshots**
- `pain_level`, `temperature`, `energy_level`
- `submitted_at`: timestamp before visit
- Use for: care planning, baseline comparison

**emergency_escalations**
- `resolution_status`: pending, addressed, escalated
- `escalation_sent_at`, `resolved_at`: response time SLA
- Use for: safety monitoring, liability protection

**micro_feedbacks**
- `quality_rating`: 1-4 scale
- `submitted_at`: during visit timestamp
- Use for: real-time quality monitoring

**health_access_tokens**
- `token_hash`: encrypted for security
- `expires_at`: time-limited access window
- `access_count`: track usage limits
- Use for: data privacy, audit trail

**care_codes**
- `status`: active, confirmed, expired
- `confirmed_at`: billing trigger point
- Use for: fraud prevention, automatic payment

**visit_timelines**
- `practitioner_started_at`: practitioner initiated
- `client_start_confirmed_at`: client confirmed (use for billing)
- `practitioner_ended_at`: practitioner claimed end
- `client_completion_confirmed_at`: client confirmed (verified)
- Key metric: `getVerifiedDurationMinutes()` for billing

**appointment_swaps**
- `status`: pending, accepted, declined
- `responded_at`: response time for SLA tracking
- Use for: workload analysis, practitioner satisfaction

**smart_assignment_logs**
- `match_score`: 0-100
- `recommended_practitioner_id` vs `assigned_practitioner_id`
- `scoring_factors`: JSON with breakdown
- Use for: assignment algorithm tuning

**post_visit_reports**
- `follow_up_needed`: boolean for continuity
- `follow_up_urgency`: routine, urgent, critical
- `auto_scheduled_appointment_id`: auto-booked follow-up
- Use for: care continuity tracking

**system_audit_logs**
- `action`: what changed
- `entity_type`, `entity_id`: what changed
- `old_values`, `new_values`: complete history
- `timestamp`: exact when
- Use for: compliance, dispute resolution

## Key Metrics to Track

### Client Satisfaction
- Average micro-feedback rating (target: 3.5+/4)
- Practitioner arrival confirmation rate (target: 95%+)
- Care completion rate (target: 98%+)

### System Performance
- Emergency response time (SLA: <5 min)
- SMS delivery success rate (target: 99%+)
- API response time (target: <500ms)

### Fraud Detection
- Unconfirmed visits % (target: <2%)
- Visit time discrepancies >30 min (target: 0%)
- Swap request decline rate (monitor for issues)

### Practitioner Performance
- Match score accuracy (recommendation following %)
- Post-visit report submission rate (target: 100%)
- Follow-up scheduling compliance (target: 95%+)

## Troubleshooting Quick Fix

| Issue | Cause | Solution |
|-------|-------|----------|
| SMS not sending | Africa's Talking credentials wrong | Check .env AFRICAS_TALKING_* variables |
| Token expired | Duration too short | Use `duration_hours` parameter or extend |
| Visit not verifying | Client didn't confirm | Check `visit_timelines` for null `client_*_at` fields |
| Swap not showing | Wrong practitioner role | Ensure initiator/responder have practitioner record |
| Smart assignment empty | No practitioners | Check practitioner status = active, specialization match |
| Audit logs missing | Not enabled | Ensure `SystemAuditLog::log()` called in operations |

## Environment Configuration Checklist

```bash
# Required .env variables
AFRICAS_TALKING_USERNAME=     ✓ Get from AT dashboard
AFRICAS_TAKING_API_KEY=        ✓ Get from AT dashboard
AFRICAS_TALKING_SHORT_CODE=    ✓ Get from AT dashboard

# Database
DB_CONNECTION=mysql            ✓ Must be MySQL for spatial queries
DB_HOST=127.0.0.1              ✓ Update for production
DB_PORT=3306
DB_DATABASE=afya_nyumbani
DB_USERNAME=root
DB_PASSWORD=

# Cache (for token caching)
CACHE_DRIVER=redis             ✓ Recommended for performance
QUEUE_CONNECTION=database      ✓ Use for async SMS jobs

# Mail (for alerts)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_USERNAME=
MAIL_PASSWORD=
```

---

**Quick Start:** Run migrations → Configure .env → Test API endpoints → Deploy

**Last Updated:** February 9, 2026
