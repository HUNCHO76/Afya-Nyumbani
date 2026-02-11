import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Icon from '@/Components/AppIcon';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import BreadcrumbTrail from '@/Components/navigation/BreadcrumbTrail';
import { useState } from 'react';
import { PageProps } from '@/types';

interface Service {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

interface Practitioner {
  id: number;
  user: {
    name: string;
    email: string;
  };
}

interface InsuranceApproval {
  id: number;
  provider: string;
  insurance_number: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_at?: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  paid_at?: string;
  created_at?: string;
}

interface Booking {
  id: number;
  booking_date: string;
  booking_time: string;
  status: string;
  payment_type: 'insurance' | 'cash';
  special_instructions?: string;
  location?: string;
  service: Service;
  practitioner?: Practitioner;
  insurance_approval?: InsuranceApproval;
  payments: Payment[];
}

const AppointmentDetails = ({ auth }: PageProps) => {
  const { props } = usePage<PageProps & { booking: Booking }>();
  const { booking } = props as any;
  
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const insuranceApprovalStatus = booking.insurance_approval?.approval_status;
  const getInsuranceStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'rejected':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head title="Appointment Details" />
      
      <MainSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`transition-all duration-250 ease-out ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
        
        <main className="pt-16 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <BreadcrumbTrail />

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Appointment Details</h1>
                  <p className="text-muted-foreground">Booking ID: #{booking.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    <Icon name="ArrowLeft" size={16} className="mr-2" />
                    Back
                  </Button>
                  {booking.status.toLowerCase() === 'pending' && (
                    <Button
                      onClick={() => router.visit(`/client/bookings/${booking.id}/edit`)}
                    >
                      <Icon name="Edit2" size={16} className="mr-2" />
                      Edit Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service Details Card */}
                <div className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
                        <Icon name="HeartHandshake" size={24} className="text-primary" />
                        {booking.service.name}
                      </h2>
                      {booking.service.description && (
                        <p className="text-muted-foreground">{booking.service.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      <Icon name={getStatusIcon(booking.status)} size={14} />
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="font-semibold text-foreground">{formatDate(booking.booking_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Time</p>
                      <p className="font-semibold text-foreground">{booking.booking_time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Icon name="MapPin" size={16} />
                        {booking.location || 'Home Visit'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Service Price</p>
                      <p className="font-semibold text-foreground">
                        {booking.service.price ? `TSh ${booking.service.price.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Practitioner Details Card */}
                {booking.practitioner && (
                  <div className="card">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="User" size={20} className="text-primary" />
                      Healthcare Practitioner
                    </h3>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="font-semibold text-foreground mb-1">{booking.practitioner.user.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Icon name="Mail" size={14} />
                        {booking.practitioner.user.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {booking.special_instructions && (
                  <div className="card">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="Lightbulb" size={20} className="text-primary" />
                      Special Instructions
                    </h3>
                    <p className="text-foreground p-4 bg-muted/50 rounded-lg">{booking.special_instructions}</p>
                  </div>
                )}

                {/* Insurance Details */}
                {booking.payment_type === 'insurance' && booking.insurance_approval && (
                  <div className="card">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="Shield" size={20} className="text-primary" />
                      Insurance Information
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Provider</p>
                        <p className="font-semibold text-foreground">{booking.insurance_approval.provider}</p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Insurance Number</p>
                        <p className="font-semibold text-foreground">{booking.insurance_approval.insurance_number}</p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Approval Status</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border ${getInsuranceStatusColor(insuranceApprovalStatus)}`}>
                          <Icon name={insuranceApprovalStatus === 'approved' ? 'CheckCircle2' : insuranceApprovalStatus === 'pending' ? 'Clock' : 'XCircle'} size={14} />
                          {insuranceApprovalStatus && (insuranceApprovalStatus.charAt(0).toUpperCase() + insuranceApprovalStatus.slice(1))}
                        </span>
                      </div>
                      {booking.insurance_approval.rejection_reason && (
                        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Rejection Reason</p>
                          <p className="text-error font-medium">{booking.insurance_approval.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Payment Information */}
                <div className="card">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="CreditCard" size={20} className="text-primary" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-semibold text-foreground capitalize">{booking.payment_type}</p>
                    </div>

                    {booking.payments && booking.payments.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground mb-2">Payment Records</p>
                        {booking.payments.map((payment: Payment, index: number) => (
                          <div key={payment.id} className={`p-3 rounded-lg border ${getPaymentStatusColor(payment.status)}`}>
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold">TSh {payment.amount.toLocaleString()}</p>
                              <span className="text-xs font-medium capitalize">{payment.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 capitalize">{payment.payment_method}</p>
                            {payment.paid_at && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.paid_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <p className="text-sm text-warning font-medium">No payments recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="card">
                  <h3 className="text-lg font-bold text-foreground mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.visit('/client/bookings')}
                    >
                      <Icon name="ArrowLeft" size={16} className="mr-2" />
                      Back to All Bookings
                    </Button>

                    {booking.status.toLowerCase() === 'pending' && (
                      <>
                        <Button 
                          className="w-full justify-start"
                          onClick={() => router.visit(`/client/bookings/${booking.id}/edit`)}
                        >
                          <Icon name="Edit2" size={16} className="mr-2" />
                          Edit Booking
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start border-error/30 text-error hover:bg-error/10"
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this booking?')) {
                              router.post(`/client/bookings/${booking.id}/cancel`);
                            }
                          }}
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Cancel Booking
                        </Button>
                      </>
                    )}

                    {booking.status.toLowerCase() === 'confirmed' && (
                      <>
                        <Button 
                          className="w-full justify-start"
                          onClick={() => router.visit(`/client/bookings/${booking.id}/edit`)}
                        >
                          <Icon name="Calendar" size={16} className="mr-2" />
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start border-error/30 text-error hover:bg-error/10"
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this booking?')) {
                              router.post(`/client/bookings/${booking.id}/cancel`);
                            }
                          }}
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Cancel Booking
                        </Button>
                      </>
                    )}
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

export default AppointmentDetails;
