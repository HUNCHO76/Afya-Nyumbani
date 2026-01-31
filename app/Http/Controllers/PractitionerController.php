<?php

namespace App\Http\Controllers;

use App\Models\Practitioner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PractitionerController extends Controller
{
    public function index(): Response
    {
        $practitioners = Practitioner::with('user')->paginate(15);
        return Inertia::render('Practitioners/Index', [
            'practitioners' => $practitioners,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Practitioners/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'specialization' => 'required|string|max:255',
            'license_number' => 'required|string|unique:practitioners',
            'years_experience' => 'required|integer|min:0',
            'availability_status' => 'required|in:available,on_duty,offline,on_leave',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => 'practitioner',
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        Practitioner::create([
            'user_id' => $user->id,
            'specialization' => $validated['specialization'],
            'license_number' => $validated['license_number'],
            'years_experience' => $validated['years_experience'],
            'availability_status' => $validated['availability_status'],
        ]);

        return redirect('/practitioners')->with('success', 'Practitioner created successfully');
    }

    public function edit(Practitioner $practitioner): Response
    {
        return Inertia::render('Practitioners/Edit', [
            'practitioner' => $practitioner->load('user'),
        ]);
    }

    public function update(Request $request, Practitioner $practitioner)
    {
        $user = $practitioner->user;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'specialization' => 'required|string|max:255',
            'license_number' => 'required|string|unique:practitioners,license_number,' . $practitioner->id,
            'years_experience' => 'required|integer|min:0',
            'availability_status' => 'required|in:available,on_duty,offline,on_leave',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $practitioner->update([
            'specialization' => $validated['specialization'],
            'license_number' => $validated['license_number'],
            'years_experience' => $validated['years_experience'],
            'availability_status' => $validated['availability_status'],
        ]);

        return redirect('/practitioners')->with('success', 'Practitioner updated successfully');
    }

    public function destroy(Practitioner $practitioner)
    {
        $user = $practitioner->user;
        $practitioner->delete();
        $user->delete();

        return redirect('/practitioners')->with('success', 'Practitioner deleted successfully');
    }
}
