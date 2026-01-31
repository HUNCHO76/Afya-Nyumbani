import React from 'react';
import Icon from '@/Components/AppIcon';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

interface Filters {
  search: string;
  serviceType: string;
  carePlanStatus: string;
  priority: string;
  location: string;
}

interface PatientFiltersProps {
  filters: Filters;
  onFilterChange: (field: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.serviceType !== 'all' ||
    filters.carePlanStatus !== 'all' ||
    filters.priority !== 'all' ||
    filters.location !== 'all';

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={20} className="text-primary" />
          Filter Patients
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
          >
            <Icon name="X" size={16} className="mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative xl:col-span-2">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
          />
          <Input
            type="text"
            placeholder="Search by name or ID..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Service Type Filter */}
        <div>
          <select
            value={filters.serviceType}
            onChange={(e) => onFilterChange('serviceType', e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Services</option>
            <option value="wound">Wound Care</option>
            <option value="physiotherapy">Physiotherapy</option>
            <option value="iv">IV Medication</option>
            <option value="catheter">Catheter Care</option>
            <option value="feeding">Feeding Tube</option>
          </select>
        </div>

        {/* Care Plan Status Filter */}
        <div>
          <select
            value={filters.carePlanStatus}
            onChange={(e) => onFilterChange('carePlanStatus', e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Search: "{filters.search}"
              <button
                onClick={() => onFilterChange('search', '')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {filters.serviceType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Service: {filters.serviceType}
              <button
                onClick={() => onFilterChange('serviceType', 'all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {filters.carePlanStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Status: {filters.carePlanStatus}
              <button
                onClick={() => onFilterChange('carePlanStatus', 'all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Priority: {filters.priority}
              <button
                onClick={() => onFilterChange('priority', 'all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {filters.location !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
              Location: {filters.location}
              <button
                onClick={() => onFilterChange('location', 'all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientFilters;
