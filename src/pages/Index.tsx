import { lazy, Suspense, useEffect, useMemo } from 'react';

const MobileMonthView = lazy(() => import('@/components/calendar/MobileMonthView'));
const MobileWeekView = lazy(() => import('@/components/calendar/MobileWeekView'));
const DesktopMonthView = lazy(() => import('@/components/calendar/DesktopMonthView'));
const NotesDialog = lazy(() => import('@/components/calendar/NotesDialog'));
const CalendarDialogs = lazy(() => import('@/components/calendar/CalendarDialogs'));
import { useCalendarState } from '@/hooks/useCalendarState';
import { useCalendarUtils } from '@/hooks/useCalendarUtils';
import { useCalendarHandlers } from '@/hooks/useCalendarHandlers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { safeLocalStorage } from '@/utils/localStorage';
import { useSyncContext } from '@/context/SyncContext';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#2A2A2A]">
    <div className="w-8 h-8 border-4 border-[#4A4A4A] border-t-white rounded-full animate-spin"></div>
  </div>
);

const Index = () => {
  const state = useCalendarState();
  const { isSyncing } = useSyncContext();
  
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

  const handleUpdateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.unregister();
        }
      });
      caches.keys().then((names) => {
        names.forEach(name => caches.delete(name));
      });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, []);
  
  useEffect(() => {
    if (!state.isLoading) {
      const timer = setTimeout(() => {
        import('@/components/calendar/CalendarDialogs');
        if (!isMobile) {
          import('@/components/calendar/NotesDialog');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isLoading, isMobile]);
  
  useKeyboardShortcuts(
    isMobile
      ? null
      : {
          onNewEvent: () => handlers.handleQuickAdd(),
          onEscape: () => {
            state.setIsDialogOpen(false);
            state.setIsNotesOpen(false);
            state.setIsQuickAddOpen(false);
          },
          onToday: () => {
            state.setWeekOffset(0);
            state.setMonthOffset(0);
          },
          onNextWeek: () => state.setWeekOffset(state.weekOffset + 1),
          onPrevWeek: () => state.setWeekOffset(state.weekOffset - 1),
        }
  );

  return (
    <div className="min-h-screen md:h-screen md:flex md:flex-col bg-[#2A2A2A]">
      <Suspense fallback={<LoadingSpinner />}>
        {isMobile && state.isMobileMonthOpen && (
          <MobileMonthView
            monthCalendar={utils.monthCalendar}
            monthOffset={state.monthOffset}
            setMonthOffset={state.setMonthOffset}
            onClose={() => state.setIsMobileMonthOpen(false)}
            getEventsForDate={utils.getEventsForDate}
            isToday={utils.isToday}
            formatDateKey={utils.formatDateKey}
            handleDateSelect={handlers.handleDateSelect}
            handleEventClick={handlers.handleEventClick}
            truncateText={utils.truncateText}
            handleOpenNotes={() => state.setIsNotesOpen(true)}
            isSyncing={isSyncing}
            onRefresh={handlers.loadEvents}
            onUpdateApp={handleUpdateApp}
          />
        )}

        {isMobile && !state.isMobileMonthOpen && (
          <div className="max-w-4xl mx-auto px-0">
            <MobileWeekView
          weekDates={utils.weekDates}
          firstDate={utils.firstDate}
          lastDate={utils.lastDate}
          weekOffset={state.weekOffset}
          setWeekOffset={state.setWeekOffset}
          forceDesktopView={state.forceDesktopView}
          setForceDesktopView={state.setForceDesktopView}
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
          handleOpenNotes={() => state.setIsNotesOpen(true)}
          isSyncing={state.isSyncing}
          onRefresh={handlers.loadEvents}
          onOpenMonthView={() => state.setIsMobileMonthOpen(true)}
          />
          </div>
        )}

        {!isMobile && (
          <DesktopMonthView
            monthCalendar={utils.monthCalendar}
            monthOffset={state.monthOffset}
            setMonthOffset={state.setMonthOffset}
            forceDesktopView={state.forceDesktopView}
            setForceDesktopView={state.setForceDesktopView}
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
            handleOpenNotes={() => state.setIsNotesOpen(true)}
            isSyncing={isSyncing}
            onRefresh={handlers.loadEvents}
            onUpdateApp={handleUpdateApp}
          />
        )}

        {(state.isDialogOpen || state.deleteDialogOpen || state.isQuickAddOpen || state.viewAllDate) && (
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
        )}

        {state.isNotesOpen && (
          <Suspense fallback={null}>
            <NotesDialog
            isOpen={state.isNotesOpen}
            onClose={() => state.setIsNotesOpen(false)}
            notesContent={state.notesContent}
            onNotesChange={(value) => {
              state.setNotesContent(value);
              safeLocalStorage.setItem('calendar_notes', value);
            }}
            userId={state.userId || 'local_user'}
          />
          </Suspense>
        )}
      </Suspense>
    </div>
  );
};

export default Index;