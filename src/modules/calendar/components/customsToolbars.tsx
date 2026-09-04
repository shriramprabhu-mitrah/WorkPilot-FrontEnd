import { Navigate, ToolbarProps, View } from 'react-big-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../types';
import { WpButton } from '@/src/app/components/common/button';
import MonthYearPicker from './monthhYearrPickerr';

export type CalendarDisplayView = View | 'timeline';

interface CustomToolbarProps extends Omit<ToolbarProps<CalendarEvent>, 'onViewChange' | 'view'> {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentView: CalendarDisplayView;
  onViewChange: (view: CalendarDisplayView) => void;
}

const CustomToolbar = ({
  label,
  onNavigate,
  currentDate,
  onDateChange,
  currentView,
  onViewChange,
}: CustomToolbarProps) => {
  return (
    <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <MonthYearPicker value={currentDate} onChange={onDateChange} />
        {currentView === 'day' ? (
          <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-slate-100">{label}</p>
        ) : currentView === 'week' ? (
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-100">{label}</p>
        ) : currentView === 'timeline' ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Roadmap & timeline of all sprints in this project
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-200">
            View and manage your project schedule
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <WpButton
          variant="secondary"
          size="sm"
          className="!rounded-xl !border !border-gray-200 dark:!border-slate-600 !bg-white dark:!bg-slate-800 !text-gray-600 dark:!text-slate-300 hover:!border-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 hover:!text-blue-600"
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => onNavigate(Navigate.PREVIOUS)}
        />

        <WpButton
          variant="secondary"
          size="sm"
          className="!rounded-xl !border !border-blue-200 dark:!border-blue-700 !bg-white dark:!bg-slate-800 !text-blue-600 dark:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/20"
          onClick={() => onNavigate(Navigate.TODAY)}
        >
          Today
        </WpButton>

        <WpButton
          variant="secondary"
          size="sm"
          className="!rounded-xl !border !border-gray-200 dark:!border-slate-600 !bg-white dark:!bg-slate-800 !text-gray-600 dark:!text-slate-300 hover:!border-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 hover:!text-blue-600"
          rightIcon={<ChevronRight size={16} />}
          onClick={() => onNavigate(Navigate.NEXT)}
        />

        <select
          value={currentView}
          onChange={(e) => onViewChange(e.target.value as CalendarDisplayView)}
          className="h-9 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 px-2 sm:px-3 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 outline-none"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
          <option value="timeline">Sprint Timeline</option>
        </select>
      </div>
    </div>
  );
};

export default CustomToolbar;
