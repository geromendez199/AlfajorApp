# Auditoría Fase 0

Formato: `OK` / `Falta` / `Inconsistente` / `Riesgo futuro`.

## Monorepo y tooling
- `pnpm-workspace.yaml` declarando `apps/*` y `packages/*`: **OK**.
- `turbo.json` con pipeline básica build/lint/test/dev sin cache refine ni filtros por app: **Riesgo futuro** (podría generar tiempos altos).
- Scripts raíz (dev/dev:api/db:migrate/db:seed/db:studio/build/lint/test) presentes y alineados al README: **OK**.

## Docker / Base de datos
- `docker/docker-compose.yml` con servicios `db` Postgres 15 y `api`, variables mínimas: **OK**.
- Falta `.env.example` y validación de variables en runtime: **Falta**.

## Prisma
- Enums `Role`, `OrderStatus`, `Channel` definidos: **OK**.
- Relaciones básicas User/Category/Product/Extra/Order/OrderItem/OrderItemExtra: **OK**.
- Índices únicos/compuestos pedidos (Order number diario, status+createdAt, etc.) ausentes; soft delete no modelado; store multi-sucursal inexistente: **Falta**.
- Order autoincrement global sin reset diario ni ventana de gracia; items sin constraint de qty mínima: **Riesgo futuro**.

## Seed
- Categorías y productos Alfajor según README creados con `upsert`: **OK**.
- Extras (bacon, pepinos, medallón extra, medallón veggie swap) creados: **OK**.
- Seed crea usuario admin PIN 0000: **OK**.
- Seed crea orden vacía total 0 cada ejecución (no idempotente, viola regla de no order sin items): **Inconsistente**.
- Idempotencia parcial: productos/extras/categorías sí, órdenes no: **Inconsistente**.

## Backend (apps/api)
- Módulos presentes (auth, users, menu, orders, inventory, reports, realtime) en estructura plana Nest: **OK** (presencia), pero sin separación domain/application/infrastructure: **Falta**.
- Controllers/Services exponen modelos Prisma directo, sin DTOs ni mappers: **Inconsistente** (acoplamiento a ORM).
- Validación de env inexistente; ConfigModule no configurado: **Falta**.
- Swagger/OpenAPI no configurado: **Falta**.
- Manejo de errores global estandarizado ausente: **Falta**.
- Logging estructurado y request id no presentes; WebSocket logs mínimos: **Falta**.
- Auditoría de acciones sensibles no implementada: **Falta**.

## Realtime
- Gateway `RealtimeGateway` presente con eventos básicos emitidos desde OrdersService: **OK** (presencia), pero rooms/roles/seguridad no configurados y payloads no tipados compartidos: **Riesgo futuro**.

## Frontend
- Apps POS/KDS/Admin Next.js con pages básicas y Tailwind config mínima: **OK** (scaffolding).
- No hay componentes UI compartidos robustos ni hooks de API/WS; falta manejo de errores, carrito completo, timers, etc.: **Falta**.

## CI/CD y calidad
- Workflow `.github/workflows/ci.yml` ejecuta install/lint/test/build en main/dev PRs: **OK**.
- Sin cache pnpm/turbo ni matrix Node; sin husky/lint-staged/commitlint/prettier config compartida: **Falta**.

## Documentación y roadmap
- Docs base (requisitos, arquitectura, modelo, endpoints, wireframes, ADR-0001 stack) presentes: **OK**.
- No existe auditoría, ADRs para DDD/error/logging, ni roadmap de sprints: **Falta**.
