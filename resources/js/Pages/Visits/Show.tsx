import React from 'react';
import { Link, router } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Button } from '@/Components/ui/button';

const VisitShow = ({ visit }: any) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };

  const handleCheckIn = (e:any) => {
    e.preventDefault();
    router.post(`/visits/${visit.id}/check-in`);
  }

  const handleCheckOut = (e:any) => {
    e.preventDefault();
    router.post(`/visits/${visit.id}/check-out`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} />
      <MainSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Visit — {visit.booking?.client?.user?.name}</h1>
                <p className="text-muted-foreground">{new Date(visit.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {!visit.check_in_time && (
                  <Button onClick={handleCheckIn}>Check In</Button>
                )}

                {visit.check_in_time && !visit.check_out_time && (
                  <Button onClick={handleCheckOut} variant="destructive">Check Out</Button>
                )}

                {visit.check_out_time && (
                  <span className="px-3 py-1 rounded bg-green-100 text-green-700">Completed</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-3">Details</h3>
              <p className="text-sm">Service: {visit.booking?.service?.name}</p>
              <p className="text-sm">Scheduled: {visit.booking?.booking_date} at {visit.booking?.booking_time}</p>
              <p className="text-sm">Location: {visit.booking?.location_address || '-'}</p>
              <p className="text-sm mt-3">Notes: {visit.visit_notes || 'No notes'}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default VisitShow;