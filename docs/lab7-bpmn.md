# ЛР7. Диаграмма бизнес-процесса

## Участники
- **Гость** — может только просматривать каталог и запускать авторизацию.
- **Пользователь** — управляет заявками, добавляет компоненты, подтверждает расчёт.
- **PingTest API** — REST-служба (Spring) с JWT-авторизацией в cookies.

## BPMN / Activity-диаграмма

```mermaid
flowchart LR
  subgraph Guest["Гость"]
    G1[Открыть SPA] --> G2{Нужна заявка?}
    G2 -- нет --> G3[Изучить каталог\n(axios -> GET /api/server-components)]
    G2 -- да --> G4[Открыть экран входа]
    G4 --> G5[Отправить логин/пароль\nPOST /api/auth/login]
  end

  subgraph User["Авторизованный пользователь"]
    U1[Получить профиль\nGET /api/users/me] --> U2[Увидеть своё имя и меню]
    U2 --> U3[Искать компоненты\nsetSearchValue -> thunk]
    U3 --> U4[Добавить компонент\nPOST /api/server-components/{id}/add-to-draft]
    U4 --> U5[Открыть черновик]
    U5 --> U6{Статус DRAFT?}
    U6 -- да --> U7[Менять количество\nPUT /api/ping-time/{req}/items/{cmp}]
    U7 --> U8[Удалять компонент\nDELETE .../items/{cmp}]
    U8 --> U9[Подтвердить заявку\nPUT /api/ping-time/{req}/form]
    U6 -- нет --> U10[Просмотреть историю\nGET /api/ping-time]
    U10 --> U11[Выйти\nPOST /api/auth/logout]
  end

  subgraph API["PingTest API"]
    A1[(Cart icon cache)]:::store
  end

  G5 -->|JWT cookie| U1
  U4 --> A1
  classDef store fill:#1f2933,stroke:#4fd1c5,color:#fff;
```

## Краткое описание
1. Гость изучает услуги и при необходимости переходит на форму авторизации.
2. После успешного `POST /api/auth/login` пользователь получает профиль (`GET /api/users/me`) и видит персонализированное меню.
3. Все запросы каталога/заявок выполняются через Redux Thunk + axios, используя сгенерированного клиента [`swagger-typescript-api`](https://raw.githubusercontent.com/iu5git/Web/main/tutorials/lab7/README.md).
4. При добавлении компонента к черновику автоматически обновляется иконка корзины (`GET /api/ping-time/cart-icon`), а заявка доступна для редактирования до подтверждения.
5. Завершённые заявки доступны в таблице истории; при выходе состояние Redux и локальные фильтры очищаются.

