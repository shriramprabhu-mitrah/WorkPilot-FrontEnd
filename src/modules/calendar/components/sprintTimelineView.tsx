'use client';

import { useMemo, useRef, useEffect } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { getSprintPalette } from './calendarsViewStyle';
import { WpButton } from '@/src/app/components/common/button';
import MonthYearPicker from './monthhYearrPickerr';
import type { CalendarEvent } from '../types';

interface SprintTimelineViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onSprintClick?: (event: CalendarEvent) => void;
}

const SprintTimelineView = ({
  events,
  currentDate,
  onNavigate,
  onSprintClick,
}: SprintTimelineViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sprintEvents = useMemo(
    () => events.filter((e) => e.type === 'Sprint'),
    [events]
  );

  const startOfMonth = useMemo(
    () => moment(currentDate).startOf('month'),
    [currentDate]
  );
  const endOfMonth = useMemo(
    () => moment(currentDate).endOf('month'),
    [currentDate]
  );
  const daysInMonth = useMemo(() => startOfMonth.daysInMonth(), [startOfMonth]);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = moment(startOfMonth).date(i + 1);
      const isToday = date.isSame(moment(), 'day');
      const isWeekend = date.day() === 0 || date.day() === 6;
      return {
        dayNumber: i + 1,
        date,
        dayName: date.format('ddd').substring(0, 1),
        fullDayName: date.format('ddd'),
        isToday,
        isWeekend,
      };
    });
  }, [daysInMonth, startOfMonth]);

  // Sprints that touch this month
  const visibleSprints = useMemo(() => {
    return sprintEvents
      .filter((sprint) => {
        const sStart = moment(sprint.start);
        const sEnd = moment(sprint.end);
        return sStart.isSameOrBefore(endOfMonth) && sEnd.isSameOrAfter(startOfMonth);
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [sprintEvents, startOfMonth, endOfMonth]);

  // Statistics
  const stats = useMemo(() => {
    let active = 0;
    let planned = 0;
    let completed = 0;

    visibleSprints.forEach((s) => {
      const st = (s.status || '').toLowerCase();
      if (st.includes('complete') || st.includes('close')) {
        completed++;
      } else if (st.includes('active') || st.includes('progress')) {
        active++;
      } else {
        planned++;
      }
    });

    return {
      total: visibleSprints.length,
      active,
      planned,
      completed,
    };
  }, [visibleSprints]);

  // Scroll to current day column on load
  useEffect(() => {
    if (moment(currentDate).isSame(moment(), 'month') && containerRef.current) {
      const todayIndex = moment().date() - 1;
      const dayWidth = 44;
      const scrollPos = Math.max(0, todayIndex * dayWidth - 180);
      containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [currentDate]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls & Metrics Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MonthYearPicker value={currentDate} onChange={onNavigate} />
          <div className="flex items-center gap-1">
            <WpButton
              variant="secondary"
              size="sm"
              className="!h-8 !w-8 !p-0 !rounded-lg !border !border-gray-200 dark:!border-slate-600 !bg-white dark:!bg-slate-800 !text-gray-600 dark:!text-slate-300 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 hover:!text-blue-600"
              onClick={() => onNavigate(moment(currentDate).subtract(1, 'month').toDate())}
            >
              <ChevronLeft size={16} />
            </WpButton>
            <WpButton
              variant="secondary"
              size="sm"
              className="!h-8 !px-2.5 !rounded-lg !border !border-blue-200 dark:!border-blue-700 !bg-white dark:!bg-slate-800 !text-blue-600 dark:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 text-xs font-semibold"
              onClick={() => onNavigate(new Date())}
            >
              Today
            </WpButton>
            <WpButton
              variant="secondary"
              size="sm"
              className="!h-8 !w-8 !p-0 !rounded-lg !border !border-gray-200 dark:!border-slate-600 !bg-white dark:!bg-slate-800 !text-gray-600 dark:!text-slate-300 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 hover:!text-blue-600"
              onClick={() => onNavigate(moment(currentDate).add(1, 'month').toDate())}
            >
              <ChevronRight size={16} />
            </WpButton>
          </div>
        </div>

        {/* Sprint Summary Metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-2.5 py-1 font-medium text-gray-700 dark:text-slate-300">
            Total Sprints: <strong className="text-gray-900 dark:text-slate-100">{stats.total}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-300">
            Active: <strong>{stats.active}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 font-medium text-indigo-700 dark:text-indigo-300">
            Planned: <strong>{stats.planned}</strong>
          </span>
          {stats.completed > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 font-medium text-gray-600 dark:text-slate-400">
              Completed: <strong>{stats.completed}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Timeline Grid */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        {visibleSprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
              <CalendarIcon size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              No Sprints Scheduled for {moment(currentDate).format('MMMM YYYY')}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
              There are no active or planned sprints in this period. Create a sprint in the Backlog or Project page to see its timeline track here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" ref={containerRef}>
            <div className="min-w-[900px]">
              {/* Timeline Header (Days Axis) */}
              <div className="grid grid-cols-[260px_1fr] border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60 sticky top-0 z-20">
                <div className="flex items-center px-4 py-3 border-r border-gray-200 dark:border-slate-700 font-semibold text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Sprint Name & Info
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))` }}>
                  {days.map((d) => (
                    <div
                      key={d.dayNumber}
                      className={`flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-slate-800 text-center transition-colors ${
                        d.isToday
                          ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                          : d.isWeekend
                            ? 'bg-gray-100/40 dark:bg-slate-900/30 text-gray-400 dark:text-slate-500'
                            : 'text-gray-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-medium">{d.dayName}</span>
                      <span
                        className={`text-xs mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                          d.isToday ? 'bg-blue-600 text-white font-bold' : ''
                        }`}
                      >
                        {d.dayNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sprint Tracks */}
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {visibleSprints.map((sprint, idx) => {
                  const palette = getSprintPalette(sprint.colorIndex ?? idx);
                  const sprintStart = moment(sprint.start);
                  const sprintEnd = moment(sprint.end);

                  // Calculate column span within current month
                  const effectiveStartDay = Math.max(1, sprintStart.isBefore(startOfMonth) ? 1 : sprintStart.date());
                  const effectiveEndDay = Math.min(daysInMonth, sprintEnd.isAfter(endOfMonth) ? daysInMonth : sprintEnd.date());
                  const durationDays = Math.max(1, Math.round((sprint.end.getTime() - sprint.start.getTime()) / (1000 * 60 * 60 * 24)));

                  const status = (sprint.status || '').toLowerCase();
                  const isCompleted = status.includes('complete') || status.includes('close');
                  const isActive = status.includes('active') || status.includes('progress') || (!isCompleted && !status.includes('plan'));

                  return (
                    <div
                      key={sprint.id}
                      className="grid grid-cols-[260px_1fr] hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      {/* Left: Sprint Details Column */}
                      <div
                        onClick={() => onSprintClick?.(sprint)}
                        className="flex flex-col justify-center px-4 py-3 border-r border-gray-200 dark:border-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {sprint.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : isCompleted
                                  ? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                            }`}
                          >
                            {sprint.status || (isActive ? 'Active' : 'Planned')}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {sprintStart.format('MMM D')} – {sprintEnd.format('MMM D')}
                          </span>
                          <span>•</span>
                          <span>{durationDays} days</span>
                        </div>
                      </div>

                      {/* Right: Interactive Timeline Track Bar */}
                      <div
                        className="relative grid py-2.5 items-center px-1"
                        style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))` }}
                      >
                        {/* Background Day Guides */}
                        {days.map((d) => (
                          <div
                            key={d.dayNumber}
                            className={`h-full border-r border-gray-100/80 dark:border-slate-800/80 ${
                              d.isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                            }`}
                          />
                        ))}

                        {/* Sprint Bar */}
                        <div
                          onClick={() => onSprintClick?.(sprint)}
                          style={{
                            gridColumn: `${effectiveStartDay} / ${effectiveEndDay + 1}`,
                            backgroundColor: palette.bgLight,
                            borderColor: palette.accent,
                          }}
                          className="absolute inset-y-2.5 left-1 right-1 z-10 flex items-center justify-between rounded-xl border-l-4 px-3 shadow-xs hover:shadow-md hover:scale-[1.008] transition-all cursor-pointer dark:!bg-slate-900/90 dark:border-l-4"
                        >
                          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
                              style={{ backgroundColor: palette.accent }}
                            />
                            <span
                              className="font-bold text-xs truncate"
                              style={{ color: palette.textLight }}
                            >
                              {sprint.title}
                            </span>
                            <span className="hidden md:inline text-[11px] opacity-75 font-medium" style={{ color: palette.textLight }}>
                              ({sprintStart.format('MMM D')} – {sprintEnd.format('MMM D')})
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 pl-2">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 shadow-xs"
                              style={{ color: palette.accent }}
                            >
                              {durationDays}d
                            </span>
                            <ArrowRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintTimelineView;
