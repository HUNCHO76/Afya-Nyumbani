<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Visit;
use App\Models\Vital;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ClientDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        // Auto-create client profile if missing
        if (!$client) {
            $client = \App\Models\Client::create([
                'user_id' => $user->id,
                'date_of_birth' => now()->subYears(30)->toDateString(),
                'emergency_contact_name' => $user->name,
                'emergency_contact_phone' => $user->phone ?? '',
            ]);
            \Illuminate\Support\Facades\Log::info('Auto-created client profile', ['user_id' => $user->id, 'client_id' => $client->id]);
        }

        // Profile summary
        $profileSummary = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'created_at' => $user->created_at,
            'address' => $client->address,
            'emergencyContact' => $client->emergency_contact_name,
            'emergencyPhone' => $client->emergency_contact_phone,
        ];

        // Upcoming bookings - sorted by pending status first
        $upcomingBookings = Booking::with(['service', 'practitioner.user'])
            ->where('client_id', $client->id)
            ->where('booking_date', '>=', now())
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->take(5)
            ->get();

        // Recent activities - combining completed bookings and visits
        $recentActivities = $this->getRecentActivities($client->id);

        // Booking history
        $bookingHistory = Booking::with(['service', 'practitioner.user'])
            ->where('client_id', $client->id)
            ->orderBy('booking_date', 'desc')
            ->take(10)
            ->get();

        // Payments & invoices
        $payments = Payment::with(['booking.service'])
            ->where('client_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Available services for booking
        $services = Service::all();

        // Statistics
        $stats = [
            'totalBookings' => Booking::where('client_id', $client->id)->count(),
            'completedBookings' => Booking::where('client_id', $client->id)->where('status', 'completed')->count(),
            'pendingPayments' => Payment::where('client_id', $client->id)->where('status', 'pending')->sum('amount'),
        ];

        return Inertia::render('Dashboard/Client', [
            'profile' => $profileSummary,
            'upcomingBookings' => $upcomingBookings,
            'recentActivities' => $recentActivities,
            'bookingHistory' => $bookingHistory,
            'payments' => $payments,
            'services' => $services,
            'stats' => $stats,
        ]);
    }

    /**
     * Get recent activities for a client from the database
     */
    private function getRecentActivities($clientId)
    {
        $activities = [];

        // Get completed bookings with visits
        $completedBookings = Booking::with(['service', 'practitioner.user', 'visits.vitals'])
            ->where('client_id', $clientId)
            ->where('status', 'completed')
            ->orderBy('booking_date', 'desc')
            ->take(10)
            ->get();

        foreach ($completedBookings as $booking) {
            $activities[] = [
                'id' => 'booking_' . $booking->id,
                'type' => 'appointment',
                'title' => 'Appointment Completed',
                'description' => ($booking->practitioner ? $booking->practitioner->user->name : 'Practitioner') . ' completed your ' . $booking->service->name . ' appointment.',
                'timestamp' => $booking->updated_at->diffForHumans(),
                'icon' => 'CheckCircle',
                'iconColor' => 'text-success'
            ];

            // Add vital signs recorded in this visit
            if ($booking->visits->count() > 0) {
                foreach ($booking->visits as $visit) {
                    if ($visit->vitals->count() > 0) {
                        $vitalsList = $visit->vitals->pluck('vital_sign.name')->join(', ');
                        $activities[] = [
                            'id' => 'vital_' . $visit->id,
                            'type' => 'vital_signs',
                            'title' => 'Vital Signs Recorded',
                            'description' => 'Vital signs recorded: ' . $vitalsList,
                            'timestamp' => $visit->updated_at->diffForHumans(),
                            'icon' => 'Activity',
                            'iconColor' => 'text-primary'
                        ];
                    }
                }
            }
        }

        // Sort by timestamp (most recent first)
        usort($activities, function ($a, $b) {
            return strcmp($b['timestamp'], $a['timestamp']);
        });

        // Return only the most recent 5
        return array_slice($activities, 0, 5);
    }
}
