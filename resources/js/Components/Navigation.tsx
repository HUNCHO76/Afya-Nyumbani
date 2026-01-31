import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Phone, Clock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth } = usePage().props;
  const isAuthenticated = !!auth?.user;

  return (
    <nav className={cn("bg-card shadow-card border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Afya-Home-Care</h1>
              <p className="text-xs text-muted-foreground">Home Nursing Care</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              // Authenticated User Navigation
              <>
                <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-foreground hover:text-primary transition-colors">
                  Profile
                </Link>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Welcome, {auth?.user?.name || 'User'}</span>
                </div>
                <form method="POST" action="/logout" style={{ display: 'inline' }}>
                  <button type="submit" className="px-4 py-2 bg-transparent border border-input rounded-md hover:bg-accent flex items-center space-x-2 text-sm">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </form>
              </>
            ) : (
              // Guest Navigation
              <>
                <a href="#services" className="text-foreground hover:text-primary transition-colors">
                  Services
                </a>
                <a href="#about" className="text-foreground hover:text-primary transition-colors">
                  About
                </a>
                <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                  Contact
                </a>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>+255 123 456 789</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>24/7 Available</span>
                  </div>
                </div>
                <Link href="/login">
                  <Button variant="default" className="bg-gradient-primary shadow-primary">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                // Authenticated User Mobile Menu
                <>
                  <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="text-foreground hover:text-primary transition-colors">
                    Profile
                  </Link>
                  <div className="text-sm text-muted-foreground py-2 border-t border-border">
                    <p className="mb-3">Welcome, {auth?.user?.name || 'User'}</p>
                    <form method="POST" action="/logout" style={{ display: 'block' }}>
                      <button type="submit" className="w-full px-4 py-2 bg-transparent border border-input rounded-md hover:bg-accent flex items-center justify-center space-x-2 text-sm">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                // Guest Mobile Menu
                <>
                  <a
                    href="#services"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Services
                  </a>
                  <a
                    href="#about"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </a>
                  <a
                    href="#contact"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </a>
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>+255 123 456 789</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>24/7 Available</span>
                    </div>
                  </div>
                  <Link href="/auth">
                    <Button variant="default" className="w-full bg-gradient-primary shadow-primary">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};