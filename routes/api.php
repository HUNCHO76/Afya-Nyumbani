<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PractitionerController;
use App\Http\Controllers\Api\PatientController;
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
});
