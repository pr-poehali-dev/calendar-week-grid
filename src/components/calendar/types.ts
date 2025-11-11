export interface Event {
  id: string;
  text: string;
  color: string;
  date: string;
  repeat?: string;
  order?: number;
  userId?: string;
  excludedDates?: string[];
  repeatUntil?: string;
  fillDay?: boolean;
}

export const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const COLORS = [
  { value: '#1E3A8A', label: 'Тёмно-синий' },
  { value: '#0EA5E9', label: 'Синий' },
  { value: '#F97316', label: 'Оранжевый' },
  { value: '#10B981', label: 'Зелёный' },
  { value: '#EF4444', label: 'Красный' },
];

export const API_URL = 'https://functions.poehali.dev/992d8e44-58a4-4f61-badd-a38834435786';
