# Дополнительные улучшения для календаря

## 🎯 Приоритетные улучшения

### 1. UX улучшения
- [ ] **Drag & Drop на мобильных** - добавить длинное нажатие для перетаскивания
- [ ] **Быстрое редактирование** - двойной клик для быстрого редактирования текста события
- [ ] **Цветные теги** - добавить систему тегов/категорий для событий
- [ ] **Поиск событий** - полнотекстовый поиск по названиям
- [ ] **Фильтры** - фильтрация событий по цвету/категории
- [ ] **Уведомления** - напоминания о событиях
- [ ] **Повтор событий** - улучшить UI для настройки повторений

### 2. Производительность
- [ ] **Виртуализация** - для месячного вида при большом количестве событий
- [ ] **Lazy load компонентов** - разделить CalendarDialogs на отдельные модули
- [ ] **Service Worker** - кеширование и офлайн режим
- [ ] **IndexedDB** - для хранения большого объёма данных
- [ ] **Оптимизация изображений** - если будут добавлены иконки/картинки

### 3. Функциональность
- [ ] **Экспорт в iCal** - для синхронизации с другими календарями
- [ ] **Импорт событий** - загрузка из файла
- [ ] **Шаблоны событий** - быстрое создание типовых событий
- [ ] **Статистика** - аналитика использования времени
- [ ] **Вложения** - прикрепление файлов к событиям
- [ ] **Совместный доступ** - приглашение других пользователей

### 4. Дизайн
- [ ] **Тёмная/светлая тема** - переключатель темы
- [ ] **Кастомизация** - выбор цветов интерфейса
- [ ] **Анимации** - плавные переходы при создании/удалении
- [ ] **Адаптивные размеры шрифтов** - для разных разрешений
- [ ] **Кастомные иконки** - для разных типов событий

### 5. Доступность (A11y)
- [ ] **Клавиатурная навигация** - полное управление с клавиатуры
- [ ] **ARIA метки** - для скринридеров
- [ ] **Контрастность** - улучшить контраст для слабовидящих
- [ ] **Фокус индикаторы** - видимые рамки при табуляции
- [ ] **Масштабирование** - поддержка увеличения шрифтов

## 🔧 Технические улучшения

### 1. Архитектура
```typescript
// Создать типизированный API client
class CalendarAPI {
  private baseURL: string;
  
  async getEvents(userId: string): Promise<Event[]> {
    // typed fetch with error handling
  }
  
  async createEvent(event: Event): Promise<Event> {
    // typed fetch
  }
}

// Использовать Context для глобального состояния
const CalendarContext = createContext<CalendarState>();

// Разбить большие хуки на более мелкие
useEventManagement(); // создание/редактирование/удаление
useDateNavigation(); // навигация по датам
useDragAndDrop(); // drag & drop логика
```

### 2. Тестирование
```bash
# Добавить тесты
npm install --save-dev vitest @testing-library/react

# Unit тесты для утилит
src/utils/__tests__/localStorage.test.ts
src/utils/__tests__/debounce.test.ts

# Integration тесты для компонентов
src/components/calendar/__tests__/NotesDialog.test.tsx
src/components/calendar/__tests__/MobileWeekView.test.tsx
```

### 3. Мониторинг
```typescript
// Добавить error tracking
import * as Sentry from "@sentry/react";

// Добавить analytics
import { analytics } from '@/utils/analytics';

analytics.track('event_created', {
  color: event.color,
  hasRepeat: !!event.repeat
});
```

### 4. Безопасность
```typescript
// Валидация данных с zod
import { z } from 'zod';

const EventSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// XSS защита
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(userInput);
```

## 📊 Метрики для отслеживания

### Performance
- Time to Interactive (TTI) < 3s
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s

### User Experience
- Количество созданных событий
- Среднее время использования
- Процент возвратов пользователей
- Ошибки и крэши

## 🚀 Быстрые победы (Quick Wins)

### Можно сделать прямо сейчас:

1. **Горячие клавиши**
```typescript
// useKeyboardShortcuts.ts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'n' && e.ctrlKey) {
      // Создать новое событие
      openDialog();
    }
    if (e.key === 'Escape') {
      // Закрыть диалоги
      closeAllDialogs();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

2. **Улучшенный экспорт**
```typescript
// Экспорт в разных форматах
const exportToCSV = (events: Event[]) => {
  const csv = events.map(e => 
    `${e.date},${e.text},${e.color}`
  ).join('\n');
  
  download(csv, 'calendar.csv', 'text/csv');
};

const exportToICS = (events: Event[]) => {
  // iCalendar format
  const ics = createICSFromEvents(events);
  download(ics, 'calendar.ics', 'text/calendar');
};
```

3. **Оптимизация bundle size**
```bash
# Анализ размера
npm install --save-dev rollup-plugin-visualizer

# В vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  visualizer({ open: true })
]
```

4. **Preload критичных ресурсов**
```html
<!-- index.html -->
<link rel="preconnect" href="https://functions.poehali.dev">
<link rel="dns-prefetch" href="https://functions.poehali.dev">
```

5. **Добавить loading states**
```typescript
// Скелетон для загрузки
{isLoading && <CalendarSkeleton />}
{!isLoading && <Calendar events={events} />}
```

## 💡 Инновационные идеи

1. **AI помощник** - предложения событий на основе истории
2. **Голосовой ввод** - создание событий голосом
3. **Интеграция с картами** - добавление места события
4. **Погода в календаре** - отображение погоды на даты
5. **Синхронизация** - между устройствами в реальном времени
6. **Habit tracking** - отслеживание привычек
7. **Time blocking** - блокирование времени для задач

## 📝 Что сделать в первую очередь?

**TOP 5 по приоритету:**

1. ✅ **Горячие клавиши** (Ctrl+N, Escape) - 30 минут
2. ✅ **Улучшенный поиск** - полнотекстовый поиск - 1 час
3. ✅ **Теги/категории** - система категорий - 2 часа
4. ✅ **Loading states** - скелетоны загрузки - 1 час
5. ✅ **Экспорт в ICS** - для других календарей - 2 часа

**Общее время: ~6-7 часов работы**
