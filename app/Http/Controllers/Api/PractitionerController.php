<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\PractitionerProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;

class PractitionerController extends Controller
{
    /**
     * Display a listing of practitioners.
     */
    public function index()
    {
        $practitioners = PractitionerProfile::with('user', 'appointments')
            ->paginate(15);
        return response()->json($practitioners);
    }

    /**
     * Store a newly created practitioner.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'specialization' => 'required|string|max:255',
            'license_number' => 'required|string|unique:practitioner_profiles',
            'available_days' => 'array',
            'work_start_time' => 'date_format:H:i',
            'work_end_time' => 'date_format:H:i',
            'service_radius_km' => 'numeric|min:1',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $user->userRoles()->create(['role' => 'practitioner']);

        $practitioner = PractitionerProfile::create([
            'user_id' => $user->id,
            'specialization' => $validated['specialization'],
            'license_number' => $validated['license_number'],
            'available_days' => $validated['available_days'] ?? [],
            'work_start_time' => $validated['work_start_time'] ?? '09:00',
            'work_end_time' => $validated['work_end_time'] ?? '17:00',
            'service_radius_km' => $validated['service_radius_km'] ?? 10,
            'is_available' => true,
        ]);

        return response()->json($practitioner->load('user'), Response::HTTP_CREATED);
    }

    /**
     * Display the specified practitioner.
     */
    public function show(string $id)
    {
        $practitioner = PractitionerProfile::with('user', 'appointments')
            ->findOrFail($id);
        return response()->json($practitioner);
    }

    /**
     * Update the specified practitioner.
     */
    public function update(Request $request, string $id)
    {
        $practitioner = PractitionerProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $practitioner->user_id,
            'specialization' => 'string|max:255',
            'license_number' => 'string|unique:practitioner_profiles,license_number,' . $id,
            'available_days' => 'array',
            'work_start_time' => 'date_format:H:i',
            'work_end_time' => 'date_format:H:i',
            'service_radius_km' => 'numeric|min:1',
            'is_available' => 'boolean',
        ]);

        if (isset($validated['name']) || isset($validated['email'])) {
            $practitioner->user->update([
                'name' => $validated['name'] ?? $practitioner->user->name,
                'email' => $validated['email'] ?? $practitioner->user->email,
            ]);
        }

        $practitioner->update($validated);
        return response()->json($practitioner->load('user'));
    }

    /**
     * Remove the specified practitioner.
     */
    public function destroy(string $id)
    {
        $practitioner = PractitionerProfile::findOrFail($id);
        $practitioner->user()->delete();
        $practitioner->delete();
        return response()->noContent();
    }
}
