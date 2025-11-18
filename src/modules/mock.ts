export interface Component {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  time: number;
}

export const COMPONENTS_MOCK: Component[] = [
  {
    id: 1,
    title: 'База данных',
    description: 'Хранение данных: SQL-запросы, чтение/запись в диск.',
    longDescription: 'Полное описание базы данных...',
    imageUrl: '/images/placeholder_142x142.png',
    time: 10,
  },
  {
    id: 2,
    title: 'Кэш',
    description: 'Быстрый доступ к часто используемым данным.',
    longDescription: 'Полное описание кэша...',
    imageUrl: '/images/placeholder_142x142.png',
    time: 5,
  },
  {
    id: 3,
    title: 'Сервер',
    description: 'Обработка входящих запросов и маршрутизация.',
    longDescription: 'Полное описание сервера...',
    imageUrl: '/images/placeholder_142x142.png',
    time: 20,
  },
  {
    id: 4,
    title: 'Балансировщик нагрузки',
    description: 'Распределение нагрузки между серверами.',
    longDescription: 'Полное описание балансировщика нагрузки...',
    imageUrl: '/images/placeholder_142x142.png',
    time: 25,
  }
];

