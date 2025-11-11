import { useMemo, useCallback } from 'react';
import { Event } from '@/components/calendar/types';

export const useCalendarUtils = (
  weekOffset: number,
  monthOffset: number,
  quickAddMonthOffset: number,
  events: Event[]
) => {
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + offset * 7);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthCalendar = (offset: number) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let dayOfWeek = firstDayOfMonth.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const dates = [];
    
    for (let i = 0; i < dayOfWeek; i++) {
      const prevDate = new Date(year, month, -dayOfWeek + i + 1);
      dates.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remainingDays = 35 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return { dates, year, month };
  };

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const monthCalendar = useMemo(() => getMonthCalendar(monthOffset), [monthOffset]);
  const firstDate = weekDates[0];
  const lastDate = weekDates[weekDates.length - 1];

  const formatDateKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }, []);

  const getEventsForDate = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    const baseEvents = events.filter(e => e.date === dateKey);
    
    const repeatingEvents = events.filter(e => {
      if (!e.repeat || e.repeat === 'none') return false;
      if (e.date === dateKey) return false;
      
      if (e.excludedDates && e.excludedDates.includes(dateKey)) return false;
      
      if (e.repeatUntil) {
        const untilDate = new Date(e.repeatUntil);
        if (date > untilDate) return false;
      }
      
      const eventDate = new Date(e.date);
      
      if (e.repeat === 'weekly') {
        return eventDate.getDay() === date.getDay() && eventDate < date;
      }
      
      if (e.repeat === 'monthly') {
        return eventDate.getDate() === date.getDate() && 
               (eventDate.getFullYear() < date.getFullYear() || 
                (eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() < date.getMonth()));
      }
      
      return false;
    });
    
    const uniqueEvents = new Map();
    [...baseEvents, ...repeatingEvents].forEach(e => {
      uniqueEvents.set(e.id, e);
    });
    
    return Array.from(uniqueEvents.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [events, formatDateKey]);

  const getDayFillColor = useCallback((date: Date) => {
    const dayEvents = getEventsForDate(date);
    const fillEvent = dayEvents.find(e => e.fillDay);
    return fillEvent?.color || null;
  }, [getEventsForDate]);

  const truncateText = useCallback((text: string, wordLimit: number = 10) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }, []);

  const getQuickAddCalendar = () => {
    return getMonthCalendar(quickAddMonthOffset);
  };

  return {
    weekDates,
    monthCalendar,
    firstDate,
    lastDate,
    formatDateKey,
    isToday,
    getEventsForDate,
    getDayFillColor,
    truncateText,
    getQuickAddCalendar,
  };
};
