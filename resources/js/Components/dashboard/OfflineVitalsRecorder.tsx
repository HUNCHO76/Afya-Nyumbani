import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Scale,
  Wifi,
  WifiOff,
  CloudUpload,
  Check,
  Loader2,
  RefreshCw
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
}

interface OfflineVitalsRecorderProps {
  userId: string;
  patients: Patient[];
}

export const OfflineVitalsRecorder = ({ userId, patients }: OfflineVitalsRecorderProps) => {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    saveOfflineVital,
    syncPendingData,
  } = useOfflineSync();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setBpSystolic("");
    setBpDiastolic("");
    setHeartRate("");
    setTemperature("");
    setRespiratoryRate("");
    setOxygenSaturation("");
    setWeight("");
    setBloodGlucose("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;

    setIsSaving(true);
    
    saveOfflineVital({
      patient_id: selectedPatient,
      recorded_by: userId,
      blood_pressure_systolic: bpSystolic ? parseInt(bpSystolic) : null,
      blood_pressure_diastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
      heart_rate: heartRate ? parseInt(heartRate) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      respiratory_rate: respiratoryRate ? parseInt(respiratoryRate) : null,
      oxygen_saturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
      weight: weight ? parseFloat(weight) : null,
      blood_glucose: bloodGlucose ? parseFloat(bloodGlucose) : null,
      notes: notes || null,
      recorded_at: new Date().toISOString(),
    });

    setIsSaving(false);
    setShowSuccess(true);
    resetForm();
    
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={`shadow-card ${isOnline ? "border-secondary" : "border-warning"}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="p-2 rounded-full bg-secondary/10">
                  <Wifi className="w-5 h-5 text-secondary" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-warning/10">
                  <WifiOff className="w-5 h-5 text-warning" />
                </div>
              )}
              <div>
                <p className="font-medium text-card-foreground">
                  {isOnline ? "Online" : "Offline Mode"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? "Data syncing in real-time" 
                    : "Data saved locally, will sync when online"}
                </p>
              </div>
            </div>
            
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-warning text-warning">
                  {pendingCount} pending
                </Badge>
                {isOnline && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => syncPendingData()}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Record Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Quick Vitals Recording
            {showSuccess && (
              <Badge className="ml-2 bg-secondary text-secondary-foreground">
                <Check className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>Select Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vitals Grid - Mobile optimized */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">BP Systolic</Label>
              <div className="relative">
                <Activity className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">BP Diastolic</Label>
              <div className="relative">
                <Activity className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Heart Rate</Label>
              <div className="relative">
                <Heart className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Temperature °C</Label>
              <div className="relative">
                <Thermometer className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Resp. Rate</Label>
              <div className="relative">
                <Wind className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="16"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">O₂ Sat %</Label>
              <div className="relative">
                <Droplet className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="98"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Weight kg</Label>
              <div className="relative">
                <Scale className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Glucose mmol/L</Label>
              <div className="relative">
                <Droplet className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="5.5"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              placeholder="Any observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedPatient || isSaving}
            className="w-full bg-gradient-primary shadow-primary"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isOnline ? (
                  <CloudUpload className="w-4 h-4 mr-2" />
                ) : (
                  <WifiOff className="w-4 h-4 mr-2" />
                )}
                {isOnline ? "Save Vitals" : "Save Offline"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
