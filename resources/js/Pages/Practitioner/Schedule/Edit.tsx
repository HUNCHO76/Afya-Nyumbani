import React, {useState} from 'react';
import { router } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

const PractitionerScheduleEdit = ({ booking, clients, services }: any) => {
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

  const [form, setForm] = useState({ client_id: booking.client_id, service_id: booking.service_id, booking_date: booking.booking_date, booking_time: booking.booking_time, location_address: booking.location_address, status: booking.status });

  const handleSubmit = (e:any) => {
    e.preventDefault();
    router.put(`/practitioner/appointments/${booking.id}`, form);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
      <MainSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl font-bold mb-4">Edit Booking</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-xl">
              <div>
                <label className="text-sm text-muted-foreground">Client</label>
                <select value={form.client_id} onChange={(e:any) => setForm({...form, client_id: e.target.value})} className="w-full p-2 border rounded">
                  <option value="">Select client</option>
                  {clients.map((c:any)=> (<option key={c.id} value={c.id}>{c.user.name}</option>))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Service</label>
                <select value={form.service_id} onChange={(e:any) => setForm({...form, service_id: e.target.value})} className="w-full p-2 border rounded">
                  <option value="">Select service</option>
                  {services.map((s:any)=> (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <Input type="date" value={form.booking_date} onChange={(e:any)=> setForm({...form, booking_date: e.target.value})} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Time</label>
                <Input type="time" value={form.booking_time} onChange={(e:any)=> setForm({...form, booking_time: e.target.value})} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Location Address</label>
                <Input type="text" value={form.location_address} onChange={(e:any)=> setForm({...form, location_address: e.target.value})} />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Booking</Button>
                <Button variant="outline" onClick={()=> setForm({ client_id: booking.client_id, service_id: booking.service_id, booking_date: booking.booking_date, booking_time: booking.booking_time, location_address: booking.location_address, status: booking.status })}>Reset</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PractitionerScheduleEdit;