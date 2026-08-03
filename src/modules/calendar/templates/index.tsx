'use client';

import { useEffect, useState } from 'react';
import CalendarPage from '../components/calendarsPages';
import CalendarSkeleton from '../components/calendarSkeleton';

export default function CalendarTemplate() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return <CalendarPage />;
}
