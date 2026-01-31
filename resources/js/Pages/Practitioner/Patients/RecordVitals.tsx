import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

interface Patient {
  id: string;
  user: {
    name: string;
  };
}

interface Props {
  patient: Patient;
}

const RecordVitals = ({ patient }: Props) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };
  
  const { data, setData, post, processing, errors } = useForm({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    blood_glucose: '',
    weight: '',
    height: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      visit_id: data.visit_id || null,
      blood_pressure_systolic: data.blood_pressure_systolic || null,
      blood_pressure_diastolic: data.blood_pressure_diastolic || null,
      temperature: data.temperature || null,
      heart_rate: data.heart_rate || null,
      respiratory_rate: data.respiratory_rate || null,
      oxygen_saturation: data.oxygen_saturation || null,
      blood_glucose: data.blood_glucose || null,
      weight: data.weight || null,
      height: data.height || null,
      notes: data.notes || null,
      recorded_at: new Date().toISOString(),
    };

    // If offline, queue the payload and redirect back to patient page
    if (!navigator.onLine) {
      const { enqueue } = await import('@/utils/offlineSync');
      await enqueue({ type: 'vital', payload, createdAt: new Date().toISOString() });
      router.visit(`/practitioner/patients/${patient.id}`);
      return;
    }

    post(`/practitioner/patients/${patient.id}/vitals`, payload, {
      onFinish: () => {},
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} />
      
      <MainSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <Link href={`/practitioner/patients/${patient.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Record Vitals</h1>
                <p className="text-muted-foreground">Patient: {patient.user.name}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl">
              <div className="rounded-lg border bg-card p-6 space-y-6">
                {/* Blood Pressure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blood_pressure_systolic">
                      Blood Pressure - Systolic (mmHg)
                    </Label>
                    <Input
                      id="blood_pressure_systolic"
                      type="number"
                      value={data.blood_pressure_systolic}
                      onChange={(e) => setData('blood_pressure_systolic', e.target.value)}
                      placeholder="120"
                      min="60"
                      max="250"
                    />
                    {errors.blood_pressure_systolic && (
                      <p className="text-sm text-red-500 mt-1">{errors.blood_pressure_systolic}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="blood_pressure_diastolic">
                      Blood Pressure - Diastolic (mmHg)
                    </Label>
                    <Input
                      id="blood_pressure_diastolic"
                      type="number"
                      value={data.blood_pressure_diastolic}
                      onChange={(e) => setData('blood_pressure_diastolic', e.target.value)}
                      placeholder="80"
                      min="40"
                      max="150"
                    />
                    {errors.blood_pressure_diastolic && (
                      <p className="text-sm text-red-500 mt-1">{errors.blood_pressure_diastolic}</p>
                    )}
                  </div>
                </div>

                {/* Heart Rate & Temperature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                    <Input
                      id="heart_rate"
                      type="number"
                      value={data.heart_rate}
                      onChange={(e) => setData('heart_rate', e.target.value)}
                      placeholder="72"
                      min="40"
                      max="200"
                    />
                    {errors.heart_rate && (
                      <p className="text-sm text-red-500 mt-1">{errors.heart_rate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={data.temperature}
                      onChange={(e) => setData('temperature', e.target.value)}
                      placeholder="36.5"
                      min="35"
                      max="42"
                    />
                    {errors.temperature && (
                      <p className="text-sm text-red-500 mt-1">{errors.temperature}</p>
                    )}
                  </div>
                </div>

                {/* Respiratory Rate & Oxygen Saturation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="respiratory_rate">Respiratory Rate (breaths/min)</Label>
                    <Input
                      id="respiratory_rate"
                      type="number"
                      value={data.respiratory_rate}
                      onChange={(e) => setData('respiratory_rate', e.target.value)}
                      placeholder="16"
                      min="8"
                      max="40"
                    />
                    {errors.respiratory_rate && (
                      <p className="text-sm text-red-500 mt-1">{errors.respiratory_rate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                    <Input
                      id="oxygen_saturation"
                      type="number"
                      value={data.oxygen_saturation}
                      onChange={(e) => setData('oxygen_saturation', e.target.value)}
                      placeholder="98"
                      min="70"
                      max="100"
                    />
                    {errors.oxygen_saturation && (
                      <p className="text-sm text-red-500 mt-1">{errors.oxygen_saturation}</p>
                    )}
                  </div>
                </div>

                {/* Blood Glucose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blood_glucose">Blood Glucose (mg/dL)</Label>
                    <Input
                      id="blood_glucose"
                      type="number"
                      step="0.1"
                      value={data.blood_glucose}
                      onChange={(e) => setData('blood_glucose', e.target.value)}
                      placeholder="100"
                      min="0"
                      max="600"
                    />
                    {errors.blood_glucose && (
                      <p className="text-sm text-red-500 mt-1">{errors.blood_glucose}</p>
                    )}
                  </div>
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={data.weight}
                      onChange={(e) => setData('weight', e.target.value)}
                      placeholder="70"
                      min="0"
                      max="500"
                    />
                    {errors.weight && (
                      <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={data.height}
                      onChange={(e) => setData('height', e.target.value)}
                      placeholder="170"
                      min="0"
                      max="300"
                    />
                    {errors.height && (
                      <p className="text-sm text-red-500 mt-1">{errors.height}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional observations or notes..."
                    rows={4}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={processing}>
                    <Save className="h-4 w-4 mr-2" />
                    {processing ? 'Saving...' : 'Save Vitals'}
                  </Button>
                  <Link href={`/practitioner/patients/${patient.id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecordVitals;
