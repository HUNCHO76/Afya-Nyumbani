<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('userRoles')->paginate(15);
        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:administrator,practitioner,client,support_staff',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->userRoles()->create(['role' => $validated['role']]);

        return redirect('/users')->with('success', 'User created successfully');
    }

    public function show(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->load('userRoles'),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->load('userRoles'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:administrator,practitioner,client,support_staff',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->userRoles()->updateOrCreate(
            ['user_id' => $user->id],
            ['role' => $validated['role']]
        );

        return redirect('/users')->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $user->userRoles()->delete();
        $user->delete();

        return redirect('/users')->with('success', 'User deleted successfully');
    }
}
