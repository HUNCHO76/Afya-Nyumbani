import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Heart, Phone, MapPin, Loader2 } from "lucide-react";

interface PatientSetupProps {
  userId: string;
  onComplete: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const PatientSetup = ({ userId, onComplete }: PatientSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const allergiesArray = allergies.split(",").map(a => a.trim()).filter(a => a);
      const conditionsArray = medicalConditions.split(",").map(c => c.trim()).filter(c => c);

      const { error } = await supabase.from("patients").insert({
        user_id: userId,
        date_of_birth: dateOfBirth || null,
        blood_type: bloodType || null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null,
        medical_conditions: conditionsArray.length > 0 ? conditionsArray : null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
      });

      if (error) throw error;

      toast({
        title: "Profile Created",
        description: "Your patient profile has been set up successfully",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error creating patient profile:", error);
      toast({
        title: "Error",
        description: "Failed to create patient profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Complete Your Patient Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Help us provide better care by sharing some basic health information
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Blood Type</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Known Allergies</Label>
            <Textarea
              placeholder="List any allergies, separated by commas (e.g., Penicillin, Peanuts, Latex)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Medical Conditions</Label>
            <Textarea
              placeholder="List any existing medical conditions, separated by commas (e.g., Diabetes, Hypertension)"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              rows={2}
            />
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-card-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Emergency Contact
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  placeholder="Full name"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+255 XXX XXX XXX"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-primary shadow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onComplete}
              disabled={isLoading}
            >
              Skip for Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
