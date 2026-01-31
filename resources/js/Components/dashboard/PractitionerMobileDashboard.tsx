import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useGPSTracking } from "@/hooks/useGPSTracking";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import {
  Navigation,
  MapPin,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  Activity,
  Users,
  ChevronRight,
  Play,
  CheckCircle,
  Loader2,
  RefreshCw,
  Crosshair
} from "lucide-react";
import { format, isSameDay } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  patient_id: string;
  patientName?: string;
}

interface PractitionerMobileDashboardProps {
  userId: string;
  practitionerProfileId: string | null;
}

export const PractitionerMobileDashboard = ({ 
  userId, 
  practitionerProfileId 
}: PractitionerMobileDashboardProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  const { isOnline, pendingCount, isSyncing, syncPendingData } = useOfflineSync();
  
  const { 
    currentLocation, 
    isTracking, 
    lastUpdate, 
    manualUpdate,
    startTracking,
    stopTracking 
  } = useGPSTracking({
    practitionerProfileId,
    enableTracking: trackingEnabled,
    updateInterval: 60000,
  });

  useEffect(() => {
    if (practitionerProfileId) {
      fetchTodaysAppointments();
    }
  }, [practitionerProfileId]);

  const fetchTodaysAppointments = async () => {
    if (!practitionerProfileId) return;
    
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("practitioner_id", practitionerProfileId)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true });

      if (error) throw error;

      // Fetch patient names
      if (appointmentsData && appointmentsData.length > 0) {
        const patientIds = appointmentsData.map(a => a.patient_id);
        const { data: patients } = await supabase
          .from("patients")
          .select("id, user_id")
          .in("id", patientIds);

        if (patients) {
          const userIds = patients.map(p => p.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);

          const enriched = appointmentsData.map(apt => {
            const patient = patients.find(p => p.id === apt.patient_id);
            const profile = profiles?.find(p => p.user_id === patient?.user_id);
            return {
              ...apt,
              patientName: profile?.full_name || "Unknown Patient"
            };
          });

          setAppointments(enriched);
        } else {
          setAppointments(appointmentsData);
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;
      fetchTodaysAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleToggleTracking = (enabled: boolean) => {
    setTrackingEnabled(enabled);
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning border-warning";
      case "confirmed": return "bg-primary/10 text-primary border-primary";
      case "in_progress": return "bg-accent/10 text-accent border-accent";
      case "completed": return "bg-secondary/10 text-secondary border-secondary";
      default: return "bg-muted";
    }
  };

  const activeAppointment = appointments.find(a => a.status === "in_progress");
  const upcomingAppointments = appointments.filter(a => 
    a.status === "pending" || a.status === "confirmed"
  );
  const completedCount = appointments.filter(a => a.status === "completed").length;

  return (
    <div className="space-y-4 pb-20">
      {/* Status Bar */}
      <Card className={`shadow-card ${isOnline ? "border-secondary/50" : "border-warning/50"}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-secondary" />
              ) : (
                <WifiOff className="w-4 h-4 text-warning" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? "Online" : "Offline"}
              </span>
              {pendingCount > 0 && (
                <Badge variant="outline" className="text-xs border-warning text-warning">
                  {pendingCount} to sync
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOnline && pendingCount > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => syncPendingData()}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Crosshair className={`w-4 h-4 ${isTracking ? "text-secondary" : "text-muted-foreground"}`} />
                <Switch
                  checked={trackingEnabled}
                  onCheckedChange={handleToggleTracking}
                />
              </div>
            </div>
          </div>
          
          {currentLocation && isTracking && (
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </span>
              {lastUpdate && (
                <span>Updated {format(lastUpdate, "h:mm a")}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-card-foreground">{appointments.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold text-card-foreground">{upcomingAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-secondary mb-1" />
            <p className="text-2xl font-bold text-card-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Visit */}
      {activeAppointment && (
        <Card className="shadow-card border-2 border-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent animate-pulse" />
              Active Visit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-card-foreground">
                  {activeAppointment.patientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeAppointment.service_type}
                </p>
              </div>
              <p className="text-lg font-bold text-accent">
                {activeAppointment.appointment_time}
              </p>
            </div>
            
            {activeAppointment.location_address && (
              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{activeAppointment.location_address}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-secondary hover:bg-secondary/90"
                onClick={() => handleStatusUpdate(activeAppointment.id, "completed")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Visit
              </Button>
              {activeAppointment.location_latitude && activeAppointment.location_longitude && (
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${activeAppointment.location_latitude},${activeAppointment.location_longitude}`,
                      "_blank"
                    );
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Upcoming Visits ({upcomingAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No more visits for today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <p className="font-bold text-primary">{apt.appointment_time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground text-sm">
                        {apt.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground">{apt.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </Badge>
                    {apt.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusUpdate(apt.id, "in_progress")}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    {apt.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusUpdate(apt.id, "confirmed")}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Location Update */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={manualUpdate}
      >
        <Navigation className="w-4 h-4 mr-2" />
        Update My Location
      </Button>
    </div>
  );
};
