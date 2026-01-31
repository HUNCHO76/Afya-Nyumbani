import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Scale,
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { format } from "date-fns";

interface VitalSign {
  id: string;
  recorded_at: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  blood_glucose: number | null;
  notes: string | null;
}

interface VitalSignsProps {
  patientId: string | null;
  userRole: "admin" | "practitioner" | "client";
  userId: string;
}

export const VitalSigns = ({ patientId, userRole, userId }: VitalSignsProps) => {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [notes, setNotes] = useState("");

  const canAddVitals = userRole === "practitioner" || userRole === "admin";

  useEffect(() => {
    if (patientId) {
      fetchVitals();
    }
  }, [patientId]);

  const fetchVitals = async () => {
    if (!patientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vital_signs")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setVitals(data || []);
    } catch (error) {
      console.error("Error fetching vitals:", error);
      toast({
        title: "Error",
        description: "Failed to load vital signs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVitals = async () => {
    if (!patientId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("vital_signs").insert({
        patient_id: patientId,
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
      });

      if (error) throw error;

      toast({
        title: "Vital Signs Recorded",
        description: "Vital signs have been saved successfully",
      });
      
      setDialogOpen(false);
      resetForm();
      fetchVitals();
    } catch (error) {
      console.error("Error recording vitals:", error);
      toast({
        title: "Error",
        description: "Failed to record vital signs",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  const getLatestVitals = () => {
    if (vitals.length === 0) return null;
    return vitals[0];
  };

  const getVitalStatus = (type: string, value: number | null) => {
    if (value === null) return "normal";
    
    switch (type) {
      case "heart_rate":
        if (value < 60 || value > 100) return "warning";
        return "normal";
      case "oxygen":
        if (value < 95) return "warning";
        return "normal";
      case "temperature":
        if (value < 36 || value > 37.5) return "warning";
        return "normal";
      case "systolic":
        if (value < 90 || value > 140) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  const latest = getLatestVitals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Vital Signs</h2>
          <p className="text-sm text-muted-foreground">Track and monitor patient health metrics</p>
        </div>
        {canAddVitals && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-primary">
                <Plus className="w-4 h-4 mr-2" />
                Record Vitals
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Record Vital Signs</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Blood Pressure (Systolic)</Label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="120"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Blood Pressure (Diastolic)</Label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="80"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Heart Rate (bpm)</Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="72"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="36.6"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Respiratory Rate (/min)</Label>
                  <div className="relative">
                    <Wind className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="16"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Oxygen Saturation (%)</Label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="98"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Blood Glucose (mmol/L)</Label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any observations or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    onClick={handleAddVitals}
                    disabled={isSaving}
                    className="w-full bg-gradient-primary shadow-primary"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Save Vital Signs
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Latest Vitals Summary */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {latest.blood_pressure_systolic || "--"}/{latest.blood_pressure_diastolic || "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">mmHg</p>
                </div>
                <div className={`p-2 rounded-lg ${getVitalStatus("systolic", latest.blood_pressure_systolic) === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Heart Rate</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {latest.heart_rate || "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">bpm</p>
                </div>
                <div className={`p-2 rounded-lg ${getVitalStatus("heart_rate", latest.heart_rate) === "warning" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                  <Heart className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {latest.temperature || "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">°C</p>
                </div>
                <div className={`p-2 rounded-lg ${getVitalStatus("temperature", Number(latest.temperature)) === "warning" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"}`}>
                  <Thermometer className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">O₂ Saturation</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {latest.oxygen_saturation || "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">%</p>
                </div>
                <div className={`p-2 rounded-lg ${getVitalStatus("oxygen", latest.oxygen_saturation) === "warning" ? "bg-warning/10 text-warning" : "bg-secondary/10 text-secondary"}`}>
                  <Droplet className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vitals History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Vitals History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vitals.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No vital signs recorded yet.
                {canAddVitals && <><br />Record the first vital signs for this patient.</>}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">BP</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">HR</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">Temp</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">O₂</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">Weight</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">Glucose</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((vital) => (
                    <tr key={vital.id} className="border-b border-border/50">
                      <td className="py-2 px-2 text-card-foreground">
                        {format(new Date(vital.recorded_at), "MMM d, h:mm a")}
                      </td>
                      <td className="text-center py-2 px-2">
                        {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                          ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                          : "--"}
                      </td>
                      <td className="text-center py-2 px-2">{vital.heart_rate || "--"}</td>
                      <td className="text-center py-2 px-2">{vital.temperature || "--"}</td>
                      <td className="text-center py-2 px-2">{vital.oxygen_saturation || "--"}%</td>
                      <td className="text-center py-2 px-2">{vital.weight ? `${vital.weight} kg` : "--"}</td>
                      <td className="text-center py-2 px-2">{vital.blood_glucose || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
