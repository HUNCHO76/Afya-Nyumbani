<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceDashboardController extends Controller
{
    public function index(): Response
    {
        // Payments summary
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $pendingAmount = Payment::where('status', 'pending')->sum('amount');
        $todayRevenue = Payment::where('status', 'completed')
            ->whereDate('paid_at', now())
            ->sum('amount');
        $monthRevenue = Payment::where('status', 'completed')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        // Pending payments
        $pendingPayments = Payment::with(['client.user', 'booking.service'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        // Recent transactions
        $recentTransactions = Payment::with(['client.user', 'booking.service'])
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        // Revenue by payment method (last 30 days)
        $revenueByMethod = Payment::selectRaw('payment_method, SUM(amount) as total, COUNT(*) as count')
            ->where('status', 'completed')
            ->where('paid_at', '>=', now()->subDays(30))
            ->groupBy('payment_method')
            ->get();

        // Daily revenue trend (last 30 days)
        $dailyRevenue = Payment::selectRaw('DATE(paid_at) as date, SUM(amount) as total')
            ->where('status', 'completed')
            ->where('paid_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Monthly revenue trend (last 12 months)
        $monthlyRevenue = Payment::selectRaw('DATE_FORMAT(paid_at, "%Y-%m") as month, SUM(amount) as total')
            ->where('status', 'completed')
            ->where('paid_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Payment status breakdown
        $statusBreakdown = Payment::selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('status')
            ->get();

        // Top paying clients (last 30 days)
        $topClients = Payment::with('client.user')
            ->selectRaw('client_id, SUM(amount) as total_paid, COUNT(*) as payment_count')
            ->where('status', 'completed')
            ->where('paid_at', '>=', now()->subDays(30))
            ->groupBy('client_id')
            ->orderByDesc('total_paid')
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Finance', [
            'summary' => [
                'totalRevenue' => $totalRevenue,
                'pendingAmount' => $pendingAmount,
                'todayRevenue' => $todayRevenue,
                'monthRevenue' => $monthRevenue,
            ],
            'pendingPayments' => $pendingPayments,
            'recentTransactions' => $recentTransactions,
            'charts' => [
                'revenueByMethod' => $revenueByMethod,
                'dailyRevenue' => $dailyRevenue,
                'monthlyRevenue' => $monthlyRevenue,
            ],
            'statusBreakdown' => $statusBreakdown,
            'topClients' => $topClients,
        ]);
    }
}
