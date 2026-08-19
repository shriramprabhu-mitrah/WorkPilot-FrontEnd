import { Navigate, ToolbarProps, View } from 'react-big-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../types';
import { WpButton } from '@/src/app/components/common/button';
import MonthYearPicker from './monthhYearrPickerr';

interface CustomToolbarProps extends ToolbarProps<CalendarEvent> {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentView: View;
  onViewChange: (view: View) => void;

  selectedType: 'All' | 'Sprint' | 'Meeting' | 'Task';
  onTypeChange: (type: 'All' | 'Sprint' | 'Meeting' | 'Task') => void;
}
const CustomToolbar = ({
  label,
  onNavigate,
  currentDate,
  onDateChange,
  currentView,
  onViewChange,
  selectedType,
  onTypeChange,
}: CustomToolbarProps) => {
  return (
    <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <MonthYearPicker value={currentDate} onChange={onDateChange} />
        {currentView === 'day' ? (
          <p className="mt-3 text-lg font-semibold text-gray-900">{label}</p>
        ) : currentView === 'week' ? (
          <p className="mt-2 text-lg font-semibold text-gray-900">{label}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">View and manage your project schedule</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as 'All' | 'Sprint' | 'Meeting' | 'Task')}
          className="h-9 sm:h-9 rounded-lg border border-gray-200 px-2 sm:px-3 text-sm shadow-sm hover:bg-gray-50"
        >
          <option value="All">All Types</option>
          <option value="Sprint">Sprint</option>
          <option value="Meeting">Meeting</option>
          <option value="Task">Task</option>
        </select>

        <WpButton
          variant="secondary"
          size="sm"
          className="!rounded-xl !border !border-gray-200 !bg-white !text-gray-600 hover:!border-blue-200 hover:!bg-blue-50 hover:!text-blue-600"
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => onNavigate(Navigate.PREVIOUS)}
        />

        <WpButton
          variant="secondary"
          size="sm"
          className="!rounded-xl !border !border-blue-200 !bg-white !text-blue-600 hover:!bg-blue-50"
          onClick={() => onNavigate(Navigate.TODAY)}
        >
          Today
        </WpButton>

        <WpButton
          variant="secondary"
          size="sm"
          className="!rounded-xl !border !border-gray-200 !bg-white !text-gray-600 hover:!border-blue-200 hover:!bg-blue-50 hover:!text-blue-600"
          rightIcon={<ChevronRight size={16} />}
          onClick={() => onNavigate(Navigate.NEXT)}
        />

        <select
          value={currentView}
          onChange={(e) => onViewChange(e.target.value as View)}
          className="h-9 sm:h-9 rounded-lg border border-gray-200 px-2 sm:px-3 text-sm shadow-sm hover:bg-gray-50"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>
      </div>
    </div>
  );
};

export default CustomToolbar;
