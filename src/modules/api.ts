export interface Component {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  time: number;
  imageUrl: string;
}

export const getComponents = async (filter?: string, minTime?: number, maxTime?: number): Promise<Component[]> => {
  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (minTime) params.append('minTime', minTime.toString());
  if (maxTime) params.append('maxTime', maxTime.toString());

  return fetch(`/api/server-components?${params.toString()}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network error');
      return response.json();
    })
    .catch(() => {
      // Mock fallback
      return MOCK_COMPONENTS.filter(c => {
        const matchesFilter = filter ? c.title.toLowerCase().includes(filter.toLowerCase()) : true;
        const matchesMin = minTime ? c.time >= minTime : true;
        const matchesMax = maxTime ? c.time <= maxTime : true;
        return matchesFilter && matchesMin && matchesMax;
      });
    });
};

export const getComponentById = async (id: number): Promise<Component> => {
  return fetch(`/api/server-components/${id}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network error');
      return response.json();
    })
    .catch(() => MOCK_COMPONENTS.find(c => c.id === id) || { id: 0, title: 'Not found', description: '', longDescription: '', time: 0, imageUrl: '' });
};

// Mock
const MOCK_COMPONENTS: Component[] = [
  { id: 1, title: 'База данных', description: 'Хранение данных', longDescription: 'Полное описание БД', time: 10, imageUrl: '' },
  { id: 2, title: 'Кэш', description: 'Быстрый доступ', longDescription: 'Полное описание кэша', time: 5, imageUrl: '' },
  { id: 3, title: 'Сервер', description: 'Обработка запросов', longDescription: 'Полное описание сервера', time: 20, imageUrl: '' },
];