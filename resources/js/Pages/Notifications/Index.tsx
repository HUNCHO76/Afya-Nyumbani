import React from "react";
import ProtectedLayout from "@/Layouts/ProtectedLayout";

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">System and workflow alerts</p>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
        Notifications feed coming soon.
      </div>
    </div>
  );
};

NotificationsPage.layout = (page: React.ReactNode) => <ProtectedLayout>{page}</ProtectedLayout>;

export default NotificationsPage;
