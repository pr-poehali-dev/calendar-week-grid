import { useState, useMemo, useCallback } from 'react';
import { Event, COLORS } from '@/components/calendar/types';
import { safeLocalStorage } from '@/utils/localStorage';

export const useCalendarState = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [movingEvent, setMovingEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewAllDate, setViewAllDate] = useState<Date | null>(null);
  const [dragOverEvent, setDragOverEvent] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(() => {
    const saved = safeLocalStorage.getItem('calendar_user_id');
    if (!saved) {
      const defaultId = 'local_user';
      safeLocalStorage.setItem('calendar_user_id', defaultId);
      return defaultId;
    }
    return saved;
  });
  const [selectedRepeat, setSelectedRepeat] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteTargetDate, setDeleteTargetDate] = useState<string | null>(null);
  const [forceDesktopView, setForceDesktopView] = useState(false);
  const [fillDay, setFillDay] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddMonthOffset, setQuickAddMonthOffset] = useState(0);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState(() => safeLocalStorage.getItem('calendar_notes') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const memoizedSetEvents = useCallback(setEvents, []);
  const memoizedSetIsLoading = useCallback(setIsLoading, []);
  const memoizedSetIsSyncing = useCallback(setIsSyncing, []);

  return useMemo(() => ({
    events,
    setEvents,
    isDialogOpen,
    setIsDialogOpen,
    selectedDate,
    setSelectedDate,
    newEventText,
    setNewEventText,
    selectedColor,
    setSelectedColor,
    editingEvent,
    setEditingEvent,
    draggedEvent,
    setDraggedEvent,
    dragOverDate,
    setDragOverDate,
    weekOffset,
    setWeekOffset,
    movingEvent,
    setMovingEvent,
    isLoading,
    setIsLoading,
    touchStart,
    setTouchStart,
    touchEnd,
    setTouchEnd,
    monthOffset,
    setMonthOffset,
    viewAllDate,
    setViewAllDate,
    dragOverEvent,
    setDragOverEvent,
    userId,
    setUserId,
    selectedRepeat,
    setSelectedRepeat,
    deleteDialogOpen,
    setDeleteDialogOpen,
    eventToDelete,
    setEventToDelete,
    deleteTargetDate,
    setDeleteTargetDate,
    forceDesktopView,
    setForceDesktopView,
    fillDay,
    setFillDay,
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddMonthOffset,
    setQuickAddMonthOffset,
    isNotesOpen,
    setIsNotesOpen,
    notesContent,
    setNotesContent,
    isSyncing,
    setIsSyncing,
  }), [
    events,
    isDialogOpen,
    selectedDate,
    newEventText,
    selectedColor,
    editingEvent,
    draggedEvent,
    dragOverDate,
    weekOffset,
    movingEvent,
    isLoading,
    touchStart,
    touchEnd,
    monthOffset,
    viewAllDate,
    dragOverEvent,
    userId,
    selectedRepeat,
    deleteDialogOpen,
    eventToDelete,
    deleteTargetDate,
    forceDesktopView,
    fillDay,
    isQuickAddOpen,
    quickAddMonthOffset,
    isNotesOpen,
    notesContent,
    isSyncing,
  ]);
};