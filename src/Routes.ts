export const ROUTES = {
  HOME: '/',
  COMPONENTS: '/components',
  COMPONENT_DETAIL: '/components/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  REQUESTS: '/requests',
  REQUEST_DETAIL: '/requests/:id',
  PROFILE: '/profile',
  COMPONENTS_MANAGEMENT: '/components-management',
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: Record<RouteKeyType, string> = {
  HOME: 'Главная',
  COMPONENTS: 'Компоненты',
  COMPONENT_DETAIL: 'Детали серверного компонента',
  LOGIN: 'Вход',
  REGISTER: 'Регистрация',
  REQUESTS: 'Заявки',
  REQUEST_DETAIL: 'Детали заявки',
  PROFILE: 'Личный кабинет',
  COMPONENTS_MANAGEMENT: 'Управление услугами',
  FORBIDDEN: 'Доступ запрещен',
  NOT_FOUND: 'Страница не найдена',
};