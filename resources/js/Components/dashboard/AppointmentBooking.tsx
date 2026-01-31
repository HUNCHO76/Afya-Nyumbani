import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Shield,
  Smartphone,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MobileMoneyPayment } from "./MobileMoneyPayment";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  location_address: string | null;
  notes: string | null;
  practitioner_id: string | null;
  payment_method: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_holder_name: string | null;
  mobile_money_provider: string | null;
}

interface AppointmentBookingProps {
  patientId: string | null;
  userId: string;
}

const SERVICE_TYPES = [
  { name: "General Nursing Care", price: 50000 },
  { name: "Wound Care", price: 35000 },
  { name: "Physiotherapy", price: 75000 },
  { name: "Post-Surgery Care", price: 80000 },
  { name: "Elderly Care", price: 60000 },
  { name: "Chronic Disease Management", price: 70000 },
  { name: "Medication Administration", price: 25000 },
  { name: "Palliative Care", price: 90000 },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const INSURANCE_PROVIDERS = [
  "NHIF - National Health Insurance Fund",
  "AAR Insurance",
  "Jubilee Insurance",
  "UAP Insurance",
  "Resolution Insurance",
  "Strategis Insurance",
  "Other"
];

export const AppointmentBooking = ({ patientId, userId }: AppointmentBookingProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "insurance" | "mobile_money">("cash");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [insuranceHolderName, setInsuranceHolderName] = useState("");

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    }
  }, [patientId]);

  const fetchAppointments = async () => {
    if (!patientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getServicePrice = () => {
    const service = SERVICE_TYPES.find(s => s.name === serviceType);
    return service?.price || 0;
  };

  const handleBookAppointment = async () => {
    if (!patientId || !selectedDate || !selectedTime || !serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "insurance" && (!insuranceProvider || !insurancePolicyNumber)) {
      toast({
        title: "Insurance Details Required",
        description: "Please provide insurance provider and policy number",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const appointmentData: any = {
        patient_id: patientId,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        service_type: serviceType,
        location_address: address || null,
        notes: notes || null,
        status: "pending",
        payment_method: paymentMethod,
        payment_amount: getServicePrice(),
        payment_status: paymentMethod === "cash" ? "pending" : "pending",
      };

      if (paymentMethod === "insurance") {
        appointmentData.insurance_provider = insuranceProvider;
        appointmentData.insurance_policy_number = insurancePolicyNumber;
        appointmentData.insurance_holder_name = insuranceHolderName || null;
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Appointment Booked",
        description: "Your appointment has been scheduled successfully",
      });
      
      setDialogOpen(false);
      resetForm();
      fetchAppointments();

      // If mobile money, open payment dialog
      if (paymentMethod === "mobile_money" && data) {
        setSelectedAppointment(data);
        setPaymentDialogOpen(true);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: "Unable to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled",
      });
      
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setServiceType("");
    setAddress("");
    setNotes("");
    setPaymentMethod("cash");
    setInsuranceProvider("");
    setInsurancePolicyNumber("");
    setInsuranceHolderName("");
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-warning/10 text-warning border-warning",
      confirmed: "bg-primary/10 text-primary border-primary",
      in_progress: "bg-accent/10 text-accent border-accent",
      completed: "bg-secondary/10 text-secondary border-secondary",
      cancelled: "bg-destructive/10 text-destructive border-destructive",
    };
    return <Badge variant="outline" className={styles[status] || ""}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string | null) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      pending: "bg-warning/10 text-warning border-warning",
      processing: "bg-primary/10 text-primary border-primary",
      completed: "bg-secondary/10 text-secondary border-secondary",
      failed: "bg-destructive/10 text-destructive border-destructive",
    };
    return <Badge variant="outline" className={styles[status] || ""}>{status}</Badge>;
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      insurance: "Health Insurance",
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
    };
    return labels[method || "cash"] || method;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Appointments</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage your home nursing visits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book a Home Nursing Visit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Select Time *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        <div className="flex justify-between items-center w-full">
                          <span>{service.name}</span>
                          <span className="text-muted-foreground ml-2">TZS {service.price.toLocaleString()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {serviceType && (
                  <p className="text-sm text-primary font-medium">
                    Service Cost: TZS {getServicePrice().toLocaleString()}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>Visit Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter your home address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Payment Method *</Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <RadioGroupItem value="cash" id="cash" />
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Cash Payment</p>
                        <p className="text-sm text-muted-foreground">Pay in cash during the visit</p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "insurance" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setPaymentMethod("insurance")}
                    >
                      <RadioGroupItem value="insurance" id="insurance" />
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Health Insurance</p>
                        <p className="text-sm text-muted-foreground">Use your health insurance coverage</p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "mobile_money" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setPaymentMethod("mobile_money")}
                    >
                      <RadioGroupItem value="mobile_money" id="mobile_money" />
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Mobile Money</p>
                        <p className="text-sm text-muted-foreground">M-Pesa, Airtel Money, or Tigo Pesa</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Insurance Details */}
              {paymentMethod === "insurance" && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label>Insurance Provider *</Label>
                    <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSURANCE_PROVIDERS.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Number *</Label>
                    <Input
                      placeholder="Enter policy number"
                      value={insurancePolicyNumber}
                      onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Holder Name</Label>
                    <Input
                      placeholder="Enter policy holder name"
                      value={insuranceHolderName}
                      onChange={(e) => setInsuranceHolderName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special requirements or symptoms to note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleBookAppointment}
                disabled={isBooking}
                className="w-full bg-gradient-primary shadow-primary"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No appointments scheduled yet.
                <br />
                Book your first home nursing visit!
              </p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-card-foreground">
                        {appointment.service_type}
                      </h3>
                      {getStatusBadge(appointment.status)}
                      {getPaymentStatusBadge(appointment.payment_status)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {format(new Date(appointment.appointment_date), "PPP")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.appointment_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {getPaymentMethodLabel(appointment.payment_method)}
                      </span>
                    </div>
                    {appointment.location_address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {appointment.location_address}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {appointment.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {appointment.payment_method === "mobile_money" && 
                     appointment.payment_status === "pending" && (
                      <Button
                        size="sm"
                        className="bg-gradient-primary"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setPaymentDialogOpen(true);
                        }}
                      >
                        <Smartphone className="w-4 h-4 mr-1" />
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Appointment Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedAppointment.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.appointment_date), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedAppointment.appointment_time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedAppointment.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    TZS {selectedAppointment.payment_amount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              {selectedAppointment.payment_method === "insurance" && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Insurance Details</p>
                  <div className="text-sm">
                    <p><span className="text-muted-foreground">Provider:</span> {selectedAppointment.insurance_provider}</p>
                    <p><span className="text-muted-foreground">Policy:</span> {selectedAppointment.insurance_policy_number}</p>
                    {selectedAppointment.insurance_holder_name && (
                      <p><span className="text-muted-foreground">Holder:</span> {selectedAppointment.insurance_holder_name}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedAppointment.location_address && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedAppointment.location_address}
                  </p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Money Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAppointment && (
            <MobileMoneyPayment
              appointmentId={selectedAppointment.id}
              amount={selectedAppointment.payment_amount || 0}
              onSuccess={() => {
                setPaymentDialogOpen(false);
                fetchAppointments();
              }}
              onCancel={() => setPaymentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
