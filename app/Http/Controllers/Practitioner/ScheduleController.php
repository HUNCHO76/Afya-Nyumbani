<?php

namespace App\Http\Controllers\Practitioner;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Visit;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $practitioner = Auth::user()->practitioner;

        $upcoming = Booking::with(['client.user', 'service'])
            ->where('assigned_practitioner_id', $practitioner->id)
            ->where('booking_date', '>=', now()->toDateString())
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->get();

        return Inertia::render('Practitioner/Schedule/Index', [
            'upcoming' => $upcoming,
        ]);
    }

    public function calendar(Request $request)
    {
        $practitioner = Auth::user()->practitioner;
        if (!$practitioner) abort(403);

        $appointments = Booking::with(['client.user', 'service', 'practitioner.user'])
            ->where('assigned_practitioner_id', $practitioner->id)
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->get();

        $services = Service::all();
        $practitioners = \App\Models\Practitioner::all();

        return Inertia::render('Practitioner/Schedule/Calendar', [
            'appointments' => $appointments,
            'services' => $services,
            'practitioners' => $practitioners,
            'practitioner' => [
                'id' => $practitioner->id,
                'specialization' => $practitioner->specialization ?? null,
                'license_number' => $practitioner->license_number ?? null,
            ],
        ]);
    }

    public function create()
    {
        $practitioner = Auth::user()->practitioner;
        $clients = Client::with('user')->get();
        $services = Service::all();

        return Inertia::render('Practitioner/Schedule/Create', [
            'clients' => $clients,
            'services' => $services,
            'practitioner' => $practitioner,
        ]);
    }

    public function store(Request $request)
    {
        $practitioner = Auth::user()->practitioner;

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'location_address' => 'nullable|string',
            'status' => 'required|in:pending,confirmed',
        ]);

        $booking = Booking::create(array_merge($validated, ['assigned_practitioner_id' => $practitioner->id]));

        return redirect()->route('practitioner.schedule.show', $booking)->with('success', 'Booking created');
    }

    public function show(Booking $booking)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) {
            abort(403);
        }

        $booking->load(['client.user', 'service']);
        $visits = Visit::where('booking_id', $booking->id)->get();

        return Inertia::render('Practitioner/Schedule/Show', [
            'booking' => $booking,
            'visits' => $visits,
        ]);
    }

    public function edit(Booking $booking)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) abort(403);

        $clients = Client::with('user')->get();
        $services = Service::all();

        return Inertia::render('Practitioner/Schedule/Edit', [
            'booking' => $booking->load(['client.user','service']),
            'clients' => $clients,
            'services' => $services,
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) abort(403);

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'location_address' => 'nullable|string',
            'status' => 'required|in:pending,confirmed',
        ]);

        $booking->update($validated);

        return redirect()->route('practitioner.schedule.show', $booking)->with('success', 'Booking updated');
    }

    public function startVisit(Booking $booking)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) abort(403);
        if ($booking->status === 'cancelled') abort(403, 'Cannot start visit for cancelled booking');

        // If a visit already exists for this booking and is in progress, redirect to it
        $existing = \App\Models\Visit::where('booking_id', $booking->id)->whereNull('check_out_time')->first();
        if ($existing) {
            return redirect()->route('visits.show', $existing);
        }

        // Get or create Patient record for the client's user
        $client = $booking->client;
        $patient = \App\Models\Patient::firstOrCreate(
            ['user_id' => $client->user_id],
            [
                'date_of_birth' => $client->date_of_birth ?? now()->subYears(30),
                'blood_type' => null,
                'allergies' => [],
                'medical_conditions' => [],
                'emergency_contact_name' => $client->emergency_contact_name ?? 'N/A',
                'emergency_contact_phone' => $client->emergency_contact_phone ?? 'N/A',
                'notes' => $client->medical_notes,
            ]
        );

        $visit = \App\Models\Visit::create([
            'booking_id' => $booking->id,
            'patient_id' => $patient->id,
            'practitioner_id' => $practitioner->id,
            'visit_notes' => null,
        ]);

        // Mark booking as in_progress
        $booking->update(['status' => 'in_progress']);

        return redirect()->route('visits.show', $visit)->with('success', 'Visit started');
    }

    public function confirm(Booking $booking)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) abort(403);

        $booking->update(['status' => 'confirmed']);

        return back()->with('success', 'Booking confirmed');
    }

    public function cancel(Booking $booking, Request $request)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) abort(403);

        $booking->update(['status' => 'cancelled', 'special_instructions' => $request->input('reason') ?? $booking->special_instructions]);

        return back()->with('success', 'Booking cancelled');
    }

    public function reschedule(Booking $booking, Request $request)
    {
        $practitioner = Auth::user()->practitioner;
        if ($booking->assigned_practitioner_id !== $practitioner->id) abort(403);

        $validated = $request->validate([
            'booking_date' => 'required|date',
            'booking_time' => 'required',
        ]);

        $booking->update($validated + ['status' => 'confirmed']);

        return back()->with('success', 'Booking rescheduled');
    }
}
