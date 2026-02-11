import React, { useState, FormEvent, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar, Shield, User, Phone, AlertTriangle, Globe, FileText } from 'lucide-react';
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

interface CreateBookingFormData {
  patient_name: string;
  patient_phone: string;
  patient_alt_phone: string;
  patient_gender: string;
  patient_age: string;
  relationship_to_patient: string;
  language_preference: 'sw' | 'en';
  appointment_type: string;
  department: string;
  reason_for_visit: string;
  symptoms: string;
  emergency_flag: 'yes' | 'no';
  emergency_signs: string[];
  service_id: string;
  booking_date: string;
  booking_time: string;
  time_slot_preference: 'morning' | 'afternoon' | 'evening' | 'any';
  payment_type: 'mobile_money' | 'cash' | 'insurance';
  insurance_provider: string;
  insurance_number: string;
  payer_phone: string;
  location_region: string;
  location_district: string;
  location_ward: string;
  location_landmark: string;
  location_address: string;
  location_lat: string;
  location_lng: string;
  special_instructions: string;
  consent_data: boolean;
  consent_contact: boolean;
  booking_channel: string;
  booking_status: string;
  payment_method: 'mpesa' | 'tigopesa' | 'airtelmoney' | 'cash';
}

// Tanzanian phone formatter - auto-formats phone numbers
const formatTzPhone = (value: string): string => {
  // Remove any non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('255')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    cleaned = '+255' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+255')) {
    // If just digits, assume +255
    if (cleaned.match(/^\d{9}$/)) {
      cleaned = '+255' + cleaned;
    }
  }
  
  return cleaned;
};

