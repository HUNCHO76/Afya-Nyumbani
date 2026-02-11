import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from "@/Components/Navigation";
import { Button } from "@/Components/ui/button";
import { Calendar, CheckCircle, Clock, Package } from "lucide-react";

interface Props {
  todaysSchedule: any[];
  visitHistory: any[];
  upcomingAssignments: any[];
  inventoryUsage: any[];
  stats: {
    todaysVisits: number;
    completedToday: number;
    totalVisits: number;
    availabilityStatus: string;
  };
}

const PractitionerDashboard = ({ 
  todaysSchedule = [], 
  visitHistory = [], 
  upcomingAssignments = [], 
  inventoryUsage = [], 
  stats 
}: Props) => {
  const { post, processing } = useForm({});
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

  const [openAssignment, setOpenAssignment] = useState<string | number | null>(null);

  const handleCheckIn = (visitId: number) => {
    post(`/visits/${visitId}/check-in`);
  };

  const handleCheckOut = (visitId: number) => {
    post(`/visits/${visitId}/check-out`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
      
      <MainSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`transition-all duration-300 ease-out pt-16 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <main className="min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Practitioner Dashboard</h1>
        <p className="text-muted-foreground">Manage your visits and track your work</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Today's Visits</p>
              <p className="text-2xl font-bold">{stats.todaysVisits}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold">{stats.completedToday}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{stats.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${
              stats.availabilityStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-xl font-semibold capitalize">{stats.availabilityStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Visits */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Today's Schedule</h2>
        </div>
        <div className="p-4">
          {todaysSchedule.length > 0 ? (
            <div className="space-y-3">
              {todaysSchedule.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.client?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Service: {item.service?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time: {item.booking_time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Location: {item.location_address || 'Not specified'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* If this item represents an existing Visit (has visit_ref), use visit check-in/out; otherwise show appointment actions */}
                      {!item.check_in_time && item.visit_ref ? (
                        <Button
                          onClick={() => handleCheckIn(item.visit_ref.id)}
                          disabled={processing}
                          size="sm"
                          variant="outline"
                        >
                          Check In
                        </Button>
                      ) : !item.check_in_time && !item.visit_ref ? (
                        <div className="flex gap-2">
                          <Link href={`/practitioner/appointments/${item.id}`}>
                            <Button size="sm" variant="outline">Open</Button>
                          </Link>

                          {item.status === 'pending' && (
                            <form method="post" action={`/practitioner/appointments/${item.id}/start`}>
                              <input type="hidden" name="_token" value={(window as any).Laravel?.csrfToken} />
                              <Button type="submit" size="sm" variant="secondary">Start Visit</Button>
                            </form>
                          )}
                        </div>
                      ) : null}

                      {item.check_in_time && item.visit_ref && !item.check_out_time && (
                        <>
                          <span className="text-xs text-green-600">Checked in at {item.check_in_time}</span>
                          <Button
                            onClick={() => handleCheckOut(item.visit_ref.id)}
                            disabled={processing}
                            size="sm"
                          >
                            Check Out
                          </Button>
                        </>
                      )}

                      {item.check_out_time && (
                        <span className="text-xs text-blue-600">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No visits scheduled for today</p>
          )}
        </div>
      </div>

      {/* Upcoming Assignments (Next 7 Days) */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {upcomingAssignments.map((assignment) => (
                <React.Fragment key={assignment.id}>
                  <tr className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">
                      {new Date(assignment.booking_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{assignment.booking_time}</td>
                    <td className="px-4 py-3 text-sm">{assignment.client?.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{assignment.service?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          assignment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {assignment.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setOpenAssignment(openAssignment === assignment.id ? null : assignment.id)}
                          className="text-sm text-primary underline"
                        >
                          {openAssignment === assignment.id ? 'Hide History' : 'View History'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {openAssignment === assignment.id && (
                    <tr className="bg-muted/10">
                      <td colSpan={5} className="px-4 py-3">
                        {visitHistory.filter(v => v.booking?.client?.id === assignment.client?.id).length > 0 ? (
                          <div className="space-y-2">
                            {visitHistory
                              .filter(v => v.booking?.client?.id === assignment.client?.id)
                              .slice(0, 5)
                              .map((v) => (
                                <div key={v.id} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <p className="text-sm font-medium">{new Date(v.booking?.booking_date).toLocaleDateString()} — {v.booking?.service?.name}</p>
                                    <p className="text-xs text-muted-foreground">{v.check_in_time ? `Checked in ${v.check_in_time}` : 'No check-in recorded'}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {v.check_out_time ? 'Completed' : (v.check_in_time ? 'In Progress' : 'Scheduled')}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No visit history for this client</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visit History */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Visit History</h2>
          <Link href="/visits">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Service</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visitHistory.slice(0, 10).map((visit) => (
              <tr key={visit.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-sm">
                {new Date(visit.booking?.booking_date || visit.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">{visit.booking?.client?.user?.name}</td>
                <td className="px-4 py-3 text-sm">{visit.booking?.service?.name}</td>
                <td className="px-4 py-3 text-sm">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  visit.check_out_time ? 'bg-green-100 text-green-700' :
                  visit.check_in_time ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {visit.check_out_time ? 'Completed' : (visit.check_in_time ? 'In Progress' : 'Scheduled')}
                </span>
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">
                {visit.visit_notes || visit.notes || 'No notes'}
                </td>
              </tr>
              ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Recent Inventory Usage */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Inventory Usage
          </h2>
        </div>
        <div className="p-4">
          {inventoryUsage.length > 0 ? (
            <div className="space-y-2">
              {inventoryUsage.map((usage) => (
                <div key={usage.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{usage.item?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(usage.used_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">Qty: {usage.quantity_used}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent inventory usage</p>
          )}
        </div>
      </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PractitionerDashboard;
