<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Models\UserRole;
use App\Models\Client;
use App\Models\Patient;
use App\Models\PractitionerProfile;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|string|in:admin,practitioner,client',
            'phone' => 'required|string|max:20',
        ]);

        DB::beginTransaction();
        
        try {
            // Create user (ensure role column is set to satisfy DB constraint)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'client',
                'status' => 'active',
            ]);

            // Create profile
            Profile::create([
                'user_id' => $user->id,
                'full_name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            \Illuminate\Support\Facades\Log::info('Profile created for user', ['user_id' => $user->id]);

            // Assign role (default to client when not provided)
            $role = $request->role ?? 'client';

            $userRole = UserRole::create([
                'user_id' => $user->id,
                'role' => $role,
            ]);

            \Illuminate\Support\Facades\Log::info('UserRole created', ['user_id' => $user->id, 'role_id' => $userRole->id, 'role' => $role]);

            // Create role-specific records
            try {
                if ($role === 'client') {
                    $client = Client::create([
                        'user_id' => $user->id,
                        'date_of_birth' => now()->subYears(30)->toDateString(),
                        'emergency_contact_name' => $request->name,
                        'emergency_contact_phone' => $request->phone ?? '',
                    ]);
                    \Illuminate\Support\Facades\Log::info('Client created', ['id' => $client->id]);

                    $patient = Patient::create([
                        'user_id' => $user->id,
                        'date_of_birth' => now()->subYears(30)->toDateString(),
                        'emergency_contact_name' => $request->name,
                        'emergency_contact_phone' => $request->phone ?? '',
                    ]);
                    \Illuminate\Support\Facades\Log::info('Patient created', ['id' => $patient->id]);
                } elseif ($role === 'practitioner') {
                    $pr = PractitionerProfile::create([
                        'user_id' => $user->id,
                        'is_available' => false,
                    ]);
                    \Illuminate\Support\Facades\Log::info('PractitionerProfile created', ['id' => $pr->id]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error creating role-specific record', ['exception' => $e->getMessage()]);
                throw $e;
            }

            DB::commit();

            event(new Registered($user));

            \Illuminate\Support\Facades\Log::info('About to log in user', ['id' => $user->id]);
            Auth::login($user);
            \Illuminate\Support\Facades\Log::info('After Auth::login - check', ['check' => Auth::check(), 'id' => Auth::id()]);

            // Debug: ensure login persisted
            \Illuminate\Support\Facades\Log::info('User registered and logged in', ['id' => $user->id, 'role' => $user->role]);

            return redirect(route('dashboard', absolute: false));
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
