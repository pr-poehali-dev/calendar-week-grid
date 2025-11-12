import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Event, DAYS_SHORT, DAYS_FULL, MONTHS } from './types';

interface MobileWeekViewProps {
  weekDates: Date[];
  firstDate: Date;
  lastDate: Date;
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
  forceDesktopView: boolean;
  setForceDesktopView: (value: boolean) => void;
  handleLogout: () => void;
  exportEventsToFile: () => void;
  getEventsForDate: (date: Date) => Event[];
  isToday: (date: Date) => boolean;
  formatDateKey: (date: Date) => string;
  dragOverDate: string | null;
  getDayFillColor: (date: Date) => string | null;
  handleDateSelect: (date: Date) => void;
  handleDragOver: (e: React.DragEvent, date: Date) => void;
  handleDragLeave: () => void;
  handleDrop: (date: Date) => void;
  draggedEvent: Event | null;
  movingEvent: Event | null;
  truncateText: (text: string, wordLimit?: number) => string;
  handleDragStart: (event: Event) => void;
  handleDragEnd: () => void;
  handleEventClick: (event: Event, e: React.MouseEvent, currentDate?: string) => void;
  handleMoveEvent: (event: Event, e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleQuickAdd: () => void;
}

const MobileWeekView = ({
  weekDates,
  firstDate,
  lastDate,
  weekOffset,
  setWeekOffset,
  forceDesktopView,
  setForceDesktopView,
  handleLogout,
  exportEventsToFile,
  getEventsForDate,
  isToday,
  formatDateKey,
  dragOverDate,
  getDayFillColor,
  handleDateSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  draggedEvent,
  movingEvent,
  truncateText,
  handleDragStart,
  handleDragEnd,
  handleEventClick,
  handleMoveEvent,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleQuickAdd
}: MobileWeekViewProps) => {
  return (
    <div 
      className={forceDesktopView ? 'hidden' : 'md:hidden'}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
            {(() => {
              const today = new Date();
              const dayOfWeek = DAYS_FULL[today.getDay() === 0 ? 6 : today.getDay() - 1];
              return `${today.getDate()} ${MONTHS[today.getMonth()]}, ${dayOfWeek}`;
            })()}
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
        const fillColor = getDayFillColor(date);
        
        const isLighterDay = index === 0 || index === 2 || index === 4;
        const baseColor = isLighterDay ? 'bg-[#5A5A5A]' : 'bg-[#4A4A4A]';
        
        return (
          <Card 
            key={index}
            className={`p-2 min-h-[100px] cursor-pointer transition-all duration-200 border-0 border-b border-[#3A3A3A] rounded-none ${
              isDragOver ? 'border-l-4 border-l-[#1E3A8A] bg-[#1E3A8A]/10' :
              isTodayDate ? `border-l-4 border-l-[#1E3A8A] ${baseColor}` : 
              baseColor
            }`}
            style={fillColor ? { backgroundColor: `${fillColor}40` } : {}}
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
                      const isGreen = event.color === '#10B981';
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
                          isGreen ? 'opacity-50' :
                          'opacity-100'
                        }`}
                        style={{ 
                          borderLeftColor: event.color,
                          backgroundColor: `${event.color}15`
                        }}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-white break-words uppercase">
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

      <Button
        onClick={handleQuickAdd}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-[#1E3A8A] hover:bg-[#0EA5E9] z-50"
        size="icon"
      >
        <Icon name="Plus" className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default MobileWeekView;