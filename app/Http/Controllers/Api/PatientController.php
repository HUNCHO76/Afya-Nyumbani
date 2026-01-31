<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;

class PatientController extends Controller
{
    /**
     * Display a listing of patients.
     */
    public function index()
    {
        $patients = Patient::with('user', 'appointments')
            ->paginate(15);
        return response()->json($patients);
    }

    /**
     * Store a newly created patient.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'date_of_birth' => 'date',
            'blood_type' => 'string|max:5',
            'allergies' => 'array',
            'medical_conditions' => 'array',
            'emergency_contact_name' => 'string|max:255',
            'emergency_contact_phone' => 'string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $user->userRoles()->create(['role' => 'client']);

        $patient = Patient::create([
            'user_id' => $user->id,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'blood_type' => $validated['blood_type'] ?? null,
            'allergies' => $validated['allergies'] ?? [],
            'medical_conditions' => $validated['medical_conditions'] ?? [],
            'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
        ]);

        return response()->json($patient->load('user'), Response::HTTP_CREATED);
    }

    /**
     * Display the specified patient.
     */
    public function show(string $id)
    {
        $patient = Patient::with('user', 'appointments', 'vitalSigns', 'medicalHistories')
            ->findOrFail($id);
        return response()->json($patient);
    }

    /**
     * Update the specified patient.
     */
    public function update(Request $request, string $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $patient->user_id,
            'date_of_birth' => 'date',
            'blood_type' => 'string|max:5',
            'allergies' => 'array',
            'medical_conditions' => 'array',
            'emergency_contact_name' => 'string|max:255',
            'emergency_contact_phone' => 'string|max:20',
            'notes' => 'string|max:1000',
        ]);

        if (isset($validated['name']) || isset($validated['email'])) {
            $patient->user->update([
                'name' => $validated['name'] ?? $patient->user->name,
                'email' => $validated['email'] ?? $patient->user->email,
            ]);
        }

        $patient->update($validated);
        return response()->json($patient->load('user'));
    }

    /**
     * Remove the specified patient.
     */
    public function destroy(string $id)
    {
        $patient = Patient::findOrFail($id);
        $patient->user()->delete();
        $patient->delete();
        return response()->noContent();
    }
}
