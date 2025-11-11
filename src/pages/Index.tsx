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
  dayIndex: number;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setIsDialogOpen(true);
    setNewEventText('');
    setSelectedColor(COLORS[0].value);
  };

  const handleCreateEvent = () => {
    if (!newEventText.trim() || selectedDay === null) return;

    const newEvent: Event = {
      id: Date.now().toString(),
      text: newEventText,
      color: selectedColor,
      dayIndex: selectedDay,
    };

    setEvents([...events, newEvent]);
    setIsDialogOpen(false);
    toast.success('Событие добавлено');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast.success('Событие удалено');
  };

  const handleDragStart = (event: Event) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dayIndex: number) => {
    if (!draggedEvent) return;

    setEvents(events.map(e => 
      e.id === draggedEvent.id ? { ...e, dayIndex } : e
    ));
    setDraggedEvent(null);
    toast.success('Событие перемещено');
  };

  const getEventsForDay = (dayIndex: number) => {
    return events.filter(e => e.dayIndex === dayIndex);
  };

  const truncateText = (text: string, wordLimit: number = 10) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#222] mb-2">
            Недельный календарь
          </h1>
          <p className="text-[#888] text-sm">
            Нажмите на день для добавления события
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 md:gap-4">
          {DAYS.map((day, dayIndex) => (
            <div key={dayIndex} className="flex flex-col space-y-3">
              <Card 
                className="p-4 md:p-6 min-h-[120px] cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white border-2 border-[#E5E5E5]"
                onClick={() => handleDayClick(dayIndex)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(dayIndex)}
              >
                <div className="text-center mb-4">
                  <div className="text-lg md:text-xl font-semibold text-[#222]">
                    {day}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Icon name="Plus" className="text-[#999] w-6 h-6" />
                </div>
              </Card>

              <div className="space-y-2">
                {getEventsForDay(dayIndex).map((event) => (
                  <Card
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(event)}
                    className="p-3 cursor-move hover:shadow-md transition-all duration-200 border-l-4"
                    style={{ 
                      borderLeftColor: event.color,
                      backgroundColor: `${event.color}15`
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
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
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Новое событие — {selectedDay !== null ? DAYS[selectedDay] : ''}
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
                Создать
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
