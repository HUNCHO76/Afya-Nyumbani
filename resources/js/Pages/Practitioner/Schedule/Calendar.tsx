import React, { useState, useEffect } from 'react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import BreadcrumbTrail from '@/Components/navigation/BreadcrumbTrail';
import Icon from '@/Components/AppIcon';
import { Button } from '@/Components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import AppointmentCalendar from '@/Components/AppointmentCalendar';
import AppointmentForm from '@/Components/AppointmentForm';
import AppointmentList from '@/Components/AppointmentList';
import PractitionerAvailability from '@/Components/PractitionerAvailability';
import RecurringAppointmentModal from '@/Components/RecurringAppointmentModal';
import AppointmentDetailsModal from '@/Components/AppointmentDetailsModal';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number;
  practitionerName: string;
  practitionerSpecialty?: string;
  practitionerAvatar?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  location: string;
  notes?: string;
}

interface Service {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

interface Practitioner {
  id: number;
  name: string;
  specialty: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  rating?: number;
}

interface AppointmentSchedulingProps {
  appointments?: Appointment[];
  services?: Service[];
  practitioners?: Practitioner[];
  stats?: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

const AppointmentScheduling = ({ 
  appointments: initialAppointments = [], 
  services = [], 
  practitioners = [],
  stats: initialStats
}: AppointmentSchedulingProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const handleToggleSidebarCalendar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPractitioner, setFilterPractitioner] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });

  // Initialize data
  useEffect(() => {
    const mockAppointments: Appointment[] = initialAppointments.length > 0 ? initialAppointments : [
      {
        id: "APT-2026-001",
        patientName: "Amina Hassan",
        patientId: "PAT-2847",
        serviceType: "Wound Dressing",
        date: "2026-01-04",
        time: "09:00",
        duration: 60,
        practitionerName: "Dr. John Mwangi",
        practitionerSpecialty: "Wound Care Specialist",
        practitionerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_104008a87-1763299273300.png",
        status: "Confirmed",
        location: "Mikocheni, Dar es Salaam",
        notes: "Regular wound check-up and dressing change"
      },
      {
        id: "APT-2026-002",
        patientName: "Joseph Kimani",
        patientId: "PAT-2848",
        serviceType: "Physiotherapy",
        date: "2026-01-04",
        time: "11:00",
        duration: 90,
        practitionerName: "Sarah Njeri",
        practitionerSpecialty: "Physiotherapist",
        status: "Confirmed",
        location: "Masaki, Dar es Salaam",
        notes: "Post-surgery rehabilitation therapy"
      },
      {
        id: "APT-2026-003",
        patientName: "Grace Wambui",
        patientId: "PAT-2849",
        serviceType: "General Check-up",
        date: "2026-01-05",
        time: "14:00",
        duration: 45,
        practitionerName: "Dr. John Mwangi",
        status: "Pending",
        location: "Kariakoo, Dar es Salaam",
        notes: "Routine health assessment"
      },
      {
        id: "APT-2026-004",
        patientName: "Michael Ochieng",
        patientId: "PAT-2850",
        serviceType: "Medication Administration",
        date: "2026-01-06",
        time: "10:30",
        duration: 30,
        practitionerName: "Nurse Akinyi",
        status: "Completed",
        location: "Oyster Bay, Dar es Salaam"
      },
      {
        id: "APT-2026-005",
        patientName: "Sarah Mohammed",
        patientId: "PAT-2851",
        serviceType: "Wound Dressing",
        date: "2026-01-06",
        time: "15:00",
        duration: 60,
        practitionerName: "Dr. John Mwangi",
        status: "Cancelled",
        location: "Mikocheni, Dar es Salaam"
      }
    ];

    setAppointments(mockAppointments);

    // Calculate stats
    const calculatedStats = {
      total: mockAppointments.length,
      confirmed: mockAppointments.filter(a => a.status === 'Confirmed').length,
      pending: mockAppointments.filter(a => a.status === 'Pending').length,
      completed: mockAppointments.filter(a => a.status === 'Completed').length,
      cancelled: mockAppointments.filter(a => a.status === 'Cancelled').length
    };
    setStats(initialStats || calculatedStats);
  }, [initialAppointments, initialStats]);

  const mockPatients = [
    { id: "PAT-2847", name: "Amina Hassan", phone: "+255 712 345 678", lastVisit: "2025-12-28" },
    { id: "PAT-2848", name: "Joseph Kimani", phone: "+255 713 456 789", lastVisit: "2025-12-29" },
    { id: "PAT-2849", name: "Grace Wambui", phone: "+255 714 567 890", lastVisit: "2025-12-30" },
  ];

  const serviceFilterOptions = [
    { value: 'all', label: 'All Services', icon: 'Filter' },
    ...services.map(s => ({ 
      value: s.name, 
      label: s.name,
      icon: s.icon || 'Activity'
    }))
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'All Status', icon: 'Filter' },
    { value: 'Confirmed', label: 'Confirmed', icon: 'CheckCircle', color: 'bg-success/20 text-success' },
    { value: 'Pending', label: 'Pending', icon: 'Clock', color: 'bg-warning/20 text-warning' },
    { value: 'Cancelled', label: 'Cancelled', icon: 'XCircle', color: 'bg-error/20 text-error' },
    { value: 'Completed', label: 'Completed', icon: 'CheckCircle2', color: 'bg-info/20 text-info' }
  ];

  const practitionerFilterOptions = [
    { value: 'all', label: 'All Practitioners', icon: 'Users' },
    ...practitioners.map(p => ({
      value: p.id.toString(),
      label: p.name,
      icon: 'User'
    }))
  ];


  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleFormSubmit = (formData: any) => {
    console.log('Appointment submitted:', formData);
    // In a real app, you would update the appointments array here
    setShowAppointmentForm(false);
  };

  const handleFormCancel = () => {
    setShowAppointmentForm(false);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
    // Update appointment status to cancelled
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'Cancelled' as const } : apt
    ));
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handlePractitionerSelect = (practitioner: Practitioner) => {
    console.log('Selected practitioner:', practitioner);
  };

  const handleRecurringSubmit = (recurringData: any) => {
    console.log('Recurring appointment data:', recurringData);
    // Handle recurring appointment creation
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const filteredAppointments = appointments.filter(apt => {
    const serviceMatch = filterService === 'all' || apt.serviceType === filterService;
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus;
    const practitionerMatch = filterPractitioner === 'all' || 
      apt.practitionerName === practitioners.find(p => p.id.toString() === filterPractitioner)?.name;
    const dateMatch = !selectedDate || apt.date === selectedDate;
    
    return serviceMatch && statusMatch && practitionerMatch && (viewMode === 'list' || dateMatch);
  });

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  const urgentAppointments = appointments.filter(apt => 
    apt.status === 'Confirmed' && 
    apt.date === new Date().toISOString().split('T')[0]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      <MainSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebarCalendar} />

      <div className={cn(
        "transition-all duration-250 ease-out",
        isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'
      )}>
        <main className="pt-16 ml-5 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <BreadcrumbTrail />

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon name="Calendar" size={24} className="text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    Appointment Scheduling
                  </h1>
                  <Badge variant="outline" className="ml-2">
                    {filteredAppointments.length} Appointments
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage home nursing care appointments with intelligent practitioner assignment
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRecurringModal(true)}
                  className="gap-2"
                >
                  <Icon name="Repeat" size={18} />
                  Recurring Setup
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleCreateAppointment}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Icon name="Plus" size={18} />
                  New Appointment
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 md:mb-8">
              <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="Calendar" size={20} className="text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-success/30 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
                      <p className="text-2xl md:text-3xl font-bold text-success">{stats.confirmed}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Icon name="CheckCircle" size={20} className="text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-warning/30 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pending</p>
                      <p className="text-2xl md:text-3xl font-bold text-warning">{stats.pending}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-info/30 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Completed</p>
                      <p className="text-2xl md:text-3xl font-bold text-info">{stats.completed}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                      <Icon name="CheckCircle2" size={20} className="text-info" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-error/30 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
                      <p className="text-2xl md:text-3xl font-bold text-error">{stats.cancelled}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                      <Icon name="XCircle" size={20} className="text-error" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {showAppointmentForm ? (
              <Card className="mb-6 md:mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CalendarPlus" size={24} className="text-primary" />
                    {selectedAppointment ? 'Edit Appointment' : 'Create New Appointment'}
                  </CardTitle>
                  <CardDescription>
                    Fill in the details to schedule a new home nursing appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentForm 
                    onSubmit={handleFormSubmit} 
                    onCancel={handleFormCancel} 
                    patients={mockPatients} 
                    practitioners={practitioners}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Filters and Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="sm:w-48">
                      <Select value={filterService} onValueChange={setFilterService}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Services" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceFilterOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon name={option.icon} size={16} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:w-48">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusFilterOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.value !== 'all' && (
                                  <div className={cn("w-2 h-2 rounded-full", option.color?.split(' ')[0])} />
                                )}
                                <Icon name={option.icon} size={16} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:w-48">
                      <Select value={filterPractitioner} onValueChange={setFilterPractitioner}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Practitioners" />
                        </SelectTrigger>
                        <SelectContent>
                          {practitionerFilterOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon name={option.icon} size={16} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                      <TabsList className="grid w-[200px] grid-cols-2">
                        <TabsTrigger value="calendar" className="gap-2">
                          <Icon name="Calendar" size={16} />
                          Calendar
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-2">
                          <Icon name="List" size={16} />
                          List
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Today's Highlights */}
                {urgentAppointments.length > 0 && (
                  <Card className="mb-6 md:mb-8 border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <Icon name="AlertCircle" size={20} className="text-warning" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Today's Confirmed Appointments ({urgentAppointments.length})
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Action required for today's schedule
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Icon name="Calendar" size={16} />
                          View Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Content */}
                {viewMode === 'calendar' ? (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                    <div className="xl:col-span-2 space-y-6 md:space-y-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Appointment Calendar</CardTitle>
                          <CardDescription>
                            Select a date to view and manage appointments
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <AppointmentCalendar 
                            appointments={filteredAppointments} 
                            onDateSelect={handleDateSelect} 
                            selectedDate={selectedDate}
                            viewMode={viewMode}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Appointments for {formatDate(selectedDate)}</CardTitle>
                              <CardDescription>
                                {filteredAppointments.length} appointments found
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">
                              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <AppointmentList 
                            appointments={filteredAppointments} 
                            onEdit={handleEditAppointment} 
                            onCancel={handleCancelAppointment} 
                            onViewDetails={handleViewDetails}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      <PractitionerAvailability 
                        practitioners={practitioners} 
                        selectedDate={selectedDate} 
                        onSelect={handlePractitionerSelect}
                      />
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                          <CardDescription>
                            Common scheduling tasks
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button variant="outline" className="w-full justify-start gap-3" onClick={handleCreateAppointment}>
                            <Icon name="CalendarPlus" size={18} className="text-primary" />
                            <div className="text-left">
                              <p className="font-medium">New Appointment</p>
                              <p className="text-xs text-muted-foreground">Schedule a new visit</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setShowRecurringModal(true)}>
                            <Icon name="Repeat" size={18} className="text-success" />
                            <div className="text-left">
                              <p className="font-medium">Recurring Schedule</p>
                              <p className="text-xs text-muted-foreground">Set up recurring visits</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-3">
                            <Icon name="Download" size={18} className="text-info" />
                            <div className="text-left">
                              <p className="font-medium">Export Schedule</p>
                              <p className="text-xs text-muted-foreground">Download calendar data</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-3">
                            <Icon name="Send" size={18} className="text-warning" />
                            <div className="text-left">
                              <p className="font-medium">Send Reminders</p>
                              <p className="text-xs text-muted-foreground">Notify patients & staff</p>
                            </div>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                    <div className="xl:col-span-2">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>All Appointments</CardTitle>
                              <CardDescription>
                                View and manage all scheduled appointments
                              </CardDescription>
                            </div>
                            <Badge variant="outline">
                              {filteredAppointments.length} Total
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <AppointmentList 
                            appointments={filteredAppointments} 
                            onEdit={handleEditAppointment} 
                            onCancel={handleCancelAppointment} 
                            onViewDetails={handleViewDetails}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      <PractitionerAvailability 
                        practitioners={practitioners} 
                        selectedDate={selectedDate} 
                        onSelect={handlePractitionerSelect}
                      />
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Schedule Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon name="Calendar" size={16} className="text-primary" />
                              </div>
                              <span className="text-sm text-muted-foreground">This Week</span>
                            </div>
                            <span className="font-semibold">12 appointments</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                <Icon name="CheckCircle" size={16} className="text-success" />
                              </div>
                              <span className="text-sm text-muted-foreground">Confirmation Rate</span>
                            </div>
                            <span className="font-semibold text-success">85%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                                <Icon name="Clock" size={16} className="text-warning" />
                              </div>
                              <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                            </div>
                            <span className="font-semibold text-warning">2.5 hours</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <RecurringAppointmentModal 
        isOpen={showRecurringModal} 
        onClose={() => setShowRecurringModal(false)} 
        onSubmit={handleRecurringSubmit} 
        appointment={selectedAppointment}
      />
      
      <AppointmentDetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default AppointmentScheduling;