'use client';

import React, { useMemo, type ReactNode } from 'react';
import { CalendarEvent } from '../types';
import { EventWrapperProps } from 'react-big-calendar';

interface EventWrapperWithStateProps extends EventWrapperProps<CalendarEvent> {
  children?: ReactNode;
  expandedRows: Record<string, boolean>;
  allEvents: CalendarEvent[];
  onExpandChange: (rowKey: string, expanded: boolean) => void;
}

const MAX_VISIBLE_SPRINTS = 2;

const getWeekKey = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
};

const EventWrapper = ({
  event,
  children,
  expandedRows,
  allEvents,
  onExpandChange,
}: EventWrapperWithStateProps) => {
  const weekKey = getWeekKey(event.start);
  const isExpanded = expandedRows[weekKey] || false;

  const weekSprints = useMemo(() => {
    if (event.type !== 'Sprint') {
      return [];
    }

    const weekStart = new Date(weekKey);
    const weekEnd = new Date(weekStart);

    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return allEvents
      .filter((e) => {
        if (e.type !== 'Sprint') return false;

        const eventStart = new Date(e.start);
        const eventEnd = new Date(e.end);

        return eventStart <= weekEnd && eventEnd >= weekStart;
      })
      .sort((a, b) => {
        const startDiff = a.start.getTime() - b.start.getTime();

        if (startDiff !== 0) {
          return startDiff;
        }

        return a.id.toString().localeCompare(b.id.toString());
      });
  }, [allEvents, weekKey, event.type]);

  if (event.type !== 'Sprint') {
    return <>{children}</>;
  }

  const sprintIndex = weekSprints.findIndex((sprint) => sprint.id === event.id);

  const shouldHide = !isExpanded && sprintIndex >= MAX_VISIBLE_SPRINTS;

  if (shouldHide) {
    return null;
  }

  const isLastVisible = sprintIndex === MAX_VISIBLE_SPRINTS - 1;

  const isLastOverall = sprintIndex === weekSprints.length - 1;

  const hasMore = weekSprints.length > MAX_VISIBLE_SPRINTS;

  const showViewMore = isLastVisible && hasMore && !isExpanded;

  const showLess = isExpanded && isLastOverall;

  const isDarkMode =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'visible',
      }}
    >
      {children}

      {(showViewMore || showLess) && (
        <div
          className="rbc-view-more-button-container"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: 0,
            right: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px 0',
            pointerEvents: 'all',
            overflow: 'visible',
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onExpandChange(weekKey, !isExpanded);
            }}
            className="
    rbc-view-more-button
    rounded-full
    border
    border-gray-200
    bg-white
    px-2 py-0.5
    text-[10px]
    font-medium
    leading-4
    text-gray-500
    shadow-sm
    transition-colors
    hover:border-gray-300
    hover:bg-gray-50
    hover:text-gray-700
    dark:border-gray-700
    dark:bg-black
    dark:text-gray-300
    dark:hover:border-gray-600
    dark:hover:bg-gray-950
    dark:hover:text-white
  "
          >
            {showViewMore ? `⋯ ${weekSprints.length - MAX_VISIBLE_SPRINTS} more` : 'Show less'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventWrapper;
