import React from "react";
import { Navigation } from "@/Components/Navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
