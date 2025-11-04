export const ROUTES = {
  HOME: '/',
  COMPONENTS: '/components',
  COMPONENT_DETAIL: '/components/:id',
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: Record<RouteKeyType, string> = {
  HOME: 'Главная',
  COMPONENTS: 'Компоненты',
  COMPONENT_DETAIL: 'Детали серверного компонента',
};