<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(): Response
    {
        $patients = Patient::with('user')->paginate(15);
        return Inertia::render('Patients/Index', [
            'patients' => $patients,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Patients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'date_of_birth' => 'required|date',
            'blood_type' => 'required|string',
            'allergies' => 'nullable|string',
            'emergency_contact' => 'required|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->userRoles()->create(['role' => 'client']);

        Patient::create([
            'user_id' => $user->id,
            'date_of_birth' => $validated['date_of_birth'],
            'blood_type' => $validated['blood_type'],
            'allergies' => $validated['allergies'] ?? null,
            'emergency_contact' => $validated['emergency_contact'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
        ]);

        return redirect('/patients')->with('success', 'Patient created successfully');
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('Patients/Edit', [
            'patient' => $patient->load('user'),
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $user = $patient->user;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'date_of_birth' => 'required|date',
            'blood_type' => 'required|string',
            'allergies' => 'nullable|string',
            'emergency_contact' => 'required|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $patient->update([
            'date_of_birth' => $validated['date_of_birth'],
            'blood_type' => $validated['blood_type'],
            'allergies' => $validated['allergies'] ?? null,
            'emergency_contact' => $validated['emergency_contact'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
        ]);

        return redirect('/patients')->with('success', 'Patient updated successfully');
    }

    public function destroy(Patient $patient)
    {
        $user = $patient->user;
        $patient->delete();
        $user->userRoles()->delete();
        $user->delete();

        return redirect('/patients')->with('success', 'Patient deleted successfully');
    }
}
