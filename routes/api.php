<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PractitionerController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ClientActivityController;
use App\Http\Controllers\Api\PractitionerActivityController;
use App\Http\Controllers\UssdController;

Route::post('/ussd', [UssdController::class, 'handle']);

Route::middleware('auth:sanctum')->group(function () {
    // User management
    Route::apiResource('users', UserController::class);

    // Practitioner management
    Route::apiResource('practitioners', PractitionerController::class);

    // Patient management
    Route::apiResource('patients', PatientController::class);

    // Current user info
    Route::get('/me', function (Request $request) {
        return $request->user()->load('userRoles');
    });

    // Practitioner offline sync endpoints
    Route::post('/practitioner/sync/vitals', [\App\Http\Controllers\Api\SyncController::class, 'syncVitals']);
    Route::post('/practitioner/sync/inventory-usage', [\App\Http\Controllers\Api\SyncController::class, 'syncInventoryUsage']);
    Route::post('/practitioner/sync/visits', [\App\Http\Controllers\Api\SyncController::class, 'syncVisits']);

    // ===== INNOVATIVE FEATURES: CLIENT ACTIVITIES =====
    Route::prefix('client')->group(function () {
        // Arrival confirmation
        Route::post('/visits/{visit}/confirm-arrival', [ClientActivityController::class, 'confirmArrival']);

        // Symptom snapshots
        Route::post('/visits/{visit}/symptom-snapshot', [ClientActivityController::class, 'submitSymptomSnapshot']);
        Route::get('/visits/{visit}/symptom-snapshots', [ClientActivityController::class, 'getSymptomSnapshots']);

        // Emergency escalation
        Route::post('/visits/{visit}/emergency-escalation', [ClientActivityController::class, 'triggerEmergencyEscalation']);
        Route::get('/emergencies', [ClientActivityController::class, 'getEmergencies']);

        // Micro-feedback
        Route::post('/visits/{visit}/micro-feedback', [ClientActivityController::class, 'submitMicroFeedback']);
        Route::get('/visits/{visit}/feedback-history', [ClientActivityController::class, 'getFeedbackHistory']);

        // Health access tokens
        Route::post('/health-tokens', [ClientActivityController::class, 'generateHealthAccessToken']);
        Route::get('/health-tokens', [ClientActivityController::class, 'listHealthTokens']);
        Route::patch('/health-tokens/{token}/revoke', [ClientActivityController::class, 'revokeHealthToken']);

        // Care codes
        Route::post('/visits/{visit}/generate-care-code', [ClientActivityController::class, 'generateCareCode']);
        Route::post('/visits/{visit}/confirm-care-code', [ClientActivityController::class, 'confirmCareCode']);
        Route::get('/visits/{visit}/completion-proof', [ClientActivityController::class, 'getCompletionProof']);

        // Comfort reporting
        Route::post('/visits/{visit}/comfort-report', [ClientActivityController::class, 'submitComfortReport']);
        Route::get('/visits/{visit}/comfort-timeline', [ClientActivityController::class, 'getComfortTimeline']);

        // Activity history
        Route::get('/activity-history', [ClientActivityController::class, 'getActivityHistory']);
    });

    // ===== INNOVATIVE FEATURES: PRACTITIONER ACTIVITIES =====
    Route::prefix('practitioner')->group(function () {
        // Appointment swaps
        Route::post('/appointments/{appointment}/request-swap', [PractitionerActivityController::class, 'requestAppointmentSwap']);
        Route::get('/swap-requests', [PractitionerActivityController::class, 'getPendingSwaps']);
        Route::patch('/appointment-swaps/{swap}/accept', [PractitionerActivityController::class, 'acceptAppointmentSwap']);
        Route::patch('/appointment-swaps/{swap}/decline', [PractitionerActivityController::class, 'declineAppointmentSwap']);
        Route::get('/appointment-swaps/history', [PractitionerActivityController::class, 'getSwapHistory']);

        // Visit timeline & validation
        Route::post('/visits/{visit}/start-visit', [PractitionerActivityController::class, 'startVisit']);
        Route::post('/visits/{visit}/confirm-start', [PractitionerActivityController::class, 'confirmVisitStart']);
        Route::post('/visits/{visit}/end-visit', [PractitionerActivityController::class, 'endVisit']);
        Route::post('/visits/{visit}/confirm-completion', [PractitionerActivityController::class, 'confirmVisitCompletion']);
        Route::get('/visits/{visit}/timeline', [PractitionerActivityController::class, 'getVisitTimeline']);

        // Smart assignment
        Route::get('/appointments/{appointment}/smart-assignment', [PractitionerActivityController::class, 'getSmartAssignment']);
        Route::post('/appointments/{appointment}/assign', [PractitionerActivityController::class, 'assignPractitioner']);
        Route::get('/practitioners/{practitioner}/match-score/{appointment}', [PractitionerActivityController::class, 'getPractitionerMatchScore']);

        // Post-visit reports
        Route::post('/visits/{visit}/post-visit-report', [PractitionerActivityController::class, 'submitPostVisitReport']);
        Route::get('/visits/{visit}/report', [PractitionerActivityController::class, 'getPostVisitReport']);
        Route::post('/follow-ups/auto-schedule', [PractitionerActivityController::class, 'autoScheduleFollowUp']);

        // Health access tokens (practitioner initiated)
        Route::post('/health-tokens/request', [PractitionerActivityController::class, 'requestHealthAccessToken']);
        Route::get('/health-records', [PractitionerActivityController::class, 'getHealthRecords']);

        // Activity history
        Route::get('/activity-history', [PractitionerActivityController::class, 'getActivityHistory']);
    });

    // ===== AUDIT & MONITORING =====
    Route::prefix('audit')->group(function () {
        Route::get('/record-access-logs', [\App\Http\Controllers\Api\AuditController::class, 'getRecordAccessLogs']);
        Route::get('/emergency-logs', [\App\Http\Controllers\Api\AuditController::class, 'getEmergencyLogs']);
        Route::get('/swap-history', [\App\Http\Controllers\Api\AuditController::class, 'getSwapHistory']);
        Route::get('/visit-validations', [\App\Http\Controllers\Api\AuditController::class, 'getVisitValidations']);
    });
});
