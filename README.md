# Alfajor Order System (POS + KDS + Admin)

Sistema modular de gestión de pedidos para fast-food, inspirado en el flujo McDonald's pero con branding y menú de **Alfajor**. Incluye:
- **POS (Caja)**: carga de pedidos, combos, extras, cobro.
- **KDS (Cocina)**: cola en tiempo real, estados y timers.
- **Admin**: ABM de menú, stock, usuarios, reportes.
- **Backend**: API REST + WebSockets para realtime.
- **DB**: PostgreSQL con Prisma.
- **Monorepo**: apps y packages compartidos.

La prioridad de este proyecto es una **base bien modular para escalar** (más productos, sucursales, features e integraciones).

---

## 1. Arquitectura general

### 1.1 Monorepo

alfajor-order-system/
apps/
pos/        # Next.js + TS (Caja)
kds/        # Next.js + TS (Cocina)
admin/      # Next.js + TS (Administración)
api/        # NestJS + TS (REST + WS)
packages/
ui/         # Componentes UI compartidos (Button, Card, Layout, Theme)
types/      # Tipos compartidos (Product, Order, User, enums)
config/     # Configs compartidas (eslint, tsconfig, tailwind preset)
prisma/
schema.prisma
seed.ts
docker/
docker-compose.yml
docs/
01-requisitos.md
02-arquitectura.md
03-modelo-datos.md
04-endpoints.md
05-wireframes.md
ADR-0001-stack.md
.github/
workflows/ci.yml

### 1.2 Módulos backend (NestJS)
- `AuthModule` (JWT + roles)
- `UsersModule`
- `MenuModule` (Products, Categories, Extras, Disponibilidad)
- `OrdersModule` (Orders, OrderItems, Estado, Auditoría)
- `InventoryModule` (Stock, recetas/BOM opcional, alertas)
- `ReportsModule` (ventas, tiempos, top productos)
- `RealtimeModule` (Gateway WS para eventos de órdenes)

### 1.3 Realtime (WebSockets)
Eventos mínimos:
- `order_created`
- `order_updated`
- `order_ready`
- `order_cancelled`
- `inventory_low` (opcional MVP+)

Los clientes POS/KDS se suscriben y actualizan UI en vivo.

---

## 2. Stack tecnológico

**Frontend**
- Next.js + React + TypeScript
- TailwindCSS con theme Alfajor (verde oscuro + marfil)
- Zustand o Redux Toolkit para estado local (preferencia simple: Zustand)
- React Query / TanStack Query para data fetching

**Backend**
- Node.js + NestJS (TypeScript)
- Prisma ORM
- WebSockets (Nest Gateway)
- Validaciones con class-validator

**DB**
- PostgreSQL

**Dev/Infra**
- Docker Compose (API + DB)
- pnpm workspaces + turbo (build/lint/test)
- CI con GitHub Actions
- Deploy sugerido: Vercel (front) + Railway/Render/Fly.io (api) + Supabase/Neon (db)

---

## 3. Branding y UI

Paleta base (aprox. del menú):
- Verde oscuro primario: `#0E3A24`
- Verde secundario: `#244733`
- Marfil claro: `#E5E3D6`
- Negro/charcoal: `#111E1B`

Reglas UX:
- Operaciones principales en 2–3 toques.
- Botones grandes, layouts sin ruido visual.
- Colores para estados (pendiente / preparando / listo).
- Tipografía sans clara; logo script solo en encabezados.

---

## 4. Dominio y modelo de datos (resumen)

Entidades base:
- `User { id, name, pin, role }`
- `Category { id, name, sortOrder }`
- `Product { id, name, description, categoryId, priceSolo, priceCombo, isAvailable, canBeCombo }`
- `Extra { id, name, price, productId? , isGlobal }`
- `Order { id, number, channel, status, total, createdAt, updatedAt }`
- `OrderItem { id, orderId, productId, qty, notes, unitPrice, isCombo }`
- `OrderItemExtra { id, orderItemId, extraId, price }`
- (MVP+) `InventoryItem`, `StockMovement`, `RecipeLine`

