'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../styles/calendar.css';
import { useState } from 'react';
import moment from 'moment';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import type { Formats } from 'react-big-calendar';
import { CalendarEvent } from '../types';
import CustomToolbar from './customsToolbars';
import CustomEvent from './customsEvents';
import CustomDateHeader from './customsDatesHeaders';
import { eventStyleGetter } from './calendarsViewStyle';
import { View } from 'react-big-calendar';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { useResize } from '@/src/hooks/useResize';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  currentView: View;
  onViewChange: (view: View) => void;
  onNavigate: (date: Date) => void;
  // selectedType: 'All' | 'Sprint' | 'Meeting' | 'Task';
  // onTypeChange: (type: 'All' | 'Sprint' | 'Meeting' | 'Task') => void;
  projectId: string;
}

const formats: Formats = {
  weekdayFormat: (date, culture, localizer) => localizer?.format(date, 'ddd', culture) ?? '',

  dayFormat: (date, culture, localizer) => localizer?.format(date, 'ddd DD/MM', culture) ?? '',
};

const CalendarView = ({
  events,
  currentDate,
  currentView,
  onViewChange,
  onNavigate,
  projectId,
  // selectedType,
  // onTypeChange,

}: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { width: screenWidth } = useResize();
  const isMobile = screenWidth > 0 && screenWidth < 640;
  const { push } = useOrgNavigation();
  return (
    <>
      <Calendar<CalendarEvent>
        localizer={localizer}
        events={events}
        date={currentDate}
        onNavigate={onNavigate}
        startAccessor="start"
        endAccessor="end"
        view={currentView}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        onView={onViewChange}
        formats={formats}
        messages={{
          allDay: 'All Day',
        }}
        getNow={() => new Date()}
        scrollToTime={new Date()}
        enableAutoScroll
        popup
        selectable
        onSelectSlot={(slotInfo) => {
          if (selectedDate?.toDateString() === slotInfo.start.toDateString()) {
            setSelectedDate(null);
          } else {
            setSelectedDate(slotInfo.start);
          }
        }}
        onSelectEvent={(event) => {
          if (event.type === 'Sprint') {
            push(
              `/projects/sprints/tasks?sprintId=${event.id}&projectId=${projectId}`
            );
            return;
          }

          setSelectedEvent(event);
        }}
        style={{
          height:
            screenWidth < 640
              ? '420px'
              : screenWidth < 1024
                ? '500px'
                : '540px',
        }}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              currentDate={currentDate}
              onDateChange={onNavigate}
              currentView={currentView}
              onViewChange={onViewChange}
            // selectedType={selectedType}
            // onTypeChange={onTypeChange}
            />
          ),
          event: CustomEvent,
          month: {
            dateHeader: (props) => <CustomDateHeader {...props} selectedDate={selectedDate} />,
          },
        }}
      />

      {selectedEvent && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelectedEvent(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-[calc(100vw-2rem)] sm:w-[420px] rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Event Details</h2>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-2xl text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase text-gray-500">Title</p>

                  <p className="mt-1 font-semibold">{selectedEvent.title}</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">Type</p>

                  <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                    {selectedEvent.type}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">Start</p>

                  <div className="mt-2 rounded-lg border bg-gray-50 p-3">
                    {moment(selectedEvent.start).format('DD MMM YYYY • hh:mm A')}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">End</p>

                  <div className="mt-2 rounded-lg border bg-gray-50 p-3">
                    {moment(selectedEvent.end).format('DD MMM YYYY • hh:mm A')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CalendarView;
