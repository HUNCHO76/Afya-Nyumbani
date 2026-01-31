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
      <Navigation isSidebarCollapsed={isSidebarCollapsed} />
      
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

            {/* Patients Grid */}
            {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {patient.user.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {calculateAge(patient.date_of_birth)} years old
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Blood Type:</span>
                        <span className="font-medium">{patient.blood_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Visits:</span>
                        <span className="font-medium">{patient.visits_count}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href={`/practitioner/patients/${patient.id}`}>
                        <Button className="w-full" variant="default">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
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
