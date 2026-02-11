<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Practitioner;
use App\Models\Service;
use App\Models\InsuranceApproval;
use App\Models\Payment;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function create()
    {
        $client = Auth::user()->client;
        
        $services = Service::all();
        
        $clientInsuranceStatus = null;
        if ($client) {
            $clientInsuranceStatus = [
                'hasInsurance' => !empty($client->insurance_number),
                'provider' => $client->insurance_provider,
                'insuranceNumber' => $client->insurance_number,
                'status' => $client->insurance_status,
            ];
        }
        
        return Inertia::render('Client/CreateBooking', [
            'services' => $services,
            'clientInsuranceStatus' => $clientInsuranceStatus,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required',
            'payment_type' => 'required|in:mobile_money,cash,insurance',
            'insurance_provider' => 'required_if:payment_type,insurance',
            'insurance_number' => 'required_if:payment_type,insurance',
            'payer_phone' => 'required_if:payment_type,mobile_money|regex:/^\+255\d{9}$/',
            'location_region' => 'nullable|string',
            'location_district' => 'nullable|string',
            'location_ward' => 'nullable|string',
            'location_landmark' => 'nullable|string',
            'location_address' => 'nullable|string',
            'location_lat' => 'nullable|numeric',
            'location_lng' => 'nullable|numeric',
            'special_instructions' => 'nullable|string',
            'payment_method' => 'required_if:payment_type,mobile_money|in:mpesa,tigopesa,airtelmoney,cash',
        ]);

        $client = Auth::user()->client;
        
        if (!$client) {
            return back()->withErrors(['error' => 'Client profile not found.']);
        }

        DB::beginTransaction();
        
        try {
            // Build location address from detailed fields if provided
            $locationParts = array_filter([
                $validated['location_address'] ?? null,
                $validated['location_landmark'] ?? null,
                $validated['location_ward'] ?? null,
                $validated['location_district'] ?? null,
                $validated['location_region'] ?? null,
            ]);

            $locationAddress = !empty($locationParts) ? implode(', ', $locationParts) : null;

            // Auto-assign a practitioner (Logic: Assign to the currently logged-in user if they are also a practitioner,
            // otherwise assign to the first available practitioner for testing/demo purposes)
            $assignedPractitionerId = null;
            $user = Auth::user();
            
            // Check if current user is also a practitioner
            if ($user->practitioner) {
                $assignedPractitionerId = $user->practitioner->id;
            } else {
                // Fallback: Assign to the first available practitioner
                $assignedPractitionerId = Practitioner::where('availability_status', 'available')->first()?->id 
                    ?? Practitioner::first()?->id;
            }

            // Create the booking
            $booking = Booking::create([
                'client_id' => $client->id,
                'service_id' => $validated['service_id'],
                'booking_date' => $validated['booking_date'],
                'booking_time' => $validated['booking_time'],
                'status' => 'pending',
                'location_address' => $locationAddress,
                'location_lat' => $validated['location_lat'] ?? null,
                'location_lng' => $validated['location_lng'] ?? null,
                'payment_type' => $validated['payment_type'],
                'special_instructions' => $validated['special_instructions'] ?? null,
                'assigned_practitioner_id' => $assignedPractitionerId,
            ]);

            $service = Service::findOrFail($validated['service_id']);

            if ($validated['payment_type'] === 'insurance') {
                // Create insurance approval record
                InsuranceApproval::create([
                    'booking_id' => $booking->id,
                    'provider' => $validated['insurance_provider'],
                    'insurance_number' => $validated['insurance_number'],
                    'approval_status' => 'pending',
                ]);

                // Update client's insurance info if not already saved
                if (empty($client->insurance_number)) {
                    $client->update([
                        'insurance_provider' => $validated['insurance_provider'],
                        'insurance_number' => $validated['insurance_number'],
                        'insurance_status' => 'pending',
                    ]);
                }

                DB::commit();
                
                // Send SMS confirmation
                $smsService = new SmsService();
                $smsService->sendBookingConfirmation($booking);

                return redirect()->route('client.dashboard')->with('success', 
                    'Booking created successfully! Your insurance approval is pending. You will be notified once approved.');
                
            } else {
                $paymentMethod = $validated['payment_method'] ?? 'cash';
                // Mobile money payment - mark as paid immediately
                $paymentStatus = in_array($paymentMethod, ['mpesa', 'tigopesa', 'airtelmoney']) ? 'completed' : 'pending';
                
                // Generate control number for mobile money payments
                $controlNumber = null;
                if ($paymentStatus === 'completed') {
                    $controlNumber = $this->generateControlNumber($booking->id, $paymentMethod);
                }
                
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'client_id' => $client->id,
                    'amount' => $service->price,
                    'payment_method' => $paymentMethod,
                    'status' => $paymentStatus,
                    'transaction_reference' => $controlNumber,
                    'paid_at' => $paymentStatus === 'completed' ? now() : null,
                ]);

                DB::commit();
                
                // Send SMS confirmation
                $smsService = new SmsService();
                $smsService->sendBookingConfirmation($booking);
                
                // Send payment notification based on status
                if ($paymentStatus === 'completed') {
                    $smsService->sendPaymentConfirmation($payment);
                } else {
                    $smsService->sendPaymentReminder($payment);
                }

                /* 
                // Send airtime reward - Service temporarily disabled
                //$airtime = new AirtimeService();
                //$rewardAmount = (float) config('services.airtime.reward_amount', 100);
                //$currency = config('services.airtime.currency', 'TZS');
                //$phone = $client->user->phone ?? $client->emergency_contact_phone;
                //if (!empty($phone)) {
                //    $airtime->sendAirtime($phone, $rewardAmount, $currency);
                //}
                */
            } // End else
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create booking. Please try again.']);
        }
    }

    public function index()
    {
        $client = Auth::user()->client;
        
        $bookings = Booking::with(['service', 'practitioner.user', 'insuranceApproval', 'payments'])
            ->where('client_id', $client->id)
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->paginate(6);
        
        return Inertia::render('Client/AllBookings', [
            'bookings' => $bookings,
        ]);
    }

    public function show(Booking $booking)
    {
        // Ensure the booking belongs to the authenticated client
        if ($booking->client_id !== Auth::user()->client->id) {
            abort(403, 'Unauthorized access to this booking.');
        }
        
        $booking->load(['service', 'practitioner.user', 'insuranceApproval', 'payments']);
        
        return Inertia::render('Client/AppointmentDetails', [
            'booking' => $booking,
        ]);
    }

    public function edit(Booking $booking)
    {
        // Ensure the booking belongs to the authenticated client
        if ($booking->client_id !== Auth::user()->client->id) {
            abort(403, 'Unauthorized access to this booking.');
        }

        // Only allow editing of pending or confirmed bookings
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return redirect()->route('client.bookings.show', $booking)
                ->withErrors(['error' => 'This booking cannot be edited.']);
        }

        $services = Service::all();
        $client = Auth::user()->client;
        
        $clientInsuranceStatus = null;
        if ($client) {
            $clientInsuranceStatus = [
                'hasInsurance' => !empty($client->insurance_number),
                'provider' => $client->insurance_provider,
                'insuranceNumber' => $client->insurance_number,
                'status' => $client->insurance_status,
            ];
        }

        $booking->load(['service', 'practitioner.user', 'insuranceApproval']);
        
        return Inertia::render('Client/EditBooking', [
            'booking' => $booking,
            'services' => $services,
            'clientInsuranceStatus' => $clientInsuranceStatus,
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        // Ensure the booking belongs to the authenticated client
        if ($booking->client_id !== Auth::user()->client->id) {
            abort(403, 'Unauthorized access to this booking.');
        }

        // Only allow editing of pending or confirmed bookings
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return back()->withErrors(['error' => 'This booking cannot be edited.']);
        }

        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required',
            'location_region' => 'nullable|string',
            'location_district' => 'nullable|string',
            'location_ward' => 'nullable|string',
            'location_landmark' => 'nullable|string',
            'location_address' => 'nullable|string',
            'location_lat' => 'nullable|numeric',
            'location_lng' => 'nullable|numeric',
            'special_instructions' => 'nullable|string',
        ]);

        DB::beginTransaction();
        
        try {
            // Build location address from detailed fields if provided
            $locationParts = array_filter([
                $validated['location_address'] ?? null,
                $validated['location_landmark'] ?? null,
                $validated['location_ward'] ?? null,
                $validated['location_district'] ?? null,
                $validated['location_region'] ?? null,
            ]);

            $locationAddress = !empty($locationParts) ? implode(', ', $locationParts) : null;

            $booking->update([
                'service_id' => $validated['service_id'],
                'booking_date' => $validated['booking_date'],
                'booking_time' => $validated['booking_time'],
                'location_address' => $locationAddress,
                'location_lat' => $validated['location_lat'] ?? null,
                'location_lng' => $validated['location_lng'] ?? null,
                'special_instructions' => $validated['special_instructions'] ?? null,
            ]);

            DB::commit();

            return redirect()->route('client.bookings.show', $booking)
                ->with('success', 'Booking updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update booking. Please try again.']);
        }
    }

    public function cancel(Booking $booking)
    {
        // Ensure the booking belongs to the authenticated client
        if ($booking->client_id !== Auth::user()->client->id) {
            abort(403, 'Unauthorized access to this booking.');
        }

        // Check if booking can be cancelled
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return back()->withErrors(['error' => 'This booking cannot be cancelled.']);
        }

        // Check if booking date is at least 24 hours away
        $bookingDateTime = \Carbon\Carbon::parse($booking->booking_date . ' ' . $booking->booking_time);
        if ($bookingDateTime->diffInHours(now()) < 24) {
            return back()->withErrors(['error' => 'Bookings can only be cancelled at least 24 hours in advance.']);
        }

        $booking->update(['status' => 'cancelled']);

        // If there's a payment, handle refund
        $payment = $booking->payments()->where('status', 'completed')->first();
        if ($payment) {
            $payment->update(['status' => 'refunded']);
        }

        return redirect()->route('client.bookings.index')->with('success', 'Booking cancelled successfully.');
    }

    /**
     * Generate a unique control number for payment
     */
    private function generateControlNumber(int $bookingId, string $paymentMethod): string
    {
        $prefix = match ($paymentMethod) {
            'mpesa' => 'MP',
            'tigopesa' => 'TP',
            'airtelmoney' => 'AM',
            default => 'MN',
        };

        // Format: PREFIX + YYYYMMDD + BookingID + Random4digits
        $date = now()->format('Ymd');
        $random = str_pad((string)rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        
        return $prefix . $date . str_pad((string)$bookingId, 4, '0', STR_PAD_LEFT) . $random;
    }
}
