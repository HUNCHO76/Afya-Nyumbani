import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Clock, Users, Check, Star, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-healthcare.jpg";

export const HeroSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Our certified nurses provide personalized care with empathy and professionalism.",
      stats: "98% Patient Satisfaction",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    },
    {
      icon: Shield,
      title: "Licensed Professionals",
      description: "All our healthcare providers are licensed and continuously trained.",
      stats: "100+ Certified Staff",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
      icon: Clock,
      title: "24/7 Emergency Response",
      description: "Round-the-clock availability for urgent medical care needs.",
      stats: "15-min Avg. Response",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    },
    {
      icon: Users,
      title: "Family-Centered Approach",
      description: "We involve family members in care plans and provide ongoing support.",
      stats: "Family Support Included",
      color: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    },
  ];

  const services = [
    "Post-Hospital Care",
    "Chronic Disease Management",
    "Elderly Care",
    "Recovery Assistance",
    "Medication Management",
    "Health Monitoring",
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <img
            src={heroImage}
            alt="Professional home nursing care - A nurse helping an elderly patient at home"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-white">
                  Trusted by 500+ Families Across Tanzania
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Professional
                  <span className="block text-accent mt-2">Home Nursing Care</span>
                </h1>
                <p className="text-xl text-white/90 max-w-2xl lg:max-w-none leading-relaxed">
                  Quality healthcare services delivered to your home by certified medical professionals. 
                  Available 24/7 with compassionate care you can trust.
                </p>
              </div>

              {/* Service Highlights */}
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {services.slice(0, 4).map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-2 text-white"
                  >
                    <Check className="h-5 w-5 text-green-400 shrink-0 font-bold stroke-[3]" />
                    <span className="text-sm font-medium">{service}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-primary shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  <span>Book Service Now</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary hover:border-white transition-all duration-300 font-semibold"
                >
                  <Users className="mr-2 h-5 w-5" />
                  View Our Services
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {[
                  { value: "500+", label: "Patients Served", icon: Users },
                  { value: "50+", label: "Qualified Staff", icon: Shield },
                  { value: "24/7", label: "Availability", icon: Clock },
                  { value: "4.9★", label: "Rating", icon: Star },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <stat.icon className="h-5 w-5 text-yellow-400 stroke-[2.5]" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                    </div>
                    <div className="text-xs text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Location Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white">
                <MapPin className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">Serving all major cities in Tanzania</span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={cn(
                    "p-6 bg-card/95 backdrop-blur-sm shadow-xl border-0 transition-all duration-300 transform",
                    hoveredCard === index
                      ? "scale-[1.02] shadow-2xl"
                      : "hover:scale-[1.01] hover:shadow-lg"
                  )}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-xl transition-transform duration-300 shadow-lg",
                        feature.color,
                        hoveredCard === index && "scale-110"
                      )}
                    >
                      <feature.icon className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          {feature.stats}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar effect */}
                  <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        index === 0 && "bg-primary",
                        index === 1 && "bg-secondary",
                        index === 2 && "bg-accent",
                        index === 3 && "bg-green-500"
                      )}
                      style={{
                        width: hoveredCard === index ? "100%" : `${85 + index * 5}%`,
                      }}
                    />
                  </div>
                </Card>
              ))}

              {/* Trust Indicators */}
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Currently serving 24 patients
                      </p>
                      <p className="text-xs text-white/70">
                        All caregivers are on-duty
                      </p>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Banner */}
          <div className="mt-12 lg:mt-16 bg-gradient-to-r from-red-600/20 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                  <Phone className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Emergency Medical Care Available
                  </h3>
                  <p className="text-white/80">
                    Immediate response for urgent medical situations
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="lg"
                className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Emergency: 1155
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};