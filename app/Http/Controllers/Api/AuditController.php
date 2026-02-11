<?php

namespace App\Http\Controllers\Api;

use App\Models\EmergencyEscalation;
use App\Models\AppointmentSwap;
use App\Models\VisitTimeline;
use App\Models\SystemAuditLog;
use App\Models\TokenAccessLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditController extends BaseController
{
    /**
     * Get health record access audit logs
     */
    public function getRecordAccessLogs(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        // If client, get their own access logs
        if ($user->role === 'client' || $user->hasRole('client')) {
            $logs = TokenAccessLog::whereHas('token', fn($q) => 
                $q->where('client_id', $user->client->id)
            )
            ->with('accessor')
            ->latest()
            ->paginate(50);
        }
        // If admin, get all access logs
        elseif ($user->role === 'admin' || $user->hasRole('admin')) {
            $logs = TokenAccessLog::with('token', 'accessor')
                ->latest()
                ->paginate(50);
        }
        // Otherwise unauthorized
        else {
            return $this->sendError('Unauthorized', 403);
        }

        return $this->sendResponse($logs, 'Access logs retrieved');
    }

    /**
     * Get emergency escalation logs
     */
    public function getEmergencyLogs(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = EmergencyEscalation::with('visit', 'client', 'practitioner', 'respondingPersonnel');

        // Filter by role
        if ($user->role === 'client' || $user->hasRole('client')) {
            $query->where('client_id', $user->client->id);
        } elseif ($user->role === 'practitioner' || $user->hasRole('practitioner')) {
            $query->where(function ($q) use ($user) {
                $q->where('practitioner_id', $user->practitioner->id)
                    ->orWhere('responding_personnel_id', $user->id);
            });
        } elseif (!($user->role === 'admin' || $user->hasRole('admin'))) {
            return $this->sendError('Unauthorized', 403);
        }

        $logs = $query->latest()->paginate(50);

        return $this->sendResponse($logs, 'Emergency logs retrieved');
    }

    /**
     * Get appointment swap history
     */
    public function getSwapHistory(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = AppointmentSwap::with('initiator', 'responder', 'appointment');

        if ($user->role === 'practitioner' || $user->hasRole('practitioner')) {
            $query->where(function ($q) use ($user) {
                $q->where('initiator_practitioner_id', $user->practitioner->id)
                    ->orWhere('responder_practitioner_id', $user->practitioner->id);
            });
        } elseif (!($user->role === 'admin' || $user->hasRole('admin'))) {
            return $this->sendError('Unauthorized', 403);
        }

        $logs = $query->latest()->paginate(50);

        return $this->sendResponse($logs, 'Swap history retrieved');
    }

    /**
     * Get visit validation timeline logs
     */
    public function getVisitValidations(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = VisitTimeline::with('visit');

        if ($user->role === 'client' || $user->hasRole('client')) {
            $query->whereHas('visit', fn($q) => 
                $q->whereHas('patient', fn($q2) => 
                    $q2->where('client_id', $user->client->id)
                )
            );
        } elseif ($user->role === 'practitioner' || $user->hasRole('practitioner')) {
            $query->whereHas('visit', fn($q) => 
                $q->where('practitioner_id', $user->practitioner->id)
            );
        } elseif (!($user->role === 'admin' || $user->hasRole('admin'))) {
            return $this->sendError('Unauthorized', 403);
        }

        $logs = $query->latest()->paginate(50);

        return $this->sendResponse($logs, 'Visit validation logs retrieved');
    }

    /**
     * Get comprehensive audit trail
     */
    public function getAuditTrail(Request $request): JsonResponse
    {
        if (!auth()->user()->hasRole('admin')) {
            return $this->sendError('Unauthorized', 403);
        }

        $validated = $request->validate([
            'entity_type' => 'nullable|string',
            'entity_id' => 'nullable|integer',
            'user_id' => 'nullable|integer',
            'action' => 'nullable|string',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $query = SystemAuditLog::with('user');

        if ($validated['entity_type'] ?? null) {
            $query->where('entity_type', $validated['entity_type']);
        }

        if ($validated['entity_id'] ?? null) {
            $query->where('entity_id', $validated['entity_id']);
        }

        if ($validated['user_id'] ?? null) {
            $query->where('user_id', $validated['user_id']);
        }

        if ($validated['action'] ?? null) {
            $query->where('action', $validated['action']);
        }

        if ($validated['from_date'] ?? null) {
            $query->whereDate('timestamp', '>=', $validated['from_date']);
        }

        if ($validated['to_date'] ?? null) {
            $query->whereDate('timestamp', '<=', $validated['to_date']);
        }

        $logs = $query->latest()->paginate(100);

        return $this->sendResponse($logs, 'Audit trail retrieved');
    }

    /**
     * Get fraud detection flags
     */
    public function getFraudFlags(Request $request): JsonResponse
    {
        if (!auth()->user()->hasRole('admin')) {
            return $this->sendError('Unauthorized', 403);
        }

        $flags = [
            'unconfirmed_visits' => $this->getUnconfirmedVisits(),
            'visit_discrepancies' => $this->getVisitDiscrepancies(),
            'duplicate_claims' => $this->getDuplicateClaims(),
            'excessive_swap_requests' => $this->getExcessiveSwapRequests(),
            'unusual_access_patterns' => $this->getUnusualAccessPatterns(),
        ];

        return $this->sendResponse($flags, 'Fraud detection flags retrieved');
    }

    // Helper methods for fraud detection

    private function getUnconfirmedVisits()
    {
        return \App\Models\VisitTimeline::whereNull('client_completion_confirmed_at')
            ->where('practitioner_ended_at', '<', now()->subHours(2))
            ->with('visit')
            ->get();
    }

    private function getVisitDiscrepancies()
    {
        return \App\Models\VisitTimeline::whereRaw('ABS(TIMESTAMPDIFF(MINUTE, practitioner_ended_at, client_completion_confirmed_at)) > 30')
            ->with('visit')
            ->get();
    }

    private function getDuplicateClaims()
    {
        // Flag multiple care codes generated for same visit within short time
        return \App\Models\CareCode::selectRaw('visit_id, COUNT(*) as count')
            ->where('created_at', '>', now()->subHours(24))
            ->groupBy('visit_id')
            ->having('count', '>', 1)
            ->with('visit')
            ->get();
    }

    private function getExcessiveSwapRequests()
    {
        // Flag practitioners requesting excessive swaps
        return \App\Models\AppointmentSwap::selectRaw('initiator_practitioner_id, COUNT(*) as count')
            ->where('requested_at', '>', now()->subDays(7))
            ->groupBy('initiator_practitioner_id')
            ->having('count', '>', 5)
            ->with('initiator')
            ->get();
    }

    private function getUnusualAccessPatterns()
    {
        // Flag unusual health record access patterns
        return TokenAccessLog::selectRaw('health_access_token_id, accessed_by_id, COUNT(*) as access_count')
            ->where('accessed_at', '>', now()->subHours(24))
            ->groupBy('health_access_token_id', 'accessed_by_id')
            ->having('access_count', '>', 10)
            ->with('token', 'accessor')
            ->get();
    }
}
