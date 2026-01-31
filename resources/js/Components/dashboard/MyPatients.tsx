import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Phone,
  MapPin,
  Activity,
  FileText,
  Heart,
  ClipboardList,
  Calendar,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile?: {
    full_name: string;
    phone: string | null;
    address: string | null;
  };
  lastAppointment?: {
    appointment_date: string;
    service_type: string;
    status: string;
  };
  latestVitals?: {
    recorded_at: string;
    blood_pressure_systolic: number | null;
    blood_pressure_diastolic: number | null;
    heart_rate: number | null;
  };
}

interface MyPatientsProps {
  userId: string;
  onSelectPatient?: (patientId: string) => void;
}

export const MyPatients = ({ userId, onSelectPatient }: MyPatientsProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchMyPatients();
  }, [userId]);

  const fetchMyPatients = async () => {
    setIsLoading(true);
    try {
      // Get practitioner profile
      const { data: practitionerProfile, error: profError } = await supabase
        .from("practitioner_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (profError) throw profError;
      if (!practitionerProfile) {
        setPatients([]);
        return;
      }

      // Get unique patients from appointments
      const { data: appointments, error: appError } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("practitioner_id", practitionerProfile.id);

      if (appError) throw appError;

      const uniquePatientIds = [...new Set(appointments?.map(a => a.patient_id) || [])];

      if (uniquePatientIds.length === 0) {
        setPatients([]);
        return;
      }

      // Fetch patient details
      const { data: patientsData, error: patError } = await supabase
        .from("patients")
        .select("*")
        .in("id", uniquePatientIds);

      if (patError) throw patError;

      // Fetch profiles for patients
      const patientUserIds = patientsData?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, address")
        .in("user_id", patientUserIds);

      // Fetch last appointment for each patient
      const enrichedPatients: Patient[] = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const profile = profiles?.find(p => p.user_id === patient.user_id);

          // Get last appointment
          const { data: lastAppt } = await supabase
            .from("appointments")
            .select("appointment_date, service_type, status")
            .eq("patient_id", patient.id)
            .eq("practitioner_id", practitionerProfile.id)
            .order("appointment_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get latest vitals
          const { data: latestVitals } = await supabase
            .from("vital_signs")
            .select("recorded_at, blood_pressure_systolic, blood_pressure_diastolic, heart_rate")
            .eq("patient_id", patient.id)
            .order("recorded_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...patient,
            profile: profile ? {
              full_name: profile.full_name,
              phone: profile.phone,
              address: profile.address,
            } : undefined,
            lastAppointment: lastAppt || undefined,
            latestVitals: latestVitals || undefined,
          };
        })
      );

      setPatients(enrichedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const name = patient.profile?.full_name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query);
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    onSelectPatient?.(patient.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedPatient(null)}
          className="mb-4"
        >
          ← Back to Patients
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {selectedPatient.profile?.full_name || "Unknown Patient"}
                </CardTitle>
                <p className="text-muted-foreground">
                  {selectedPatient.date_of_birth
                    ? `DOB: ${format(new Date(selectedPatient.date_of_birth), "PPP")}`
                    : "DOB not specified"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Info */}
            <div className="grid gap-4 md:grid-cols-2">
              {selectedPatient.profile?.phone && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedPatient.profile.phone}</p>
                  </div>
                </div>
              )}
              {selectedPatient.profile?.address && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedPatient.profile.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Medical Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Medical Information
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {selectedPatient.blood_type && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="text-xl font-bold text-destructive">{selectedPatient.blood_type}</p>
                  </div>
                )}

                {selectedPatient.emergency_contact_name && (
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{selectedPatient.emergency_contact_name}</p>
                    <p className="text-sm">{selectedPatient.emergency_contact_phone}</p>
                  </div>
                )}
              </div>

              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <p className="font-semibold text-warning">Allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="outline" className="border-warning text-warning">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedPatient.medical_conditions && selectedPatient.medical_conditions.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-2">Medical Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medical_conditions.map((condition, idx) => (
                      <Badge key={idx} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Latest Vitals */}
            {selectedPatient.latestVitals && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive" />
                  Latest Vitals
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Blood Pressure</p>
                    <p className="text-lg font-bold">
                      {selectedPatient.latestVitals.blood_pressure_systolic || "--"}/
                      {selectedPatient.latestVitals.blood_pressure_diastolic || "--"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Heart Rate</p>
                    <p className="text-lg font-bold">
                      {selectedPatient.latestVitals.heart_rate || "--"} bpm
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Recorded</p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedPatient.latestVitals.recorded_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <Button onClick={() => onSelectPatient?.(selectedPatient.id)}>
                <Heart className="w-4 h-4 mr-2" />
                Record Vitals
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Records
              </Button>
              <Button variant="outline">
                <ClipboardList className="w-4 h-4 mr-2" />
                Care Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">My Patients</h2>
          <p className="text-sm text-muted-foreground">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? "No patients match your search" : "No patients assigned yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="shadow-card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePatientSelect(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {patient.profile?.full_name || "Unknown Patient"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {patient.blood_type && (
                          <span className="text-destructive font-medium">{patient.blood_type}</span>
                        )}
                        {patient.lastAppointment && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last visit: {format(new Date(patient.lastAppointment.appointment_date), "MMM d")}
                          </span>
                        )}
                      </div>
                      {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {patient.medical_conditions.slice(0, 2).map((cond, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cond}
                            </Badge>
                          ))}
                          {patient.medical_conditions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{patient.medical_conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
