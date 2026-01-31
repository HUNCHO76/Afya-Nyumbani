import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/AppIcon';
import { PageProps } from '@/types';
import { format } from 'date-fns';

interface Booking {
  id: number;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  service: {
    id: number;
    name: string;
    price: number;
    duration: number;
  };
  practitioner?: {
    id: number;
    user: {
      name: string;
      avatar?: string;
    };
    specialization?: string;
  };
  payment_type: 'cash' | 'insurance';
  special_instructions?: string;
  insurance_approval?: {
    id: number;
    approval_status: 'pending' | 'approved' | 'rejected';
    approved_amount?: number;
  };
  payments?: Array<{
    id: number;
    status: string;
    amount: number;
    payment_method: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface AllBookingsProps extends PageProps {
  bookings: {
    data: Booking[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  filters?: {
    status?: string;
    payment_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

type SortOption = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';

export default function AllBookings({ auth, bookings, filters }: AllBookingsProps) {
  const [filterStatus, setFilterStatus] = useState<string>(filters?.status || 'all');
  const [filterPaymentType, setFilterPaymentType] = useState<string>(filters?.payment_type || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(filters?.search || '');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [dateRange, setDateRange] = useState({
    from: filters?.date_from || '',
    to: filters?.date_to || '',
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' },
  ];

  const paymentTypeOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'cash', label: 'Cash Payment' },
    { value: 'insurance', label: 'Insurance' },
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'price_asc', label: 'Price: Low to High' },
  ];

  const applyFilters = () => {
    const params: any = {};
    
    if (filterStatus !== 'all') params.status = filterStatus;
    if (filterPaymentType !== 'all') params.payment_type = filterPaymentType;
    if (searchQuery) params.search = searchQuery;
    if (dateRange.from) params.date_from = dateRange.from;
    if (dateRange.to) params.date_to = dateRange.to;
    
    router.get(route('client.bookings.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterPaymentType('all');
    setSearchQuery('');
    setDateRange({ from: '', to: '' });
    router.get(route('client.bookings.index'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (date: string | null | undefined, time: string | null | undefined) => {
    if (!date || !time) return 'N/A';
    try {
      const dateTime = new Date(`${date}T${time}`);
      if (isNaN(dateTime.getTime())) return 'N/A';
      return format(dateTime, 'MMM dd, yyyy • hh:mm a');
    } catch (e) {
      return 'N/A';
    }
  };

  const getTimeUntilAppointment = (date: string | null | undefined, time: string | null | undefined) => {
    if (!date || !time) return 'N/A';
    try {
      const appointmentDate = new Date(`${date}T${time}`);
      if (isNaN(appointmentDate.getTime())) return 'N/A';
      const now = new Date();
      const diffMs = appointmentDate.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 0) return 'Past';
      if (diffHours < 24) return 'Today';
      if (diffHours < 48) return 'Tomorrow';
      return `${Math.floor(diffHours / 24)} days`;
    } catch (e) {
      return 'N/A';
    }
  };

  const getStatusConfig = (status: Booking['status']) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'Clock' },
      confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: 'CheckCircle' },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'CheckCircle2' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: 'XCircle' },
      rescheduled: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: 'CalendarSync' },
    };
    return config[status] || config.pending;
  };

  const getPaymentStatus = (booking: Booking) => {
    if (booking.payment_type === 'insurance') {
      if (booking.insurance_approval?.approval_status === 'approved') {
        return { label: 'Insurance Approved', color: 'bg-green-100 text-green-800' };
      }
      if (booking.insurance_approval?.approval_status === 'pending') {
        return { label: 'Awaiting Approval', color: 'bg-yellow-100 text-yellow-800' };
      }
      return { label: 'Insurance Rejected', color: 'bg-red-100 text-red-800' };
    }
    
    const payment = booking.payments?.[0];
    if (payment?.status === 'paid') {
      return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    if (payment?.status === 'pending') {
      return { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Unpaid', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredBookings = useMemo(() => {
    return bookings.data.filter((booking) => {
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const matchesPaymentType = filterPaymentType === 'all' || booking.payment_type === filterPaymentType;
      const matchesSearch = !searchQuery || 
        booking.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.practitioner?.user.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesPaymentType && matchesSearch;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
        case 'date_desc':
          return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
        case 'price_asc':
          return a.service.price - b.service.price;
        case 'price_desc':
          return b.service.price - a.service.price;
        default:
          return 0;
      }
    });
  }, [bookings.data, filterStatus, filterPaymentType, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = bookings.total;
    const pending = bookings.data.filter(b => b.status === 'pending').length;
    const confirmed = bookings.data.filter(b => b.status === 'confirmed').length;
    const completed = bookings.data.filter(b => b.status === 'completed').length;
    
    return { total, pending, confirmed, completed };
  }, [bookings]);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">My Appointments</h2>
            <p className="text-sm text-gray-600 mt-1">Total: <span className="font-semibold">{bookings.total}</span> appointment{bookings.total !== 1 ? 's' : ''}</p>
          </div>
          <Link href={route('client.bookings.create')}>
            <Button>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="My Bookings" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Icon name="Calendar" className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  </div>
                  <Icon name="CheckCircle" className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Icon name="Clock" className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <Icon name="CheckCircle2" className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter and search your bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Type</label>
                  <Select value={filterPaymentType} onValueChange={setFilterPaymentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <Input
                    placeholder="Search services or practitioners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetFilters}>
                  <Icon name="FilterX" className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
                <Button onClick={applyFilters}>
                  <Icon name="Filter" className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardContent className="p-0">
              {filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Practitioner</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const statusConfig = getStatusConfig(booking.status);
                        const paymentStatus = getPaymentStatus(booking);
                        
                        return (
                          <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{booking.service.name}</p>
                                <p className="text-xs text-gray-500">{booking.service.duration} mins</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {formatDateTime(booking.booking_date, booking.booking_time)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {booking.practitioner ? (
                                <div>
                                  <p className="font-medium">{booking.practitioner.user.name}</p>
                                  {booking.practitioner.specialization && (
                                    <p className="text-xs text-gray-500">{booking.practitioner.specialization}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">Not assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              {formatCurrency(booking.service.price)}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={statusConfig.color}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={paymentStatus.color}>
                                {paymentStatus.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Icon name="MoreVertical" className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={route('client.bookings.show', booking.id)}>
                                      <Icon name="Eye" className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={route('services.show', booking.service.id)}>
                                      <Icon name="Package" className="mr-2 h-4 w-4" />
                                      Service Details
                                    </Link>
                                  </DropdownMenuItem>
                                  {booking.status === 'pending' && 
                                   booking.payment_type === 'cash' &&
                                   booking.payments?.[0]?.status === 'pending' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem asChild>
                                        <Link href={route('client.payments.show', booking.payments[0].id)}>
                                          <Icon name="CreditCard" className="mr-2 h-4 w-4" />
                                          Pay Now
                                        </Link>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {booking.status === 'pending' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => router.post(route('client.bookings.cancel', booking.id))}
                                        className="text-red-600"
                                      >
                                        <Icon name="XCircle" className="mr-2 h-4 w-4" />
                                        Cancel Booking
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">No bookings found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <Card className="mt-8">
            <CardContent className="py-4">
              {bookings.last_page > 1 ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{(bookings.current_page - 1) * bookings.per_page + 1}</span> to{" "}
                    <span className="font-semibold">
                      {Math.min(bookings.current_page * bookings.per_page, bookings.total)}
                    </span>{" "}
                    of <span className="font-semibold">{bookings.total}</span> appointments (Page{" "}
                    <span className="font-semibold">{bookings.current_page}</span> of{" "}
                    <span className="font-semibold">{bookings.last_page}</span>)
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={route('client.bookings.index', { page: bookings.current_page - 1 })}
                      preserveState
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        bookings.current_page === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon name="ChevronLeft" className="mr-1 h-4 w-4" />
                      Previous
                    </Link>
                    {Array.from({ length: Math.min(5, bookings.last_page) }, (_, i) => {
                      let pageNum;
                      if (bookings.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (bookings.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (bookings.current_page >= bookings.last_page - 2) {
                        pageNum = bookings.last_page - 4 + i;
                      } else {
                        pageNum = bookings.current_page - 2 + i;
                      }
                      
                      return (
                        <Link
                          key={pageNum}
                          href={route('client.bookings.index', { page: pageNum })}
                          preserveState
                          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            bookings.current_page === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                    <Link
                      href={route('client.bookings.index', { page: bookings.current_page + 1 })}
                      preserveState
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        bookings.current_page === bookings.last_page
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Next
                      <Icon name="ChevronRight" className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Showing all {bookings.total} appointment{bookings.total !== 1 ? 's' : ''}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}