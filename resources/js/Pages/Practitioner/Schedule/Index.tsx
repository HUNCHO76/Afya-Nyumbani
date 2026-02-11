import React, {useState} from 'react';
import { Link } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Button } from '@/Components/ui/button';

const PractitionerScheduleIndex = ({ upcoming }: any) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false'); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
      <MainSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">My Schedule</h1>
              <p className="text-muted-foreground">Upcoming appointments</p>
            </div>

            {upcoming.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcoming.map((booking: any) => (
                  <div key={booking.id} className="rounded-lg border bg-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.client?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time} — {booking.service?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/practitioner/appointments/${booking.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>

                      {booking.status !== 'cancelled' && booking.status !== 'in_progress' && (
                        <form method="post" action={`/practitioner/appointments/${booking.id}/start`}>
                          <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                          <Button type="submit" size="sm" variant="secondary">Start Visit</Button>
                        </form>
                      )}

                      <form method="post" action={`/practitioner/appointments/${booking.id}/confirm`}>
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                        <Button type="submit" size="sm">Confirm</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PractitionerScheduleIndex;
