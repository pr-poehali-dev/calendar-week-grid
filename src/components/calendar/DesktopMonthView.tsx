import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Event, DAYS_SHORT, MONTHS } from './types';

interface DesktopMonthViewProps {
  monthCalendar: {
    dates: { date: Date; isCurrentMonth: boolean }[];
    year: number;
    month: number;
  };
  monthOffset: number;
  setMonthOffset: (offset: number) => void;
  forceDesktopView: boolean;
  setForceDesktopView: (value: boolean) => void;
  handleLogout: () => void;
  exportEventsToFile: () => void;
  getEventsForDate: (date: Date) => Event[];
  isToday: (date: Date) => boolean;
  formatDateKey: (date: Date) => string;
  dragOverDate: string | null;
  dragOverEvent: string | null;
  getDayFillColor: (date: Date) => string | null;
  handleDateSelect: (date: Date) => void;
  handleDragOver: (e: React.DragEvent, date: Date) => void;
  handleDragLeave: () => void;
  handleDrop: (date: Date) => void;
  draggedEvent: Event | null;
  movingEvent: Event | null;
  handleDragStart: (event: Event) => void;
  handleDragEnd: () => void;
  handleEventDragOver: (e: React.DragEvent, event: Event) => void;
  handleEventDrop: (e: React.DragEvent, event: Event) => void;
  handleEventClick: (event: Event, e: React.MouseEvent, currentDate?: string) => void;
  handleViewAllClick: (date: Date, e: React.MouseEvent) => void;
}

const DesktopMonthView = ({
  monthCalendar,
  monthOffset,
  setMonthOffset,
  forceDesktopView,
  setForceDesktopView,
  handleLogout,
  exportEventsToFile,
  getEventsForDate,
  isToday,
  formatDateKey,
  dragOverDate,
  dragOverEvent,
  getDayFillColor,
  handleDateSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  draggedEvent,
  movingEvent,
  handleDragStart,
  handleDragEnd,
  handleEventDragOver,
  handleEventDrop,
  handleEventClick,
  handleViewAllClick
}: DesktopMonthViewProps) => {
  return (
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
          const fillColor = getDayFillColor(item.date);
          
          return (
            <Card
              key={index}
              className={`h-full p-4 cursor-pointer transition-all duration-200 border rounded-lg ${
                isDragOver ? 'border-[#1E3A8A] bg-[#1E3A8A]/10' :
                isTodayDate ? 'border-[#1E3A8A] bg-[#4A4A4A]' :
                item.isCurrentMonth ? 'border-[#3A3A3A]' : 'border-[#2A2A2A] bg-[#333333]'
              }`}
              style={
                fillColor 
                  ? { backgroundColor: `${fillColor}40` } 
                  : (isSunday && item.isCurrentMonth 
                      ? { backgroundColor: '#3F2A2A' } 
                      : { backgroundColor: item.isCurrentMonth ? '#4A4A4A' : '#333333' })
              }
              onClick={() => handleDateSelect(item.date)}
              onDragOver={(e) => handleDragOver(e, item.date)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(item.date)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
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
                        const isGreen = event.color === '#10B981';
                        return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={() => handleDragStart(event)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleEventDragOver(e, event)}
                          onDrop={(e) => handleEventDrop(e, event)}
                          onClick={(e) => handleEventClick(event, e, dateKey)}
                          className={`text-sm p-1.5 rounded border-l-2 cursor-move leading-tight transition-all duration-200 ${
                            isDragging ? 'opacity-50' :
                            isMoving ? 'ring-2 ring-[#1E3A8A] animate-pulse' :
                            isDraggedOver ? 'ring-2 ring-[#0EA5E9] shadow-lg' :
                            isGreen ? 'opacity-50' :
                            'hover:shadow-md'
                          }`}
                          style={{
                            borderLeftColor: event.color,
                            backgroundColor: `${event.color}20`
                          }}
                        >
                          <span className="text-white break-words line-clamp-2 uppercase">{event.text}</span>
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
  );
};

export default DesktopMonthView;