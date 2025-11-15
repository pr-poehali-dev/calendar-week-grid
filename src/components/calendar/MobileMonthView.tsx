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
}: MobileMonthViewProps) => {
  const [expandedCell, setExpandedCell] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-[#2A2A2A] z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[#3A3A3A]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-[#3A3A3A] text-white"
          title="Недельный вид"
        >
          <Icon name="CalendarDays" className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset(monthOffset - 1)}
            className="hover:bg-[#3A3A3A] text-white"
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </Button>
          
          <h2 className="text-white font-semibold text-lg">
            {MONTHS[monthCalendar.month]} {monthCalendar.year}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset(monthOffset + 1)}
            className="hover:bg-[#3A3A3A] text-white"
          >
            <Icon name="ChevronRight" className="w-5 h-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonthOffset(0)}
          className="hover:bg-[#3A3A3A] text-white"
        >
          <Icon name="CalendarClock" className="w-5 h-5" />
        </Button>
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
                  <div className="text-center mb-3 pb-3 border-b border-[#3A3A3A]">
                    <div className="text-lg font-bold text-white">
                      {date.getDate()} {MONTHS[date.getMonth()]}
                    </div>
                    <div className="text-sm text-[#999]">
                      {DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
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
                      className={`px-1 py-1 rounded uppercase leading-tight ${
                        isExpanded ? 'cursor-pointer hover:opacity-80' : 'pointer-events-none'
                      } transition-opacity ${
                        isExpanded ? 'text-xs' : 'text-[8px] truncate'
                      }`}
                      style={{ 
                        backgroundColor: `${event.color}20`,
                        color: '#fff'
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