export default function CreateBooking({ auth, services, clientInsuranceStatus }: CreateBookingProps) {
  const [showLocationInput, setShowLocationInput] = useState<'manual' | 'gps'>('manual');
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  // Region and district mapping (sample, extend as needed)
  const regionDistrictMap: { [key: string]: string[] } = {
    'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Kigamboni', 'Ubungo'],
    'Dodoma': ['Dodoma City', 'Chamwino', 'Bahi', 'Kondoa'],
    'Arusha': ['Arusha City', 'Meru', 'Monduli', 'Karatu'],
    'Mwanza': ['Mwanza City', 'Ilemela', 'Magu'],
    'Mbeya': ['Mbeya City', 'Rungwe', 'Chunya'],
    'Morogoro': ['Morogoro City', 'Kilombero', 'Mvomero'],
    'Tanga': ['Tanga City', 'Muheza', 'Korogwe'],
    'Kilimanjaro': ['Moshi', 'Rombo', 'Same'],
    'Other': ['Manual Entry'],
  };
  
  // Get tomorrow's date for min date (assuming same-day booking allowed)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months in advance

  const { data, setData, post, processing, errors, reset } = useForm<CreateBookingFormData>({
    patient_name: auth?.user?.name || '',
    patient_phone: (auth?.user && 'phone' in auth.user ? (auth.user as any).phone : '') || '',
    patient_alt_phone: '',
    patient_gender: '',
    patient_age: '',
    relationship_to_patient: 'self',
    language_preference: 'sw' as 'sw' | 'en',
    appointment_type: '',
    department: '',
    reason_for_visit: '',
    symptoms: '',
    emergency_flag: 'no' as 'yes' | 'no',
    emergency_signs: [] as string[],
    service_id: '',
    booking_date: '',
    booking_time: '',
    time_slot_preference: 'any' as 'morning' | 'afternoon' | 'evening' | 'any',
    payment_type: 'mobile_money' as 'mobile_money' | 'cash' | 'insurance',
    insurance_provider: clientInsuranceStatus?.provider || '',
    insurance_number: clientInsuranceStatus?.insuranceNumber || '',
    payer_phone: '',
    location_region: '',
    location_district: '',
    location_ward: '',
    location_landmark: '',
    location_address: '',
    location_lat: '',
    location_lng: '',
    special_instructions: '',
    consent_data: false,
    consent_contact: false,
    booking_channel: 'web',
    booking_status: 'pending',
    payment_method: 'mpesa' as 'mpesa' | 'tigopesa' | 'airtelmoney' | 'cash',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^\+255\d{9}$/;

    // Enhanced validation
    if (!data.patient_name) {
      alert('Please enter the patient name.');
      return;
    }

    if (!data.patient_phone || !phoneRegex.test(data.patient_phone)) {
      alert('Please enter a valid phone number in +255XXXXXXXXX format.');
      return;
    }

    if (!data.appointment_type) {
      alert('Please select an appointment type.');
      return;
    }

    if (!data.service_id) {
      alert('Please select a service before continuing.');
      return;
    }

    if (!data.booking_date || (!data.booking_time && data.time_slot_preference === 'any')) {
      alert('Please select date and time for your booking.');
      return;
    }

    if (!data.reason_for_visit) {
      alert('Please provide a reason for the visit.');
      return;
    }

    // Validate location
    const isHomeVisit = data.appointment_type === 'home_visit';
    if (isHomeVisit) {
      if (!data.location_region || !data.location_district || !data.location_ward) {
        alert('Please provide region, district, and ward for home visits.');
        return;
      }
      if (!data.location_address && !data.location_landmark && (!data.location_lat || !data.location_lng)) {
        alert('Please provide a home visit address, landmark, or GPS coordinates.');
        return;
      }
    }

    if (data.emergency_flag === 'yes' && data.emergency_signs.length === 0) {
      alert('Please select at least one emergency sign for urgent cases.');
      return;
    }

    if (data.payment_type === 'insurance' && (!data.insurance_provider || !data.insurance_number)) {
      alert('Please provide insurance provider and member number.');
      return;
    }

    if (data.payment_type === 'mobile_money' && (!data.payer_phone || !phoneRegex.test(data.payer_phone))) {
      alert('Please provide a valid payer phone number in +255XXXXXXXXX format.');
      return;
    }

    if (!data.consent_data || !data.consent_contact) {
      alert('Please accept the consent statements to proceed.');
      return;
    }

    post(route('client.bookings.store'), {
      onSuccess: () => {
        reset();
        router.visit(route('client.dashboard'));
      },
      onError: (errors) => {
        console.error('Booking submission errors:', errors);
        const errorMsg = errors.error || Object.values(errors).join(', ') || 'There was an error creating your booking. Please try again.';
        alert(errorMsg);
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
  const isHomeVisit = data.appointment_type === 'home_visit';

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
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Book an Appointment</h2>}
    >
      <Head title="Book an Appointment" />

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
                {/* Patient Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="flex text-lg font-semibold text-gray-900 mb-4 items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={data.patient_name}
                        onChange={(e) => setData('patient_name', e.target.value)}
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                          errors.patient_name
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="e.g., Amina Juma"
                        required
                      />
                      {errors.patient_name && (
                        <p className="text-red-600 text-sm mt-1">{errors.patient_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (+255)</label>
                      <input
                        type="tel"
                        value={data.patient_phone}
                        onChange={(e) => setData('patient_phone', formatTzPhone(e.target.value))}
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                          errors.patient_phone
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="+255712345678"
                        required
                      />
                      {errors.patient_phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.patient_phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alternative Phone (Optional)</label>
                      <input
                        type="tel"
                        value={data.patient_alt_phone}
                        onChange={(e) => setData('patient_alt_phone', formatTzPhone(e.target.value))}
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                          errors.patient_alt_phone
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="+2557XXXXXXXX"
                      />
                      {errors.patient_alt_phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.patient_alt_phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={data.patient_gender}
                        onChange={(e) => setData('patient_gender', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      >
                        <option value="">Select gender...</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={data.patient_age}
                        onChange={(e) => setData('patient_age', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        placeholder="e.g., 28"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to Patient</label>
                      <select
                        value={data.relationship_to_patient}
                        onChange={(e) => setData('relationship_to_patient', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      >
                        <option value="self">Self</option>
                        <option value="parent">Parent/Guardian</option>
                        <option value="spouse">Spouse</option>
                        <option value="caregiver">Caregiver</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setData('language_preference', 'sw')}
                          className={`flex-1 p-3 rounded-md border ${data.language_preference === 'sw' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                          Swahili
                        </button>
                        <button
                          type="button"
                          onClick={() => setData('language_preference', 'en')}
                          className={`flex-1 p-3 rounded-md border ${data.language_preference === 'en' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="flex text-lg font-semibold text-gray-900 mb-4 items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Appointment Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                      <select
                        value={data.appointment_type}
                        onChange={(e) => setData('appointment_type', e.target.value)}
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                          errors.appointment_type
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        required
                      >
                        <option value="">Select type...</option>
                        <option value="opd">OPD</option>
                        <option value="specialist">Specialist Consultation</option>
                        <option value="lab">Lab Tests</option>
                        <option value="home_visit">Home Visit</option>
                      </select>
                      {errors.appointment_type && (
                        <p className="text-red-600 text-sm mt-1">{errors.appointment_type}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department/Specialty (Optional)</label>
                      <input
                        type="text"
                        value={data.department}
                        onChange={(e) => setData('department', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        placeholder="e.g., Pediatrics, Cardiology"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                      <textarea
                        value={data.reason_for_visit}
                        onChange={(e) => setData('reason_for_visit', e.target.value)}
                        rows={3}
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                          errors.reason_for_visit
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Briefly describe why you need this appointment"
                        required
                      />
                      {errors.reason_for_visit && (
                        <p className="text-red-600 text-sm mt-1">{errors.reason_for_visit}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Basic Symptoms (Optional)</label>
                      <textarea
                        value={data.symptoms}
                        onChange={(e) => setData('symptoms', e.target.value)}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        placeholder="List any symptoms (e.g., fever, cough, headache)"
                      />
                    </div>
                  </div>
                </div>

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
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                          errors.booking_date
                            ? 'border-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
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
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Service hours: 8:00 AM - 6:00 PM
                      </p>
                      {errors.booking_time && <p className="mt-1 text-sm text-red-600">{errors.booking_time}</p>}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4" />
                        Preferred Time Slot
                      </label>
                      <select
                        value={data.time_slot_preference}
                        onChange={(e) => setData('time_slot_preference', e.target.value as any)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="any">Any Time</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Screening */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <label className="flex text-lg font-semibold text-red-900 mb-4 items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Screening
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-2">Is this an emergency?</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="emergency_flag"
                            value="yes"
                            checked={data.emergency_flag === 'yes'}
                            onChange={() => setData('emergency_flag', 'yes')}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="emergency_flag"
                            value="no"
                            checked={data.emergency_flag === 'no'}
                            onChange={() => setData('emergency_flag', 'no')}
                          />
                          No
                        </label>
                      </div>
                    </div>

                    {data.emergency_flag === 'yes' && (
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2">Select emergency signs (at least one)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            'Severe bleeding',
                            'Severe chest pain',
                            'Unconsciousness',
                            'Difficulty breathing',
                            'Severe abdominal pain',
                            'Seizures'
                          ].map((sign) => (
                            <label key={sign} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={data.emergency_signs.includes(sign)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setData('emergency_signs', [...data.emergency_signs, sign]);
                                  } else {
                                    setData('emergency_signs', data.emergency_signs.filter(s => s !== sign));
                                  }
                                }}
                              />
                              {sign}
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-red-700 mt-2">
                          If this is life-threatening, please call emergency services immediately.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="flex text-lg font-semibold text-gray-900 mb-4 items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Payment & Insurance
                  </label>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { id: 'mobile_money', name: 'Mobile Money' },
                        { id: 'cash', name: 'Cash' },
                        { id: 'insurance', name: 'Insurance (NHIF)' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setData('payment_type', type.id as any)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            data.payment_type === type.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{type.name}</p>
                        </button>
                      ))}
                    </div>

                    {data.payment_type === 'mobile_money' && (
                      <>
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payer Phone (+255)</label>
                          <input
                            type="tel"
                            value={data.payer_phone}
                            onChange={(e) => setData('payer_phone', formatTzPhone(e.target.value))}
                            className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                              errors.payer_phone
                                ? 'border-red-500 focus:border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder="+2557XXXXXXXX"
                          />
                          {errors.payer_phone && (
                            <p className="text-red-600 text-sm mt-1">{errors.payer_phone}</p>
                          )}
                        </div>
                      </>
                    )}

                    {data.payment_type === 'insurance' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                          <select
                            value={data.insurance_provider}
                            onChange={(e) => setData('insurance_provider', e.target.value)}
                            className={`w-full rounded-md shadow-sm focus:ring-blue-500 p-3 ${
                              errors.insurance_provider
                                ? 'border-red-500 focus:border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                          >
                            <option value="">Select provider...</option>
                            <option value="NHIF">NHIF</option>
                            <option value="Private">Private</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.insurance_provider && (
                            <p className="text-red-600 text-sm mt-1">{errors.insurance_provider}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Member Number</label>
                          <input
                            type="text"
                            value={data.insurance_number}
                            onChange={(e) => setData('insurance_number', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                            placeholder="NHIF Member ID"
                          />
                        </div>
                      </div>
                    )}
                    
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
                              {data.payment_type === 'cash'
                                ? 'Cash'
                                : data.payment_type === 'insurance'
                                  ? data.insurance_provider || 'Insurance'
                                  : data.payment_method === 'mpesa' ? 'M-Pesa'
                                    : data.payment_method === 'tigopesa' ? 'Tigo Pesa'
                                      : 'Airtel Money'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="flex text-lg font-semibold text-gray-900 mb-4 items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {isHomeVisit ? 'Home Visit Location' : 'Service Location (Optional)'}
                  </label>
                  
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

                  {/* Region Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      value={data.location_region}
                      onChange={(e) => {
                        setData('location_region', e.target.value);
                        setData('location_district', '');
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict('');
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                    >
                      <option value="">Select a region...</option>
                      {Object.keys(regionDistrictMap).map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    {errors.location_region && <p className="mt-1 text-sm text-red-600">{errors.location_region}</p>}
                  </div>

                  {/* District Selection */}
                  {selectedRegion && data.location_region && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District in {data.location_region}
                      </label>
                      <select
                        value={data.location_district}
                        onChange={(e) => {
                          setData('location_district', e.target.value);
                          setSelectedDistrict(e.target.value);
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      >
                        <option value="">Select a district...</option>
                        {regionDistrictMap[data.location_region].map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      {errors.location_district && <p className="mt-1 text-sm text-red-600">{errors.location_district}</p>}
                    </div>
                  )}

                  {/* Ward Selection */}
                  {selectedDistrict && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ward
                      </label>
                      <input
                        type="text"
                        value={data.location_ward}
                        onChange={(e) => setData('location_ward', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        placeholder="e.g., Kijitonyama"
                      />
                      {errors.location_ward && <p className="mt-1 text-sm text-red-600">{errors.location_ward}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={data.location_address}
                      onChange={(e) => setData('location_address', e.target.value)}
                      placeholder="Enter full address or building name"
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      required={isHomeVisit && !data.location_lat && !data.location_landmark}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Please provide as much detail as possible for accurate service delivery
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Landmark (Optional)</label>
                    <input
                      type="text"
                      value={data.location_landmark}
                      onChange={(e) => setData('location_landmark', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                      placeholder="e.g., near Taifa Stadium"
                    />
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

                {/* Consent */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="flex text-lg font-semibold text-gray-900 mb-4 items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Consent & Privacy
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={data.consent_data}
                        onChange={(e) => setData('consent_data', e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">
                        I consent to the collection and use of my data for appointment processing.
                      </span>
                    </label>
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={data.consent_contact}
                        onChange={(e) => setData('consent_contact', e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">
                        I agree to be contacted by phone/SMS regarding this appointment.
                      </span>
                    </label>
                  </div>
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