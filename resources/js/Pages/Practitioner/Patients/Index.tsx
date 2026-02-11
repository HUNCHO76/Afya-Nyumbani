import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import MainSidebar from '@/Components/navigation/MainSidebar';
import { Navigation } from '@/Components/Navigation';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, User, Calendar, Activity } from 'lucide-react';

interface Patient {
  id: string;
  user: {
    name: string;
    email: string;
  };
  date_of_birth: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  visits_count: number;
}

interface Props {
  patients: {
    data: Patient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const PractitionerPatientsIndex = ({ patients }: Props) => {
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.data.filter(patient =>
    patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">My Patients</h1>
              <p className="text-muted-foreground">
                View and manage patients you've been assigned to care for
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Patients Table */}
            {filteredPatients.length > 0 ? (
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-6 py-3 text-left text-sm font-semibold">Patient Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Age</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Blood Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Total Visits</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Emergency Contact</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{patient.user.name}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{patient.user.email}</td>
                          <td className="px-6 py-4 text-sm">{calculateAge(patient.date_of_birth)} years</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {patient.blood_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              {patient.visits_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="text-muted-foreground">
                              <p>{patient.emergency_contact_name}</p>
                              <p className="text-xs">{patient.emergency_contact_phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Link href={`/practitioner/patients/${patient.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'No patients match your search criteria'
                    : 'You haven\'t been assigned to any patients yet'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {patients.last_page > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: patients.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === patients.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.get(`/practitioner/patients?page=${page}`)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PractitionerPatientsIndex;
