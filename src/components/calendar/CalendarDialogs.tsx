import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Event, COLORS, DAYS_SHORT, MONTHS } from './types';

interface CalendarDialogsProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  editingEvent: Event | null;
  newEventText: string;
  setNewEventText: (value: string) => void;
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  fillDay: boolean;
  setFillDay: (value: boolean) => void;
  selectedRepeat: 'none' | 'weekly' | 'monthly';
  setSelectedRepeat: (value: 'none' | 'weekly' | 'monthly') => void;
  handleCreateEvent: () => void;
  handleDeleteEvent: (eventId: string, targetDate?: string) => void;
  selectedDate: string | null;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (value: boolean) => void;
  eventToDelete: Event | null;
  deleteTargetDate: string | null;
  deleteEvent: (eventId: string, mode: 'all' | 'one' | 'future', targetDate?: string) => void;
  viewAllDate: Date | null;
  setViewAllDate: (value: Date | null) => void;
  getEventsForDate: (date: Date) => Event[];
  formatDateKey: (date: Date) => string;
  handleEventClick: (event: Event, e: React.MouseEvent, currentDate?: string) => void;
  handleDayClick: (date: Date) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (value: boolean) => void;
  quickAddMonthOffset: number;
  setQuickAddMonthOffset: (value: number) => void;
  getQuickAddCalendar: () => { dates: { date: Date; isCurrentMonth: boolean }[]; year: number; month: number };
  handleQuickAddDateSelect: (date: Date) => void;
  isToday: (date: Date) => boolean;
}

const CalendarDialogs = ({
  isDialogOpen,
  setIsDialogOpen,
  editingEvent,
  newEventText,
  setNewEventText,
  selectedColor,
  setSelectedColor,
  fillDay,
  setFillDay,
  selectedRepeat,
  setSelectedRepeat,
  handleCreateEvent,
  handleDeleteEvent,
  selectedDate,
  deleteDialogOpen,
  setDeleteDialogOpen,
  eventToDelete,
  deleteTargetDate,
  deleteEvent,
  viewAllDate,
  setViewAllDate,
  getEventsForDate,
  formatDateKey,
  handleEventClick,
  handleDayClick,
  isQuickAddOpen,
  setIsQuickAddOpen,
  quickAddMonthOffset,
  setQuickAddMonthOffset,
  getQuickAddCalendar,
  handleQuickAddDateSelect,
  isToday
}: CalendarDialogsProps) => {
  return (
    <>
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
                <p className="text-sm text-white break-words uppercase">{event.text}</p>
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
                  handleDayClick(viewAllDate);
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
        <DialogContent className="sm:max-w-md top-[5%] translate-y-0 md:top-[50%] md:translate-y-[-50%] max-h-[90vh] overflow-y-auto p-4">
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
              <span className="flex-1 text-center text-sm md:text-base">{editingEvent ? 'Редактировать' : 'Новое событие'}</span>
              <div className="w-9"></div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
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
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-[#666]">Цвет:</p>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fillDay}
                    onChange={(e) => setFillDay(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300"
                  />
                  <span className="text-xs text-[#666]">Окрасить день</span>
                </label>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-lg transition-all duration-200 ${
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
              <p className="text-xs text-[#666] mb-1.5">Повторять:</p>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant={selectedRepeat === 'none' ? 'default' : 'outline'}
                  onClick={() => setSelectedRepeat('none')}
                  className="flex-1 text-xs px-2 py-1.5 h-auto"
                >
                  Нет
                </Button>
                <Button
                  type="button"
                  variant={selectedRepeat === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setSelectedRepeat('weekly')}
                  className="flex-1 text-xs px-2 py-1.5 h-auto"
                >
                  <Icon name="Calendar" className="w-3 h-3 mr-1" />
                  Неделя
                </Button>
                <Button
                  type="button"
                  variant={selectedRepeat === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setSelectedRepeat('monthly')}
                  className="flex-1 text-xs px-2 py-1.5 h-auto"
                >
                  <Icon name="CalendarDays" className="w-3 h-3 mr-1" />
                  Месяц
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleCreateEvent}
                disabled={!newEventText.trim()}
                className="flex-1 text-sm"
              >
                {editingEvent ? 'Сохранить' : 'Создать'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-sm"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              }}
              variant="ghost"
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="sm:max-w-md bg-[#4A4A4A] border-[#3A3A3A]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuickAddMonthOffset(quickAddMonthOffset - 1)}
                className="hover:bg-[#3A3A3A] text-white h-8 w-8"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
              </Button>
              <span>
                {MONTHS[getQuickAddCalendar().month].charAt(0).toUpperCase() + MONTHS[getQuickAddCalendar().month].slice(1, -1) + 'ь'} {getQuickAddCalendar().year}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuickAddMonthOffset(quickAddMonthOffset + 1)}
                className="hover:bg-[#3A3A3A] text-white h-8 w-8"
              >
                <Icon name="ChevronRight" className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_SHORT.map((day, i) => (
                <div key={i} className="text-center text-xs text-[#999] font-medium py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getQuickAddCalendar().dates.map((item, index) => {
                const isTodayDate = isToday(item.date);
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickAddDateSelect(item.date)}
                    className={`aspect-square p-2 rounded text-sm transition-all ${
                      isTodayDate ? 'bg-[#1E3A8A] text-white font-bold' :
                      item.isCurrentMonth ? 'text-white hover:bg-[#3A3A3A]' : 'text-[#666] hover:bg-[#3A3A3A]'
                    }`}
                  >
                    {item.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarDialogs;