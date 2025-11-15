import { useEffect } from 'react';
import { toast } from 'sonner';
import { Event, COLORS, MONTHS, DAYS_SHORT, API_URL } from '@/components/calendar/types';
import { safeLocalStorage } from '@/utils/localStorage';
import { Note } from '@/types/notes';

export const useCalendarHandlers = (
  state: any,
  formatDateKey: (date: Date) => string,
  getEventsForDate: (date: Date) => Event[]
) => {
  const {
    events,
    setEvents,
    userId,
    setUserId,
    isLoading,
    setIsLoading,
    isSyncing,
    setIsSyncing,
    editingEvent,
    setEditingEvent,
    newEventText,
    setNewEventText,
    selectedColor,
    setSelectedColor,
    selectedDate,
    setSelectedDate,
    selectedRepeat,
    setSelectedRepeat,
    fillDay,
    setFillDay,
    isDialogOpen,
    setIsDialogOpen,
    draggedEvent,
    setDraggedEvent,
    dragOverDate,
    setDragOverDate,
    dragOverEvent,
    setDragOverEvent,
    movingEvent,
    setMovingEvent,
    weekOffset,
    setWeekOffset,
    touchStart,
    setTouchStart,
    touchEnd,
    setTouchEnd,
    eventToDelete,
    setEventToDelete,
    deleteTargetDate,
    setDeleteTargetDate,
    deleteDialogOpen,
    setDeleteDialogOpen,
    quickAddMonthOffset,
    setQuickAddMonthOffset,
    isQuickAddOpen,
    setIsQuickAddOpen,
    viewAllDate,
    setViewAllDate,
  } = state;

  useEffect(() => {
    if (!userId) return;

    const cachedEvents = localStorage.getItem(`calendar_events_${userId}`);
    if (cachedEvents) {
      try {
        const allEvents = JSON.parse(cachedEvents);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        
        const currentMonthEvents = allEvents.filter((e: Event) => {
          const eventDate = new Date(e.date);
          return eventDate >= monthStart && eventDate <= monthEnd;
        });
        
        setEvents(currentMonthEvents);
        setIsLoading(false);
        
        setTimeout(() => {
          setEvents(allEvents);
        }, 300);
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }

    const syncData = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch(`${API_URL}?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const userEvents = data.filter((e: Event) => e.userId === userId);
          setEvents(userEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(userEvents));
        }
      } catch (error) {
        const cached = localStorage.getItem(`calendar_events_${userId}`);
        if (cached) {
          toast.info('Работаем офлайн');
        } else {
          toast.error('Ошибка загрузки событий');
        }
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    };

    syncData();
  }, [userId]);

  const loadEvents = async () => {
    if (!userId) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_URL}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const userEvents = data.filter((e: Event) => e.userId === userId);
        setEvents(userEvents);
        localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(userEvents));
      }
    } catch (error) {
      const cachedEvents = localStorage.getItem(`calendar_events_${userId}`);
      if (cachedEvents) {
        toast.info('Работаем офлайн');
      } else {
        toast.error('Ошибка загрузки событий');
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
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
          const updatedEvents = events.map((e: Event) => 
            e.id === editingEvent.id 
              ? { ...e, text: newEventText, color: selectedColor, date: selectedDate, repeat: selectedRepeat, fillDay }
              : e
          );
          setEvents(updatedEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
          setIsDialogOpen(false);
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
          const updatedEvents = [...events, newEvent];
          setEvents(updatedEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDeleteEvent = async (eventId: string, targetDate?: string) => {
    const event = events.find((e: Event) => e.id === eventId);
    
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
      const event = events.find((e: Event) => e.id === eventId);
      if (!event) return;

      if (mode === 'all') {
        const response = await fetch(`${API_URL}?id=${eventId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const updatedEvents = events.filter((e: Event) => e.id !== eventId);
          setEvents(updatedEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
          setIsDialogOpen(false);
          setDeleteDialogOpen(false);
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
          const updatedEvents = events.map((e: Event) => 
            e.id === eventId ? { ...e, excludedDates } : e
          );
          setEvents(updatedEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
          setIsDialogOpen(false);
          setDeleteDialogOpen(false);
        }
      } else if (mode === 'future' && targetDate) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            repeatUntil: targetDate
          })
        });
        
        if (response.ok) {
          const updatedEvents = events.map((e: Event) => 
            e.id === eventId ? { ...e, repeatUntil: targetDate } : e
          );
          setEvents(updatedEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
          setIsDialogOpen(false);
          setDeleteDialogOpen(false);
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
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    
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
          const updatedEvents = events.map((e: Event) => 
            e.id === movingEvent.id ? { ...e, date: newDate } : e
          );
          setEvents(updatedEvents);
          localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
          setMovingEvent(null);
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
        const updatedEvents = events.map((e: Event) => 
          e.id === draggedEvent.id ? { ...e, date: newDate } : e
        );
        setEvents(updatedEvents);
        localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(updatedEvents));
        setDraggedEvent(null);
        setDragOverDate(null);
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
      const dayEvents = events.filter((e: Event) => e.date === targetEvent.date).sort((a: Event, b: Event) => (a.order || 0) - (b.order || 0));
      const draggedIndex = dayEvents.findIndex((e: Event) => e.id === draggedEvent.id);
      const targetIndex = dayEvents.findIndex((e: Event) => e.id === targetEvent.id);
      
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
        
        const otherEvents = events.filter((e: Event) => e.date !== targetEvent.date);
        const finalEvents = [...otherEvents, ...updatedEvents];
        setEvents(finalEvents);
        localStorage.setItem(`calendar_events_${userId}`, JSON.stringify(finalEvents));
      } catch (error) {
        toast.error('Ошибка изменения порядка');
      }
    }
    
    setDraggedEvent(null);
    setDragOverEvent(null);
  };

  const exportEventsToFile = () => {
    const notes = safeLocalStorage.getJSON<Note[]>('calendar_notes_list', []);
    
    if (events.length === 0 && notes.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    let content = 'КАЛЕНДАРЬ ФОТОГРАФА\n';
    content += '='.repeat(50) + '\n\n';

    if (sortedEvents.length > 0) {
      content += '📅 СОБЫТИЯ\n';
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
        });
        content += '\n';
      });

      content += '='.repeat(50) + '\n';
      content += `Всего событий: ${events.length}\n`;
      content += `Дней с событиями: ${Object.keys(groupedByDate).length}\n\n`;
    }

    if (notes.length > 0) {
      content += '\n📝 ЗАМЕТКИ\n';
      content += '='.repeat(50) + '\n\n';
      
      notes.forEach((note, index) => {
        content += `${index + 1}. ${note.title}\n`;
        content += '-'.repeat(50) + '\n';
        if (note.content) {
          content += note.content + '\n';
        } else {
          content += '(пусто)\n';
        }
        content += '\n';
      });

      content += '='.repeat(50) + '\n';
      content += `Всего заметок: ${notes.length}\n\n`;
    }

    content += '\n' + '='.repeat(50) + '\n';
    content += `Дата экспорта: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `календарь_и_заметки_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const exportedItems = [];
    if (events.length > 0) exportedItems.push(`${events.length} событий`);
    if (notes.length > 0) exportedItems.push(`${notes.length} заметок`);
    
    toast.success(`Сохранено: ${exportedItems.join(' и ')}`);
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
    
    if (isLeftSwipe || isRightSwipe) {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
    
    if (isLeftSwipe) {
      setWeekOffset(weekOffset + 1);
    }
    if (isRightSwipe) {
      setWeekOffset(weekOffset - 1);
    }
  };



  return {
    handleDayClick,
    handleQuickAdd,
    handleQuickAddDateSelect,
    handleViewAllClick,
    handleEventClick,
    handleCreateEvent,
    handleDeleteEvent,
    deleteEvent,
    handleMoveEvent,
    handleDateSelect,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleEventDragOver,
    handleEventDrop,
    exportEventsToFile,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};