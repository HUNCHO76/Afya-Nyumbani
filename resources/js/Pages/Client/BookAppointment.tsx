import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
}

interface BookingPageProps extends PageProps {
    services: Service[];
    clientInsuranceStatus?: {
        hasInsurance: boolean;
        provider?: string;
        insuranceNumber?: string;
        status?: string;
    };
}

export default function BookAppointment({ auth, services, clientInsuranceStatus }: BookingPageProps) {
    const [paymentType, setPaymentType] = useState<'cash' | 'insurance'>('cash');
    const [showLocationInput, setShowLocationInput] = useState<'manual' | 'gps'>('manual');

    const { data, setData, post, processing, errors } = useForm({
        service_id: '',
        booking_date: '',
        booking_time: '',
        payment_type: 'cash' as 'cash' | 'insurance',
        insurance_provider: clientInsuranceStatus?.provider || '',
        insurance_number: clientInsuranceStatus?.insuranceNumber || '',
        location_address: '',
        location_lat: '',
        location_lng: '',
        special_instructions: '',
        payment_method: 'mpesa' as 'mpesa' | 'tigopesa' | 'airtelmoney' | 'cash',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('client.bookings.store'));
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setData({
                        ...data,
                        location_lat: position.coords.latitude.toString(),
                        location_lng: position.coords.longitude.toString(),
                    });
                    setShowLocationInput('gps');
                },
                (error) => {
                    alert('Unable to get your location. Please enter address manually.');
                }
            );
        }
    };

    const selectedService = services.find(s => s.id === parseInt(data.service_id));

    return (
        <AuthenticatedLayout
            // user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Book an Appointment</h2>}
        >
            <Head title="Book Appointment" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Service Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Service
                                    </label>
                                    <select
                                        value={data.service_id}
                                        onChange={(e) => setData('service_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Choose a Service --</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - TZS {service.price.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.service_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.service_id}</p>
                                    )}
                                </div>

                                {/* Service Description */}
                                {selectedService && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <h4 className="font-medium text-blue-900 mb-1">{selectedService.name}</h4>
                                        <p className="text-sm text-blue-700">{selectedService.description}</p>
                                        <p className="text-lg font-semibold text-blue-900 mt-2">
                                            TZS {selectedService.price.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Appointment Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.booking_date}
                                            onChange={(e) => setData('booking_date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.booking_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.booking_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Time
                                        </label>
                                        <input
                                            type="time"
                                            value={data.booking_time}
                                            onChange={(e) => setData('booking_time', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.booking_time && (
                                            <p className="mt-1 text-sm text-red-600">{errors.booking_time}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Payment Method
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="cash"
                                                checked={data.payment_type === 'cash'}
                                                onChange={(e) => {
                                                    setData('payment_type', 'cash');
                                                    setPaymentType('cash');
                                                }}
                                                className="form-radio h-4 w-4 text-indigo-600"
                                            />
                                            <span className="text-gray-700">Cash Payment (Mobile Money)</span>
                                        </label>

                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="insurance"
                                                checked={data.payment_type === 'insurance'}
                                                onChange={(e) => {
                                                    setData('payment_type', 'insurance');
                                                    setPaymentType('insurance');
                                                }}
                                                className="form-radio h-4 w-4 text-indigo-600"
                                            />
                                            <span className="text-gray-700">Health Insurance</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Insurance Details (if insurance selected) */}
                                {paymentType === 'insurance' && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 space-y-4">
                                        <div className="flex items-start space-x-2">
                                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-yellow-800">
                                                Insurance bookings require approval before confirmation. You'll be notified once approved.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Insurance Provider
                                            </label>
                                            <select
                                                value={data.insurance_provider}
                                                onChange={(e) => setData('insurance_provider', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required={paymentType === 'insurance'}
                                            >
                                                <option value="">-- Select Provider --</option>
                                                <option value="NHIF">NHIF (National Health Insurance Fund)</option>
                                                <option value="Jubilee Insurance">Jubilee Insurance</option>
                                                <option value="AAR Insurance">AAR Insurance</option>
                                                <option value="Britam">Britam</option>
                                                <option value="Resolution Insurance">Resolution Insurance</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.insurance_provider && (
                                                <p className="mt-1 text-sm text-red-600">{errors.insurance_provider}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Insurance/Membership Number
                                            </label>
                                            <input
                                                type="text"
                                                value={data.insurance_number}
                                                onChange={(e) => setData('insurance_number', e.target.value)}
                                                placeholder="Enter your insurance number"
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required={paymentType === 'insurance'}
                                            />
                                            {errors.insurance_number && (
                                                <p className="mt-1 text-sm text-red-600">{errors.insurance_number}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Money Options (if cash selected) */}
                                {paymentType === 'cash' && (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Select Mobile Money Provider
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <label className="flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                                                    <input
                                                        type="radio"
                                                        value="mpesa"
                                                        checked={data.payment_method === 'mpesa'}
                                                        onChange={(e) => setData('payment_method', 'mpesa')}
                                                        className="form-radio h-4 w-4 text-green-600"
                                                    />
                                                    <span className="font-medium text-gray-700">M-Pesa</span>
                                                </label>

                                                <label className="flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                                                    <input
                                                        type="radio"
                                                        value="tigopesa"
                                                        checked={data.payment_method === 'tigopesa'}
                                                        onChange={(e) => setData('payment_method', 'tigopesa')}
                                                        className="form-radio h-4 w-4 text-green-600"
                                                    />
                                                    <span className="font-medium text-gray-700">Tigo Pesa</span>
                                                </label>

                                                <label className="flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                                                    <input
                                                        type="radio"
                                                        value="airtelmoney"
                                                        checked={data.payment_method === 'airtelmoney'}
                                                        onChange={(e) => setData('payment_method', 'airtelmoney')}
                                                        className="form-radio h-4 w-4 text-green-600"
                                                    />
                                                    <span className="font-medium text-gray-700">Airtel Money</span>
                                                </label>
                                            </div>
                                        </div>
                                        <p className="text-sm text-green-700">
                                            You will be redirected to complete payment after booking confirmation.
                                        </p>
                                    </div>
                                )}

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Location
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                        >
                                            Use Current Location (GPS)
                                        </button>
                                    </div>

                                    {showLocationInput === 'gps' && data.location_lat && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                                            Location captured: {data.location_lat}, {data.location_lng}
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        value={data.location_address}
                                        onChange={(e) => setData('location_address', e.target.value)}
                                        placeholder="Or enter your address manually"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.location_address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.location_address}</p>
                                    )}
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Instructions (Optional)
                                    </label>
                                    <textarea
                                        value={data.special_instructions}
                                        onChange={(e) => setData('special_instructions', e.target.value)}
                                        rows={3}
                                        placeholder="Any special requests or information we should know..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Processing...' : 'Book Appointment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
