import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AuthScreen from '@/components/calendar/AuthScreen';
import MobileWeekView from '@/components/calendar/MobileWeekView';
import DesktopMonthView from '@/components/calendar/DesktopMonthView';
import CalendarDialogs from '@/components/calendar/CalendarDialogs';
import { Event, COLORS, MONTHS, DAYS_SHORT, API_URL } from '@/components/calendar/types';

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [movingEvent, setMovingEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewAllDate, setViewAllDate] = useState<Date | null>(null);
  const [dragOverEvent, setDragOverEvent] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('calendar_user_id'));
  const [isAuthOpen, setIsAuthOpen] = useState(!localStorage.getItem('calendar_user_id'));
  const [vkIdInput, setVkIdInput] = useState('');
  const [selectedRepeat, setSelectedRepeat] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteTargetDate, setDeleteTargetDate] = useState<string | null>(null);
  const [forceDesktopView, setForceDesktopView] = useState(false);
  const [fillDay, setFillDay] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddMonthOffset, setQuickAddMonthOffset] = useState(0);

  useEffect(() => {
    if (userId) {
      loadEvents();
    }
  }, [userId]);

  const loadEvents = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_URL}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.filter((e: Event) => e.userId === userId));
      }
    } catch (error) {
      toast.error('Ошибка загрузки событий');
    } finally {
      setIsLoading(false);
    }
  };

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

  const weekDates = getWeekDates(weekOffset);
  const monthCalendar = getMonthCalendar(monthOffset);
  const firstDate = weekDates[0];
  const lastDate = weekDates[weekDates.length - 1];

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(formatDateKey(date));
    setEditingEvent(null);
    setIsDialogOpen(true);
    setNewEventText('');
    setSelectedColor(COLORS[0].value);
    setSelectedRepeat('none');
    setFillDay(false);
  };

  const handleQuickAdd = () => {
    setQuickAddMonthOffset(0);
    setIsQuickAddOpen(true);
  };

  const handleQuickAddDateSelect = (date: Date) => {
    setIsQuickAddOpen(false);
    handleDayClick(date);
  };

  const getQuickAddCalendar = () => {
    return getMonthCalendar(quickAddMonthOffset);
  };

  const handleViewAllClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewAllDate(date);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent, currentDate?: string) => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEventText(event.text);
    setSelectedColor(event.color);
    setSelectedDate(currentDate || event.date);
    setSelectedRepeat((event.repeat as 'none' | 'weekly' | 'monthly') || 'none');
    setFillDay(event.fillDay || false);
    setIsDialogOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!newEventText.trim() || !selectedDate || !userId) return;

    try {
      if (editingEvent) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEvent.id,
            text: newEventText,
            color: selectedColor,
            date: selectedDate,
            userId,
            repeat: selectedRepeat,
            fillDay
          })
        });
        
        if (response.ok) {
          setEvents(events.map(e => 
            e.id === editingEvent.id 
              ? { ...e, text: newEventText, color: selectedColor, date: selectedDate, repeat: selectedRepeat, fillDay }
              : e
          ));
          setIsDialogOpen(false);
          toast.success('Событие изменено');
        }
      } else {
        const newEvent: Event = {
          id: Date.now().toString(),
          text: newEventText,
          color: selectedColor,
          date: selectedDate,
          userId,
          repeat: selectedRepeat,
          excludedDates: [],
          fillDay
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
        
        if (response.ok) {
          setEvents([...events, newEvent]);
          setIsDialogOpen(false);
          toast.success('Событие добавлено');
        }
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDeleteEvent = async (eventId: string, targetDate?: string) => {
    const event = events.find(e => e.id === eventId);
    
    if (event && event.repeat && event.repeat !== 'none') {
      setEventToDelete(event);
      setDeleteTargetDate(targetDate || event.date);
      setDeleteDialogOpen(true);
      return;
    }
    
    await deleteEvent(eventId, 'all', targetDate);
  };

  const deleteEvent = async (eventId: string, mode: 'all' | 'one' | 'future', targetDate?: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (mode === 'all') {
        const response = await fetch(`${API_URL}?id=${eventId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setEvents(events.filter(e => e.id !== eventId));
          setIsDialogOpen(false);
          setDeleteDialogOpen(false);
          toast.success('Все повторения удалены');
        }
      } else if (mode === 'one' && targetDate) {
        const excludedDates = event.excludedDates || [];
        if (!excludedDates.includes(targetDate)) {
          excludedDates.push(targetDate);
        }
        
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            excludedDates
          })
        });
        
        if (response.ok) {
          setEvents(events.map(e => 
            e.id === eventId ? { ...e, excludedDates } : e
          ));
          setIsDialogOpen(false);
          setDeleteDialogOpen(false);
          toast.success('Это повторение удалено');
        }
      } else if (mode === 'future' && targetDate) {
        const targetDateObj = new Date(targetDate);
        targetDateObj.setDate(targetDateObj.getDate() - 1);
        const repeatUntil = formatDateKey(targetDateObj);
        
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            repeatUntil
          })
        });
        
        if (response.ok) {
          setEvents(events.map(e => 
            e.id === eventId ? { ...e, repeatUntil } : e
          ));
          setIsDialogOpen(false);
          setDeleteDialogOpen(false);
          toast.success('Будущие повторения удалены');
        }
      }
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleMoveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setMovingEvent(event);
    toast.info('Выберите новую дату для события', {
      action: {
        label: 'Отмена',
        onClick: () => setMovingEvent(null)
      }
    });
  };

  const handleDateSelect = async (date: Date) => {
    if (movingEvent) {
      const newDate = formatDateKey(date);
      try {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: movingEvent.id,
            text: movingEvent.text,
            color: movingEvent.color,
            date: newDate,
            userId,
            fillDay: movingEvent.fillDay
          })
        });
        
        if (response.ok) {
          setEvents(events.map(e => 
            e.id === movingEvent.id ? { ...e, date: newDate } : e
          ));
          setMovingEvent(null);
          toast.success('Событие перенесено');
        }
      } catch (error) {
        toast.error('Ошибка переноса');
      }
    } else {
      handleDayClick(date);
    }
  };

  const handleDragStart = (event: Event) => {
    setDraggedEvent(event);
  };

  const handleDragEnd = () => {
    setDragOverDate(null);
    setDragOverEvent(null);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(formatDateKey(date));
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (date: Date) => {
    if (!draggedEvent) return;

    const newDate = formatDateKey(date);
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggedEvent.id,
          text: draggedEvent.text,
          color: draggedEvent.color,
          date: newDate,
          userId,
          fillDay: draggedEvent.fillDay
        })
      });
      
      if (response.ok) {
        setEvents(events.map(e => 
          e.id === draggedEvent.id ? { ...e, date: newDate } : e
        ));
        setDraggedEvent(null);
        setDragOverDate(null);
        toast.success('Событие перемещено');
      }
    } catch (error) {
      toast.error('Ошибка перемещения');
    }
  };

  const handleEventDragOver = (e: React.DragEvent, targetEvent: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedEvent && draggedEvent.id !== targetEvent.id) {
      setDragOverEvent(targetEvent.id);
    }
  };

  const handleEventDrop = async (e: React.DragEvent, targetEvent: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedEvent || draggedEvent.id === targetEvent.id || draggedEvent.date !== targetEvent.date) {
      setDragOverEvent(null);
      return;
    }

    const sameDate = draggedEvent.date === targetEvent.date;
    if (sameDate) {
      const dayEvents = events.filter(e => e.date === targetEvent.date).sort((a, b) => (a.order || 0) - (b.order || 0));
      const draggedIndex = dayEvents.findIndex(e => e.id === draggedEvent.id);
      const targetIndex = dayEvents.findIndex(e => e.id === targetEvent.id);
      
      const reorderedEvents = [...dayEvents];
      const [removed] = reorderedEvents.splice(draggedIndex, 1);
      reorderedEvents.splice(targetIndex, 0, removed);
      
      const updatedEvents = reorderedEvents.map((event, index) => ({
        ...event,
        order: index
      }));
      
      try {
        await Promise.all(updatedEvents.map(event => 
          fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
          })
        ));
        
        const otherEvents = events.filter(e => e.date !== targetEvent.date);
        setEvents([...otherEvents, ...updatedEvents]);
        toast.success('Порядок изменён');
      } catch (error) {
        toast.error('Ошибка изменения порядка');
      }
    }
    
    setDraggedEvent(null);
    setDragOverEvent(null);
  };

  const eventsByDate = useMemo(() => {
    const cache = new Map<string, Event[]>();
    
    const getEventsForDateKey = (dateKey: string, date: Date) => {
      if (cache.has(dateKey)) return cache.get(dateKey)!;
      
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
      
      const result = Array.from(uniqueEvents.values())
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      cache.set(dateKey, result);
      return result;
    };
    
    return getEventsForDateKey;
  }, [events]);

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return eventsByDate(dateKey, date);
  };

  const getDayFillColor = useMemo(() => {
    const cache = new Map<string, string | null>();
    return (date: Date) => {
      const dateKey = formatDateKey(date);
      if (cache.has(dateKey)) return cache.get(dateKey)!;
      
      const dayEvents = getEventsForDate(date);
      const fillEvent = dayEvents.find(e => e.fillDay);
      const result = fillEvent?.color || null;
      
      cache.set(dateKey, result);
      return result;
    };
  }, [events]);

  const truncateText = (text: string, wordLimit: number = 10) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const exportEventsToFile = () => {
    if (events.length === 0) {
      toast.error('Нет событий для экспорта');
      return;
    }

    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    let content = 'КАЛЕНДАРЬ ФОТОГРАФА\n';
    content += '='.repeat(50) + '\n\n';

    const groupedByDate: { [key: string]: Event[] } = {};
    sortedEvents.forEach(event => {
      if (!groupedByDate[event.date]) {
        groupedByDate[event.date] = [];
      }
      groupedByDate[event.date].push(event);
    });

    Object.keys(groupedByDate).sort().forEach(dateKey => {
      const date = new Date(dateKey);
      const dayOfWeek = DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1];
      content += `${dayOfWeek}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}\n`;
      content += '-'.repeat(50) + '\n';
      
      const dayEvents = groupedByDate[dateKey].sort((a, b) => (a.order || 0) - (b.order || 0));
      dayEvents.forEach((event, index) => {
        content += `${index + 1}. ${event.text}\n`;
        if (event.repeat && event.repeat !== 'none') {
          const repeatLabel = event.repeat === 'weekly' ? 'Каждую неделю' : 'Каждый месяц';
          content += `   (↻ ${repeatLabel})\n`;
        }
      });
      content += '\n';
    });

    content += '\n' + '='.repeat(50) + '\n';
    content += `Всего событий: ${events.length}\n`;
    content += `Дней с событиями: ${Object.keys(groupedByDate).length}\n`;
    content += `Дата экспорта: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `календарь_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Календарь сохранён');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      setWeekOffset(weekOffset + 1);
    }
    if (isRightSwipe) {
      setWeekOffset(weekOffset - 1);
    }
  };

  const handleVKLogin = () => {
    if (!vkIdInput.trim()) {
      toast.error('Введите ваш VK ID');
      return;
    }
    
    const cleanId = vkIdInput.trim();
    localStorage.setItem('calendar_user_id', cleanId);
    setUserId(cleanId);
    setIsAuthOpen(false);
    toast.success('Вы вошли в календарь');
  };

  const handleLogout = () => {
    localStorage.removeItem('calendar_user_id');
    localStorage.removeItem('vk_access_token');
    setUserId(null);
    setIsAuthOpen(true);
    setEvents([]);
    toast.success('Вы вышли из системы');
  };

  if (!userId) {
    return (
      <AuthScreen 
        vkIdInput={vkIdInput}
        setVkIdInput={setVkIdInput}
        onLogin={handleVKLogin}
      />
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:flex md:flex-col bg-[#2A2A2A]">
      <div className="max-w-4xl md:max-w-none md:flex-1 md:flex md:flex-col mx-auto px-0 md:overflow-hidden md:w-full">
        <MobileWeekView
          weekDates={weekDates}
          firstDate={firstDate}
          lastDate={lastDate}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          forceDesktopView={forceDesktopView}
          setForceDesktopView={setForceDesktopView}
          handleLogout={handleLogout}
          exportEventsToFile={exportEventsToFile}
          getEventsForDate={getEventsForDate}
          isToday={isToday}
          formatDateKey={formatDateKey}
          dragOverDate={dragOverDate}
          getDayFillColor={getDayFillColor}
          handleDateSelect={handleDateSelect}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          draggedEvent={draggedEvent}
          movingEvent={movingEvent}
          truncateText={truncateText}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleEventClick={handleEventClick}
          handleMoveEvent={handleMoveEvent}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          handleQuickAdd={handleQuickAdd}
        />

        <DesktopMonthView
          monthCalendar={monthCalendar}
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          forceDesktopView={forceDesktopView}
          setForceDesktopView={setForceDesktopView}
          handleLogout={handleLogout}
          exportEventsToFile={exportEventsToFile}
          getEventsForDate={getEventsForDate}
          isToday={isToday}
          formatDateKey={formatDateKey}
          dragOverDate={dragOverDate}
          dragOverEvent={dragOverEvent}
          getDayFillColor={getDayFillColor}
          handleDateSelect={handleDateSelect}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          draggedEvent={draggedEvent}
          movingEvent={movingEvent}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleEventDragOver={handleEventDragOver}
          handleEventDrop={handleEventDrop}
          handleEventClick={handleEventClick}
          handleViewAllClick={handleViewAllClick}
        />
      </div>

      <CalendarDialogs
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingEvent={editingEvent}
        newEventText={newEventText}
        setNewEventText={setNewEventText}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        fillDay={fillDay}
        setFillDay={setFillDay}
        selectedRepeat={selectedRepeat}
        setSelectedRepeat={setSelectedRepeat}
        handleCreateEvent={handleCreateEvent}
        handleDeleteEvent={handleDeleteEvent}
        selectedDate={selectedDate}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        eventToDelete={eventToDelete}
        deleteTargetDate={deleteTargetDate}
        deleteEvent={deleteEvent}
        viewAllDate={viewAllDate}
        setViewAllDate={setViewAllDate}
        getEventsForDate={getEventsForDate}
        formatDateKey={formatDateKey}
        handleEventClick={handleEventClick}
        handleDayClick={handleDayClick}
        isQuickAddOpen={isQuickAddOpen}
        setIsQuickAddOpen={setIsQuickAddOpen}
        quickAddMonthOffset={quickAddMonthOffset}
        setQuickAddMonthOffset={setQuickAddMonthOffset}
        getQuickAddCalendar={getQuickAddCalendar}
        handleQuickAddDateSelect={handleQuickAddDateSelect}
        isToday={isToday}
      />
    </div>
  );
};

export default Index;