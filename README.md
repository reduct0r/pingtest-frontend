# PingTest Frontend · Лабораторная 7

SPA для расчёта времени отклика серверных компонентов. Проект дополняет лабораторную работу №7 и повторяет требования методички по Redux Toolkit, axios и кодогенерации Swagger[^guide].

## Основные возможности
- Авторизация/регистрация с хранением JWT в HttpOnly-cookie, переключение гостевого и пользовательского интерфейса.
- Redux Toolkit + redux-thunk для каталога услуг, черновика заявки и истории запросов.
- Сгенерированный клиент `swagger-typescript-api` (axios) + скрипт `npm run generate:api`.
- Страница каталога с поиском, кнопкой «Добавить» и иконкой черновика.
- Страница черновика/заявки: изменение количества, удаление компонентов, установка коэффициента и подтверждение.
- Таблица «Мои заявки» с фильтрами и переходом к деталям.
- Личный кабинет для обновления логина и пароля.
- Локальное хранение фильтров/логина (LocalStorage) + инструкция по использованию cookie в Postman/Insomnia.
- Activity/BPMN диаграмма процесса (`docs/lab7-bpmn.md`).

[^guide]: Методические указания: [iu5git/Web – lab7](https://raw.githubusercontent.com/iu5git/Web/main/tutorials/lab7/README.md)

## Быстрый старт

```bash
npm install
npm run generate:api   # генерирует src/api/Api.ts из Swagger (по умолчанию http://localhost:8081/v3/api-docs)
npm run dev            # https://localhost:3000 (mkcert сертификат уже настроен в vite.config.ts)
```

Переменные окружения:
- `VITE_API_BASE_URL` — при необходимости переопределяет `/api`.
- `SWAGGER_URL` или `SWAGGER_PATH` — источник OpenAPI-схемы для скрипта генерации.

## Сценарии демонстрации
1. **Авторизация** (страница `/login`): вводим учётные данные → в Application → Cookies появится `jwt`/`refresh`, а в LocalStorage хранится `pingtest:last-username` (можно использовать значение cookie в Postman).
2. **Каталог** (`/components`): поиск услуги → добавить компонент (кнопка становится активной только для авторизованного пользователя) → иконка черновика отображает счётчик.
3. **Черновик заявки** (`/requests/:id`): изменение количества, удаление компонентов, установка коэффициента, подтверждение и удаление заявки.
4. **История заявок** (`/requests`): таблица с фильтром по статусу, переход к заявкам в статусах FORMED/COMPLETED/REJECTED.
5. **Личный кабинет** (`/profile`): смена логина и пароля.

Дополнительно:
- Для BPMN/Activity-описания см. `docs/lab7-bpmn.md`.
- Кодогенерация api: `scripts/generate-api.mjs` (axios + типы + unwrapResponseData).
- Все сетевые запросы отображают загрузочные состояния/анимации.

## Стек
- Vite + React 19 + TypeScript
- Redux Toolkit, redux-thunk, react-router-dom
- axios + swagger-typescript-api
- react-bootstrap (базовые формы/spinner), кастомные стили
- Tauri dev proxy (mkcert) + PWA-плагин
