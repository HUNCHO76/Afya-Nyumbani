import { Link } from "@inertiajs/react";
import { Navigation } from "@/Components/Navigation";
import { HeroSection } from "@/Components/HeroSection";
import { ServicesSection } from "@/Components/ServicesSection";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ServicesSection />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Experience Our Healthcare Management System
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8">
            Join our comprehensive platform and streamline your healthcare journey
            today.
          </p>
          <Link href="/login">
            <Button className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-primary text-primary-foreground font-semibold shadow-primary hover:shadow-lg transition-all text-sm sm:text-base">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
