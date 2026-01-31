import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  Calendar,
  Clock,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  Loader2,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  location_address: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  insurance_provider: string | null;
  mobile_money_provider: string | null;
  patient_id: string;
  practitioner_id: string | null;
  patientName?: string;
  practitionerName?: string;
}

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitioners, setPractitioners] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchPractitioners();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: false });

      if (error) throw error;

      // Fetch patient and practitioner names
      const appointmentsWithNames = await Promise.all(
        (data || []).map(async (apt) => {
          const { data: patient } = await supabase
            .from("patients")
            .select("user_id")
            .eq("id", apt.patient_id)
            .single();

          let patientName = "Unknown";
          if (patient) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", patient.user_id)
              .single();
            patientName = profile?.full_name || "Unknown";
          }

          let practitionerName = "Unassigned";
          if (apt.practitioner_id) {
            const { data: practitioner } = await supabase
              .from("practitioner_profiles")
              .select("user_id")
              .eq("id", apt.practitioner_id)
              .single();
            if (practitioner) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("user_id", practitioner.user_id)
                .single();
              practitionerName = profile?.full_name || "Unknown";
            }
          }

          return { ...apt, patientName, practitionerName };
        })
      );

      setAppointments(appointmentsWithNames);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const { data } = await supabase.from("practitioner_profiles").select("id, user_id");
      
      const practitionersWithNames = await Promise.all(
        (data || []).map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", p.user_id)
            .single();
          return { id: p.id, name: profile?.full_name || "Unknown" };
        })
      );

      setPractitioners(practitionersWithNames);
    } catch (error) {
      console.error("Error fetching practitioners:", error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({ title: "Status Updated", description: `Appointment marked as ${newStatus}` });
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const assignPractitioner = async (appointmentId: string, practitionerId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ practitioner_id: practitionerId, status: "confirmed" })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({ title: "Practitioner Assigned", description: "Appointment has been assigned" });
      fetchAppointments();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error assigning practitioner:", error);
      toast({ title: "Error", description: "Failed to assign practitioner", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-warning/10 text-warning border-warning",
      confirmed: "bg-primary/10 text-primary border-primary",
      in_progress: "bg-accent/10 text-accent border-accent",
      completed: "bg-secondary/10 text-secondary border-secondary",
      cancelled: "bg-destructive/10 text-destructive border-destructive",
    };
    return <Badge variant="outline" className={styles[status] || ""}>{status}</Badge>;
  };

  const getPaymentBadge = (method: string | null) => {
    if (!method) return null;
    const labels: Record<string, string> = {
      cash: "Cash",
      insurance: "Insurance",
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
    };
    return <Badge variant="outline">{labels[method] || method}</Badge>;
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-card-foreground">All Appointments</h2>
        <p className="text-sm text-muted-foreground">Manage and assign appointments system-wide</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Practitioner</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.patientName}</TableCell>
                    <TableCell>{apt.service_type}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(apt.appointment_date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {apt.appointment_time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{apt.practitionerName}</TableCell>
                    <TableCell>{getPaymentBadge(apt.payment_method)}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {apt.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-secondary"
                            onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedAppointment.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.appointment_date), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedAppointment.appointment_time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{selectedAppointment.payment_method || "Cash"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {selectedAppointment.payment_amount
                      ? `TZS ${selectedAppointment.payment_amount.toLocaleString()}`
                      : "Not set"}
                  </p>
                </div>
              </div>

              {selectedAppointment.insurance_provider && (
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Provider</p>
                  <p className="font-medium">{selectedAppointment.insurance_provider}</p>
                </div>
              )}

              {selectedAppointment.location_address && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedAppointment.location_address}
                  </p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Assign Practitioner */}
              {selectedAppointment.status === "pending" && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Assign Practitioner</p>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => assignPractitioner(selectedAppointment.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select practitioner" />
                      </SelectTrigger>
                      <SelectContent>
                        {practitioners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
