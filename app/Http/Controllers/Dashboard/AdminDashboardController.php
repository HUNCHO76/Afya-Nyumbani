<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Practitioner;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        // KPI Cards Data
        $totalClients = Client::count();
        $activeBookings = Booking::whereIn('status', ['pending', 'confirmed', 'in_progress'])->count();
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $practitionersOnline = Practitioner::where('availability_status', 'available')->count();

        // Monthly bookings chart data (last 6 months)
        $monthlyBookings = Booking::selectRaw('DATE_FORMAT(booking_date, "%Y-%m") as month, COUNT(*) as count')
            ->where('booking_date', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Revenue trend (last 6 months)
        $monthlyRevenue = Payment::selectRaw('DATE_FORMAT(paid_at, "%Y-%m") as month, SUM(amount) as total')
            ->where('status', 'completed')
            ->where('paid_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Recent bookings
        $recentBookings = Booking::with(['client.user', 'service', 'practitioner.user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Recent payments
        $recentPayments = Payment::with(['client.user', 'booking.service'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Low stock items
        $lowStockItems = InventoryItem::whereRaw('quantity <= reorder_level')
            ->get();

        return Inertia::render('Dashboard/Admin', [
            'kpi' => [
                'totalClients' => $totalClients,
                'activeBookings' => $activeBookings,
                'totalRevenue' => $totalRevenue,
                'practitionersOnline' => $practitionersOnline,
            ],
            'charts' => [
                'monthlyBookings' => $monthlyBookings,
                'monthlyRevenue' => $monthlyRevenue,
            ],
            'recentBookings' => $recentBookings,
            'recentPayments' => $recentPayments,
            'lowStockItems' => $lowStockItems,
        ]);
    }
}
