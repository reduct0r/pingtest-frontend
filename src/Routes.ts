export const ROUTES = {
  HOME: '/',
  COMPONENTS: '/components',
  COMPONENT_DETAIL: '/components/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  REQUESTS: '/requests',
  REQUEST_DETAIL: '/requests/:id',
  PROFILE: '/profile',
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
};