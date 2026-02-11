<?php
use App\Http\Controllers\UssdController;
use App\Http\Controllers\SmsCallbackController;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PractitionerController;
use App\Http\Controllers\Dashboard\AdminDashboardController;
use App\Http\Controllers\Dashboard\ClientDashboardController;
use App\Http\Controllers\Dashboard\FinanceDashboardController;
use App\Http\Controllers\Dashboard\InventoryDashboardController;
use App\Http\Controllers\Dashboard\PractitionerDashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\Practitioner\PatientManagementController as PractitionerPatientController;
use App\Http\Controllers\Client\BookingController as ClientBookingController;
use App\Http\Controllers\Client\PaymentController as ClientPaymentController;
use App\Http\Controllers\DashboardController;

Route::post('/ussd', [UssdController::class, 'handle']);
Route::post('/Ussd', [UssdController::class, 'handle']); // Capital U for Africa's Talking
Route::post('/incoming_sms', [SmsCallbackController::class, 'handleIncoming']);

// Public routes
Route::get('/', fn () => Inertia::render('Index'));
Route::get('/auth', fn () => Inertia::render('Auth'));

// Protected application routes
Route::middleware(['auth'])->group(function () {
    
    // Dashboard routes - role-based
    Route::get('/dashboard', function () {
        $role = Auth::user()->role;
        
        return match($role) {
            'super_admin', 'admin' => redirect('/dashboard/admin'),
            'client' => redirect('/dashboard/client'),
            'practitioner' => redirect('/dashboard/practitioner'),
            'inventory_officer' => redirect('/dashboard/inventory'),
            'finance_officer' => redirect('/dashboard/finance'),
            default => abort(403, 'Unauthorized'),
        };
    })->name('dashboard');

    // Admin Dashboard
    Route::get('/dashboard/admin', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    
    // User Management
    Route::resource('users', UserController::class);
    Route::resource('clients', ClientController::class);
    Route::resource('practitioners', PractitionerController::class);
    Route::resource('services', ServiceController::class);
    Route::resource('bookings', BookingController::class);

    // Client Dashboard
    Route::get('/dashboard/client', [ClientDashboardController::class, 'index'])->name('client.dashboard');
    
    // Client Bookings
    Route::get('/client/bookings', [ClientBookingController::class, 'index'])->name('client.bookings.index');
    Route::get('/client/bookings/create', [ClientBookingController::class, 'create'])->name('client.bookings.create');
    Route::post('/client/bookings', [ClientBookingController::class, 'store'])->name('client.bookings.store');
    Route::get('/client/bookings/{booking}', [ClientBookingController::class, 'show'])->name('client.bookings.show');
    Route::get('/client/bookings/{booking}/edit', [ClientBookingController::class, 'edit'])->name('client.bookings.edit');
    Route::put('/client/bookings/{booking}', [ClientBookingController::class, 'update'])->name('client.bookings.update');
    Route::post('/client/bookings/{booking}/cancel', [ClientBookingController::class, 'cancel'])->name('client.bookings.cancel');
    
    // Client Payments
    Route::get('/client/payments', [ClientPaymentController::class, 'index'])->name('client.payments.index');
    Route::get('/client/payments/{payment}', [ClientPaymentController::class, 'show'])->name('client.payments.show');

    // Practitioner Dashboard
    Route::get('/dashboard/practitioner', [PractitionerDashboardController::class, 'index'])->name('practitioner.dashboard');
    
    // Practitioner Patient Management
    Route::get('/practitioner/patients', [PractitionerPatientController::class, 'index'])->name('practitioner.patients.index');
    Route::get('/practitioner/patients/{patient}', [PractitionerPatientController::class, 'show'])->name('practitioner.patients.show');
    Route::get('/practitioner/patients/{patient}/vitals/create', [PractitionerPatientController::class, 'createVitals'])->name('practitioner.patients.vitals.create');
    Route::post('/practitioner/patients/{patient}/vitals', [PractitionerPatientController::class, 'storeVitals'])->name('practitioner.patients.vitals.store');
    Route::post('/practitioner/patients/{patient}/medical-history', [PractitionerPatientController::class, 'addMedicalHistory'])->name('practitioner.patients.medical-history.store');
    Route::get('/practitioner/patients/{patient}/visit-history', [PractitionerPatientController::class, 'visitHistory'])->name('practitioner.patients.visit-history');

    // Practitioner schedule & appointments
    Route::get('/practitioner/schedule', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'index'])->name('practitioner.schedule.index');
    Route::get('/practitioner/appointments/create', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'create'])->name('practitioner.schedule.create');
    Route::post('/practitioner/appointments', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'store'])->name('practitioner.schedule.store');
    Route::get('/practitioner/appointments/{booking}', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'show'])->name('practitioner.schedule.show');
    Route::get('/practitioner/appointments/{booking}/edit', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'edit'])->name('practitioner.schedule.edit');
    Route::put('/practitioner/appointments/{booking}', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'update'])->name('practitioner.schedule.update');
    Route::post('/practitioner/appointments/{booking}/confirm', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'confirm'])->name('practitioner.schedule.confirm');
    Route::post('/practitioner/appointments/{booking}/cancel', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'cancel'])->name('practitioner.schedule.cancel');
    Route::post('/practitioner/appointments/{booking}/reschedule', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'reschedule'])->name('practitioner.schedule.reschedule');

    // Start visit
    Route::post('/practitioner/appointments/{booking}/start', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'startVisit'])->name('practitioner.schedule.start');

    // Calendar view
    Route::get('/practitioner/schedule/calendar', [\App\Http\Controllers\Practitioner\ScheduleController::class, 'calendar'])->name('practitioner.schedule.calendar');

    // Visit actions (check-in/check-out, show)
    Route::get('/visits/{visit}', [\App\Http\Controllers\VisitController::class, 'show'])->name('visits.show');
    Route::post('/visits/{visit}/check-in', [\App\Http\Controllers\VisitController::class, 'checkIn'])->name('visits.checkin');
    Route::post('/visits/{visit}/check-out', [\App\Http\Controllers\VisitController::class, 'checkOut'])->name('visits.checkout');

    // API sync compat routes (also exposed under /api/*)
    Route::post('/api/practitioner/sync/vitals', [\App\Http\Controllers\Api\SyncController::class, 'syncVitals'])->middleware(['auth:sanctum']);
    Route::post('/api/practitioner/sync/inventory-usage', [\App\Http\Controllers\Api\SyncController::class, 'syncInventoryUsage'])->middleware(['auth:sanctum']);
    Route::post('/api/practitioner/sync/visits', [\App\Http\Controllers\Api\SyncController::class, 'syncVisits'])->middleware(['auth:sanctum']);

    // Vitals (recording and listing)
    Route::get('/visits/{visit}/vitals', [\App\Http\Controllers\VitalController::class, 'index'])->name('visits.vitals.index');
    Route::post('/visits/{visit}/vitals', [\App\Http\Controllers\VitalController::class, 'store'])->name('visits.vitals.store');

    // Inventory usage reporting
    Route::get('/practitioner/inventory-usage', [\App\Http\Controllers\InventoryUsageController::class, 'index'])->name('practitioner.inventory.usage.index');
    Route::post('/practitioner/inventory-usage', [\App\Http\Controllers\InventoryUsageController::class, 'store'])->name('practitioner.inventory.usage.store');

    // Inventory Officer Dashboard
    Route::get('/dashboard/inventory', [InventoryDashboardController::class, 'index'])->name('inventory.dashboard');
    Route::resource('inventory', InventoryController::class);

    // Finance Officer Dashboard
    Route::get('/dashboard/finance', [FinanceDashboardController::class, 'index'])->name('finance.dashboard');
    Route::get('/payments', fn () => Inertia::render('Payments/Index'));

    // Patient Management
    Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');

    // Legacy routes (keeping for backward compatibility)
    Route::get('/appointments', fn () => Inertia::render('Appointments/Index'));
    Route::get('/reports', fn () => Inertia::render('Reports/Index'));
    Route::get('/notifications', fn () => Inertia::render('Notifications/Index'));
    // Profile routes
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Fallback to SPA 404
Route::fallback(fn () => Inertia::render('NotFound'))->name('fallback');

require __DIR__.'/auth.php';
