import { useState } from 'react';
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
}

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const COLORS = [
  { value: '#8B5CF6', label: 'Фиолетовый' },
  { value: '#0EA5E9', label: 'Синий' },
  { value: '#F97316', label: 'Оранжевый' },
  { value: '#D946EF', label: 'Розовый' },
  { value: '#10B981', label: 'Зелёный' },
];

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

  const weekDates = getWeekDates(weekOffset);
  const firstDate = weekDates[0];
  const lastDate = weekDates[6];

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

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEventText(event.text);
    setSelectedColor(event.color);
    setSelectedDate(event.date);
    setIsDialogOpen(true);
  };

  const handleCreateEvent = () => {
    if (!newEventText.trim() || !selectedDate) return;

    if (editingEvent) {
      setEvents(events.map(e => 
        e.id === editingEvent.id 
          ? { ...e, text: newEventText, color: selectedColor }
          : e
      ));
      setIsDialogOpen(false);
      toast.success('Событие изменено');
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        text: newEventText,
        color: selectedColor,
        date: selectedDate,
      };

      setEvents([...events, newEvent]);
      setIsDialogOpen(false);
      toast.success('Событие добавлено');
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast.success('Событие удалено');
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

  const handleDrop = (date: Date) => {
    if (!draggedEvent) return;

    const newDate = formatDateKey(date);
    setEvents(events.map(e => 
      e.id === draggedEvent.id ? { ...e, date: newDate } : e
    ));
    setDraggedEvent(null);
    setDragOverDate(null);
    toast.success('Событие перемещено');
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

  return (
    <div className="min-h-screen bg-[#2A2A2A] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="hover:bg-[#3A3A3A] text-white"
          >
            <Icon name="ChevronLeft" className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {firstDate.getDate()} {MONTHS[firstDate.getMonth()]} — {lastDate.getDate()} {MONTHS[lastDate.getMonth()]} {lastDate.getFullYear()}
            </h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="hover:bg-[#3A3A3A] text-white"
          >
            <Icon name="ChevronRight" className="w-6 h-6" />
          </Button>
        </div>

        <div className="space-y-3">
          {weekDates.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isTodayDate = isToday(date);
            const dateKey = formatDateKey(date);
            const isDragOver = dragOverDate === dateKey;
            
            return (
              <Card 
                key={index}
                className={`p-4 min-h-[100px] cursor-pointer transition-all duration-200 border-2 ${
                  isDragOver ? 'border-[#8B5CF6] border-dashed bg-[#8B5CF6]/10 shadow-xl scale-[1.02]' :
                  isTodayDate ? 'border-[#8B5CF6] bg-[#4A4A4A] hover:shadow-lg' : 
                  'border-[#3A3A3A] bg-[#4A4A4A] hover:shadow-lg'
                }`}
                onClick={() => handleDayClick(date)}
                onDragOver={(e) => handleDragOver(e, date)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(date)}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 text-center min-w-[60px] ${isTodayDate ? 'text-[#8B5CF6]' : 'text-[#E5E5E5]'}`}>
                    <div className="text-sm font-medium">{DAYS_SHORT[index]}</div>
                    <div className={`text-2xl font-bold ${isTodayDate ? 'bg-[#8B5CF6] text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mt-1' : ''}`}>
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
                          return (
                          <div
                            key={event.id}
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => handleEventClick(event, e)}
                            className={`p-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 flex items-start justify-between gap-2 ${
                              isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                            }`}
                            style={{ 
                              borderLeftColor: event.color,
                              backgroundColor: `${event.color}15`
                            }}
                          >
                            <p className="text-sm text-[#333] flex-1 break-words">
                              {truncateText(event.text, 10)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="flex-shrink-0 text-[#999] hover:text-red-500 transition-colors"
                            >
                              <Icon name="Trash2" className="w-4 h-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Редактировать событие' : 'Новое событие'}
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