import React, { useState } from 'react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import BreadcrumbTrail from '@/Components/navigation/BreadcrumbTrail';
import Icon from '@/Components/AppIcon';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconColor: string;
}

interface Booking {
  id: number;
  booking_date: string;
  booking_time: string;
  status: string;
  service: {
    id: number;
    name: string;
  };
  practitioner?: {
    user: {
      name: string;
    };
  };
}

interface Service {
  id: number;
  name: string;
  description?: string;
}

interface ClientDashboardProps {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    member_since?: string;
    created_at?: string;
  };
  upcomingBookings: Booking[];
  recentActivities: Activity[];
  services: Service[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    pendingPayments: number;
  };
}

const ClientDashboard = () => {
  const { props } = usePage<{
    auth: { user: any },
    profile: ClientDashboardProps['profile'],
    upcomingBookings: ClientDashboardProps['upcomingBookings'],
    recentActivities: ClientDashboardProps['recentActivities'],
    services: ClientDashboardProps['services'],
    stats: ClientDashboardProps['stats']
  }>();

  const user = props.auth.user;
  const {
    profile,
    upcomingBookings = [],
    recentActivities = [],
    services = [],
    stats = { totalBookings: 0, completedBookings: 0, pendingPayments: 0 },
  } = props;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filter bookings by status
  const pendingBookings = upcomingBookings.filter(b => b.status.toLowerCase() === 'pending');
  const confirmedBookings = upcomingBookings.filter(b => b.status.toLowerCase() === 'confirmed');
  const allUpcoming = [...confirmedBookings, ...pendingBookings];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'completed':
        return 'bg-info/10 text-info border-info/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'CheckCircle2';
      case 'pending':
        return 'Clock';
      case 'completed':
        return 'CheckCheck';
      case 'cancelled':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleViewAllActivities = () => {
    console.log('View all activities');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Prefer profile member_since or created_at, fall back to user created timestamps
  const memberSince = profile?.member_since ?? profile?.created_at ?? (user as any)?.created_at ?? (user as any)?.createdAt;

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`transition-all duration-250 ease-out ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <Navigation />
        
        <main className="pt-16 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <BreadcrumbTrail />
            
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Welcome back, {profile?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {pendingBookings.length > 0 
                    ? `You have ${pendingBookings.length} pending appointment${pendingBookings.length > 1 ? 's' : ''} awaiting confirmation`
                    : "Here's your health overview and recent activities"}
                </p>
              </div>
              <Link href={route('client.bookings.create')} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Icon name="Calendar" size={18} className="mr-2" />
                  Book Appointment
                </Button>
              </Link>
            </div>

            {/* Pending Bookings Alert Banner */}
            {pendingBookings.length > 0 && (
              <div className="mb-6 p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon name="AlertCircle" size={24} className="text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Pending Confirmation Required
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      You have {pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} waiting for practitioner confirmation. 
                      We'll notify you once confirmed.
                    </p>
                    <Link href="/client/bookings">
                      <Button size="sm" variant="outline" className="border-warning/30 hover:bg-warning/20">
                        <Icon name="Eye" size={16} className="mr-2" />
                        View Pending Bookings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Confirmation</p>
                    <p className="text-2xl md:text-3xl font-bold text-warning">
                      {pendingBookings.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting response
                    </p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-warning/10 flex items-center justify-center">
                    <Icon name="Clock" size={24} className="text-warning" />
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Confirmed Visits</p>
                    <p className="text-2xl md:text-3xl font-bold text-success">
                      {confirmedBookings.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ready to go
                    </p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-success/10 flex items-center justify-center">
                    <Icon name="CheckCircle" size={24} className="text-success" />
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-2xl md:text-3xl font-bold text-info">
                      {stats.completedBookings || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total visits
                    </p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-info/10 flex items-center justify-center">
                    <Icon name="CheckCheck" size={24} className="text-info" />
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats.pendingPayments ? 'TSh ' + stats.pendingPayments.toLocaleString() : 'TSh 0'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Outstanding
                    </p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-error/10 flex items-center justify-center">
                    <Icon name="CreditCard" size={24} className="text-error" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Recent Activities & Appointments */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Appointments with Status Tabs */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Icon name="CalendarDays" size={22} className="text-primary" />
                      My Appointments
                    </h2>
                    {allUpcoming.length > 0 && (
                      <Link href="/client/bookings">
                        <Button variant="ghost" size="sm">
                          View All
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Status Tabs */}
                  <div className="flex gap-2 mb-4 border-b border-border pb-2">
                    <button className="px-4 py-2 text-sm font-medium text-foreground border-b-2 border-primary">
                      All ({allUpcoming.length})
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Pending ({pendingBookings.length})
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Confirmed ({confirmedBookings.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {allUpcoming.length > 0 ? (
                      allUpcoming.map((booking, index) => (
                        <div 
                          key={booking.id} 
                          className={`group p-4 border rounded-lg transition-all duration-200 ${
                            booking.status.toLowerCase() === 'pending' 
                              ? 'border-warning/30 bg-warning/5 hover:border-warning/50' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                  {index + 1}
                                </span>
                                <h3 className="font-semibold text-foreground">{booking.service?.name}</h3>
                                {booking.status.toLowerCase() === 'pending' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-warning/20 text-warning rounded-full animate-pulse">
                                    <Icon name="Clock" size={12} />
                                    Awaiting Confirmation
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="User" size={14} />
                                {booking.practitioner?.user?.name || 'Practitioner will be assigned'}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ml-2 flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                              <Icon name={getStatusIcon(booking.status)} size={12} />
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap mb-3">
                            <span className="flex items-center gap-1.5">
                              <Icon name="Calendar" size={14} className="flex-shrink-0" />
                              {formatDate(booking.booking_date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon name="Clock" size={14} className="flex-shrink-0" />
                              {booking.booking_time}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon name="MapPin" size={14} className="flex-shrink-0" />
                              Home Visit
                            </span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Link href={`/client/bookings/${booking.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Icon name="Eye" size={14} className="mr-1" />
                                View Details
                              </Button>
                            </Link>
                            {booking.status.toLowerCase() === 'pending' && (
                              <Link href={`/client/bookings/${booking.id}/edit`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full border-warning/30 hover:bg-warning/10">
                                  <Icon name="Edit2" size={14} className="mr-1" />
                                  Edit Booking
                                </Button>
                              </Link>
                            )}
                            {booking.status.toLowerCase() === 'confirmed' && (
                              <Link href={`/client/bookings/${booking.id}/edit`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Icon name="Calendar" size={14} className="mr-1" />
                                  Reschedule
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                          <Icon name="CalendarOff" size={28} className="text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium mb-3">No upcoming appointments</p>
                        <p className="text-sm text-muted-foreground mb-4">Schedule a visit with one of our healthcare practitioners</p>
                        <Link href="/client/bookings/create">
                          <Button size="sm">
                            <Icon name="Plus" size={16} className="mr-2" />
                            Book Your First Appointment
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Icon name="Activity" size={22} className="text-primary" />
                      Recent Activities
                    </h2>
                    <Button variant="ghost" size="sm" onClick={handleViewAllActivities}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities && recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.iconColor.replace('text-', 'bg-')}/10`}>
                            <Icon name={activity.icon} size={20} className={activity.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No recent activities yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Section */}
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="card relative overflow-hidden border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -right-10 -top-14 h-32 w-32 rounded-full bg-primary/10" />
                    <div className="absolute -left-16 bottom-0 h-28 w-28 rounded-full bg-primary/5" />
                  </div>

                  <div className="relative flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {profile?.avatar ? (
                            <img
                              src={profile.avatar}
                              alt={profile.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(profile?.name || 'User')
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="text-lg font-bold text-foreground truncate">{profile?.name}</h2>
                            <p className="text-sm text-muted-foreground">Client Account</p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-success/15 text-success rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 truncate">{profile?.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/80">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name="Mail" size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <p className="text-sm font-medium text-foreground break-all">{profile?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/80">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name="Phone" size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Phone</p>
                          <p className="text-sm font-medium text-foreground">{profile?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/80">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name="Calendar" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                          <p className="text-sm font-medium text-foreground">
                            {memberSince
                              ? new Date(memberSince).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short'
                                })
                              : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-success">{stats.totalBookings}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-xl font-bold text-info">{stats.completedBookings}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-xl font-bold text-warning">{pendingBookings.length}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/profile" className="block">
                        <Button className="w-full">
                          <Icon name="Edit" size={16} className="mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                      <Link href="/profile/security" className="block">
                        <Button variant="outline" className="w-full">
                          <Icon name="Shield" size={16} className="mr-2" />
                          Security
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="card">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Icon name="Zap" size={20} className="text-warning" />
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    {pendingBookings.length > 0 && (
                      <Link href="/client/bookings?filter=pending">
                        <Button variant="outline" className="w-full justify-start h-12 border-warning/30 hover:bg-warning/10">
                          <Icon name="Clock" size={18} className="mr-3 text-warning" />
                          <div className="text-left flex-1">
                            <p className="font-medium text-foreground">Pending Confirmations</p>
                            <p className="text-xs text-muted-foreground">{pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} awaiting</p>
                          </div>
                          <span className="bg-warning/20 text-warning text-xs font-bold px-2 py-1 rounded-full">
                            {pendingBookings.length}
                          </span>
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/client/bookings">
                      <Button variant="outline" className="w-full justify-start h-12">
                        <Icon name="Calendar" size={18} className="mr-3 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">View All Bookings</p>
                          <p className="text-xs text-muted-foreground">Check your appointment history</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/client/payments">
                      <Button variant="outline" className="w-full justify-start h-12">
                        <Icon name="CreditCard" size={18} className="mr-3 text-success" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">Payment History</p>
                          <p className="text-xs text-muted-foreground">View and manage payments</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/health-records">
                      <Button variant="outline" className="w-full justify-start h-12">
                        <Icon name="FileText" size={18} className="mr-3 text-info" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">Health Records</p>
                          <p className="text-xs text-muted-foreground">Access your medical history</p>
                        </div>
                      </Button>
                    </Link>
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

export default ClientDashboard;