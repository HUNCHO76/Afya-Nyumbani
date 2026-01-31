<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use App\Models\Practitioner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::with(['client.user', 'service', 'practitioner.user'])
            ->orderBy('booking_date', 'desc')
            ->paginate(15);
            
        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(): Response
    {
        $clients = Client::with('user')->get();
        $services = Service::all();
        $practitioners = Practitioner::with('user')
            ->where('availability_status', 'available')
            ->get();

        return Inertia::render('Bookings/Create', [
            'clients' => $clients,
            'services' => $services,
            'practitioners' => $practitioners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'status' => 'required|in:pending,confirmed,in_progress,completed,cancelled',
            'assigned_practitioner_id' => 'nullable|exists:practitioners,id',
            'location_lat' => 'nullable|string',
            'location_lng' => 'nullable|string',
        ]);

        Booking::create($validated);

        return redirect('/bookings')->with('success', 'Booking created successfully');
    }

    public function edit(Booking $booking): Response
    {
        $clients = Client::with('user')->get();
        $services = Service::all();
        $practitioners = Practitioner::with('user')->get();

        return Inertia::render('Bookings/Edit', [
            'booking' => $booking->load(['client.user', 'service', 'practitioner.user']),
            'clients' => $clients,
            'services' => $services,
            'practitioners' => $practitioners,
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'status' => 'required|in:pending,confirmed,in_progress,completed,cancelled',
            'assigned_practitioner_id' => 'nullable|exists:practitioners,id',
            'location_lat' => 'nullable|string',
            'location_lng' => 'nullable|string',
        ]);

        $booking->update($validated);

        return redirect('/bookings')->with('success', 'Booking updated successfully');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return redirect('/bookings')->with('success', 'Booking deleted successfully');
    }
}
