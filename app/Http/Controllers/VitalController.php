<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVitalRequest;
use App\Models\Vital;
use App\Models\Visit;
use Illuminate\Http\Request;

class VitalController extends Controller
{
    public function index(Visit $visit)
    {
        $practitioner = auth('web')->user()?->practitioner;
        if (!$practitioner) abort(403);

        // Ensure practitioner is assigned to visit
        if ($visit->practitioner_id && $visit->practitioner_id !== $practitioner->id) {
            abort(403);
        }

        $vitals = Vital::where('visit_id', $visit->id)->orderBy('recorded_at', 'desc')->get();

        return inertia('Visits/Vitals/Index', compact('visit', 'vitals'));
    }

    public function store(StoreVitalRequest $request)
    {
        $practitioner = auth('web')->user()?->practitioner;
        if (!$practitioner) abort(403);

        $data = $request->validated();

        // If visit provided, ensure practitioner assignment
        if (!empty($data['visit_id'])) {
            $visit = Visit::findOrFail($data['visit_id']);
            if ($visit->practitioner_id && $visit->practitioner_id !== $practitioner->id) {
                abort(403);
            }
        }

        $vital = Vital::create(array_merge($data, [
            'recorded_by' => auth('web')->user()->id,
            'recorded_at' => $data['recorded_at'] ?? now(),
        ]));

        return back()->with('success', 'Vital recorded successfully')->with('vital', $vital);
    }
}
