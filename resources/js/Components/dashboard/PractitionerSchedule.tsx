import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Navigation,
  CheckCircle,
  Play,
  Loader2,
  Settings
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  notes: string | null;
  patient_id: string;
}

interface PractitionerProfile {
  id: string;
  specialization: string | null;
  license_number: string | null;
  available_days: string[] | null;
  work_start_time: string | null;
  work_end_time: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  is_available: boolean;
}

interface PractitionerScheduleProps {
  userId: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const PractitionerSchedule = ({ userId }: PractitionerScheduleProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<PractitionerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Profile form state
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [workStartTime, setWorkStartTime] = useState("08:00");
  const [workEndTime, setWorkEndTime] = useState("17:00");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (profile) {
      fetchAppointments();
    }
  }, [profile, selectedDate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("practitioner_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setSpecialization(data.specialization || "");
        setLicenseNumber(data.license_number || "");
        setAvailableDays(data.available_days || []);
        setWorkStartTime(data.work_start_time || "08:00");
        setWorkEndTime(data.work_end_time || "17:00");
        setIsAvailable(data.is_available);
      } else {
        // Create initial profile
        await createProfile();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("practitioner_profiles")
        .insert({
          user_id: userId,
          available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          work_start_time: "08:00",
          work_end_time: "17:00",
          is_available: true,
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setAvailableDays(data.available_days || []);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const fetchAppointments = async () => {
    if (!profile) return;
    
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("practitioner_id", profile.id)
        .gte("appointment_date", format(weekStart, "yyyy-MM-dd"))
        .lte("appointment_date", format(weekEnd, "yyyy-MM-dd"))
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("practitioner_profiles")
        .update({
          specialization: specialization || null,
          license_number: licenseNumber || null,
          available_days: availableDays,
          work_start_time: workStartTime,
          work_end_time: workEndTime,
          is_available: isAvailable,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your schedule settings have been saved",
      });
      
      setSettingsOpen(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!profile || !navigator.geolocation) {
      toast({
        title: "Location Not Available",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { error } = await supabase
            .from("practitioner_profiles")
            .update({
              current_latitude: position.coords.latitude,
              current_longitude: position.coords.longitude,
            })
            .eq("id", profile.id);

          if (error) throw error;

          toast({
            title: "Location Updated",
            description: "Your current location has been updated",
          });
          
          fetchProfile();
        } catch (error) {
          console.error("Error updating location:", error);
          toast({
            title: "Error",
            description: "Failed to update location",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your current location",
          variant: "destructive",
        });
      }
    );
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Appointment marked as ${status}`,
      });
      
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Confirmed</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return addDays(weekStart, i);
  });

  const todayAppointments = appointments.filter(a => 
    isSameDay(new Date(a.appointment_date), new Date())
  );

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
          <h2 className="text-xl font-semibold text-card-foreground">My Schedule</h2>
          <p className="text-sm text-muted-foreground">Manage your appointments and availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUpdateLocation}>
            <Navigation className="w-4 h-4 mr-2" />
            Update Location
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Schedule Settings
          </Button>
        </div>
      </div>

      {/* Availability Status */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-secondary" : "bg-destructive"}`} />
              <div>
                <p className="font-medium text-card-foreground">
                  {isAvailable ? "Available for Appointments" : "Not Available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.specialization || "General Practice"} • {workStartTime} - {workEndTime}
                </p>
              </div>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={async (checked) => {
                setIsAvailable(checked);
                if (profile) {
                  await supabase
                    .from("practitioner_profiles")
                    .update({ is_available: checked })
                    .eq("id", profile.id);
                  toast({
                    title: checked ? "Now Available" : "Set to Unavailable",
                    description: checked ? "You can receive new appointments" : "New appointments are paused",
                  });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Today's Visits ({todayAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{appointment.appointment_time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{appointment.service_type}</p>
                      {appointment.location_address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {appointment.location_address}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex gap-2">
                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, "in_progress")}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {appointment.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, "completed")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {appointment.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {appointment.location_latitude && appointment.location_longitude && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${appointment.location_latitude},${appointment.location_longitude}`,
                            "_blank"
                          );
                        }}
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Calendar */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Schedule</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAppointments = appointments.filter(a => 
                isSameDay(new Date(a.appointment_date), day)
              );
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 rounded-lg border ${isToday ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-card-foreground"}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 bg-primary/10 rounded truncate"
                        title={`${apt.appointment_time} - ${apt.service_type}`}
                      >
                        {apt.appointment_time}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{dayAppointments.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input
                placeholder="e.g., Wound Care, Physiotherapy"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>License Number</Label>
              <Input
                placeholder="Your professional license number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Start Time</Label>
                <Input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Work End Time</Label>
                <Input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day}
                    variant={availableDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="w-full bg-gradient-primary shadow-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
