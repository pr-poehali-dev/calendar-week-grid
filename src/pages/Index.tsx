import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Event {
  id: string;
  text: string;
  color: string;
  date: string;
  repeat?: string;
  order?: number;
  userId?: string;
  excludedDates?: string[];
  repeatUntil?: string;
}

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const COLORS = [
  { value: '#1E3A8A', label: 'Тёмно-синий' },
  { value: '#0EA5E9', label: 'Синий' },
  { value: '#F97316', label: 'Оранжевый' },
  { value: '#10B981', label: 'Зелёный' },
  { value: '#EF4444', label: 'Красный' },
];

const API_URL = 'https://functions.poehali.dev/992d8e44-58a4-4f61-badd-a38834435786';

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
    const year = today.getFullYear();
    const month = today.getMonth() + offset;
    
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
            repeat: selectedRepeat
          })
        });
        
        if (response.ok) {
          setEvents(events.map(e => 
            e.id === editingEvent.id 
              ? { ...e, text: newEventText, color: selectedColor, date: selectedDate, repeat: selectedRepeat }
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
          excludedDates: []
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
            userId
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
          userId
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

  const getEventsForDate = (date: Date) => {
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
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#2A2A2A]">
        <Card className="w-full max-w-md p-8 bg-[#4A4A4A] border-[#3A3A3A]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Календарь фотографа</h1>
            <p className="text-[#999]">Войдите через ВКонтакте</p>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Введите ваш VK ID или любое имя"
              value={vkIdInput}
              onChange={(e) => setVkIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVKLogin()}
              className="w-full text-white bg-[#3A3A3A] border-[#555]"
              autoFocus
            />
            <Button 
              onClick={handleVKLogin}
              className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white py-6 text-lg font-semibold"
            >
              Войти
            </Button>
            <p className="text-xs text-[#999] text-center">
              Введите свой VK ID (например, id123456789) или любое уникальное имя.
              Это будет вашим личным календарём.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:flex md:flex-col bg-[#2A2A2A]">
      <div 
        className="max-w-4xl md:max-w-none md:flex-1 md:flex md:flex-col mx-auto px-0 md:overflow-hidden md:w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* Mobile Week View */}
        <div className={forceDesktopView ? 'hidden' : 'md:hidden'}>
          <div className="mb-0.5 flex items-center justify-between px-2 py-0.5">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="hover:bg-[#3A3A3A] text-white h-8 w-8"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-[#3A3A3A] text-white h-8 w-8"
                title="Выйти"
              >
                <Icon name="LogOut" className="w-4 h-4" />
              </Button>
            </div>
            
            <div
              onClick={exportEventsToFile}
              className="text-center flex-1 cursor-pointer"
            >
              <h1 className="text-xs font-bold text-white hover:text-[#0EA5E9] transition-colors">
                {firstDate.getDate()} {MONTHS[firstDate.getMonth()]} — {lastDate.getDate()} {MONTHS[lastDate.getMonth()]} {lastDate.getFullYear()}
              </h1>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setForceDesktopView(true)}
                className="hover:bg-[#3A3A3A] text-white h-8 w-8"
                title="ПК версия"
              >
                <Icon name="Monitor" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="hover:bg-[#3A3A3A] text-white h-8 w-8"
              >
                <Icon name="ChevronRight" className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-0">
          {weekDates.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isTodayDate = isToday(date);
            const dateKey = formatDateKey(date);
            const isDragOver = dragOverDate === dateKey;
            
            const isLighterDay = index === 0 || index === 2 || index === 4;
            const baseColor = isLighterDay ? 'bg-[#525252]' : 'bg-[#4A4A4A]';
            
            return (
              <Card 
                key={index}
                className={`p-2 min-h-[100px] cursor-pointer transition-all duration-200 border-0 border-b border-[#3A3A3A] rounded-none ${
                  isDragOver ? 'border-l-4 border-l-[#1E3A8A] bg-[#1E3A8A]/10' :
                  isTodayDate ? `border-l-4 border-l-[#1E3A8A] ${baseColor}` : 
                  baseColor
                }`}
                onClick={() => handleDateSelect(date)}
                onDragOver={(e) => handleDragOver(e, date)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(date)}
              >
                <div className="flex items-start gap-2">
                  <div className={`flex-shrink-0 text-left min-w-[35px] ${isTodayDate ? 'text-[#1E3A8A]' : 'text-[#E5E5E5]'}`}>
                    <div className="text-xs font-medium">{DAYS_SHORT[index]}</div>
                    <div className={`text-lg font-bold ${isTodayDate ? 'bg-[#1E3A8A] text-white rounded-full w-7 h-7 flex items-center justify-center mt-1' : ''}`}>
                      {date.getDate()}
                    </div>
                  </div>

                  <div className="flex-1 min-h-[60px]">
                    {dayEvents.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-[#999]">
                        <Icon name="Plus" className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayEvents.map((event) => {
                          const isDragging = draggedEvent?.id === event.id;
                          const isMoving = movingEvent?.id === event.id;
                          return (
                          <div
                            key={event.id}
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => handleEventClick(event, e, dateKey)}
                            className={`p-2 rounded-lg cursor-pointer border-l-4 flex items-start justify-between gap-2 ${
                              isDragging ? 'opacity-40' : 
                              isMoving ? 'ring-2 ring-[#1E3A8A] animate-pulse' : 
                              'opacity-100'
                            }`}
                            style={{ 
                              borderLeftColor: event.color,
                              backgroundColor: `${event.color}15`
                            }}
                          >
                            <div className="flex-1">
                              <p className="text-sm text-white break-words">
                                {truncateText(event.text, 10)}
                              </p>
                              {event.repeat !== 'none' && event.repeat && (
                                <p className="text-xs text-white/60 mt-1">
                                  {event.repeat === 'weekly' ? '↻ Каждую неделю' : '↻ Каждый месяц'}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => handleMoveEvent(event, e)}
                              className="flex-shrink-0 text-[#1E3A8A] hover:text-[#0EA5E9] transition-colors"
                              title="Перенести событие"
                            >
                              <Icon name="MoveRight" className="w-4 h-4" />
                            </button>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          </div>
        </div>

        {/* Desktop Month View */}
        <div className={forceDesktopView ? 'flex flex-col flex-1 px-6 w-full overflow-y-auto' : 'hidden md:flex md:flex-col md:flex-1 px-6 w-full md:overflow-y-auto'}>
          <div className="mb-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonthOffset(monthOffset - 1)}
                className="hover:bg-[#3A3A3A] text-white h-10 w-10"
              >
                <Icon name="ChevronLeft" className="w-5 h-5" />
              </Button>
              {forceDesktopView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setForceDesktopView(false)}
                  className="hover:bg-[#3A3A3A] text-white h-10 w-10 md:hidden"
                  title="Мобильная версия"
                >
                  <Icon name="Smartphone" className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-[#3A3A3A] text-red-400 hover:text-red-300 h-10 w-10"
                title="Выйти"
              >
                <Icon name="LogOut" className="w-5 h-5" />
              </Button>
            </div>
            
            <div
              onClick={exportEventsToFile}
              className="flex-1 text-center cursor-pointer"
            >
              <h1 className="text-3xl font-bold text-white hover:text-[#0EA5E9] transition-colors">
                {MONTHS[monthCalendar.month].charAt(0).toUpperCase() + MONTHS[monthCalendar.month].slice(1, -1) + 'ь'} {monthCalendar.year}
              </h1>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMonthOffset(monthOffset + 1)}
              className="hover:bg-[#3A3A3A] text-white h-10 w-10"
            >
              <Icon name="ChevronRight" className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 pb-6" style={{ gridAutoRows: 'minmax(200px, auto)' }}>
            {monthCalendar.dates.map((item, index) => {
              const dayEvents = getEventsForDate(item.date);
              const isTodayDate = isToday(item.date);
              const dateKey = formatDateKey(item.date);
              const isDragOver = dragOverDate === dateKey;
              const dayOfWeekRaw = item.date.getDay();
              const dayOfWeek = dayOfWeekRaw === 0 ? 6 : dayOfWeekRaw - 1;
              const dayName = DAYS_SHORT[dayOfWeek];
              const isSunday = dayOfWeekRaw === 0;
              
              return (
                <Card
                  key={index}
                  className={`h-full p-4 cursor-pointer transition-all duration-200 border rounded-lg ${
                    isDragOver ? 'border-[#1E3A8A] bg-[#1E3A8A]/10' :
                    isTodayDate ? 'border-[#1E3A8A] bg-[#4A4A4A]' :
                    isSunday && item.isCurrentMonth ? 'border-[#3A3A3A] bg-[#4A4A4A] ring-1 ring-red-900/30' :
                    item.isCurrentMonth ? 'border-[#3A3A3A] bg-[#4A4A4A]' : 'border-[#2A2A2A] bg-[#333333]'
                  }`}
                  onClick={() => handleDateSelect(item.date)}
                  onDragOver={(e) => handleDragOver(e, item.date)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(item.date)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-base font-semibold ${
                        isTodayDate ? 'text-white bg-[#1E3A8A] rounded-full w-8 h-8 flex items-center justify-center' :
                        item.isCurrentMonth ? 'text-[#E5E5E5]' : 'text-[#666]'
                      }`}>
                        {item.date.getDate()}
                      </div>
                      <div className={`text-sm font-medium ${
                        isSunday && item.isCurrentMonth ? 'text-red-400' :
                        item.isCurrentMonth ? 'text-[#999]' : 'text-[#555]'
                      }`}>
                        {dayName}
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 4).map((event) => {
                            const isDragging = draggedEvent?.id === event.id;
                            const isMoving = movingEvent?.id === event.id;
                            const isDraggedOver = dragOverEvent === event.id;
                            return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleEventDragOver(e, event)}
                              onDrop={(e) => handleEventDrop(e, event)}
                              onClick={(e) => handleEventClick(event, e, dateKey)}
                              className={`text-sm p-1.5 rounded border-l-2 cursor-move leading-tight transition-all duration-300 ease-in-out ${
                                isDragging ? 'opacity-40 scale-95' :
                                isMoving ? 'ring-2 ring-[#1E3A8A] animate-pulse' :
                                isDraggedOver ? 'ring-2 ring-[#0EA5E9] scale-105 shadow-lg' :
                                'opacity-100 hover:scale-102 hover:shadow-md'
                              }`}
                              style={{
                                borderLeftColor: event.color,
                                backgroundColor: `${event.color}20`
                              }}
                            >
                              <span className="text-white break-words line-clamp-2">{event.text}</span>
                            </div>
                          );
                          })}
                          {dayEvents.length > 4 && (
                            <div 
                              onClick={(e) => handleViewAllClick(item.date, e)}
                              className="text-xs text-[#999] text-center hover:text-[#0EA5E9] cursor-pointer transition-colors"
                            >
                              +{dayEvents.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* View All Events Dialog */}
      <Dialog open={viewAllDate !== null} onOpenChange={() => setViewAllDate(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-[#4A4A4A] border-[#3A3A3A]">
          <DialogHeader>
            <DialogTitle className="text-center text-white">
              События {viewAllDate && `${viewAllDate.getDate()} ${MONTHS[viewAllDate.getMonth()]} ${viewAllDate.getFullYear()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            {viewAllDate && getEventsForDate(viewAllDate).map((event) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event, e as any, formatDateKey(viewAllDate));
                  setViewAllDate(null);
                }}
                className="p-3 rounded-lg cursor-pointer border-l-4 hover:opacity-80 transition-opacity"
                style={{
                  borderLeftColor: event.color,
                  backgroundColor: `${event.color}15`
                }}
              >
                <p className="text-sm text-white break-words">{event.text}</p>
                {event.repeat !== 'none' && event.repeat && (
                  <p className="text-xs text-white/60 mt-1">
                    {event.repeat === 'weekly' ? '↻ Каждую неделю' : '↻ Каждый месяц'}
                  </p>
                )}
              </div>
            ))}
            
            <Button
              onClick={() => {
                if (viewAllDate) {
                  setSelectedDate(formatDateKey(viewAllDate));
                  setEditingEvent(null);
                  setIsDialogOpen(true);
                  setNewEventText('');
                  setSelectedColor(COLORS[0].value);
                  setViewAllDate(null);
                }
              }}
              className="w-full mt-4 bg-[#1E3A8A] hover:bg-[#0EA5E9]"
            >
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Добавить событие
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {editingEvent && (
                <button
                  onClick={() => handleDeleteEvent(editingEvent.id, selectedDate || undefined)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-400/10 rounded"
                  title="Удалить событие"
                >
                  <Icon name="Trash2" className="w-5 h-5" />
                </button>
              )}
              <span className="flex-1 text-center">{editingEvent ? 'Редактировать событие' : 'Новое событие'}</span>
              <div className="w-9"></div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Input
                placeholder="Введите текст события..."
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateEvent()}
                className="w-full"
                autoFocus
              />
            </div>

            <div>
              <p className="text-sm text-[#666] mb-2">Выберите цвет:</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                      selectedColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-[#222] scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-[#666] mb-2">Повторять событие:</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedRepeat === 'none' ? 'default' : 'outline'}
                  onClick={() => setSelectedRepeat('none')}
                  className="flex-1"
                >
                  Не повторять
                </Button>
                <Button
                  type="button"
                  variant={selectedRepeat === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setSelectedRepeat('weekly')}
                  className="flex-1"
                >
                  <Icon name="Calendar" className="w-4 h-4 mr-1" />
                  Еженедельно
                </Button>
                <Button
                  type="button"
                  variant={selectedRepeat === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setSelectedRepeat('monthly')}
                  className="flex-1"
                >
                  <Icon name="CalendarDays" className="w-4 h-4 mr-1" />
                  Ежемесячно
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateEvent}
                disabled={!newEventText.trim()}
                className="flex-1"
              >
                {editingEvent ? 'Сохранить' : 'Создать'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Repeating Event Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#4A4A4A] border-[#3A3A3A]">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              Удалить повторяющееся событие?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <p className="text-sm text-[#999] text-center mb-4">
              Это событие повторяется. Что вы хотите сделать?
            </p>
            <Button
              onClick={() => eventToDelete && deleteEvent(eventToDelete.id, 'one', deleteTargetDate || undefined)}
              variant="outline"
              className="w-full"
            >
              <Icon name="X" className="w-4 h-4 mr-2" />
              Удалить только это
            </Button>
            <Button
              onClick={() => eventToDelete && deleteEvent(eventToDelete.id, 'future', deleteTargetDate || undefined)}
              variant="outline"
              className="w-full"
            >
              <Icon name="CalendarX" className="w-4 h-4 mr-2" />
              Удалить это и будущие
            </Button>
            <Button
              onClick={() => eventToDelete && deleteEvent(eventToDelete.id, 'all', deleteTargetDate || undefined)}
              variant="destructive"
              className="w-full"
            >
              <Icon name="Trash2" className="w-4 h-4 mr-2" />
              Удалить все повторения
            </Button>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
              variant="ghost"
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;