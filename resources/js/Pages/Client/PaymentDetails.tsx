import React, { useState, FormEvent, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Clock, Calendar, DollarSign, Shield, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get tomorrow's date for min date (assuming same-day booking allowed)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months in advance

  const { data, setData, post, processing, errors, reset } = useForm({
    service_id: '',
    booking_date: '',
    booking_time: '',
    payment_type: (clientInsuranceStatus?.hasInsurance ? 'insurance' : 'cash') as 'cash' | 'insurance',
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

    // Enhanced validation
    if (!data.service_id) {
      alert('Please select a service before continuing.');
      return;
    }

    if (!data.booking_date || !data.booking_time) {
      alert('Please select date and time for your booking.');
      return;
    }

    // If insurance selected, validate insurance fields
    if (data.payment_type === 'insurance' && (!data.insurance_provider || !data.insurance_number)) {
      alert('Please provide insurance provider and insurance number.');
      return;
    }

    // Validate location
    if (!data.location_address && (!data.location_lat || !data.location_lng)) {
      alert('Please provide service location.');
      return;
    }

    post(route('client.bookings.store'), {
      onSuccess: () => {
        reset();
        alert('Booking created successfully! You will receive a confirmation shortly.');
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

  const safeServices = services ?? [];
  const selectedService = safeServices.find(s => s.id === parseInt(data.service_id as string));

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

  // Filter services based on search
  const filteredServices = safeServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    setData('service_id', serviceId);
    setShowServicesDropdown(false);
    setSearchTerm('');
  };

  // Clear service selection
  const handleClearService = () => {
    setData('service_id', '');
    setSearchTerm('');
  };

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
                    {clientInsuranceStatus.expiryDate && ` Expires: ${new Date(clientInsuranceStatus.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Selection - Simplified Input */}
                <div className="relative">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Select Service</label>
                  
                  {/* Selected Service Display */}
                  {selectedService ? (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                          {selectedService.description && (
                            <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-lg font-bold text-gray-900">
                              TZS {selectedService.price.toLocaleString()}
                            </span>
                            {selectedService.duration_minutes && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {selectedService.duration_minutes} min
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearService}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Change Service
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Service Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowServicesDropdown(true);
                          }}
                          onClick={() => setShowServicesDropdown(true)}
                          placeholder="Search for a service..."
                          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showServicesDropdown ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Services Dropdown */}
                      {showServicesDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                          {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                              <div
                                key={service.id}
                                onClick={() => handleServiceSelect(service.id.toString())}
                                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                    {service.category && (
                                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                                        {service.category}
                                      </span>
                                    )}
                                    {service.description && (
                                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{service.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="font-bold text-gray-900">TZS {service.price.toLocaleString()}</p>
                                    {service.duration_minutes && (
                                      <p className="text-sm text-gray-500 mt-1">{service.duration_minutes} min</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No services found matching "{searchTerm}"
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  {errors.service_id && <p className="mt-2 text-sm text-red-600">{errors.service_id}</p>}
                  {!data.service_id && !showServicesDropdown && (
                    <p className="mt-2 text-sm text-yellow-600">Please select a service to continue.</p>
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
                  <label className="block text-lg font-semibold text-gray-900 mb-4">Payment Method</label>
                  
                  {/* Payment Type Selection */}
                  <div className="mb-6">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setData('payment_type', 'cash')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          data.payment_type === 'cash' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          <span className="font-medium">Pay Now (Mobile Money)</span>
                        </div>
                      </button>
                      
                      {clientInsuranceStatus?.hasInsurance && (
                        <button
                          type="button"
                          onClick={() => setData('payment_type', 'insurance')}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                            data.payment_type === 'insurance' 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-medium">Use Insurance</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Insurance fields */}
                  {data.payment_type === 'insurance' && (
                    <div className="space-y-4 bg-green-50 border border-green-200 p-4 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                        <select
                          value={data.insurance_provider}
                          onChange={(e) => setData('insurance_provider', e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2"
                          required
                        >
                          <option value="">Select Provider</option>
                          <option value="NHIF">NHIF</option>
                          <option value="AAR">AAR</option>
                          <option value="Jubilee">Jubilee Insurance</option>
                          <option value="Alico">Alico</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.insurance_provider && <p className="mt-1 text-sm text-red-600">{errors.insurance_provider}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance / Membership Number</label>
                        <input
                          type="text"
                          value={data.insurance_number}
                          onChange={(e) => setData('insurance_number', e.target.value)}
                          placeholder="Enter your insurance number"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2"
                          required
                        />
                        {errors.insurance_number && <p className="mt-1 text-sm text-red-600">{errors.insurance_number}</p>}
                      </div>
                    </div>
                  )}

                  {/* Mobile money options */}
                  {data.payment_type === 'cash' && selectedService && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {[
                          { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-100 border-green-300' },
                          { id: 'tigopesa', name: 'Tigo Pesa', color: 'bg-blue-100 border-blue-300' },
                          { id: 'airtelmoney', name: 'Airtel Money', color: 'bg-red-100 border-red-300' },
                          { id: 'cash', name: 'Cash on Delivery', color: 'bg-yellow-100 border-yellow-300' },
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
                              <p className="text-sm text-gray-600 mt-1">
                                {method.id === 'cash' ? 'Pay after service' : 'Instant payment'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Payment Summary */}
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
                               data.payment_method === 'airtelmoney' ? 'Airtel Money' : 'Cash'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                        disabled={processing || !selectedService}
                        className="min-w-[180px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </AuthenticatedLayout>
  );
}