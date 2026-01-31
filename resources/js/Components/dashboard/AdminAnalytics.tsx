import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
  MapPin,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface AnalyticsData {
  totalPatients: number;
  totalPractitioners: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  appointmentsByStatus: { name: string; value: number }[];
  appointmentsByService: { name: string; count: number }[];
  revenueByPayment: { name: string; value: number }[];
}

const COLORS = ['hsl(212, 85%, 45%)', 'hsl(142, 70%, 45%)', 'hsl(45, 95%, 55%)', 'hsl(0, 75%, 55%)', 'hsl(175, 60%, 50%)'];

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch patients count
      const { count: patientCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      // Fetch practitioners count
      const { count: practitionerCount } = await supabase
        .from("practitioner_profiles")
        .select("*", { count: "exact", head: true });

      // Fetch appointments with details
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*");

      const appointmentsData = appointments || [];
      
      // Calculate appointment stats
      const pending = appointmentsData.filter(a => a.status === "pending").length;
      const completed = appointmentsData.filter(a => a.status === "completed").length;
      const confirmed = appointmentsData.filter(a => a.status === "confirmed").length;
      const cancelled = appointmentsData.filter(a => a.status === "cancelled").length;
      const inProgress = appointmentsData.filter(a => a.status === "in_progress").length;

      // Calculate revenue
      const totalRevenue = appointmentsData
        .filter(a => a.payment_status === "completed")
        .reduce((sum, a) => sum + (a.payment_amount || 0), 0);

      // Group by service type
      const serviceGroups: Record<string, number> = {};
      appointmentsData.forEach(a => {
        serviceGroups[a.service_type] = (serviceGroups[a.service_type] || 0) + 1;
      });

      // Group by payment method
      const paymentGroups: Record<string, number> = {};
      appointmentsData.forEach(a => {
        const method = a.payment_method || "cash";
        paymentGroups[method] = (paymentGroups[method] || 0) + (a.payment_amount || 0);
      });

      setAnalytics({
        totalPatients: patientCount || 0,
        totalPractitioners: practitionerCount || 0,
        totalAppointments: appointmentsData.length,
        pendingAppointments: pending,
        completedAppointments: completed,
        totalRevenue,
        appointmentsByStatus: [
          { name: "Pending", value: pending },
          { name: "Confirmed", value: confirmed },
          { name: "In Progress", value: inProgress },
          { name: "Completed", value: completed },
          { name: "Cancelled", value: cancelled },
        ].filter(s => s.value > 0),
        appointmentsByService: Object.entries(serviceGroups).map(([name, count]) => ({
          name: name.length > 15 ? name.substring(0, 15) + "..." : name,
          count,
        })),
        revenueByPayment: Object.entries(paymentGroups).map(([name, value]) => ({
          name: name.replace("_", " ").toUpperCase(),
          value,
        })),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center text-muted-foreground">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-card-foreground">System Analytics</h2>
        <p className="text-sm text-muted-foreground">Overview of system performance and metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-card-foreground">{analytics.totalPatients}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Practitioners</p>
                <p className="text-3xl font-bold text-card-foreground">{analytics.totalPractitioners}</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <UserCheck className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <p className="text-3xl font-bold text-card-foreground">{analytics.totalAppointments}</p>
                <p className="text-xs text-muted-foreground">{analytics.pendingAppointments} pending</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (TZS)</p>
                <p className="text-3xl font-bold text-card-foreground">
                  {analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.appointmentsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.appointmentsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No appointment data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments by Service */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Appointments by Service</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.appointmentsByService.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.appointmentsByService}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(212, 85%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No service data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Payment Method */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Revenue by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.revenueByPayment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueByPayment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => `TZS ${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" fill="hsl(142, 70%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No revenue data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
