import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { router } from '@inertiajs/react';

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
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
}

interface Booking {
    id: number;
    booking_date: string;
    booking_time: string;
    status: string;
    payment_type: 'insurance' | 'cash';
    special_instructions?: string;
    service: Service;
    practitioner?: Practitioner;
    insurance_approval?: InsuranceApproval;
    payments: Payment[];
}

interface MyAppointmentsProps extends PageProps {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function MyAppointments({ auth, bookings }: MyAppointmentsProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'in_progress':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleCancelBooking = (bookingId: number) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            router.post(route('client.bookings.cancel', bookingId));
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        return new Date('2000-01-01 ' + time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">My Appointments</h2>
                    <Link
                        href="/client/bookings/create"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Book New Appointment
                    </Link>
                </div>
            }
        >
            <Head title="My Appointments" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {bookings.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by booking your first appointment.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href="/client/bookings/create"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Book Appointment
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.data.map((booking) => (
                                <div key={booking.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {booking.service.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {booking.service.description}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {booking.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg
                                                            className="w-5 h-5 mr-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {formatDate(booking.booking_date)} at{' '}
                                                            {formatTime(booking.booking_time)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg
                                                            className="w-5 h-5 mr-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            {booking.payment_type === 'insurance' ? (
                                                                <span className="flex items-center">
                                                                    Insurance Payment
                                                                    {booking.insurance_approval && (
                                                                        <span
                                                                            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getApprovalStatusColor(
                                                                                booking.insurance_approval.approval_status
                                                                            )}`}
                                                                        >
                                                                            {booking.insurance_approval.approval_status.toUpperCase()}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                `Cash Payment - TZS ${booking.service.price.toLocaleString()}`
                                                            )}
                                                        </span>
                                                    </div>

                                                    {booking.practitioner && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg
                                                                className="w-5 h-5 mr-2"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                />
                                                            </svg>
                                                            <span>{booking.practitioner.user.name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {booking.special_instructions && (
                                                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-medium">Special Instructions:</span>{' '}
                                                            {booking.special_instructions}
                                                        </p>
                                                    </div>
                                                )}

                                                {booking.insurance_approval?.rejection_reason && (
                                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                        <p className="text-sm text-red-800">
                                                            <span className="font-medium">Rejection Reason:</span>{' '}
                                                            {booking.insurance_approval.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end space-x-3 pt-4 border-t">
                                            <Link
                                                href={route('client.bookings.show', booking.id)}
                                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                View Details
                                            </Link>

                                            {booking.status === 'pending' &&
                                                booking.payment_type === 'cash' &&
                                                booking.payments.length > 0 &&
                                                booking.payments[0].status === 'pending' && (
                                                    <Link
                                                        href={route('client.payments.show', booking.payments[0].id)}
                                                        className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                                                    >
                                                        Complete Payment
                                                    </Link>
                                                )}

                                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                                >
                                                    Cancel Appointment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {bookings.last_page > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {bookings.current_page > 1 && (
                                            <Link
                                                href={`?page=${bookings.current_page - 1}`}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {bookings.current_page < bookings.last_page && (
                                            <Link
                                                href={`?page=${bookings.current_page + 1}`}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{(bookings.current_page - 1) * bookings.per_page + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(bookings.current_page * bookings.per_page, bookings.total)}
                                                </span>{' '}
                                                of <span className="font-medium">{bookings.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {Array.from({ length: bookings.last_page }, (_, i) => i + 1).map((page) => (
                                                    <Link
                                                        key={page}
                                                        href={`?page=${page}`}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            page === bookings.current_page
                                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </Link>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
