<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Models\Booking;
use App\Models\InventoryUsage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PractitionerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $practitioner = $user->practitioner;

        if (!$practitioner) {
            abort(403, 'Practitioner profile not found');
        }

        // Today's assigned bookings (pending, confirmed, in_progress)
        $todaysBookings = Booking::with(['client.user', 'service'])
            ->where('assigned_practitioner_id', $practitioner->id)
            ->whereDate('booking_date', now())
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->orderBy('booking_time')
            ->get();

        // We intentionally do NOT mix in visits here; Today's Schedule should show pending bookings only
        $todaysSchedule = $todaysBookings;

        // Visit history
        $visitHistory = Visit::with(['booking.client.user', 'booking.service'])
            ->where('practitioner_id', $practitioner->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Recent inventory usage
        $recentInventoryUsage = InventoryUsage::with('inventoryItem')
            ->where('practitioner_id', $practitioner->id)
            ->orderBy('used_at', 'desc')
            ->take(10)
            ->get();

        // Statistics
        $stats = [
            // Count actual visits created/checked-in today
            'todaysVisits' => Visit::where('practitioner_id', $practitioner->id)
                ->whereDate('created_at', now())
                ->count(),
            'completedToday' => Visit::where('practitioner_id', $practitioner->id)
                ->whereDate('created_at', now())
                ->whereNotNull('check_out_time')
                ->count(),
            'totalVisits' => Visit::where('practitioner_id', $practitioner->id)->count(),
            'availabilityStatus' => $practitioner->availability_status,
        ];

        // Upcoming assignments (next 7 days)
        $upcomingAssignments = Booking::with(['client.user', 'service'])
            ->where('assigned_practitioner_id', $practitioner->id)
            ->where('booking_date', '>', now())
            ->where('booking_date', '<=', now()->addDays(7))
            ->whereIn('status', ['confirmed'])
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->get();

        return Inertia::render('Dashboard/Practitioner', [
            'todaysSchedule' => $todaysSchedule,
            'visitHistory' => $visitHistory,
            'upcomingAssignments' => $upcomingAssignments,
            'recentInventoryUsage' => $recentInventoryUsage,
            'stats' => $stats,
            'practitioner' => [
                'id' => $practitioner->id,
                'specialization' => $practitioner->specialization,
                'license_number' => $practitioner->license_number,
            ],
        ]);
    }
}
