<?php

namespace App\Http\Controllers\Api;

use App\Models\Appointment;
use App\Models\AppointmentSwap;
use App\Models\PostVisitReport;
use App\Models\Visit;
use App\Models\VisitTimeline;
use App\Models\SmartAssignmentLog;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PractitionerActivityController extends BaseController
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Request appointment swap
     */
    public function requestAppointmentSwap(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'swap_reason' => 'required|string|max:500',
        ]);

        // Verify requester is the assigned practitioner
        if ($appointment->practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        // Find available practitioners with same specialty
        $availablePractitioners = \App\Models\Practitioner::where('specialization', $appointment->practitioner->specialization)
            ->where('id', '!=', $appointment->practitioner_id)
            ->where('is_active', true)
            ->limit(10)
            ->get();

        if ($availablePractitioners->isEmpty()) {
            return $this->sendError('No available practitioners for swap', 404);
        }

        $swaps = [];
        foreach ($availablePractitioners as $practitioner) {
            $swap = AppointmentSwap::create([
                'initiator_practitioner_id' => auth()->user()->practitioner->id,
                'responder_practitioner_id' => $practitioner->id,
                'appointment_id' => $appointment->id,
                'swap_reason' => $validated['swap_reason'],
                'requested_at' => now(),
                'status' => 'pending',
            ]);

            // Notify responder
            $this->smsService->send(
                $practitioner->user->phone,
                "Swap request from {$appointment->practitioner->user->name} for appointment on {$appointment->appointment_date}. Check app for details."
            );

            $swaps[] = $swap;
        }

        return $this->sendResponse(
            $swaps,
            'Swap requests sent to available practitioners',
            201
        );
    }

    /**
     * Accept appointment swap
     */
    public function acceptAppointmentSwap(Request $request, AppointmentSwap $swap): JsonResponse
    {
        // Verify responder is authenticated user
        if ($swap->responder_practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        $swap->update([
            'status' => 'accepted',
            'responded_at' => now(),
            'completed_at' => now(),
        ]);

        // Update appointment
        $swap->appointment->update([
            'practitioner_id' => $swap->responder_practitioner_id,
        ]);

        // Notify all parties
        $this->smsService->send(
            $swap->initiator->user->phone,
            "Your swap request was accepted by {$swap->responder->user->name}"
        );

        // Notify client
        $client = $swap->appointment->patient->user;
        $this->smsService->send(
            $client->phone,
            "Your appointment practitioner has changed to Dr. {$swap->responder->user->name}"
        );

        // Log event
        \App\Models\SystemAuditLog::log(
            auth()->user(),
            'appointment_swap_accepted',
            'Appointment',
            $swap->appointment_id
        );

        return $this->sendResponse(
            $swap->load('appointment', 'initiator', 'responder'),
            'Appointment swap accepted'
        );
    }

    /**
     * Decline appointment swap
     */
    public function declineAppointmentSwap(Request $request, AppointmentSwap $swap): JsonResponse
    {
        if ($swap->responder_practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        $swap->update([
            'status' => 'declined',
            'responded_at' => now(),
        ]);

        $this->smsService->send(
            $swap->initiator->user->phone,
            "Your swap request for {$swap->appointment->appointment_date} was declined"
        );

        return $this->sendResponse($swap, 'Swap request declined');
    }

    /**
     * Start visit with client confirmation
     */
    public function startVisit(Request $request, Visit $visit): JsonResponse
    {
        if ($visit->practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        // Create or update visit timeline
        $timeline = VisitTimeline::firstOrCreate(
            ['visit_id' => $visit->id],
            ['practitioner_started_at' => now()]
        );

        $timeline->update(['practitioner_started_at' => now()]);

        // Send confirmation SMS to client
        $client = $visit->patient->user;
        $this->smsService->send(
            $client->phone,
            "Dr. {$visit->practitioner->user->name} is starting your visit. Reply YES to confirm."
        );

        return $this->sendResponse(
            $timeline,
            'Visit started - Client confirmation requested',
            201
        );
    }

    /**
     * Confirm visit start (client response)
     */
    public function confirmVisitStart(Request $request, Visit $visit): JsonResponse
    {
        $timeline = VisitTimeline::where('visit_id', $visit->id)->firstOrFail();

        $timeline->update(['client_start_confirmed_at' => now()]);

        // Notify practitioner
        $this->smsService->send(
            $visit->practitioner->user->phone,
            "Client confirmed visit start. Begin care procedures."
        );

        return $this->sendResponse($timeline, 'Visit start confirmed by client');
    }

    /**
     * End visit
     */
    public function endVisit(Request $request, Visit $visit): JsonResponse
    {
        if ($visit->practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        $timeline = VisitTimeline::where('visit_id', $visit->id)->firstOrFail();
        $timeline->update(['practitioner_ended_at' => now()]);

        // Calculate duration if possible
        if ($timeline->client_start_confirmed_at) {
            $timeline->update([
                'duration_minutes' => $timeline->client_start_confirmed_at->diffInMinutes(now()),
            ]);
        }

        // Request completion confirmation from client
        $client = $visit->patient->user;
        $this->smsService->send(
            $client->phone,
            "Visit with Dr. {$visit->practitioner->user->name} is complete. Reply OK to confirm."
        );

        return $this->sendResponse($timeline, 'Visit ended - Awaiting client confirmation');
    }

    /**
     * Confirm visit completion (client response)
     */
    public function confirmVisitCompletion(Request $request, Visit $visit): JsonResponse
    {
        $timeline = VisitTimeline::where('visit_id', $visit->id)->firstOrFail();
        $timeline->update(['client_completion_confirmed_at' => now()]);

        $visit->update(['status' => 'completed']);

        return $this->sendResponse(
            $timeline,
            'Visit completion confirmed'
        );
    }

    /**
     * Get smart assignment recommendation
     */
    public function getSmartAssignment(Request $request, Appointment $appointment): JsonResponse
    {
        $matchScores = $this->calculatePractitionerMatches($appointment);

        if (empty($matchScores)) {
            return $this->sendError('No suitable practitioners found', 404);
        }

        // Sort by score descending
        usort($matchScores, fn($a, $b) => $b['score'] <=> $a['score']);

        return $this->sendResponse(
            [
                'recommended' => array_slice($matchScores, 0, 3),
                'scoring_factors' => $this->getScorningFactors(),
            ],
            'Smart assignment recommendations'
        );
    }

    /**
     * Assign practitioner (manual or auto-confirm recommendation)
     */
    public function assignPractitioner(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'practitioner_id' => 'required|exists:practitioners,id',
        ]);

        // Calculate match score for assigned practitioner
        $matches = $this->calculatePractitionerMatches($appointment);
        $assignedMatch = collect($matches)->firstWhere('practitioner_id', $validated['practitioner_id']);
        $matchScore = $assignedMatch['score'] ?? 0;

        // Find recommended (highest score)
        $recommendedMatch = collect($matches)->sortByDesc('score')->first();

        SmartAssignmentLog::create([
            'appointment_id' => $appointment->id,
            'recommended_practitioner_id' => $recommendedMatch['practitioner_id'] ?? $validated['practitioner_id'],
            'assigned_practitioner_id' => $validated['practitioner_id'],
            'match_score' => $matchScore,
            'scoring_factors' => $assignedMatch['factors'] ?? [],
            'assignment_timestamp' => now(),
        ]);

        $appointment->update(['practitioner_id' => $validated['practitioner_id']]);

        return $this->sendResponse(
            $appointment->load('practitioner'),
            'Practitioner assigned'
        );
    }

    /**
     * Submit post-visit report
     */
    public function submitPostVisitReport(Request $request, Visit $visit): JsonResponse
    {
        if ($visit->practitioner_id !== auth()->user()->practitioner->id) {
            return $this->sendError('Unauthorized', 403);
        }

        $validated = $request->validate([
            'findings' => 'required|string',
            'treatments_provided' => 'required|string',
            'recommendations' => 'required|string',
            'follow_up_needed' => 'nullable|boolean',
            'follow_up_urgency' => 'nullable|in:routine,urgent,critical',
            'follow_up_interval_days' => 'nullable|integer|min:1',
        ]);

        $report = PostVisitReport::create([
            'visit_id' => $visit->id,
            'practitioner_id' => $visit->practitioner_id,
            'submitted_at' => now(),
            ...$validated,
        ]);

        // Auto-schedule follow-up if needed
        if ($validated['follow_up_needed'] ?? false) {
            $followUpDate = now()->addDays($validated['follow_up_interval_days'] ?? 7);
            
            $followUpAppointment = Appointment::create([
                'patient_id' => $visit->patient_id,
                'practitioner_id' => $visit->practitioner_id,
                'service_type' => 'Follow-up: ' . $visit->booking->service->name,
                'appointment_date' => $followUpDate->format('Y-m-d'),
                'appointment_time' => $followUpDate->format('H:i'),
                'status' => 'pending',
                'payment_status' => 'pending',
                'notes' => $validated['recommendations'],
            ]);

            $report->update(['auto_scheduled_appointment_id' => $followUpAppointment->id]);

            // Notify client
            $this->smsService->send(
                $visit->patient->user->phone,
                "Follow-up appointment scheduled for {$followUpDate->format('M d, Y')} at {$followUpDate->format('h:i A')}"
            );
        }

        return $this->sendResponse(
            $report->load('visit', 'autoScheduledAppointment'),
            'Post-visit report submitted',
            201
        );
    }

    /**
     * Request health access token (practitioner initiates)
     */
    public function requestHealthAccessToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'allowed_record_types' => 'required|array',
            'allowed_record_types.*' => 'string',
            'duration_hours' => 'nullable|integer|min:1|max:72',
        ]);

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $accessToken = \App\Models\HealthAccessToken::create([
            'token_hash' => $tokenHash,
            'client_id' => $validated['client_id'],
            'authorized_entity_id' => auth()->user()->practitioner->id,
            'authorized_entity_type' => 'practitioner',
            'allowed_record_types' => $validated['allowed_record_types'],
            'created_at' => now(),
            'expires_at' => now()->addHours($validated['duration_hours'] ?? 2),
        ]);

        return $this->sendResponse(
            [
                'id' => $accessToken->id,
                'token' => $token,
                'expires_at' => $accessToken->expires_at,
            ],
            'Health access token created',
            201
        );
    }

    /**
     * Get practitioner activity history
     */
    public function getActivityHistory(Request $request): JsonResponse
    {
        $practitioner = auth()->user()->practitioner;

        $activities = [
            'pending_swaps' => AppointmentSwap::where('initiator_practitioner_id', $practitioner->id)
                ->where('status', 'pending')
                ->with('appointment', 'responder')
                ->latest()
                ->get(),
            'completed_swaps' => AppointmentSwap::where('initiator_practitioner_id', $practitioner->id)
                ->where('status', 'accepted')
                ->with('appointment')
                ->latest()
                ->limit(20)
                ->get(),
            'recent_reports' => PostVisitReport::where('practitioner_id', $practitioner->id)
                ->with('visit')
                ->latest()
                ->limit(10)
                ->get(),
            'visits_today' => Visit::where('practitioner_id', $practitioner->id)
                ->whereDate('created_at', today())
                ->with('patient')
                ->get(),
        ];

        return $this->sendResponse($activities, 'Practitioner activity history retrieved');
    }

    // Helper methods

    /**
     * Calculate match scores for practitioners
     */
    private function calculatePractitionerMatches(Appointment $appointment): array
    {
        $practitioners = \App\Models\Practitioner::where('is_active', true)->get();
        $matches = [];

        foreach ($practitioners as $practitioner) {
            $score = 0;
            $factors = [];

            // Specialty match (40%)
            if ($practitioner->specialization === $appointment->service->specialty) {
                $score += 40;
                $factors['specialty_match'] = 40;
            }

            // Availability (30%)
            $appointmentDateTime = \Carbon\Carbon::parse(
                "{$appointment->appointment_date} {$appointment->appointment_time}"
            );
            if ($this->isPractitionerAvailable($practitioner, $appointmentDateTime)) {
                $score += 30;
                $factors['availability'] = 30;
            }

            // Client rating of practitioner (20%)
            $rating = \App\Models\MicroFeedback::where('practitioner_id', $practitioner->id)
                ->avg('quality_rating') ?? 0;
            $ratingScore = ($rating / 4) * 20;
            $score += $ratingScore;
            $factors['client_rating'] = round($ratingScore, 2);

            // Geographic proximity (10%)
            if ($appointment->location_latitude && $appointment->location_longitude) {
                if ($this->isPractitionerNearby($practitioner, $appointment)) {
                    $score += 10;
                    $factors['proximity'] = 10;
                }
            }

            $matches[] = [
                'practitioner_id' => $practitioner->id,
                'practitioner_name' => $practitioner->user->name,
                'score' => round($score, 2),
                'factors' => $factors,
            ];
        }

        return array_filter($matches, fn($m) => $m['score'] > 0);
    }

    /**
     * Check if practitioner is available
     */
    private function isPractitionerAvailable(\App\Models\Practitioner $practitioner, \Carbon\Carbon $dateTime): bool
    {
        return !Appointment::where('practitioner_id', $practitioner->id)
            ->whereDate('appointment_date', $dateTime->format('Y-m-d'))
            ->where(function ($q) use ($dateTime) {
                $q->where('status', 'confirmed')
                    ->orWhere('status', 'in_progress');
            })
            ->exists();
    }

    /**
     * Check if practitioner is nearby
     */
    private function isPractitionerNearby(\App\Models\Practitioner $practitioner, Appointment $appointment): bool
    {
        // Simple radius check (e.g., 5km)
        $maxDistance = 5; // km
        // Implementation would use geospatial queries
        return true; // Placeholder
    }

    /**
     * Get scoring factors explanation
     */
    private function getScorningFactors(): array
    {
        return [
            'specialty_match' => 'Practitioner specialization matches appointment service',
            'availability' => 'Practitioner available at appointment time',
            'client_rating' => 'Average client satisfaction rating',
            'proximity' => 'Practitioner proximity to appointment location',
        ];
    }
}
