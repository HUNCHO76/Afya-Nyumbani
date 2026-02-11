import React, {useState} from 'react';
import { Link, router } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

const PractitionerScheduleShow = ({ booking, visits }: any) => {
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

  const [form, setForm] = useState({ booking_date: booking.booking_date, booking_time: booking.booking_time, reason: '' });

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`/practitioner/appointments/${booking.id}/reschedule`, form);
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('reason', form.reason);
    router.post(`/practitioner/appointments/${booking.id}/cancel`, data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
      <MainSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Appointment Details</h1>
                <p className="text-muted-foreground">{booking.client?.user?.name} — {booking.service?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {booking.status !== 'cancelled' && booking.status !== 'in_progress' && (
                  <form method="post" action={`/practitioner/appointments/${booking.id}/start`}>
                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                    <Button type="submit">Start Visit</Button>
                  </form>
                )}

                <form method="post" action={`/practitioner/appointments/${booking.id}/confirm`}>
                  <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                  <Button type="submit">Confirm</Button>
                </form>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Reschedule</h3>
                <form onSubmit={handleReschedule} className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Date</label>
                    <Input type="date" value={form.booking_date} onChange={(e:any) => setForm({...form, booking_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Time</label>
                    <Input type="time" value={form.booking_time} onChange={(e:any) => setForm({...form, booking_time: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="outline" onClick={() => setForm({booking_date: booking.booking_date, booking_time: booking.booking_time, reason: ''})}>Reset</Button>
                  </div>
                </form>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Cancel</h3>
                <form onSubmit={handleCancel} className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Reason (optional)</label>
                    <Input type="text" value={form.reason} onChange={(e:any) => setForm({...form, reason: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="destructive">Cancel Appointment</Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">Visit Records</h3>
              {visits.length > 0 ? (
                <div className="space-y-2">
                  {visits.map((v:any) => (
                    <div key={v.id} className="rounded border p-3">
                      <p className="text-sm font-medium">{new Date(v.created_at).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{v.visit_notes || 'No notes'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No visit records</p>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default PractitionerScheduleShow;
