# Fin Panel

Фронтенд-пет-проект для антифрод-панели: мониторинг операций, анализ риска, действия аналитика.

## Стек
- React + TypeScript + Vite
- React Router
- TanStack Query
- MUI
- Zod
- MSW
- Vitest + Testing Library
- Docker + Nginx

## Структура
```text
src/
  app/          # providers, router, styles
  pages/        # страницы
  widgets/      # крупные UI-блоки
  entities/     # доменные сущности
  shared/       # общие утилиты и UI
  mocks/        # mock API
  tests/        # тестовая инициализация
```

## Быстрый старт
```bash
npm install
npm run dev
```

## Production в Docker
```bash
docker compose up --build
```

## Ближайшие шаги
1. Вынести фильтры и сортировку в URL search params.
2. Добавить экран деталки операции.
3. Сделать risk timeline и action log.
4. Добавить dashboard charts и виртуализацию списка.
5. Покрыть критичные сценарии тестами.
