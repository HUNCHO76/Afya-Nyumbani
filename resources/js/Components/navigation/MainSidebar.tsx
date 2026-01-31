import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CalendarDays,
  DollarSign,
  Package,
  Settings,
  FileText,
  Activity,
  Heart,
  ClipboardList,
  BarChart3,
  Map,
  CreditCard,
  Phone,
  Shield,
  Stethoscope,
  UserCog,
  TrendingUp,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface MainSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const MainSidebar: React.FC<MainSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { url, props } = usePage<PageProps<{ auth: { user: { role?: string } } }>>();
  const user = props.auth?.user;
  const userRole = (user as any)?.role;
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    );
  };

  // Role-based navigation configuration
  const getNavigationForRole = (): NavigationGroup[] => {
    switch (userRole) {
      case 'super_admin':
      case 'admin':
        return [
          {
            label: 'Overview',
            items: [
              {
                title: 'Dashboard',
                href: '/dashboard/admin',
                icon: <LayoutDashboard className="w-5 h-5" />,
              },
              {
                title: 'Analytics',
                href: '/dashboard/admin#analytics',
                icon: <BarChart3 className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Management',
            items: [
              {
                title: 'Practitioners',
                href: '/practitioners',
                icon: <Stethoscope className="w-5 h-5" />,
              },
              {
                title: 'Patients',
                href: '/patients',
                icon: <Users className="w-5 h-5" />,
              },
              {
                title: 'Users',
                href: '/users',
                icon: <UserCog className="w-5 h-5" />,
              },
              {
                title: 'Clients',
                href: '/clients',
                icon: <UserCheck className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Operations',
            items: [
              {
                title: 'Appointments',
                href: '/bookings',
                icon: <Calendar className="w-5 h-5" />,
              },
              {
                title: 'Services',
                href: '/services',
                icon: <ClipboardList className="w-5 h-5" />,
              },
              {
                title: 'Route Map',
                href: '/dashboard/admin#route-map',
                icon: <Map className="w-5 h-5" />,
              },
              {
                title: 'Inventory',
                href: '/inventory',
                icon: <Package className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Finance',
            items: [
              {
                title: 'Financial Overview',
                href: '/dashboard/admin#financial',
                icon: <DollarSign className="w-5 h-5" />,
              },
              {
                title: 'Reports',
                href: '/reports',
                icon: <FileText className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'System',
            items: [
              {
                title: 'Settings',
                href: '/settings',
                icon: <Settings className="w-5 h-5" />,
              },
              {
                title: 'Notifications',
                href: '/notifications',
                icon: <Bell className="w-5 h-5" />,
              },
            ],
          },
        ];

      case 'practitioner':
        return [
          {
            label: 'Dashboard',
            items: [
              {
                title: 'Overview',
                href: '/dashboard/practitioner',
                icon: <LayoutDashboard className="w-5 h-5" />,
              },
              {
                title: 'Mobile View',
                href: '/dashboard/practitioner#mobile',
                icon: <Activity className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Patients',
            items: [
              {
                title: 'My Patients',
                href: '/practitioner/patients',
                icon: <Users className="w-5 h-5" />,
              },
              {
                title: 'Record Vitals',
                href: '/practitioner/patients#vitals',
                icon: <Heart className="w-5 h-5" />,
              },
              {
                title: 'Patient Records',
                href: '/practitioner/patients#records',
                icon: <FileText className="w-5 h-5" />,
              },
              {
                title: 'Care Plans',
                href: '/practitioner/patients#care-plans',
                icon: <ClipboardList className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Schedule',
            items: [
              {
                title: 'My Schedule',
                href: '/practitioner/schedule',
                icon: <CalendarDays className="w-5 h-5" />,
              },
              {
                title: 'Route Map',
                href: '/dashboard/practitioner#route-map',
                icon: <Map className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Tools',
            items: [
              {
                title: 'Offline Vitals',
                href: '/practitioner/offline-vitals',
                icon: <Activity className="w-5 h-5" />,
              },
              {
                title: 'Sync Status',
                href: '/practitioner/sync/queue-status',
                icon: <TrendingUp className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Account',
            items: [
              {
                title: 'Profile',
                href: '/profile',
                icon: <UserCog className="w-5 h-5" />,
              },
              {
                title: 'Settings',
                href: '/settings',
                icon: <Settings className="w-5 h-5" />,
              },
            ],
          },
        ];

      case 'client':
        return [
          {
            label: 'Dashboard',
            items: [
              {
                title: 'Dashboard',
                href: '/dashboard/client',
                icon: <LayoutDashboard className="w-5 h-5" />,
              },
              {
                title: 'Overview',
                href: '/dashboard/client#overview',
                icon: <Activity className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Appointments',
            items: [
              {
                title: 'My Bookings',
                href: '/client/bookings',
                icon: <Calendar className="w-5 h-5" />,
              },
              {
                title: 'Book Appointment',
                href: '/client/bookings/create',
                icon: <CalendarDays className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Health',
            items: [
              {
                title: 'Medical Records',
                href: '/health-records',
                icon: <FileText className="w-5 h-5" />,
              },
              {
                title: 'Vital Signs',
                href: '/dashboard/client#vitals',
                icon: <Heart className="w-5 h-5" />,
              },
              {
                title: 'Care Plans',
                href: '/dashboard/client#care-plans',
                icon: <ClipboardList className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Billing',
            items: [
              {
                title: 'Payment History',
                href: '/client/payments',
                icon: <CreditCard className="w-5 h-5" />,
              },
              {
                title: 'Invoices',
                href: '/client/invoices',
                icon: <FileText className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Account',
            items: [
              {
                title: 'Profile',
                href: '/profile',
                icon: <UserCog className="w-5 h-5" />,
              },
              {
                title: 'Security',
                href: '/profile/security',
                icon: <Shield className="w-5 h-5" />,
              },
              {
                title: 'Settings',
                href: '/settings',
                icon: <Settings className="w-5 h-5" />,
              },
            ],
          },
        ];

      case 'inventory_officer':
        return [
          {
            label: 'Dashboard',
            items: [
              {
                title: 'Dashboard',
                href: '/dashboard/inventory',
                icon: <LayoutDashboard className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Inventory',
            items: [
              {
                title: 'Items',
                href: '/inventory',
                icon: <Package className="w-5 h-5" />,
              },
              {
                title: 'Stock Levels',
                href: '/inventory/stock',
                icon: <BarChart3 className="w-5 h-5" />,
              },
              {
                title: 'Suppliers',
                href: '/inventory/suppliers',
                icon: <Users className="w-5 h-5" />,
              },
              {
                title: 'Usage Reports',
                href: '/inventory/reports',
                icon: <FileText className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Account',
            items: [
              {
                title: 'Profile',
                href: '/profile',
                icon: <UserCog className="w-5 h-5" />,
              },
              {
                title: 'Settings',
                href: '/settings',
                icon: <Settings className="w-5 h-5" />,
              },
            ],
          },
        ];

      case 'finance_officer':
        return [
          {
            label: 'Dashboard',
            items: [
              {
                title: 'Dashboard',
                href: '/dashboard/finance',
                icon: <LayoutDashboard className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Finance',
            items: [
              {
                title: 'Payments',
                href: '/finance/payments',
                icon: <CreditCard className="w-5 h-5" />,
              },
              {
                title: 'Invoices',
                href: '/finance/invoices',
                icon: <FileText className="w-5 h-5" />,
              },
              {
                title: 'Revenue',
                href: '/finance/revenue',
                icon: <DollarSign className="w-5 h-5" />,
              },
              {
                title: 'Reports',
                href: '/finance/reports',
                icon: <BarChart3 className="w-5 h-5" />,
              },
            ],
          },
          {
            label: 'Account',
            items: [
              {
                title: 'Profile',
                href: '/profile',
                icon: <UserCog className="w-5 h-5" />,
              },
              {
                title: 'Settings',
                href: '/settings',
                icon: <Settings className="w-5 h-5" />,
              },
            ],
          },
        ];

      default:
        return [
          {
            label: 'Navigation',
            items: [
              {
                title: 'Dashboard',
                href: '/dashboard',
                icon: <LayoutDashboard className="w-5 h-5" />,
              },
            ],
          },
        ];
    }
  };

  const navigationGroups = getNavigationForRole();

  const isActiveRoute = (href: string) => {
    if (href.includes('#')) {
      // For hash routes, check if the base path matches and the hash matches
      const [path, hash] = href.split('#');
      return url.startsWith(path) && (window.location.hash === `#${hash}` || url.includes(`#${hash}`));
    }
    return url === href || url.startsWith(href + '/');
  };

  const renderNavigationItem = (item: NavigationItem, depth: number = 0) => {
    const isActive = isActiveRoute(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              isCollapsed && 'justify-center',
              depth > 0 && 'ml-4'
            )}
          >
            {item.icon}
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{item.title}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>
          {!isCollapsed && isExpanded && item.children && (
            <div className="mt-1 space-y-1">
              {item.children.map(child => renderNavigationItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          isCollapsed && 'justify-center',
          depth > 0 && 'ml-4'
        )}
      >
        {item.icon}
        {!isCollapsed && (
          <>
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
        {isCollapsed && item.badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-background border-r border-border transition-all duration-300 overflow-y-auto',
          isCollapsed ? 'w-[88px]' : 'w-[280px]',
          'lg:translate-x-0',
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border sticky top-0 bg-background z-10">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg text-foreground">Afya Nyumbani</span>
                <p className="text-xs text-muted-foreground">Home Care</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {navigationGroups.map((group, index) => (
            <div key={index}>
              {!isCollapsed && group.label && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map(item => renderNavigationItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border mt-auto sticky bottom-0 bg-background">
          <Link
            href="/logout"
            method="post"
            as="button"
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-background border border-border items-center justify-center hover:bg-muted transition-colors hidden lg:flex"
        >
          <svg
            className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    </>
  );
};

export default MainSidebar;
