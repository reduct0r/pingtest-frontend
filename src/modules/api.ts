import { COMPONENTS_MOCK } from "./mock";
import { isTauri } from '@tauri-apps/api/core';

export interface Component {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  time: number;
  imageUrl: string;
}

let API_BASE = '';  // Для web/dev

if (isTauri()) {  // Теперь без ошибки типов
  API_BASE = 'http://192.168.15.7:8081';
}

export const getComponents = async (filter?: string, minTime?: number, maxTime?: number): Promise<Component[]> => {
  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (minTime) params.append('minTime', minTime.toString());
  if (maxTime) params.append('maxTime', maxTime.toString());

  return fetch(`${API_BASE}/api/server-components?${params.toString()}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network error');
      return response.json();
    })
    .catch((error) => {
      // Mock fallback
      console.error('Fetch error:', error.message);
      return COMPONENTS_MOCK.filter(c => {
        const matchesFilter = filter ? c.title.toLowerCase().includes(filter.toLowerCase()) : true;
        const matchesMin = minTime ? c.time >= minTime : true;
        const matchesMax = maxTime ? c.time <= maxTime : true;
        return matchesFilter && matchesMin && matchesMax;
      });
    });
};

export const getComponentById = async (id: number): Promise<Component> => {
  return fetch(`${API_BASE}/api/server-components/${id}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network error');
      return response.json();
    })
    .catch(() => COMPONENTS_MOCK.find(c => c.id === id) || { id: 0, title: 'Not found', description: '', longDescription: '', time: 0, imageUrl: '' });
};