import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Users,
  Activity,
  DollarSign,
  Bell,
  Heart,
  Clock,
  MapPin,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  ClipboardList,
  BarChart3,
  Map,
  CreditCard,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentBooking } from "./dashboard/AppointmentBooking";
import { PatientRecords } from "./dashboard/PatientRecords";
import { VitalSigns } from "./dashboard/VitalSigns";
import { CarePlans } from "./dashboard/CarePlans";
import { PractitionerSchedule } from "./dashboard/PractitionerSchedule";
import { PatientSetup } from "./dashboard/PatientSetup";
import { AdminAnalytics } from "./dashboard/AdminAnalytics";
import { PractitionerManagement } from "./dashboard/PractitionerManagement";
import { PatientManagement } from "./dashboard/PatientManagement";
import { AdminAppointments } from "./dashboard/AdminAppointments";
import { RouteMap } from "./dashboard/RouteMap";
import { MyPatients } from "./dashboard/MyPatients";
import { OfflineVitalsRecorder } from "./dashboard/OfflineVitalsRecorder";
import { PractitionerMobileDashboard } from "./dashboard/PractitionerMobileDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

type UserRole = 'admin' | 'practitioner' | 'client';

interface DashboardProps {
  userRole: UserRole;
  userName: string;
  userId: string;
  onLogout?: () => void;
}

const sidebarItems = {
  admin: [
    { icon: BarChart3, label: "Analytics", href: "#analytics" },
    { icon: Users, label: "Practitioners", href: "#practitioners" },
    { icon: UserCheck, label: "Patients", href: "#patients" },
    { icon: Calendar, label: "Appointments", href: "#appointments" },
    { icon: Map, label: "Route Map", href: "#route-map" },
    { icon: DollarSign, label: "Financial", href: "#financial" },
    { icon: Settings, label: "Settings", href: "#settings" },
  ],
  practitioner: [
    { icon: Smartphone, label: "Mobile View", href: "#mobile" },
    { icon: Calendar, label: "My Schedule", href: "#schedule" },
    { icon: Users, label: "My Patients", href: "#patients" },
    { icon: Heart, label: "Record Vitals", href: "#offline-vitals" },
    { icon: Map, label: "Route Map", href: "#route-map" },
    { icon: FileText, label: "Patient Records", href: "#records" },
    { icon: ClipboardList, label: "Care Plans", href: "#care-plans" },
    { icon: Settings, label: "Profile", href: "#profile" },
  ],
  client: [
    { icon: Activity, label: "Overview", href: "#overview" },
    { icon: Calendar, label: "Appointments", href: "#appointments" },
    { icon: FileText, label: "Medical Records", href: "#records" },
    { icon: Heart, label: "Vital Signs", href: "#vitals" },
    { icon: ClipboardList, label: "Care Plans", href: "#care-plans" },
    { icon: Settings, label: "Profile", href: "#profile" },
  ],
};

export const Dashboard = ({ userRole, userName, userId, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState(sidebarItems[userRole][0].href);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [practitionerProfileId, setPractitionerProfileId] = useState<string | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<{ id: string; name: string }[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (userRole === "client") {
      fetchPatientId();
    }
    if (userRole === "practitioner") {
      fetchPractitionerProfile();
    }
  }, [userRole, userId]);

  const fetchPatientId = async () => {
    const { data } = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setPatientId(data.id);
    } else {
      setNeedsSetup(true);
    }
  };

  const fetchPractitionerProfile = async () => {
    const { data: profile } = await supabase
      .from("practitioner_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      setPractitionerProfileId(profile.id);
      
      // Fetch assigned patients
      const { data: appointments } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("practitioner_id", profile.id);

      if (appointments && appointments.length > 0) {
        const uniquePatientIds = [...new Set(appointments.map(a => a.patient_id))];
        
        const { data: patients } = await supabase
          .from("patients")
          .select("id, user_id")
          .in("id", uniquePatientIds);

        if (patients) {
          const userIds = patients.map(p => p.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);

          const patientList = patients.map(p => {
            const prof = profiles?.find(pr => pr.user_id === p.user_id);
            return {
              id: p.id,
              name: prof?.full_name || "Unknown Patient"
            };
          });
          setAssignedPatients(patientList);
        }
      }
    }
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    fetchPatientId();
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'practitioner': return 'Healthcare Practitioner';
      case 'client': return 'Patient Portal';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    if (userRole === "client" && needsSetup) {
      return <PatientSetup userId={userId} onComplete={handleSetupComplete} />;
    }

    // Admin content
    if (userRole === "admin") {
      switch (activeTab) {
        case "#analytics":
          return <AdminAnalytics />;
        case "#practitioners":
          return <PractitionerManagement />;
        case "#patients":
          return <PatientManagement />;
        case "#appointments":
          return <AdminAppointments />;
        case "#route-map":
          return <RouteMap isAdmin={true} />;
        case "#financial":
          return <AdminAnalytics />; // Reuse analytics for financial tab
        default:
          return <AdminAnalytics />;
      }
    }

    // Practitioner content
    if (userRole === "practitioner") {
      switch (activeTab) {
        case "#mobile":
          return <PractitionerMobileDashboard userId={userId} practitionerProfileId={practitionerProfileId} />;
        case "#schedule":
          return <PractitionerSchedule userId={userId} />;
        case "#patients":
          return <MyPatients userId={userId} />;
        case "#offline-vitals":
          return <OfflineVitalsRecorder userId={userId} patients={assignedPatients} />;
        case "#route-map":
          return <RouteMap userId={userId} />;
        case "#records":
          return <PatientRecords patientId={null} userRole={userRole} userId={userId} />;
        case "#care-plans":
          return <CarePlans patientId={null} userRole={userRole} userId={userId} />;
        default:
          return <PractitionerMobileDashboard userId={userId} practitionerProfileId={practitionerProfileId} />;
      }
    }

    // Client content
    switch (activeTab) {
      case "#appointments":
        return <AppointmentBooking patientId={patientId} userId={userId} />;
      case "#records":
        return <PatientRecords patientId={patientId} userRole={userRole} userId={userId} />;
      case "#vitals":
        return <VitalSigns patientId={patientId} userRole={userRole} userId={userId} />;
      case "#care-plans":
        return <CarePlans patientId={patientId} userRole={userRole} userId={userId} />;
      default:
        return (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a section from the sidebar to get started
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-card border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground">Afya Kongwe</h1>
              <p className="text-xs text-muted-foreground">{getRoleTitle(userRole)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems[userRole].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(item.href)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeTab === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <header className="bg-card shadow-sm border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Welcome back, {userName}!</h1>
              <p className="text-muted-foreground">
                {userRole === 'admin' && "Manage your healthcare operations efficiently"}
                {userRole === 'practitioner' && "Your patients are counting on you today"}
                {userRole === 'client' && "Stay on top of your healthcare journey"}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2">3</Badge>
            </Button>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
};
