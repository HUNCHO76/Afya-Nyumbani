<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function client()
    {
        $user = Auth::user();

        $profile = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? null,
            'avatar' => $user->avatar_url ?? null,
            'member_since' => $user->created_at,
        ];

        $upcomingBookings = Booking::with(['service', 'practitioner.user'])
            ->where('user_id', $user->id)
            ->whereDate('booking_date', '>=', now()->toDateString())
            ->orderBy('booking_date')
            ->limit(10)
            ->get();

        $recentActivities = collect([]); // Empty collection for now

        $services = Service::select('id', 'name', 'description')->get();

        $stats = [
            'totalBookings' => Booking::where('user_id', $user->id)->count(),
            'completedBookings' => Booking::where('user_id', $user->id)->where('status', 'completed')->count(),
            'pendingPayments' => 0,
        ];

        return Inertia::render('Dashboard/Client', [
            'profile' => $profile,
            'upcomingBookings' => $upcomingBookings,
            'recentActivities' => $recentActivities,
            'services' => $services,
            'stats' => $stats,
        ]);
    }
}