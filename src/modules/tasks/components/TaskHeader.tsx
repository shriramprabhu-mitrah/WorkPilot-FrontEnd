'use client';
import { Search, Download, Columns3, SlidersHorizontal } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { filters } from '../data/fliter';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
type TaskHeaderProps = {
  searchTerm: string;
  selectedFilters: {
    project: string;
    status: string;
    priority: string;
    assignee: string;
    sprint: string;
  };
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;

  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<{
      project: string;
      status: string;
      priority: string;
      assignee: string;
      sprint: string;
    }>
  >;
};
export const TaskHeader = ({
  selectedFilters,
  setSelectedFilters,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
}: TaskHeaderProps) => {
  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Task List</h1>

        <div className="flex gap-2">
          <WpButton variant="secondary" size="sm" leftIcon={<Download size={16} />}>
            Export
          </WpButton>
          <WpButton variant="secondary" size="sm" leftIcon={<Columns3 size={16} />}>
            Columns
          </WpButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <WpInput
          type="text"
          placeholder="Search tasks..."
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
          wrapperClassName="w-full sm:w-52"
          className="!py-1.5"
        />
        {filters.map((filter) => (
          <FilterDropdown
            key={filter.key}
            value={selectedFilters[filter.key as keyof typeof selectedFilters]}
            options={filter.options}
            onChange={(value) => handleFilterChange(filter.key, value)}
          />
        ))}
        <WpButton variant="secondary" size="sm" leftIcon={<SlidersHorizontal size={16} />}>
          More Filters
        </WpButton>
      </div>
    </div>
  );
};
