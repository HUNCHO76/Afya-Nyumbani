<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patientsData = [
            [
                'name' => 'John Kipchoge',
                'email' => 'john.kipchoge@example.com',
                'date_of_birth' => '1984-11-20',
                'blood_type' => 'O+',
                'allergies' => ['Penicillin'],
                'medical_conditions' => ['Hypertension', 'Type 2 Diabetes'],
                'emergency_contact_name' => 'Mary Kipchoge',
                'emergency_contact_phone' => '+254712345678',
            ],
            [
                'name' => 'Grace Mutua',
                'email' => 'grace.mutua@example.com',
                'date_of_birth' => '1978-05-15',
                'blood_type' => 'A-',
                'allergies' => ['Sulfonamides'],
                'medical_conditions' => ['Asthma'],
                'emergency_contact_name' => 'Peter Mutua',
                'emergency_contact_phone' => '+254723456789',
            ],
            [
                'name' => 'David Omondi',
                'email' => 'david.omondi@example.com',
                'date_of_birth' => '1992-03-22',
                'blood_type' => 'B+',
                'allergies' => ['NSAIDs'],
                'medical_conditions' => ['Chronic Back Pain'],
                'emergency_contact_name' => 'Sarah Omondi',
                'emergency_contact_phone' => '+254734567890',
            ],
            [
                'name' => 'Elizabeth Kamau',
                'email' => 'elizabeth.kamau@example.com',
                'date_of_birth' => '1965-08-10',
                'blood_type' => 'AB+',
                'allergies' => [],
                'medical_conditions' => ['Arthritis', 'High Cholesterol'],
                'emergency_contact_name' => 'James Kamau',
                'emergency_contact_phone' => '+254745678901',
            ],
            [
                'name' => 'Michael Otieno',
                'email' => 'michael.otieno@example.com',
                'date_of_birth' => '1988-11-30',
                'blood_type' => 'O-',
                'allergies' => ['Latex'],
                'medical_conditions' => ['Post-surgery recovery'],
                'emergency_contact_name' => 'Joyce Otieno',
                'emergency_contact_phone' => '+254756789012',
            ],
            [
                'name' => 'Rose Nyambura',
                'email' => 'rose.nyambura@example.com',
                'date_of_birth' => '1995-01-14',
                'blood_type' => 'A+',
                'allergies' => [],
                'medical_conditions' => [],
                'emergency_contact_name' => 'Joseph Nyambura',
                'emergency_contact_phone' => '+254767890123',
            ],
            [
                'name' => 'Samuel Kipkemboi',
                'email' => 'samuel.kipkemboi@example.com',
                'date_of_birth' => '1970-07-05',
                'blood_type' => 'B-',
                'allergies' => ['Codeine'],
                'medical_conditions' => ['Hypertension', 'Diabetes'],
                'emergency_contact_name' => 'Anne Kipkemboi',
                'emergency_contact_phone' => '+254778901234',
            ],
            [
                'name' => 'Patricia Wanjiru',
                'email' => 'patricia.wanjiru@example.com',
                'date_of_birth' => '1980-09-25',
                'blood_type' => 'AB-',
                'allergies' => ['Aspirin'],
                'medical_conditions' => ['Migraine', 'Anxiety'],
                'emergency_contact_name' => 'Thomas Wanjiru',
                'emergency_contact_phone' => '+254789012345',
            ],
        ];

        foreach ($patientsData as $data) {
            // Check if user already exists
            $user = User::where('email', $data['email'])->first();
            
            if (!$user) {
                // Create user
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make('password'),
                    'role' => 'client',
                ]);

                // Create patient
                Patient::create([
                    'user_id' => $user->id,
                    'date_of_birth' => $data['date_of_birth'],
                    'blood_type' => $data['blood_type'],
                    'allergies' => $data['allergies'],
                    'medical_conditions' => $data['medical_conditions'],
                    'emergency_contact_name' => $data['emergency_contact_name'],
                    'emergency_contact_phone' => $data['emergency_contact_phone'],
                    'notes' => 'Patient created via seeder',
                ]);
            }
        }

        $this->command->info('PatientSeeder: ' . count($patientsData) . ' patients created successfully!');
    }
}
