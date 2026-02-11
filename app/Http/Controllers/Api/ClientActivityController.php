<?php

namespace App\Http\Controllers\Api;

use App\Models\Visit;
use App\Models\PractitionerArrivalConfirmation;
use App\Models\SymptomSnapshot;
use App\Models\EmergencyEscalation;
use App\Models\MicroFeedback;
use App\Models\ComfortReport;
use App\Models\CareCode;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientActivityController extends BaseController
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Confirm practitioner arrival
     */
    public function confirmArrival(Request $request, Visit $visit): JsonResponse
    {
        $validated = $request->validate([
            'confirmation_method' => 'required|in:SMS,USSD,app',
            'response' => 'required|in:yes,no,confirm',
        ]);

        $confirmation = PractitionerArrivalConfirmation::where('visit_id', $visit->id)
            ->where('status', 'pending')
            ->firstOrFail();

        if ($validated['response'] === 'yes' || $validated['response'] === 'confirm') {
            $confirmation->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmation_method' => $validated['confirmation_method'],
            ]);

            // Log in audit trail
            \App\Models\SystemAuditLog::log(
                auth()->user(),
                'arrival_confirmed',
                'Visit',
                $visit->id
            );

            return $this->sendResponse(
                $confirmation->load('visit', 'client', 'practitioner'),
                'Practitioner arrival confirmed'
            );
        }

        // If client rejects, send alert to supervisor
        $confirmation->update(['status' => 'rejected']);
        $this->smsService->sendAlert(
            $visit->practitioner->user->phone,
            "Client rejected your arrival. Please contact supervisor."
        );

        return $this->sendError('Arrival confirmation rejected', 400);
    }

    /**
     * Submit symptom snapshot
     */
    public function submitSymptomSnapshot(Request $request, Visit $visit): JsonResponse
    {
        $validated = $request->validate([
            'pain_level' => 'nullable|integer|min:1|max:10',
            'temperature' => 'nullable|in:high,normal,low',
            'energy_level' => 'nullable|in:low,moderate,high',
            'recent_medication' => 'nullable|boolean',
            'new_concerns' => 'nullable|string|max:500',
        ]);

        $snapshot = SymptomSnapshot::create([
            'visit_id' => $visit->id,
            'client_id' => auth()->user()->client->id,
            'appointment_id' => $visit->booking->appointment_id,
            'submitted_at' => now(),
            ...$validated,
        ]);

        // Notify practitioner
        $this->smsService->send(
            $visit->practitioner->user->phone,
            "Client symptom update for visit {$visit->id}: {$snapshot->getHealthStatusSummary()}"
        );

        return $this->sendResponse(
            $snapshot,
            'Symptom snapshot submitted',
            201
        );
    }

    /**
     * Trigger emergency escalation
     */
    public function triggerEmergencyEscalation(Request $request, Visit $visit): JsonResponse
    {
        $validated = $request->validate([
            'escalation_reason' => 'nullable|string|max:500',
        ]);

        $escalation = EmergencyEscalation::create([
            'visit_id' => $visit->id,
            'client_id' => auth()->user()->client->id,
            'practitioner_id' => $visit->practitioner_id,
            'escalation_reason' => $validated['escalation_reason'] ?? 'Client triggered emergency',
            'escalation_sent_at' => now(),
            'resolution_status' => 'pending',
        ]);

        // Send immediate alerts
        $this->smsService->sendAlert(
            $visit->practitioner->user->phone,
            "EMERGENCY: Client has escalated during your visit {$visit->id}"
        );

        // Alert supervisor
        $supervisor = \App\Models\User::where('role', 'admin')->first();
        if ($supervisor) {
            $this->smsService->sendAlert(
                $supervisor->phone,
                "EMERGENCY ESCALATION: Visit {$visit->id} - {$validated['escalation_reason']}"
            );
        }

        return $this->sendResponse(
            $escalation->load('visit', 'client', 'practitioner'),
            'Emergency escalation triggered - Supervisor alerted',
            201
        );
    }

    /**
     * Submit micro-feedback
     */
    public function submitMicroFeedback(Request $request, Visit $visit): JsonResponse
    {
        $validated = $request->validate([
            'quality_rating' => 'required|integer|min:1|max:4',
            'comments' => 'nullable|string|max:500',
        ]);

        $feedback = MicroFeedback::create([
            'visit_id' => $visit->id,
            'client_id' => auth()->user()->client->id,
            'practitioner_id' => $visit->practitioner_id,
            'submitted_at' => now(),
            ...$validated,
        ]);

        // Notify practitioner
        $this->smsService->send(
            $visit->practitioner->user->phone,
            "Care quality feedback: {$feedback->getRatingLabel()}"
        );

        return $this->sendResponse(
            $feedback,
            'Feedback submitted',
            201
        );
    }

    /**
     * Generate health access token
     */
    public function generateHealthAccessToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'authorized_entity_id' => 'required|integer',
            'authorized_entity_type' => 'required|in:specialist,insurance,caregiver',
            'allowed_record_types' => 'required|array',
            'allowed_record_types.*' => 'string',
            'duration_hours' => 'nullable|integer|min:1|max:720',
        ]);

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $accessToken = \App\Models\HealthAccessToken::create([
            'token_hash' => $tokenHash,
            'client_id' => auth()->user()->client->id,
            'authorized_entity_id' => $validated['authorized_entity_id'],
            'authorized_entity_type' => $validated['authorized_entity_type'],
            'allowed_record_types' => $validated['allowed_record_types'],
            'created_at' => now(),
            'expires_at' => now()->addHours($validated['duration_hours'] ?? 48),
        ]);

        return $this->sendResponse(
            [
                'id' => $accessToken->id,
                'token' => $token, // Only returned once
                'expires_at' => $accessToken->expires_at,
                'allowed_record_types' => $accessToken->allowed_record_types,
            ],
            'Health access token generated',
            201
        );
    }

    /**
     * Generate care completion code
     */
    public function generateCareCode(Request $request, Visit $visit): JsonResponse
    {
        // Verify practitioner is the one ending visit
        if ($visit->practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        $code = strtoupper(bin2hex(random_bytes(6)));
        $codeHash = hash('sha256', $code);

        $careCode = CareCode::create([
            'visit_id' => $visit->id,
            'client_id' => $visit->patient->client_id ?? $visit->patient->user->client->id,
            'practitioner_id' => $visit->practitioner_id,
            'code_hash' => $codeHash,
            'generated_at' => now(),
            'expires_at' => now()->addHours(2),
            'status' => 'active',
        ]);

        // Send code to client via SMS
        $client = $careCode->client;
        $this->smsService->send(
            $client->user->phone,
            "Visit complete! Confirm with code: {$code}"
        );

        return $this->sendResponse(
            [
                'id' => $careCode->id,
                'code' => $code, // For display in dashboard
                'expires_at' => $careCode->expires_at,
            ],
            'Care code generated',
            201
        );
    }

    /**
     * Confirm care code
     */
    public function confirmCareCode(Request $request, Visit $visit): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'confirmation_method' => 'required|in:SMS,USSD,app',
        ]);

        $codeHash = hash('sha256', $validated['code']);
        $careCode = CareCode::where('code_hash', $codeHash)
            ->where('visit_id', $visit->id)
            ->where('expires_at', '>', now())
            ->where('status', 'active')
            ->firstOrFail();

        $careCode->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'confirmation_method' => $validated['confirmation_method'],
        ]);

        // Trigger billing/payment
        event(new \App\Events\VisitCompletionConfirmed($visit));

        return $this->sendResponse(
            $careCode,
            'Visit completion confirmed - Billing triggered'
        );
    }

    /**
     * Submit comfort report
     */
    public function submitComfortReport(Request $request, Visit $visit): JsonResponse
    {
        $validated = $request->validate([
            'comfort_rating' => 'required|integer|min:1|max:5',
            'safety_rating' => 'required|integer|min:1|max:5',
            'concern_description' => 'nullable|string|max:500',
        ]);

        $report = ComfortReport::create([
            'visit_id' => $visit->id,
            'client_id' => auth()->user()->client->id,
            'practitioner_id' => $visit->practitioner_id,
            'submitted_at' => now(),
            'resolution_status' => 'pending',
            ...$validated,
        ]);

        // Alert if safety concern
        if ($validated['safety_rating'] <= 2) {
            $this->smsService->sendAlert(
                $visit->practitioner->user->phone,
                "Safety concern reported: {$report->getSafetyLabel()}"
            );
        }

        return $this->sendResponse(
            $report,
            'Comfort report submitted',
            201
        );
    }

    /**
     * Get client activity history
     */
    public function getActivityHistory(Request $request): JsonResponse
    {
        $client = auth()->user()->client;

        $activities = [
            'recent_visits' => Visit::where('patient.client_id', $client->id)
                ->with('practitioner', 'booking')
                ->latest()
                ->limit(10)
                ->get(),
            'pending_confirmations' => PractitionerArrivalConfirmation::where('client_id', $client->id)
                ->where('status', 'pending')
                ->with('visit', 'practitioner')
                ->get(),
            'active_tokens' => \App\Models\HealthAccessToken::where('client_id', $client->id)
                ->where('revoked_at', null)
                ->where('expires_at', '>', now())
                ->get(),
            'feedback_ratings' => MicroFeedback::where('client_id', $client->id)
                ->latest()
                ->limit(20)
                ->get(),
        ];

        return $this->sendResponse($activities, 'Client activity history retrieved');
    }
}
