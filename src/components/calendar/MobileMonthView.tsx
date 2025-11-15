import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Event, DAYS_SHORT, MONTHS } from './types';
import { memo } from 'react';

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
  truncateText: (text: string, wordLimit?: number) => string;
}

const MobileMonthView = ({
  monthCalendar,
  monthOffset,
  setMonthOffset,
  onClose,
  getEventsForDate,
  isToday,
  handleDateSelect,
  truncateText,
}: MobileMonthViewProps) => {
  return (
    <div className="fixed inset-0 bg-[#2A2A2A] z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[#3A3A3A]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-[#3A3A3A] text-white"
        >
          <Icon name="X" className="w-5 h-5" />
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
            
            return (
              <div
                key={index}
                onClick={() => {
                  handleDateSelect(date);
                  onClose();
                }}
                className={`border border-[#3A3A3A] p-1 cursor-pointer transition-colors min-h-[80px] ${
                  isTodayDate ? 'bg-[#0EA5E9]/10' : 
                  isCurrentMonth ? 'bg-[#4A4A4A]' : 'bg-[#3A3A3A]'
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${
                  isTodayDate ? 'bg-[#0EA5E9] text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto' :
                  isCurrentMonth ? 'text-white text-center' : 'text-[#666] text-center'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-[8px] px-1 py-0.5 rounded truncate"
                      style={{ 
                        borderLeft: `2px solid ${event.color}`,
                        backgroundColor: `${event.color}15`,
                        color: '#fff'
                      }}
                    >
                      {truncateText(event.text, 2)}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] text-[#999] text-center">
                      +{dayEvents.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(MobileMonthView);
