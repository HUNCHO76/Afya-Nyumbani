<?php

namespace Database\Seeders;

use App\Models\Vital;
use App\Models\Patient;
use App\Models\Visit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VitalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = Patient::all();
        $visits = Visit::all();
        
        // Get a practitioner user to record vitals
        $practitioner = User::where('role', 'practitioner')->first();
        $recordedBy = $practitioner ? $practitioner->id : User::first()->id;

        if ($patients->isEmpty()) {
            $this->command->warn('VitalSeeder: Skipped - No patients found. Run PatientSeeder first.');
            return;
        }

        $vitals = [];

        foreach ($patients as $patient) {
            // Create 3-6 vital records per patient
            $vitalCount = rand(3, 6);
            
            for ($i = 0; $i < $vitalCount; $i++) {
                // Get a random visit for this patient if available
                $patientVisits = $visits->where('patient_id', $patient->id);
                $visit = $patientVisits->isNotEmpty() ? $patientVisits->random() : null;
                
                // Create vitals with realistic values
                $vital = Vital::create([
                    'patient_id' => $patient->id,
                    'visit_id' => $visit ? $visit->id : null,
                    'recorded_by' => $recordedBy,
                    'blood_pressure_systolic' => rand(100, 160),
                    'blood_pressure_diastolic' => rand(60, 100),
                    'heart_rate' => rand(60, 100),
                    'temperature' => round(36 + (rand(-5, 20) / 10), 1),
                    'respiratory_rate' => rand(12, 20),
                    'oxygen_saturation' => rand(95, 100),
                    'blood_glucose' => rand(70, 150),
                    'weight' => round(50 + (rand(300, 1200) / 10), 1),
                    'height' => rand(150, 190),
                    'notes' => $this->getRandomNotes(),
                    'created_at' => now()->subDays(rand(0, 60)),
                ]);
                
                $vitals[] = $vital;
            }
        }

        $this->command->info('VitalSeeder: ' . count($vitals) . ' vital records created successfully!');
    }

    /**
     * Get random medical notes
     */
    private function getRandomNotes(): string
    {
        $notes = [
            'Patient appears stable and responding well to treatment.',
            'Vital signs within normal range. Continue current medication.',
            'Patient reports mild discomfort. Monitor closely.',
            'Follow-up required in 2 weeks.',
            'Patient compliance with medication regimen excellent.',
            'Slight elevation in blood pressure. Advised rest and stress reduction.',
            'All vitals normal. Patient in good health.',
            'Continue with current treatment plan.',
            'Patient reports improved symptoms.',
        ];

        return $notes[array_rand($notes)];
    }
}
