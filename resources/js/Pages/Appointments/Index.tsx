import React from "react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";

const AppointmentsPage = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage bookings and schedules</p>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
        Appointment list coming soon.
      </div>
    </div>
  );
};

AppointmentsPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default AppointmentsPage;
