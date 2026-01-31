<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of client payments.
     */
    public function index()
    {
        $client = Auth::user()->client;
        
        $payments = Payment::with(['booking.service', 'booking.practitioner.user'])
            ->where('client_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return Inertia::render('Client/PaymentHistory', [
            'payments' => $payments,
        ]);
    }

    /**
     * Display a specific payment.
     */
    public function show(Payment $payment)
    {
        // Ensure the payment belongs to the authenticated client
        if ($payment->client_id !== Auth::user()->client->id) {
            abort(403, 'Unauthorized access to this payment.');
        }
        
        $payment->load(['booking.service', 'booking.practitioner.user']);
        
        return Inertia::render('Client/PaymentDetails', [
            'payment' => $payment,
        ]);
    }
}
