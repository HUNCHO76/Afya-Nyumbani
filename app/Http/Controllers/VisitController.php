<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function show(Visit $visit)
    {
        $visit->load(['booking.client.user', 'booking.service', 'practitioner.user']);

        // Authorization: only assigned practitioner or admins can view
        if (auth()->user()->role === 'practitioner') {
            $practitioner = auth()->user()->practitioner;
            if ($visit->practitioner_id && $visit->practitioner_id !== $practitioner->id) {
                abort(403);
            }

            if ($visit->booking && $visit->booking->assigned_practitioner_id && $visit->booking->assigned_practitioner_id !== $practitioner->id) {
                abort(403);
            }
        }

        return Inertia::render('Visits/Show', ['visit' => $visit]);
    }

    public function checkIn(Visit $visit)
    {
        $practitioner = auth()->user()->practitioner;
        if (!$practitioner) abort(403);

        // Only assigned practitioner can check in
        if ($visit->practitioner_id && $visit->practitioner_id !== $practitioner->id) {
            abort(403);
        }

        if (!$visit->check_in_time) {
            $visit->update(['check_in_time' => now()]);
        }

        // Also ensure booking status reflects in_progress
        if ($visit->booking && $visit->booking->status !== 'in_progress') {
            $visit->booking->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Checked in');
    }

    public function checkOut(Visit $visit)
    {
        $practitioner = auth()->user()->practitioner;
        if (!$practitioner) abort(403);

        if ($visit->practitioner_id && $visit->practitioner_id !== $practitioner->id) {
            abort(403);
        }

        if (!$visit->check_out_time) {
            $visit->update(['check_out_time' => now()]);
        }

        // Mark booking completed when visit checks out
        $booking = $visit->booking;
        if ($booking) {
            $booking->update(['status' => 'completed']);
        }

        return back()->with('success', 'Checked out and visit completed');
    }
}
