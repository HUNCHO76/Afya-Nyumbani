import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Smartphone,
  CreditCard,
  Shield,
  CheckCircle,
  Loader2
} from "lucide-react";

interface MobileMoneyPaymentProps {
  appointmentId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const MOBILE_PROVIDERS = [
  {
    id: "mpesa",
    name: "M-Pesa",
    logo: "📱",
    color: "bg-green-500",
    description: "Pay with Vodacom M-Pesa"
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    logo: "📲",
    color: "bg-red-500",
    description: "Pay with Airtel Money"
  },
  {
    id: "tigo_pesa",
    name: "Tigo Pesa",
    logo: "💳",
    color: "bg-blue-500",
    description: "Pay with Tigo Pesa"
  }
];

export const MobileMoneyPayment = ({
  appointmentId,
  amount,
  onSuccess,
  onCancel
}: MobileMoneyPaymentProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "confirm" | "processing" | "success">("select");

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits and format for Tanzanian numbers
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("255")) {
      return digits.slice(0, 12);
    } else if (digits.startsWith("0")) {
      return "255" + digits.slice(1, 10);
    }
    return digits.slice(0, 12);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const validatePhoneNumber = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (!digits.startsWith("255") || digits.length !== 12) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Tanzanian phone number",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const initiatePayment = async () => {
    if (!selectedProvider) {
      toast({
        title: "Select Provider",
        description: "Please select a mobile money provider",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber()) return;

    setPaymentStep("confirm");
  };

  const confirmPayment = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Update appointment with payment info
      const { error } = await supabase
        .from("appointments")
        .update({
          payment_method: "mobile_money",
          mobile_money_provider: selectedProvider,
          mobile_money_phone: phoneNumber,
          payment_amount: amount,
          payment_status: "processing",
          payment_reference: `MM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
        .eq("id", appointmentId);

      if (error) throw error;

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Update payment status to completed
      await supabase
        .from("appointments")
        .update({ payment_status: "completed" })
        .eq("id", appointmentId);

      setPaymentStep("success");
      toast({
        title: "Payment Successful",
        description: `Payment of TZS ${amount.toLocaleString()} completed via ${MOBILE_PROVIDERS.find(p => p.id === selectedProvider)?.name}`
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
      setPaymentStep("select");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStep === "success") {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Your payment of TZS {amount.toLocaleString()} has been processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === "processing") {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Processing Payment</h3>
          <p className="text-muted-foreground">
            Please check your phone for the payment prompt and enter your PIN.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Do not close this page...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile Money Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentStep === "select" && (
          <>
            {/* Amount Display */}
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-3xl font-bold text-primary">TZS {amount.toLocaleString()}</p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-3">
              <Label>Select Payment Provider</Label>
              <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
                {MOBILE_PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedProvider === provider.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <RadioGroupItem value={provider.id} id={provider.id} />
                    <div className={`w-10 h-10 ${provider.color} rounded-full flex items-center justify-center text-xl`}>
                      {provider.logo}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Money Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+</span>
                <Input
                  id="phone"
                  placeholder="255 7XX XXX XXX"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-8"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your registered mobile money number
              </p>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your payment is secured. You will receive a prompt on your phone to confirm the payment.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={initiatePayment} className="flex-1 bg-gradient-primary">
                Continue
              </Button>
            </div>
          </>
        )}

        {paymentStep === "confirm" && (
          <>
            {/* Payment Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold">Confirm Payment Details</h3>
              
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">
                    {MOBILE_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="font-medium">+{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">TZS {amount.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                By confirming, you will receive a payment prompt on your phone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPaymentStep("select")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={confirmPayment}
                disabled={isProcessing}
                className="flex-1 bg-gradient-primary"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
