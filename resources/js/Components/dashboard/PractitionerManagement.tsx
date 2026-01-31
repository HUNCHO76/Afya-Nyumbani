import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2
} from "lucide-react";

interface Practitioner {
  id: string;
  user_id: string;
  specialization: string | null;
  license_number: string | null;
  is_available: boolean | null;
  work_start_time: string | null;
  work_end_time: string | null;
  available_days: string[] | null;
  current_latitude: number | null;
  current_longitude: number | null;
  service_radius_km: number | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  appointmentCount?: number;
}

export const PractitionerManagement = () => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPractitioners();
  }, []);

  const fetchPractitioners = async () => {
    try {
      const { data: practitionersData, error } = await supabase
        .from("practitioner_profiles")
        .select("*");

      if (error) throw error;

      // Fetch profiles for each practitioner
      const practitionersWithProfiles = await Promise.all(
        (practitionersData || []).map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("user_id", p.user_id)
            .single();

          const { count } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("practitioner_id", p.id);

          return {
            ...p,
            profile: profile || { full_name: "Unknown", email: "", phone: null },
            appointmentCount: count || 0,
          };
        })
      );

      setPractitioners(practitionersWithProfiles);
    } catch (error) {
      console.error("Error fetching practitioners:", error);
      toast({
        title: "Error",
        description: "Failed to load practitioners",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (practitionerId: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("practitioner_profiles")
        .update({ is_available: !currentStatus })
        .eq("id", practitionerId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Practitioner is now ${!currentStatus ? "available" : "unavailable"}`,
      });

      fetchPractitioners();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const filteredPractitioners = practitioners.filter(
    (p) =>
      p.profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-xl font-semibold text-card-foreground">Practitioner Management</h2>
          <p className="text-sm text-muted-foreground">Manage healthcare practitioners and their schedules</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search practitioners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Practitioners</p>
                <p className="text-2xl font-bold text-card-foreground">{practitioners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Now</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {practitioners.filter((p) => p.is_available).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <MapPin className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Location</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {practitioners.filter((p) => p.current_latitude).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practitioners Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPractitioners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No practitioners found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPractitioners.map((practitioner) => (
                  <TableRow key={practitioner.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {practitioner.profile?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {practitioner.profile?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {practitioner.specialization || "General"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{practitioner.appointmentCount} total</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {practitioner.work_start_time?.slice(0, 5)} - {practitioner.work_end_time?.slice(0, 5)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          practitioner.is_available
                            ? "bg-secondary/10 text-secondary border-secondary"
                            : "bg-destructive/10 text-destructive border-destructive"
                        }
                      >
                        {practitioner.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPractitioner(practitioner);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAvailability(practitioner.id, practitioner.is_available)}
                        >
                          {practitioner.is_available ? (
                            <XCircle className="w-4 h-4 text-destructive" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-secondary" />
                          )}
                        </Button>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Practitioner Details</DialogTitle>
          </DialogHeader>
          {selectedPractitioner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedPractitioner.profile?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPractitioner.profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPractitioner.profile?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{selectedPractitioner.license_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedPractitioner.specialization || "General"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Radius</p>
                  <p className="font-medium">{selectedPractitioner.service_radius_km || 20} km</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Available Days</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPractitioner.available_days?.map((day) => (
                    <Badge key={day} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedPractitioner.current_latitude && (
                <div>
                  <p className="text-sm text-muted-foreground">Current Location</p>
                  <p className="font-medium">
                    {selectedPractitioner.current_latitude.toFixed(4)}, {selectedPractitioner.current_longitude?.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
