import { lazy, Suspense } from 'react';
import AuthScreen from '@/components/calendar/AuthScreen';
import MobileWeekView from '@/components/calendar/MobileWeekView';
import DesktopMonthView from '@/components/calendar/DesktopMonthView';
import { useCalendarState } from '@/hooks/useCalendarState';
import { useCalendarUtils } from '@/hooks/useCalendarUtils';
import { useCalendarHandlers } from '@/hooks/useCalendarHandlers';

const CalendarDialogs = lazy(() => import('@/components/calendar/CalendarDialogs'));

const Index = () => {
  const state = useCalendarState();
  
  const utils = useCalendarUtils(
    state.weekOffset,
    state.monthOffset,
    state.quickAddMonthOffset,
    state.events
  );
  
  const handlers = useCalendarHandlers(
    state,
    utils.formatDateKey,
    utils.getEventsForDate
  );

  if (!state.userId) {
    return (
      <AuthScreen 
        vkIdInput={state.vkIdInput}
        setVkIdInput={state.setVkIdInput}
        onLogin={handlers.handleVKLogin}
      />
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:flex md:flex-col bg-[#2A2A2A]">
      <div className="max-w-4xl md:max-w-none md:flex-1 md:flex md:flex-col mx-auto px-0 md:overflow-hidden md:w-full">
        <MobileWeekView
          weekDates={utils.weekDates}
          firstDate={utils.firstDate}
          lastDate={utils.lastDate}
          weekOffset={state.weekOffset}
          setWeekOffset={state.setWeekOffset}
          forceDesktopView={state.forceDesktopView}
          setForceDesktopView={state.setForceDesktopView}
          handleLogout={handlers.handleLogout}
          exportEventsToFile={handlers.exportEventsToFile}
          getEventsForDate={utils.getEventsForDate}
          isToday={utils.isToday}
          formatDateKey={utils.formatDateKey}
          dragOverDate={state.dragOverDate}
          getDayFillColor={utils.getDayFillColor}
          handleDateSelect={handlers.handleDateSelect}
          handleDragOver={handlers.handleDragOver}
          handleDragLeave={handlers.handleDragLeave}
          handleDrop={handlers.handleDrop}
          draggedEvent={state.draggedEvent}
          movingEvent={state.movingEvent}
          truncateText={utils.truncateText}
          handleDragStart={handlers.handleDragStart}
          handleDragEnd={handlers.handleDragEnd}
          handleEventClick={handlers.handleEventClick}
          handleMoveEvent={handlers.handleMoveEvent}
          handleTouchStart={handlers.handleTouchStart}
          handleTouchMove={handlers.handleTouchMove}
          handleTouchEnd={handlers.handleTouchEnd}
          handleQuickAdd={handlers.handleQuickAdd}
        />

        <DesktopMonthView
          monthCalendar={utils.monthCalendar}
          monthOffset={state.monthOffset}
          setMonthOffset={state.setMonthOffset}
          forceDesktopView={state.forceDesktopView}
          setForceDesktopView={state.setForceDesktopView}
          handleLogout={handlers.handleLogout}
          exportEventsToFile={handlers.exportEventsToFile}
          getEventsForDate={utils.getEventsForDate}
          isToday={utils.isToday}
          formatDateKey={utils.formatDateKey}
          dragOverDate={state.dragOverDate}
          dragOverEvent={state.dragOverEvent}
          getDayFillColor={utils.getDayFillColor}
          handleDateSelect={handlers.handleDateSelect}
          handleDragOver={handlers.handleDragOver}
          handleDragLeave={handlers.handleDragLeave}
          handleDrop={handlers.handleDrop}
          draggedEvent={state.draggedEvent}
          movingEvent={state.movingEvent}
          handleDragStart={handlers.handleDragStart}
          handleDragEnd={handlers.handleDragEnd}
          handleEventDragOver={handlers.handleEventDragOver}
          handleEventDrop={handlers.handleEventDrop}
          handleEventClick={handlers.handleEventClick}
          handleViewAllClick={handlers.handleViewAllClick}
        />
      </div>

      <Suspense fallback={null}>
        <CalendarDialogs
          isDialogOpen={state.isDialogOpen}
          setIsDialogOpen={state.setIsDialogOpen}
          editingEvent={state.editingEvent}
          newEventText={state.newEventText}
          setNewEventText={state.setNewEventText}
          selectedColor={state.selectedColor}
          setSelectedColor={state.setSelectedColor}
          fillDay={state.fillDay}
          setFillDay={state.setFillDay}
          selectedRepeat={state.selectedRepeat}
          setSelectedRepeat={state.setSelectedRepeat}
          handleCreateEvent={handlers.handleCreateEvent}
          handleDeleteEvent={handlers.handleDeleteEvent}
          selectedDate={state.selectedDate}
          deleteDialogOpen={state.deleteDialogOpen}
          setDeleteDialogOpen={state.setDeleteDialogOpen}
          eventToDelete={state.eventToDelete}
          deleteTargetDate={state.deleteTargetDate}
          deleteEvent={handlers.deleteEvent}
          viewAllDate={state.viewAllDate}
          setViewAllDate={state.setViewAllDate}
          getEventsForDate={utils.getEventsForDate}
          formatDateKey={utils.formatDateKey}
          handleEventClick={handlers.handleEventClick}
          handleDayClick={handlers.handleDayClick}
          isQuickAddOpen={state.isQuickAddOpen}
          setIsQuickAddOpen={state.setIsQuickAddOpen}
          quickAddMonthOffset={state.quickAddMonthOffset}
          setQuickAddMonthOffset={state.setQuickAddMonthOffset}
          getQuickAddCalendar={utils.getQuickAddCalendar}
          handleQuickAddDateSelect={handlers.handleQuickAddDateSelect}
          isToday={utils.isToday}
        />
      </Suspense>
    </div>
  );
};

export default Index;