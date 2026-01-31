<?php

namespace App\Http\Controllers\Practitioner;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Visit;
use App\Models\Vital;
use App\Models\MedicalHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PatientManagementController extends Controller
{
    /**
     * Display a listing of patients assigned to the practitioner
     */
    public function index()
    {
        $practitioner = Auth::user()->practitioner;
        
        // Get patients from completed or ongoing visits
        $patients = Patient::whereHas('visits', function ($query) use ($practitioner) {
            $query->where('practitioner_id', $practitioner->id);
        })
        ->with(['user', 'visits' => function ($query) use ($practitioner) {
            $query->where('practitioner_id', $practitioner->id)
                  ->latest()
                  ->take(5);
        }])
        ->withCount(['visits' => function ($query) use ($practitioner) {
            $query->where('practitioner_id', $practitioner->id);
        }])
        ->paginate(15);

        return Inertia::render('Practitioner/Patients/Index', [
            'patients' => $patients,
        ]);
    }

    /**
     * Display the specified patient details
     */
    public function show(Patient $patient)
    {
        $practitioner = Auth::user()->practitioner;
        
        // Verify practitioner has access to this patient
        $hasAccess = Visit::where('patient_id', $patient->id)
            ->where('practitioner_id', $practitioner->id)
            ->exists();
            
        if (!$hasAccess) {
            abort(403, 'Unauthorized access to patient record');
        }

        $patient->load([
            'user',
            'medicalHistories' => function ($query) {
                $query->latest()->take(10);
            },
            'vitals' => function ($query) {
                $query->latest()->take(10);
            },
            'visits' => function ($query) use ($practitioner) {
                $query->where('practitioner_id', $practitioner->id)
                      ->with('service')
                      ->latest();
            }
        ]);

        return Inertia::render('Practitioner/Patients/Show', [
            'patient' => $patient,
        ]);
    }

    /**
     * Show form to record vitals
     */
    public function createVitals(Patient $patient)
    {
        $practitioner = Auth::user()->practitioner;
        
        // Verify access
        $hasAccess = Visit::where('patient_id', $patient->id)
            ->where('practitioner_id', $practitioner->id)
            ->exists();
            
        if (!$hasAccess) {
            abort(403, 'Unauthorized access to patient record');
        }

        return Inertia::render('Practitioner/Patients/RecordVitals', [
            'patient' => $patient->load('user'),
        ]);
    }

    /**
     * Store vitals for a patient
     */
    public function storeVitals(Request $request, Patient $patient)
    {
        $practitioner = Auth::user()->practitioner;
        
        // Verify access
        $hasAccess = Visit::where('patient_id', $patient->id)
            ->where('practitioner_id', $practitioner->id)
            ->exists();
            
        if (!$hasAccess) {
            abort(403, 'Unauthorized access to patient record');
        }

        $validated = $request->validate([
            'visit_id' => 'nullable|exists:visits,id',
            'blood_pressure_systolic' => 'nullable|integer|min:60|max:250',
            'blood_pressure_diastolic' => 'nullable|integer|min:40|max:150',
            'heart_rate' => 'nullable|integer|min:40|max:200',
            'temperature' => 'nullable|numeric|min:35|max:42',
            'respiratory_rate' => 'nullable|integer|min:8|max:40',
            'oxygen_saturation' => 'nullable|integer|min:70|max:100',
            'blood_glucose' => 'nullable|numeric|min:0|max:600',
            'weight' => 'nullable|numeric|min:0|max:500',
            'height' => 'nullable|numeric|min:0|max:300',
            'notes' => 'nullable|string|max:1000',
        ]);

        Vital::create([
            'patient_id' => $patient->id,
            'visit_id' => $validated['visit_id'] ?? null,
            'recorded_by' => Auth::id(),
            'blood_pressure_systolic' => $validated['blood_pressure_systolic'] ?? null,
            'blood_pressure_diastolic' => $validated['blood_pressure_diastolic'] ?? null,
            'heart_rate' => $validated['heart_rate'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'respiratory_rate' => $validated['respiratory_rate'] ?? null,
            'oxygen_saturation' => $validated['oxygen_saturation'] ?? null,
            'blood_glucose' => $validated['blood_glucose'] ?? null,
            'weight' => $validated['weight'] ?? null,
            'height' => $validated['height'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('practitioner.patients.show', $patient)
            ->with('success', 'Vitals recorded successfully');
    }

    /**
     * Add medical history/notes for a patient
     */
    public function addMedicalHistory(Request $request, Patient $patient)
    {
        $practitioner = Auth::user()->practitioner;
        
        // Verify access
        $hasAccess = Visit::where('patient_id', $patient->id)
            ->where('practitioner_id', $practitioner->id)
            ->exists();
            
        if (!$hasAccess) {
            abort(403, 'Unauthorized access to patient record');
        }

        $validated = $request->validate([
            'visit_id' => 'nullable|exists:visits,id',
            'condition' => 'required|string|max:255',
            'diagnosis' => 'nullable|string|max:500',
            'treatment' => 'nullable|string|max:500',
            'medications' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'severity' => 'nullable|in:mild,moderate,severe,critical',
        ]);

        MedicalHistory::create([
            'patient_id' => $patient->id,
            'visit_id' => $validated['visit_id'] ?? null,
            'recorded_by' => Auth::id(),
            'condition' => $validated['condition'],
            'diagnosis' => $validated['diagnosis'] ?? null,
            'treatment' => $validated['treatment'] ?? null,
            'medications' => $validated['medications'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'severity' => $validated['severity'] ?? 'moderate',
        ]);

        return redirect()->route('practitioner.patients.show', $patient)
            ->with('success', 'Medical history added successfully');
    }

    /**
     * Get patient visit history
     */
    public function visitHistory(Patient $patient)
    {
        $practitioner = Auth::user()->practitioner;
        
        $visits = Visit::where('patient_id', $patient->id)
            ->where('practitioner_id', $practitioner->id)
            ->with(['service', 'vitals', 'medicalHistories'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Practitioner/Patients/VisitHistory', [
            'patient' => $patient->load('user'),
            'visits' => $visits,
        ]);
    }
}
