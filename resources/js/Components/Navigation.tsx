import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Phone, Clock, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Navigation = ({ className, isSidebarCollapsed = false, onToggleSidebar }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth } = usePage().props;
  const isAuthenticated = !!auth?.user;

  return (
    <nav className={cn("bg-card shadow-card border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end space-x-5 items-center h-16">
          {/* Sidebar Toggle Button - Visible when sidebar is collapsed on desktop */}
          {isAuthenticated && onToggleSidebar && isSidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
              title="Open sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-foreground" />
            </button>
          )}
          
          {/* Logo - Icon Only */}
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <Heart className="w-6 h-6 text-primary-foreground" />
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
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && onToggleSidebar && (
              <button
                className="p-2"
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
              >
                <PanelLeftOpen className={cn("w-6 h-6 text-foreground transition-transform", !isSidebarCollapsed && "rotate-180")} />
              </button>
            )}
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
            </button>
          </div>
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
                    <p>Welcome, {auth?.user?.name || 'User'}</p>
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
                  <Link href="/login">
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