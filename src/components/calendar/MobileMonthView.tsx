import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Event, DAYS_SHORT, MONTHS } from './types';
import { memo, useState } from 'react';

interface MobileMonthViewProps {
  monthCalendar: {
    dates: { date: Date; isCurrentMonth: boolean }[];
    year: number;
    month: number;
  };
  monthOffset: number;
  setMonthOffset: (offset: number) => void;
  onClose: () => void;
  getEventsForDate: (date: Date) => Event[];
  isToday: (date: Date) => boolean;
  formatDateKey: (date: Date) => string;
  handleDateSelect: (date: Date) => void;
  handleEventClick?: (event: Event, e: React.MouseEvent, currentDate?: string) => void;
  truncateText: (text: string, wordLimit?: number) => string;
  handleOpenNotes: () => void;
  isSyncing: boolean;
  onRefresh: () => void;
}

const MobileMonthView = ({
  monthCalendar,
  monthOffset,
  setMonthOffset,
  onClose,
  getEventsForDate,
  isToday,
  formatDateKey,
  handleDateSelect,
  handleEventClick,
  truncateText,
  handleOpenNotes,
  isSyncing,
  onRefresh,
}: MobileMonthViewProps) => {
  const [expandedCell, setExpandedCell] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setMonthOffset(monthOffset + 1);
    }
    if (isRightSwipe) {
      setMonthOffset(monthOffset - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#2A2A2A] z-50 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between p-3 border-b border-[#3A3A3A]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-[#3A3A3A] text-white"
            title="Недельный вид"
          >
            <Icon name="CalendarDays" className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="hover:bg-[#3A3A3A] text-white"
            title="Обновить"
            disabled={isSyncing}
          >
            <Icon name="RefreshCw" className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <h2 className="text-white font-semibold text-lg">
          {MONTHS[monthCalendar.month]} {monthCalendar.year}
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenNotes}
            className="hover:bg-[#3A3A3A] text-white"
            title="Заметки"
          >
            <Icon name="FileText" className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset(0)}
            className="hover:bg-[#3A3A3A] text-white"
            title="Сегодня"
          >
            <Icon name="CalendarClock" className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#3A3A3A] bg-[#3A3A3A]">
        {DAYS_SHORT.map((day) => (
          <div
            key={day}
            className="text-center py-2 text-xs font-semibold text-white"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 auto-rows-fr h-full">
          {monthCalendar.dates.map(({ date, isCurrentMonth }, index) => {
            const dayEvents = getEventsForDate(date);
            const isTodayDate = isToday(date);
            const isExpanded = expandedCell === index;
            
            return (
              <>
                {isExpanded && (
                  <div 
                    className="fixed inset-0 bg-black/50 z-[59]"
                    onClick={() => setExpandedCell(null)}
                  />
                )}
                <div
                  key={index}
                  onClick={() => {
                    if (!isExpanded) {
                      setExpandedCell(index);
                    } else {
                      setExpandedCell(null);
                    }
                  }}
                  className={`border border-[#3A3A3A] p-1 transition-all min-h-[80px] ${
                    isExpanded ? 'fixed inset-4 z-[70] overflow-auto rounded-lg shadow-2xl cursor-default' : 'relative cursor-pointer'
                  } ${
                    isTodayDate ? 'bg-[#0EA5E9]/10' : 
                    isCurrentMonth ? 'bg-[#4A4A4A]' : 'bg-[#3A3A3A]'
                  }`}
                >
                {isExpanded ? (
                  <div className="text-center mb-3 pb-2 border-b border-[#3A3A3A]">
                    <div className="text-xs text-[#999]">
                      {date.getDate()} {MONTHS[date.getMonth()]}, {DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                    </div>
                  </div>
                ) : (
                  <div className={`text-xs font-semibold mb-1 ${
                    isTodayDate ? 'bg-[#0EA5E9] text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto' :
                    isCurrentMonth ? 'text-white text-center' : 'text-[#666] text-center'
                  }`}>
                    {date.getDate()}
                  </div>
                )}
                
                <div className="space-y-0.5">
                  {(isExpanded ? dayEvents : dayEvents.slice(0, 3)).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        if (isExpanded) {
                          e.stopPropagation();
                          if (handleEventClick) {
                            handleEventClick(event, e as any, formatDateKey(date));
                          }
                        }
                      }}
                      className={`rounded uppercase ${
                        isExpanded ? 'px-2 py-2 cursor-pointer hover:opacity-80' : 'px-1 py-0.5 pointer-events-none'
                      } transition-opacity ${
                        isExpanded ? 'text-sm leading-5' : 'text-[6px] leading-tight'
                      }`}
                      style={{ 
                        backgroundColor: `${event.color}20`,
                        color: '#fff',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {isExpanded ? event.text : truncateText(event.text, 2)}
                    </div>
                  ))}
                  {!isExpanded && dayEvents.length > 3 && (
                    <div className="text-[8px] text-[#999] text-center pointer-events-none">
                      +{dayEvents.length - 3}
                    </div>
                  )}
                </div>
                {isExpanded && (
                  <div className="mt-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateSelect(date);
                        setExpandedCell(null);
                      }}
                      className="w-full bg-[#1E3A8A] hover:bg-[#0EA5E9]"
                    >
                      <Icon name="Plus" className="w-4 h-4 mr-2" />
                      Добавить событие
                    </Button>
                  </div>
                )}
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(MobileMonthView);