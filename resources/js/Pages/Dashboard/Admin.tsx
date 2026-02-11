import { useState } from 'react';
import { Navigation } from '@/Components/Navigation'; // Import the new Navigation component
import MainSidebar from '@/Components/navigation/MainSidebar'; // Ensure this path is correct
import BreadcrumbTrail from '@/Components/navigation/BreadcrumbTrail';
import MetricCard from '@/Components/MetricCard';
import AppointmentTable from '@/Components/AppointmentTable'; // Ensure this path is correct
import QuickActionCard from '@/Components/QuickActionCard';
import RevenueChart from '@/Components/RevenueChart';
import PractitionerPerformance from '@/Components/PractitionerPerformance';
import AlertPanel from '@/Components/AlertPanel';
import BookingTrendsChart from '@/Components/BookingTrendsChart';

const AdministratorDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };

  // Mock user data - in a real app, this would come from your auth context or props
  const user = {
    name: "Dr. Fatuma Juma",
    role: "System Administrator",
    avatar: null // You can add avatar URL if available
  };

  const metricsData = [
    {
      title: "Active Patients",
      value: "847",
      subtitle: "Total registered",
      icon: "Users",
      trend: "up",
      trendValue: "+12% from last month",
      iconBgColor: "bg-primary/10"
    },
    {
      title: "Today's Appointments",
      value: "24",
      subtitle: "8 completed, 16 pending",
      icon: "Calendar",
      trend: "up",
      trendValue: "+5 from yesterday",
      iconBgColor: "bg-success/10"
    },
    {
      title: "Available Practitioners",
      value: "18/25",
      subtitle: "Currently on duty",
      icon: "UserCheck",
      iconBgColor: "bg-warning/10"
    },
    {
      title: "Monthly Revenue",
      value: "TZS 45.2M",
      subtitle: "January 2026",
      icon: "TrendingUp",
      trend: "up",
      trendValue: "+18% from December",
      iconBgColor: "bg-accent/10"
    }
  ];

  const appointmentsData = [
    {
      id: 1,
      time: "09:00 AM",
      patientName: "Amina Hassan",
      patientId: "PT-2847",
      patientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1a0ea65bb-1763296441079.png",
      patientImageAlt: "Professional headshot of African woman with braided hair wearing blue medical scrubs",
      service: "Wound Dressing",
      practitionerName: "Dr. John Mwangi",
      practitionerRole: "Registered Nurse",
      practitionerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_104008a87-1763299273300.png",
      practitionerImageAlt: "Professional headshot of African male doctor with short hair in white medical coat",
      location: "Mikocheni, Dar es Salaam",
      status: "Confirmed"
    },
    {
      id: 2,
      time: "10:30 AM",
      patientName: "Joseph Kimaro",
      patientId: "PT-2851",
      patientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1a184de25-1763292715446.png",
      patientImageAlt: "Professional headshot of elderly African man with gray hair wearing casual blue shirt",
      service: "Physiotherapy Session",
      practitionerName: "Sarah Ndege",
      practitionerRole: "Physiotherapist",
      practitionerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1f6a0e5ca-1763295077315.png",
      practitionerImageAlt: "Professional headshot of African woman with short natural hair in medical uniform",
      location: "Masaki, Dar es Salaam",
      status: "In Progress"
    },
    {
      id: 3,
      time: "11:00 AM",
      patientName: "Grace Mollel",
      patientId: "PT-2839",
      patientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1f08f67cb-1763297408747.png",
      patientImageAlt: "Professional headshot of middle-aged African woman with shoulder-length hair wearing green blouse",
      service: "IV Medication",
      practitionerName: "Dr. Peter Lyimo",
      practitionerRole: "Medical Doctor",
      practitionerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1e2cb5490-1763295838657.png",
      practitionerImageAlt: "Professional headshot of African male doctor with glasses wearing white medical coat",
      location: "Upanga, Dar es Salaam",
      status: "Pending"
    },
    {
      id: 4,
      time: "02:00 PM",
      patientName: "Daniel Mushi",
      patientId: "PT-2856",
      patientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_13053f812-1763294485274.png",
      patientImageAlt: "Professional headshot of young African man with short hair wearing casual shirt",
      service: "Catheter Care",
      practitionerName: "Elizabeth Komba",
      practitionerRole: "Registered Nurse",
      practitionerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_13661fd1e-1763300454485.png",
      practitionerImageAlt: "Professional headshot of African woman with tied-back hair in blue nursing uniform",
      location: "Kinondoni, Dar es Salaam",
      status: "Confirmed"
    }
  ];

  const quickActionsData = [
    {
      title: "Patient Management",
      description: "View and manage patient profiles, medical history, and care plans",
      icon: "Users",
      link: "/patients",
      iconBgColor: "bg-primary/10"
    },
    {
      title: "Schedule Appointments",
      description: "Book new appointments and manage practitioner schedules",
      icon: "CalendarPlus",
      link: "/appointment-scheduling",
      iconBgColor: "bg-success/10"
    },
    {
      title: "Staff Management",
      description: "Manage practitioner credentials, availability, and performance",
      icon: "UserCog",
      link: "/practitioner-management",
      iconBgColor: "bg-warning/10"
    },
    {
      title: "Inventory Control",
      description: "Track medical supplies, manage stock levels, and reorder items",
      icon: "Package",
      link: "/inventory-management",
      iconBgColor: "bg-accent/10"
    }
  ];

  const revenueData = [
    { month: "Jul", revenue: 32500000, expenses: 18200000 },
    { month: "Aug", revenue: 35800000, expenses: 19500000 },
    { month: "Sep", revenue: 38200000, expenses: 20100000 },
    { month: "Oct", revenue: 36900000, expenses: 19800000 },
    { month: "Nov", revenue: 40100000, expenses: 21300000 },
    { month: "Dec", revenue: 38300000, expenses: 20500000 },
    { month: "Jan", revenue: 45200000, expenses: 22800000 }
  ];

  const practitionersData = [
    {
      id: 1,
      name: "Dr. John Mwangi",
      role: "Registered Nurse",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_104008a87-1763299273300.png",
      imageAlt: "Professional headshot of African male doctor with short hair in white medical coat",
      completedAppointments: 156,
      rating: 4.9
    },
    {
      id: 2,
      name: "Sarah Ndege",
      role: "Physiotherapist",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f6a0e5ca-1763295077315.png",
      imageAlt: "Professional headshot of African woman with short natural hair in medical uniform",
      completedAppointments: 142,
      rating: 4.8
    },
    {
      id: 3,
      name: "Dr. Peter Lyimo",
      role: "Medical Doctor",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e2cb5490-1763295838657.png",
      imageAlt: "Professional headshot of African male doctor with glasses wearing white medical coat",
      completedAppointments: 138,
      rating: 4.9
    },
    {
      id: 4,
      name: "Elizabeth Komba",
      role: "Registered Nurse",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_13661fd1e-1763300454485.png",
      imageAlt: "Professional headshot of African woman with tied-back hair in blue nursing uniform",
      completedAppointments: 129,
      rating: 4.7
    }
  ];

  const alertsData = [
    {
      id: 1,
      type: "critical",
      title: "Critical Inventory Alert",
      message: "Surgical gloves stock critically low - only 15 units remaining. Immediate reorder required.",
      timestamp: "2 minutes ago",
      actionable: true
    },
    {
      id: 2,
      type: "warning",
      title: "Appointment Rescheduling",
      message: "Patient PT-2863 requested to reschedule appointment from 04/01/2026 to 06/01/2026.",
      timestamp: "15 minutes ago",
      actionable: true
    },
    {
      id: 3,
      type: "info",
      title: "Payment Confirmation",
      message: "M-Pesa payment of TZS 85,000 received from Patient PT-2847 for wound dressing service.",
      timestamp: "1 hour ago",
      actionable: false
    }
  ];

  const bookingTrendsData = [
    { day: "Mon", bookings: 18 },
    { day: "Tue", bookings: 22 },
    { day: "Wed", bookings: 25 },
    { day: "Thu", bookings: 21 },
    { day: "Fri", bookings: 28 },
    { day: "Sat", bookings: 24 },
    { day: "Sun", bookings: 19 }
  ];

  const handleViewAppointmentDetails = (appointment) => {
    console.log("Viewing appointment details:", appointment);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Replace the existing NavigationHeader with the new Navigation component */}
      <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <MainSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className={`transition-all duration-250 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        {/* You can remove the old NavigationHeader since it's now part of Navigation */}
        
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <BreadcrumbTrail />
            
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Administrator Dashboard
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Welcome back, {user.name}! Here's an overview of your home nursing operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {metricsData?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <AppointmentTable
                  appointments={appointmentsData}
                  onViewDetails={handleViewAppointmentDetails} />
              </div>
              <div>
                <AlertPanel alerts={alertsData} />
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {quickActionsData?.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <RevenueChart data={revenueData} />
              <BookingTrendsChart data={bookingTrendsData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <PractitionerPerformance practitioners={practitionersData} />
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                    System Status
                  </h2>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">Database Connection</span>
                    </div>
                    <span className="text-xs text-success font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">SMS Gateway</span>
                    </div>
                    <span className="text-xs text-success font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">Payment Gateway</span>
                    </div>
                    <span className="text-xs text-success font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">GPS Services</span>
                    </div>
                    <span className="text-xs text-success font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdministratorDashboard;