import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Syringe, 
  Thermometer, 
  Activity, 
  Pill, 
  UserCheck,
  Heart,
  Zap
} from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "General Nursing Care",
    description: "Comprehensive nursing services including wound dressing, catheter care, and medication administration.",
    features: ["Wound care", "Medication management", "Vital signs monitoring", "Patient assessment"],
    price: "From TSh 50,000",
    color: "primary"
  },
  {
    icon: Activity,
    title: "Physiotherapy",
    description: "Professional physiotherapy services to help with mobility, pain management, and rehabilitation.",
    features: ["Mobility exercises", "Pain management", "Post-surgery rehab", "Strength training"],
    price: "From TSh 75,000",
    color: "secondary"
  },
  {
    icon: Syringe,
    title: "IV Therapy & Injections",
    description: "Safe and sterile intravenous treatments and medication injections administered at home.",
    features: ["IV medication", "Vitamin therapy", "Vaccinations", "Blood draws"],
    price: "From TSh 40,000",
    color: "accent"
  },
  {
    icon: Heart,
    title: "Cardiac Care",
    description: "Specialized care for patients with heart conditions and post-cardiac procedure monitoring.",
    features: ["ECG monitoring", "Blood pressure checks", "Medication compliance", "Emergency response"],
    price: "From TSh 100,000",
    color: "destructive"
  },
  {
    icon: UserCheck,
    title: "Elderly Care",
    description: "Comprehensive care services specifically designed for elderly patients and their unique needs.",
    features: ["Daily living assistance", "Medication reminders", "Safety monitoring", "Companionship"],
    price: "From TSh 60,000",
    color: "primary"
  },
  {
    icon: Zap,
    title: "Emergency Response",
    description: "24/7 emergency medical response for urgent healthcare needs and critical situations.",
    features: ["24/7 availability", "Rapid response", "Emergency stabilization", "Hospital coordination"],
    price: "Emergency rates apply",
    color: "warning"
  }
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Healthcare Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional medical care delivered to your home by certified healthcare providers. 
            Choose from our comprehensive range of services tailored to your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            const getColorClasses = (color: string) => {
              switch (color) {
                case 'primary':
                  return 'bg-primary/10 text-primary';
                case 'secondary':
                  return 'bg-secondary/10 text-secondary';
                case 'accent':
                  return 'bg-accent/10 text-accent';
                case 'destructive':
                  return 'bg-destructive/10 text-destructive';
                case 'warning':
                  return 'bg-warning/10 text-warning';
                default:
                  return 'bg-primary/10 text-primary';
              }
            };

            return (
              <Card key={index} className="relative overflow-hidden shadow-card hover:shadow-primary transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className={`flex items-center justify-center w-16 h-16 rounded-lg mb-4 ${getColorClasses(service.color)}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl text-card-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-card-foreground text-sm">Includes:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{service.price}</span>
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-card p-8 shadow-card">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Need a Custom Care Plan?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our medical team can create personalized care plans combining multiple services 
              to meet your specific healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary shadow-primary">
                Consult Our Team
              </Button>
              <Button size="lg" variant="outline">
                View All Services
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};