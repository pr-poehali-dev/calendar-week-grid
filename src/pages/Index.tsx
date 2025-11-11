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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
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
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(formatDateKey(date));
    setEditingEvent(null);
    setIsDialogOpen(true);
    setNewEventText('');
    setSelectedColor(COLORS[0].value);
  };

  const handleViewAllClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewAllDate(date);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEventText(event.text);
    setSelectedColor(event.color);
    setSelectedDate(event.date);
    setIsDialogOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!newEventText.trim() || !selectedDate) return;

    try {
      if (editingEvent) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEvent.id,
            text: newEventText,
            color: selectedColor,
            date: selectedDate
          })
        });
        
        if (response.ok) {
          setEvents(events.map(e => 
            e.id === editingEvent.id 
              ? { ...e, text: newEventText, color: selectedColor, date: selectedDate }
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

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}?id=${eventId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId));
        setIsDialogOpen(false);
        toast.success('Событие удалено');
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
            date: newDate
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
          date: newDate
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

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return events.filter(e => e.date === dateKey);
  };

  const truncateText = (text: string, wordLimit: number = 10) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
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

  return (
    <div className="min-h-screen md:h-screen md:flex md:flex-col bg-[#2A2A2A]">
      <div 
        className="max-w-4xl md:max-w-none md:flex-1 md:flex md:flex-col mx-auto px-0 md:overflow-hidden md:w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* Mobile Week View */}
        <div className="md:hidden">
          <div className="mb-0.5 flex items-center justify-between px-2 py-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="hover:bg-[#3A3A3A] text-white h-8 w-8"
            >
              <Icon name="ChevronLeft" className="w-4 h-4" />
            </Button>
            
            <a 
              href="https://vk.com/fotoklubpro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center flex-1"
            >
              <h1 className="text-xs font-bold text-white hover:text-[#0EA5E9] transition-colors">
                {firstDate.getDate()} {MONTHS[firstDate.getMonth()]} — {lastDate.getDate()} {MONTHS[lastDate.getMonth()]} {lastDate.getFullYear()}
              </h1>
            </a>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="hover:bg-[#3A3A3A] text-white h-8 w-8"
            >
              <Icon name="ChevronRight" className="w-4 h-4" />
            </Button>
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
                            onClick={(e) => handleEventClick(event, e)}
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
        <div className="hidden md:flex md:flex-col md:flex-1 px-6 w-full md:overflow-y-auto">
          <div className="mb-3 flex items-center justify-between flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMonthOffset(monthOffset - 1)}
              className="hover:bg-[#3A3A3A] text-white h-10 w-10"
            >
              <Icon name="ChevronLeft" className="w-5 h-5" />
            </Button>
            
            <a 
              href="https://vk.com/fotoklubpro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 text-center"
            >
              <h1 className="text-3xl font-bold text-white hover:text-[#0EA5E9] transition-colors">
                {MONTHS[monthCalendar.month].charAt(0).toUpperCase() + MONTHS[monthCalendar.month].slice(1, -1) + 'ь'} {monthCalendar.year}
              </h1>
            </a>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMonthOffset(monthOffset + 1)}
              className="hover:bg-[#3A3A3A] text-white h-10 w-10"
            >
              <Icon name="ChevronRight" className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 pb-6" style={{ gridAutoRows: 'minmax(150px, auto)' }}>
            {monthCalendar.dates.map((item, index) => {
              const dayEvents = getEventsForDate(item.date);
              const isTodayDate = isToday(item.date);
              const dateKey = formatDateKey(item.date);
              const isDragOver = dragOverDate === dateKey;
              const dayOfWeek = item.date.getDay();
              const dayName = DAYS_SHORT[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
              
              return (
                <Card
                  key={index}
                  className={`h-full p-4 cursor-pointer transition-all duration-200 border rounded-lg ${
                    isDragOver ? 'border-[#1E3A8A] bg-[#1E3A8A]/10' :
                    isTodayDate ? 'border-[#1E3A8A] bg-[#4A4A4A]' :
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
                            return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => handleEventClick(event, e)}
                              className={`text-sm p-1.5 rounded border-l-2 cursor-move leading-tight ${
                                isDragging ? 'opacity-40' :
                                isMoving ? 'ring-2 ring-[#1E3A8A] animate-pulse' :
                                'opacity-100'
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
                  handleEventClick(event, e as any);
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
                  onClick={() => handleDeleteEvent(editingEvent.id)}
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
    </div>
  );
};

export default Index;