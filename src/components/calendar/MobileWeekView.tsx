import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Event, DAYS_SHORT, MONTHS } from './types';
import { memo } from 'react';

interface MobileWeekViewProps {
  weekDates: Date[];
  firstDate: Date;
  lastDate: Date;
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
  forceDesktopView: boolean;
  setForceDesktopView: (value: boolean) => void;
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
  handleOpenNotes: () => void;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenMonthView: () => void;
}

const MobileWeekView = ({
  weekDates,
  firstDate,
  lastDate,
  weekOffset,
  setWeekOffset,
  forceDesktopView,
  setForceDesktopView,
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
  handleQuickAdd,
  handleOpenNotes,
  isSyncing,
  onRefresh,
  onOpenMonthView
}: MobileWeekViewProps) => {
  return (
    <div 
      className={forceDesktopView ? 'hidden' : 'md:hidden'}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-0.5 flex items-center justify-end gap-1 px-2 py-0.5">
        {isSyncing && (
          <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-[#1E3A8A] text-white px-3 py-1 rounded-full text-xs z-50 flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Синхронизация
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            onRefresh();
          }}
          className="hover:bg-[#3A3A3A] text-white h-10 w-10"
          title="Обновить"
          disabled={isSyncing}
        >
          <Icon name="RefreshCw" className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            setWeekOffset(0);
          }}
          className="hover:bg-[#3A3A3A] text-white h-10 w-10"
          title="Сегодня"
        >
          <Icon name="CalendarClock" className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            handleOpenNotes();
          }}
          className="hover:bg-[#3A3A3A] text-white h-10 w-10"
          title="Заметки"
        >
          <Icon name="FileText" className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            exportEventsToFile();
          }}
          className="hover:bg-[#3A3A3A] text-white h-10 w-10"
          title="Экспорт событий"
        >
          <Icon name="Download" className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            onOpenMonthView();
          }}
          className="hover:bg-[#3A3A3A] text-white h-10 w-10"
          title="Весь месяц"
        >
          <Icon name="Calendar" className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
            setForceDesktopView(true);
          }}
          className="hover:bg-[#3A3A3A] text-white h-10 w-10"
          title="ПК версия"
        >
          <Icon name="Monitor" className="w-5 h-5" />
        </Button>
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
              isTodayDate ? 'border-l-4 border-l-[#0EA5E9] bg-[#0EA5E9]/10' : 
              baseColor
            }`}
            style={fillColor ? { backgroundColor: `${fillColor}40` } : {}}
            onClick={() => handleDateSelect(date)}
            onDragOver={(e) => handleDragOver(e, date)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(date)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 text-left min-w-[35px]">
                <div className="text-sm font-semibold text-white">{DAYS_SHORT[index]}</div>
                <div className={`text-lg font-bold ${isTodayDate ? 'bg-[#0EA5E9] text-white rounded-full w-7 h-7 flex items-center justify-center mt-1' : 'text-[#E5E5E5]'}`}>
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
                        className={`px-2 py-1.5 rounded cursor-pointer flex items-start justify-between gap-2 ${
                          isDragging ? 'opacity-40' : 
                          isMoving ? 'ring-2 ring-[#1E3A8A] animate-pulse' : 
                          isGreen ? 'opacity-50' :
                          'opacity-100'
                        }`}
                        style={{ 
                          backgroundColor: `${event.color}15`
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white break-words uppercase leading-tight">
                            {truncateText(event.text, 15)}
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
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(10);
          handleQuickAdd();
        }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg bg-[#1E3A8A] hover:bg-[#0EA5E9] z-50 active:scale-95 transition-transform"
        size="icon"
      >
        <Icon name="Plus" className="w-7 h-7" />
      </Button>
    </div>
  );
};

export default memo(MobileWeekView);