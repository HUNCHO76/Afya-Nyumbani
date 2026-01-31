import React, { useState, FormEvent, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MapPin, Info, Clock, Calendar, DollarSign, Shield } from 'lucide-react';
import { PageProps } from '@/types';

interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  category?: string;
}

interface CreateBookingProps extends PageProps {
  services: Service[];
  clientInsuranceStatus?: {
    hasInsurance: boolean;
    provider?: string;
    insuranceNumber?: string;
    status?: string;
    expiryDate?: string;
  };
}

export default function CreateBooking({ auth, services, clientInsuranceStatus }: CreateBookingProps) {
  const [showLocationInput, setShowLocationInput] = useState<'manual' | 'gps'>('manual');
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null);
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
  
  // Get tomorrow's date for min date (assuming same-day booking allowed)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months in advance

  const { data, setData, post, processing, errors, reset } = useForm({
    service_id: '',
    booking_date: '',
    booking_time: '',
    payment_type: 'cash' as 'cash' | 'insurance',
    insurance_provider: clientInsuranceStatus?.provider || '',
    insurance_number: clientInsuranceStatus?.insuranceNumber || '',
    location_city: '',
    location_area: '',
    location_address: '',
    location_lat: '',
    location_lng: '',
    special_instructions: '',
    payment_method: 'mpesa' as 'mpesa' | 'tigopesa' | 'airtelmoney' | 'cash',
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

    post(route('client.bookings.store'), {
      onSuccess: () => {
        reset();
        router.visit(route('client.dashboard'));
      },
      onError: () => {
        alert('There was an error creating your booking. Please try again.');
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
          
          // Reverse geocode to get address (simplified - in production you'd use a geocoding service)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                setData('location_address', data.display_name);
              }
            })
            .catch(() => {
              // Silently fail if geocoding fails
            });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to capture location. Please allow location access or enter an address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const selectedService = services.find(s => s.id === parseInt(data.service_id as string));

  // Set default booking time to next available hour
  useEffect(() => {
    if (!data.booking_time) {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      const timeString = nextHour.toTimeString().slice(0, 5);
      setData('booking_time', timeString);
    }
    
    if (!data.booking_date) {
      const today = new Date().toISOString().split('T')[0];
      setData('booking_date', today);
    }
  }, []);

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Book a Service</h2>}
    >
      <Head title="Book a Service" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          {/* Insurance Status Banner */}
          {clientInsuranceStatus?.hasInsurance && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-medium text-blue-800">Insurance Detected</h3>
                  <p className="text-sm text-blue-600">
                    Your {clientInsuranceStatus.provider} insurance is {clientInsuranceStatus.status?.toLowerCase() || 'active'}. 
                    {clientInsuranceStatus.expiryDate && `Expires: ${new Date(clientInsuranceStatus.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Selection */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Select Service</label>
                  
                  {/* Select Dropdown */}
                  <div className="mb-6">
                    <select
                      value={data.service_id}
                      onChange={(e) => {
                        setData('service_id', e.target.value);
                        const selected = services.find(s => s.id === parseInt(e.target.value));
                        if (selected) {
                          setSelectedServiceDetails(selected);
                        }
                      }}
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-gray-900"
                    >
                      <option value="">-- Choose a service --</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - TZS {service.price.toLocaleString()} 
                          {service.duration_minutes ? ` (${service.duration_minutes} min)` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.service_id && <p className="mt-2 text-sm text-red-600">{errors.service_id}</p>}
                  </div>

                  {/* Service Details Card */}
                  {selectedService && (
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedService.name}</h3>
                      {selectedService.category && (
                        <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-200 text-blue-800 rounded-full mt-2">
                          {selectedService.category}
                        </span>
                      )}
                      {selectedService.description && (
                        <p className="text-gray-700 mt-4">{selectedService.description}</p>
                      )}
                      <div className="flex gap-6 mt-4 pt-4 border-t border-blue-200">
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="text-2xl font-bold text-gray-900">TZS {selectedService.price.toLocaleString()}</p>
                        </div>
                        {selectedService.duration_minutes && (
                          <div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Duration
                            </p>
                            <p className="text-2xl font-bold text-gray-900">{selectedService.duration_minutes} min</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}


                </div>

                {/* Date & Time */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">When would you like service?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={data.booking_date}
                        onChange={(e) => setData('booking_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        max={maxDate.toISOString().split('T')[0]}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Available for booking up to {maxDate.toLocaleDateString()}
                      </p>
                      {errors.booking_date && <p className="mt-1 text-sm text-red-600">{errors.booking_date}</p>}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={data.booking_time}
                        onChange={(e) => setData('booking_time', e.target.value)}
                        min="08:00"
                        max="18:00"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Service hours: 8:00 AM - 6:00 PM
                      </p>
                      {errors.booking_time && <p className="mt-1 text-sm text-red-600">{errors.booking_time}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Mobile Money Payment</label>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Provider</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-100 border-green-300' },
                        { id: 'tigopesa', name: 'Tigo Pesa', color: 'bg-blue-100 border-blue-300' },
                        { id: 'airtelmoney', name: 'Airtel Money', color: 'bg-red-100 border-red-300' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setData('payment_method', method.id as any)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            data.payment_method === method.id 
                              ? `${method.color} ring-2 ring-opacity-50` 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600 mt-1">Instant payment</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Payment Summary */}
                    {selectedService && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">TZS {selectedService.price.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {data.payment_method === 'mpesa' ? 'M-Pesa' : 
                               data.payment_method === 'tigopesa' ? 'Tigo Pesa' : 
                               data.payment_method === 'airtelmoney' ? 'Airtel Money' : 'M-Pesa'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Service Location</label>
                  
                  <div className="mb-4">
                    <Button 
                      type="button" 
                      variant="default" 
                      onClick={handleGetLocation} 
                      disabled={processing}
                      className="w-full md:w-auto"
                    >
                      <MapPin className="mr-2 h-4 w-4" /> 
                      {showLocationInput === 'gps' && data.location_lat ? 'Update Current Location' : 'Use Current Location'}
                    </Button>
                  </div>

                  {showLocationInput === 'gps' && data.location_lat && (
                    <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
                      <p className="text-sm text-green-800">
                        ✓ Location captured via GPS
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Coordinates: {data.location_lat}, {data.location_lng}
                      </p>
                    </div>
                  )}

                  {/* City Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      value={data.location_city}
                      onChange={(e) => {
                        setData('location_city', e.target.value);
                        setData('location_area', '');
                        setSelectedCity(e.target.value);
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                    >
                      <option value="">Select a city...</option>
                      {Object.keys(locationMap).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.location_city && <p className="mt-1 text-sm text-red-600">{errors.location_city}</p>}
                  </div>

                  {/* Area/Place Selection */}
                  {selectedCity && data.location_city && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area / Place in {data.location_city}
                      </label>
                      <select
                        value={data.location_area}
                        onChange={(e) => setData('location_area', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      >
                        <option value="">Select an area...</option>
                        {locationMap[data.location_city].map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                      {errors.location_area && <p className="mt-1 text-sm text-red-600">{errors.location_area}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address / Landmark
                    </label>
                    <textarea
                      value={data.location_address}
                      onChange={(e) => setData('location_address', e.target.value)}
                      placeholder="Enter full address, landmark, or building name"
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      required={!data.location_lat}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Please provide as much detail as possible for accurate service delivery
                    </p>
                  </div>
                </div>

                {/* Special instructions */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Additional Information</label>
                  <textarea
                    value={data.special_instructions}
                    onChange={(e) => setData('special_instructions', e.target.value)}
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                    placeholder="Any special instructions, notes for the service provider, or specific requirements..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This information will be shared with the service provider
                  </p>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      {selectedService && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Booking Summary:</p>
                          <p>{selectedService.name} • {data.booking_date} at {data.booking_time}</p>
                          <p className="font-bold mt-1">Total: TZS {selectedService.price.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => window.history.back()}
                        className="min-w-[120px]"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={processing}
                        className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
                      >
                        {processing ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Processing...
                          </>
                        ) : (
                          'Confirm & Book Now'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    By confirming, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedServiceDetails.name}</h3>
              <button
                onClick={() => setSelectedServiceDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedServiceDetails.category && (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4">
                {selectedServiceDetails.category}
              </span>
            )}
            
            <div className="space-y-4">
              {selectedServiceDetails.description && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedServiceDetails.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold text-lg">TZS {selectedServiceDetails.price.toLocaleString()}</p>
                </div>
                
                {selectedServiceDetails.duration_minutes && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-bold text-lg">{selectedServiceDetails.duration_minutes} minutes</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  setData('service_id', selectedServiceDetails.id.toString());
                  setSelectedServiceDetails(null);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Select This Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}