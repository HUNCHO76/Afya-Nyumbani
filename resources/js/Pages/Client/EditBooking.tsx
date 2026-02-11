import React, { useState, FormEvent, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MapPin, Info, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';

interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  category?: string;
}

interface Booking {
  id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  special_instructions?: string;
  status: string;
  service: Service;
}

interface EditBookingProps extends PageProps {
  booking: Booking;
  services: Service[];
  clientInsuranceStatus?: {
    hasInsurance: boolean;
    provider?: string;
    insuranceNumber?: string;
    status?: string;
  };
}

export default function EditBooking({ auth, booking, services, clientInsuranceStatus }: EditBookingProps) {
  const [showLocationInput, setShowLocationInput] = useState<'manual' | 'gps'>('manual');
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(booking.service);
  const [selectedCity, setSelectedCity] = useState<string>('');
  
  // City and area mapping
  const locationMap: { [key: string]: string[] } = {
    'Dar es Salaam': ['Bungé', 'Kinondoni', 'Temeke', 'Ilala', 'Tazara', 'Mikumi', 'Mwenge', 'Ubungo', 'Ongata Rongai', 'Upanga'],
    'Mbeya': ['Mbeya City', 'Rungwe', 'Chunya', 'Kyela', 'Tukuyu', 'Boma'],
    'Kilimanjaro': ['Arusha', 'Moshi', 'Rombo', 'Same', 'Siha', 'Vangindrani'],
    'Dodoma': ['Dodoma City', 'Chamwino', 'Iringa', 'Bahi', 'Kondoa'],
    'Arusha': ['Arusha City', 'Meru', 'Monduli', 'Ngorongoro', 'Karatu', 'Longido'],
    'Other': ['Manual Entry'],
  };
  
  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  const { data, setData, put, processing, errors, reset } = useForm({
    service_id: booking.service_id.toString(),
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    location_city: '',
    location_area: '',
    location_address: booking.location_address || '',
    location_lat: booking.location_lat?.toString() || '',
    location_lng: booking.location_lng?.toString() || '',
    special_instructions: booking.special_instructions || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    if (!data.service_id) {
      alert('Please select a service before continuing.');
      return;
    }

    if (!data.booking_date || !data.booking_time) {
      alert('Please select date and time for your booking.');
      return;
    }

    // Validate location
    if (!data.location_city && !data.location_address && (!data.location_lat || !data.location_lng)) {
      alert('Please provide service location (city and area, or address, or GPS coordinates).');
      return;
    }

    put(route('client.bookings.update', booking.id), {
      onSuccess: () => {
        router.visit(route('client.bookings.show', booking.id));
      },
      onError: () => {
        alert('There was an error updating your booking. Please try again.');
      },
    });
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
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services or enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    const service = services.find((s) => s.id === parseInt(data.service_id));
    setSelectedServiceDetails(service || null);
  }, [data.service_id, services]);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Booking</h2>
          <Link href={route('client.bookings.show', booking.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="Edit Booking" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.service_id}
                    onChange={(e) => setData('service_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - TZS {service.price.toLocaleString()}
                        {service.duration_minutes && ` (${service.duration_minutes} mins)`}
                      </option>
                    ))}
                  </select>
                  {errors.service_id && <p className="mt-1 text-sm text-red-600">{errors.service_id}</p>}
                  
                  {selectedServiceDetails && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">{selectedServiceDetails.name}</p>
                          {selectedServiceDetails.description && (
                            <p className="text-sm text-blue-700 mt-1">{selectedServiceDetails.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-blue-700">
                            <span className="font-semibold">TZS {selectedServiceDetails.price.toLocaleString()}</span>
                            {selectedServiceDetails.duration_minutes && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {selectedServiceDetails.duration_minutes} minutes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Booking Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={data.booking_date}
                      onChange={(e) => setData('booking_date', e.target.value)}
                      min={tomorrow.toISOString().split('T')[0]}
                      max={maxDate.toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    {errors.booking_date && <p className="mt-1 text-sm text-red-600">{errors.booking_date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Booking Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={data.booking_time}
                      onChange={(e) => setData('booking_time', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    {errors.booking_time && <p className="mt-1 text-sm text-red-600">{errors.booking_time}</p>}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Service Location <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={showLocationInput === 'manual' ? 'default' : 'outline'}
                      onClick={() => setShowLocationInput('manual')}
                      className="flex-1"
                    >
                      Enter Manually
                    </Button>
                    <Button
                      type="button"
                      variant={showLocationInput === 'gps' ? 'default' : 'outline'}
                      onClick={handleGetLocation}
                      className="flex-1"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Use GPS
                    </Button>
                  </div>

                  {showLocationInput === 'manual' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <select
                            value={data.location_city}
                            onChange={(e) => {
                              setData('location_city', e.target.value);
                              setSelectedCity(e.target.value);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Select City</option>
                            {Object.keys(locationMap).map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Area/District</label>
                          <select
                            value={data.location_area}
                            onChange={(e) => setData('location_area', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            disabled={!selectedCity}
                          >
                            <option value="">Select Area</option>
                            {selectedCity &&
                              locationMap[selectedCity]?.map((area) => (
                                <option key={area} value={area}>
                                  {area}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address / Landmark
                        </label>
                        <input
                          type="text"
                          value={data.location_address}
                          onChange={(e) => setData('location_address', e.target.value)}
                          placeholder="e.g., House #123, Near Main Market"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                          <input
                            type="text"
                            value={data.location_lat}
                            readOnly
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                          <input
                            type="text"
                            value={data.location_lng}
                            readOnly
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                          />
                        </div>
                      </div>
                      {data.location_lat && data.location_lng && (
                        <p className="text-sm text-green-600">✓ GPS location captured successfully</p>
                      )}
                    </div>
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
                    placeholder="Any special requirements or instructions for the practitioner..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.special_instructions && (
                    <p className="mt-1 text-sm text-red-600">{errors.special_instructions}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <Link href={route('client.bookings.show', booking.id)}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Booking'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
