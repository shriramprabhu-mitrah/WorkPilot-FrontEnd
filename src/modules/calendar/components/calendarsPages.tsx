'use client';

import { useState } from 'react';
import CalendarView from './calendarsViews';
import UpcomingEvents from './upcominggEventss';
import TodayCard from './todaysCards';
import EventLegends from './eventsLegendss';
import { Views, View } from 'react-big-calendar';
import { calendarEvents } from '../data/calendarEvents';
import { expandMultiDayEvents } from '../../../utils/calendar';
const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const displayEvents =
    currentView === Views.MONTH ? calendarEvents : expandMultiDayEvents(calendarEvents);

  const [selectedType, setSelectedType] = useState<'All' | 'Sprint' | 'Meeting' | 'Task'>('All');

  const filteredEvents =
    selectedType === 'All'
      ? displayEvents
      : displayEvents.filter((event) => event.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>

        <p className="mt-1 text-gray-500">Plan, track and manage your project schedule.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <CalendarView
              events={filteredEvents}
              currentDate={currentDate}
              currentView={currentView}
              onViewChange={setCurrentView}
              onNavigate={setCurrentDate}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />

            <EventLegends />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <UpcomingEvents events={calendarEvents} currentDate={currentDate} />

          <TodayCard events={calendarEvents} currentDate={currentDate} />
        </div>
      </div>
    </div>
  );
};
export default CalendarPage;
