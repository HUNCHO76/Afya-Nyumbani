<?php

namespace App\Services;

use App\Models\HealthAccessToken;
use App\Models\TokenAccessLog;

class HealthDataAccessService
{
    /**
     * Get health records using access token
     */
    public function getHealthRecordsByToken(string $token, array $requestedRecordTypes = []): array
    {
        $tokenHash = hash('sha256', $token);
        
        $accessToken = HealthAccessToken::where('token_hash', $tokenHash)->first();

        if (!$accessToken || !$accessToken->isActive()) {
            throw new \Exception('Invalid or expired access token');
        }

        // Check if token allows requested record types
        if (!empty($requestedRecordTypes)) {
            foreach ($requestedRecordTypes as $type) {
                if (!in_array($type, $accessToken->allowed_record_types)) {
                    throw new \Exception("Access denied for record type: {$type}");
                }
            }
        } else {
            $requestedRecordTypes = $accessToken->allowed_record_types;
        }

        // Log the access
        $accessToken->logAccess(auth()->user());

        // Fetch records based on allowed types
        return $this->fetchRecordsByType($accessToken->client_id, $requestedRecordTypes);
    }

    /**
     * Validate token and return allowed record types
     */
    public function validateToken(string $token): ?HealthAccessToken
    {
        $tokenHash = hash('sha256', $token);
        $accessToken = HealthAccessToken::where('token_hash', $tokenHash)->first();

        if ($accessToken && $accessToken->isActive()) {
            return $accessToken;
        }

        return null;
    }

    /**
     * Create health access token
     */
    public function createAccessToken(
        int $clientId,
        int $authorizedEntityId,
        string $authorizedEntityType,
        array $allowedRecordTypes,
        int $durationHours = 48,
        ?int $accessLimit = null
    ): array {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $accessToken = HealthAccessToken::create([
            'token_hash' => $tokenHash,
            'client_id' => $clientId,
            'authorized_entity_id' => $authorizedEntityId,
            'authorized_entity_type' => $authorizedEntityType,
            'allowed_record_types' => $allowedRecordTypes,
            'created_at' => now(),
            'expires_at' => now()->addHours($durationHours),
            'access_limit' => $accessLimit,
            'access_count' => 0,
        ]);

        return [
            'id' => $accessToken->id,
            'token' => $token, // Only returned once
            'expires_at' => $accessToken->expires_at,
            'allowed_record_types' => $accessToken->allowed_record_types,
        ];
    }

    /**
     * Revoke access token
     */
    public function revokeToken(int $tokenId, $revokedBy = null): bool
    {
        $token = HealthAccessToken::find($tokenId);
        
        if (!$token) {
            return false;
        }

        $token->update(['revoked_at' => now()]);
        
        return true;
    }

    /**
     * Get access audit logs for a token
     */
    public function getAccessLogs(int $tokenId, int $limit = 50): array
    {
        return TokenAccessLog::where('health_access_token_id', $tokenId)
            ->with('accessor')
            ->latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Check if entity can access specific records
     */
    public function canAccessRecords(
        string $token,
        array $recordTypes
    ): bool {
        $accessToken = $this->validateToken($token);

        if (!$accessToken) {
            return false;
        }

        foreach ($recordTypes as $type) {
            if (!in_array($type, $accessToken->allowed_record_types)) {
                return false;
            }
        }

        // Check access limit
        if ($accessToken->access_limit && $accessToken->access_count >= $accessToken->access_limit) {
            return false;
        }

        return true;
    }

    // Private helpers

    /**
     * Fetch records by type
     */
    private function fetchRecordsByType(int $clientId, array $recordTypes): array
    {
        $records = [];

        foreach ($recordTypes as $type) {
            $records[$type] = $this->getRecordTypeData($clientId, $type);
        }

        return $records;
    }

    /**
     * Get specific record type data
     */
    private function getRecordTypeData(int $clientId, string $type): array
    {
        // This is a simplified implementation
        // In production, you'd fetch from actual database tables
        
        $client = \App\Models\Client::find($clientId);
        
        return match($type) {
            'lab_results' => $this->fetchLabResults($clientId),
            'prescriptions' => $this->fetchPrescriptions($clientId),
            'medical_history' => $this->fetchMedicalHistory($clientId),
            'vital_signs' => $this->fetchVitals($clientId),
            'visit_records' => $this->fetchVisitRecords($clientId),
            'allergies' => $this->fetchAllergies($clientId),
            default => [],
        };
    }

    private function fetchLabResults(int $clientId): array
    {
        return []; // Implement based on your lab results model
    }

    private function fetchPrescriptions(int $clientId): array
    {
        return []; // Implement based on your prescriptions model
    }

    private function fetchMedicalHistory(int $clientId): array
    {
        $patient = \App\Models\Patient::whereHas('client', fn($q) => $q->where('id', $clientId))->first();
        
        if (!$patient) {
            return [];
        }

        return \App\Models\MedicalHistory::where('patient_id', $patient->id)
            ->latest()
            ->get()
            ->toArray();
    }

    private function fetchVitals(int $clientId): array
    {
        $patient = \App\Models\Patient::whereHas('client', fn($q) => $q->where('id', $clientId))->first();
        
        if (!$patient) {
            return [];
        }

        return \App\Models\Vital::where('patient_id', $patient->id)
            ->latest()
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function fetchVisitRecords(int $clientId): array
    {
        return \App\Models\Visit::whereHas('patient', 
            fn($q) => $q->whereHas('client', fn($q2) => $q2->where('id', $clientId))
        )
        ->with('practitioner', 'vitals', 'medicalHistories')
        ->latest()
        ->limit(10)
        ->get()
        ->toArray();
    }

    private function fetchAllergies(int $clientId): array
    {
        // Implement based on your allergies model
        return [];
    }
}