Enums:
- `Role = CASHIER | KITCHEN | MANAGER | ADMIN`
- `OrderStatus = PENDING | IN_PROGRESS | READY | DELIVERED | CANCELLED`
- `Channel = COUNTER | PICKUP | DELIVERY`

---

## 5. Menú Alfajor (seed inicial)

### 5.1 Categorías
- **Alfajores**
- **Especiales**
- **Bebidas**
- **Tragos**

### 5.2 Productos
**ALFAJORES**
1. **Cheese**  
   - desc: carne y cheddar  
   - solo: $8000  
   - combo (papas + bebida): $11000  
   - extras: bacon (+$1000), pepinos encurtidos (+$0)  
2. **Onion**  
   - desc: smash con cebolla en plancha y cheddar  
   - solo: $9000  
   - combo: $12000  
3. **American**  
   - desc: lechuga, tomate y salsa especial  
   - solo: $9000  
   - combo: $12000  
4. **Pickle**  
   - desc: pepinos encurtidos, cebolla morada y salsa pickle  
   - solo: $9000  
   - combo: $12000  

**Nota general:** todos los alfajores permiten **medallón veggie** (swap) y **medallón extra +$2000**.

**ESPECIALES**
1. **Caja de Alfajores**  
   - desc: 4 Cheese simples  
   - precio: $20000  
2. **Bandeja de Papas**  
   - desc: papas solas  
   - precio: $4000  
3. **Bandeja de Papas con bacon y salsita**  
   - precio: $5000  

**BEBIDAS**
1. **Gaseosa** (Coca/Sprite/Fanta) – $2500  
2. **Agua saborizada** – $2500  
3. **Agua / Soda** – $2000  
4. **Liso Santa Fe** – $1000  
5. **Pinta Heineken** – $4000  

**TRAGOS**
1. **Fernet** – $3000  
2. **Gin Heredero** – $3000  
3. **Vermut** – $3000  

El `seed.ts` debe cargar estas categorías/productos/extras y dejar el sistema listo para usar.

---

## 6. Scripts

En la raíz del monorepo:

```bash
pnpm install

# levantar DB + API
pnpm dev:api

# levantar POS/KDS/Admin en paralelo
pnpm dev

# migraciones prisma
pnpm db:migrate
pnpm db:seed
pnpm db:studio

# lint/test/build
pnpm lint
pnpm test
pnpm build

Scripts esperados (package.json raíz):
	•	dev → turbo run dev en apps front
	•	dev:api → docker compose up + nest start:dev
	•	db:migrate → prisma migrate dev
	•	db:seed → ts-node prisma/seed.ts
	•	build → turbo run build
	•	lint → turbo run lint
	•	test → turbo run test

⸻

7. Variables de entorno

API (apps/api/.env)

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alfajor
JWT_SECRET=supersecret
WS_PORT=3001
API_PORT=3001

Fronts (apps/*/.env.local)

NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001


⸻

8. Reglas funcionales clave

POS
	•	Carga rápida con combos.
	•	Extras con validación.
	•	Notas limitadas.
	•	Envío a cocina bloquea edición salvo ventana de gracia.

KDS
	•	Cola ordenada por antigüedad/prioridad.
	•	Cambios de estado emiten WS.
	•	Timer por orden con alertas (verde/amarillo/rojo).

Admin
	•	ABM de productos y precios.
	•	Disponibilidad por stock/hora.
	•	Reportes básicos.

⸻

9. CI (GitHub Actions)

Workflow mínimo:
	•	instalar deps
	•	lint
	•	test
	•	build

Debe correr en cada PR a dev y main.

⸻

10. Estado del proyecto
	•	Setup monorepo + tooling
	•	Prisma schema + seed Alfajor
	•	API Orders + WS
	•	POS MVP
	•	KDS MVP
	•	Admin MVP
	•	Deploy demo

⸻

11. Contribución
	1.	Crear issue con descripción y criterios.
	2.	Branch: feature/<modulo>-<tarea>
	3.	PR a dev con checklist.
	4.	Revisión.

⸻

Licencia

MIT
