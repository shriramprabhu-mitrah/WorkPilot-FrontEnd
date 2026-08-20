'use client';

import { useState } from 'react';
import CalendarView from './calendarsViews';
import UpcomingEvents from './upcominggEventss';
import TodayCard from './todaysCards';
import EventLegends from './eventsLegendss';
import { Views, View } from 'react-big-calendar';
// import { calendarEvents } from '../data/calendarEvents';
import { expandMultiDayEvents } from '../../../utils/calendar';
import { useAppSelector } from '@/src/store';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import type { SprintDetail } from '@/src/types/project';
import type { CalendarEvent } from '../types';
const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  // const displayEvents = currentView === Views.MONTH ? calendarEvents : expandMultiDayEvents(calendarEvents);
  // const [selectedType, setSelectedType] = useState<'All' | 'Sprint' | 'Meeting' | 'Task'>('All');
  const selectedProject = useAppSelector((state) => state.project.selectedProject);
  const projectId = selectedProject?.id ?? '';
  const { sprints, isLoadingSprints } = useGetSprints(projectId);
  const sprintEvents: CalendarEvent[] = (sprints ?? []).map((sprint: SprintDetail) => ({
    id: sprint.id,
    title: sprint.name,
    start: new Date(sprint.start_date),
    end: new Date(sprint.end_date),
    type: 'Sprint',
  }));
  const allEvents = [...sprintEvents];

  const displayEvents = currentView === Views.MONTH ? allEvents : expandMultiDayEvents(allEvents);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-3 pb-3 pt-0 sm:px-6 sm:pb-6 sm:pt-1">
      <div className="mb-2 sm:mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>

        <p className="mt-0 text-gray-500">Plan, track and manage your project schedule.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
            <CalendarView
              events={displayEvents}
              currentDate={currentDate}
              currentView={currentView}
              onViewChange={setCurrentView}
              onNavigate={setCurrentDate}
              // selectedType={selectedType}
              // onTypeChange={setSelectedType}
              projectId={projectId}
            />

            <EventLegends />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <UpcomingEvents events={allEvents} currentDate={currentDate} />

          <TodayCard events={allEvents} currentDate={currentDate} />
        </div>
      </div>
    </div>
  );
};
export default CalendarPage;
