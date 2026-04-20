# SkinX Posts — โจทย์ Full-stack

แอปพลิเคชัน full-stack สำหรับดูโพสต์จากไฟล์ `posts.json` (9,837 โพสต์) — backend เป็น Node.js, ฐานข้อมูล PostgreSQL, frontend เป็น Next.js 16 โดยให้ความสำคัญกับ security และ performance

> 🇬🇧 English: [README.md](README.md)

## เทคโนโลยีที่ใช้

| ชั้น (Layer) | เทคโนโลยี                                                              |
| ----------- | ---------------------------------------------------------------------- |
| Database    | PostgreSQL 16 (Docker)                                                 |
| ORM         | Prisma 5                                                               |
| Backend     | Node.js 20, Express, TypeScript, Zod, JWT sessions, bcrypt             |
| Frontend    | Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4          |
| Security    | helmet, rate-limit, per-email lockout, BREACH-safe gzip, DOMPurify     |
| Tests       | Vitest, supertest — รวม 48 tests ทั้ง backend + frontend               |

## โครงสร้างโปรเจกต์

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma               # User, Session, Post, Tag, PostTag
│   │   └── migrations/                 # 2 migrations (init + sessions)
│   ├── src/
│   │   ├── config/env.ts               # โหลด env พร้อม validate ด้วย Zod
│   │   ├── db/client.ts                # Prisma singleton (กัน leak ใน hot-reload)
│   │   ├── middleware/                 # auth, validate, error
│   │   ├── modules/
│   │   │   ├── auth/                   # routes → controller → service
│   │   │   │   ├── auth.{routes,controller,service,schema}.ts
│   │   │   │   └── lockout.ts          # per-email brute-force tracker
│   │   │   └── posts/                  # routes → controller → service → repository
│   │   ├── scripts/seed.ts             # seed แบบ idempotent, batch 500 แถว
│   │   ├── utils/                      # jwt, hash, errors, logger, asyncHandler
│   │   ├── app.ts                      # ประกอบ Express (helmet, compression…)
│   │   └── index.ts                    # entry + graceful shutdown
│   ├── tests/                          # 37 tests (auth, posts, lockout, utils)
│   ├── .env.example
│   ├── .env.test
│   ├── vitest.config.ts
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/auth/clear/         # Route handler ล้าง cookie เก่า
│   │   │   ├── login/                  # page + server action + client form
│   │   │   ├── register/               # page + server action + client form
│   │   │   ├── posts/
│   │   │   │   ├── [id]/               # detail + not-found
│   │   │   │   ├── page.tsx            # list + filter + pagination
│   │   │   │   ├── layout.tsx          # header/nav, ป้องกันด้วย auth
│   │   │   │   ├── loading.tsx         # skeleton shimmer
│   │   │   │   ├── error.tsx           # error boundary
│   │   │   │   ├── not-found.tsx       # 404 เฉพาะ /posts
│   │   │   │   └── logout-action.ts    # server action
│   │   │   ├── globals.css             # Tailwind v4 theme tokens + animations
│   │   │   ├── layout.tsx              # root layout
│   │   │   ├── not-found.tsx           # 404 ระดับ global
│   │   │   └── page.tsx                # redirect → /posts
│   │   ├── components/                 # PostCard, TagFilter, Pagination, LogoutButton
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client (server-only)
│   │   │   ├── auth.ts                 # cookie helpers
│   │   │   ├── sanitize.ts             # sanitize-html whitelist
│   │   │   ├── format.ts               # format วันที่ (Asia/Bangkok)
│   │   │   ├── types.ts                # shared types
│   │   │   └── env.ts                  # BACKEND_API_URL
│   │   └── proxy.ts                    # Next 16 proxy (auth guard + 404 guard)
│   ├── tests/                          # 11 tests (sanitize + format)
│   ├── .env.example
│   ├── next.config.ts
│   ├── vitest.config.ts
│   └── tsconfig.json
│
├── posts.json                          # ไฟล์ seed (9,837 โพสต์)
├── docker-compose.yml                  # PostgreSQL
├── README.md                           # English
└── README.th.md                        # อยู่ที่นี่
```

## สิ่งที่ต้องมีก่อนเริ่ม

- **Node.js** >= 20
- **Docker** + **Docker Compose** (สำหรับรัน PostgreSQL)
- **npm** (หรือ pnpm / yarn)

## ขั้นตอนการรันครั้งแรก

```bash
# 1. เปิด PostgreSQL
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
# generate JWT_SECRET ใหม่แล้ว paste ลง .env:
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
npm install
npm run prisma:migrate              # apply 2 migrations
npm run seed                        # สร้าง demo user + 9,837 posts
npm run dev                         # http://localhost:4000

# 3. Frontend (terminal ใหม่)
cd frontend
cp .env.example .env.local
npm install
npm run dev                         # http://localhost:3000
```

**บัญชีทดสอบ** (สร้างโดย seed):

| field    | value                |
| -------- | -------------------- |
| email    | `demo@skinx.local`   |
| password | `Demo@1234`          |

เปิด http://localhost:3000 แล้วล็อกอินเลย

## HTTP API

ทุก endpoint อยู่ใต้ `/api/*` ส่ง JWT ผ่าน cookie `skinx_token` (httpOnly, SameSite=Lax) หรือ header `Authorization: Bearer <jwt>`

| Method | Path                              | ต้องล็อกอิน | หน้าที่                                         |
| ------ | --------------------------------- | ----------- | ----------------------------------------------- |
| GET    | `/health`                         | ไม่         | liveness probe                                  |
| POST   | `/api/auth/register`              | ไม่         | สร้าง user + ออก session                        |
| POST   | `/api/auth/login`                 | ไม่         | ตรวจรหัสผ่าน + ออก session                      |
| POST   | `/api/auth/logout`                | ใช่         | revoke session ปัจจุบัน                         |
| GET    | `/api/auth/me`                    | ใช่         | คืนข้อมูลผู้ใช้ session ปัจจุบัน                |
| GET    | `/api/posts`                      | ใช่         | รายการโพสต์ — `?page=&pageSize=&tag=&q=`        |
| GET    | `/api/posts/tags`                 | ใช่         | รายการ tag ทั้งหมดพร้อมนับจำนวนโพสต์            |
| GET    | `/api/posts/:id`                  | ใช่         | รายละเอียดโพสต์ (รวม HTML content)              |

Error response:

```json
{ "error": { "code": "CONFLICT", "message": "Email is already registered", "details": { ... } } }
```

## คำสั่ง npm ที่ใช้บ่อย

### Backend

```bash
npm run dev                 # tsx watch (hot-reload)
npm run build               # compile TypeScript → dist/
npm run start               # รันไฟล์ที่ build แล้ว
npm run prisma:migrate      # สร้าง + apply migration ใหม่
npm run prisma:deploy       # apply migration (prod)
npm run prisma:studio       # เปิด Prisma Studio ดูข้อมูล
npm run seed                # seed posts.json + demo user
npm run typecheck           # ตรวจ type โดยไม่ build
npm run test:setup          # apply migrations ลง DB ทดสอบ (ครั้งแรก)
npm test                    # รัน vitest 1 ครั้ง
npm run test:watch          # watch mode
```

### Frontend

```bash
npm run dev                 # next dev (Turbopack)
npm run build               # next build
npm run start               # next start (production)
npm run lint                # next lint
npm run typecheck           # tsc --noEmit
npm test                    # vitest (sanitize + format)
npm run test:watch
```

## Environment variables

### `backend/.env`

| var                    | บังคับ | ค่า default                         | หน้าที่                                            |
| ---------------------- | ------ | ----------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`         | ✓      | —                                   | Postgres connection string                         |
| `PORT`                 |        | `4000`                              | HTTP port                                          |
| `NODE_ENV`             |        | `development`                       | `development` / `test` / `production`              |
| `LOG_LEVEL`            |        | `info`                              | pino log level                                     |
| `JWT_SECRET`           | ✓      | —                                   | secret ของ HS256 ยาวอย่างน้อย 32 ตัว **(generate เอง)** |
| `JWT_EXPIRES_IN`       |        | `7d`                                | อายุ token                                         |
| `CORS_ORIGIN`          |        | `http://localhost:3000`             | origin ที่อนุญาต (คั่นด้วย ,)                      |
| `TRUST_PROXY`          |        | `false`                             | Express trust proxy — **ห้ามตั้ง `true`** ใน prod ถ้าไม่ได้อยู่หลัง reverse proxy ที่เชื่อถือได้ |
| `SEED_FILE_PATH`       |        | `../posts.json`                     | path ของไฟล์ seed (สัมพันธ์กับ cwd)                |
| `SEED_DEMO_EMAIL`      |        | `demo@skinx.local`                  | email ของ demo user                                |
| `SEED_DEMO_PASSWORD`   |        | `Demo@1234`                         | password ของ demo user                             |

`backend/.env.test` ใช้ค่าเดียวกันแต่ `DATABASE_URL` ชี้ไปที่ `skinx_posts_test` และ JWT secret ถูก fix ไว้

### `frontend/.env.local`

| var               | บังคับ | ค่า default              | หน้าที่                                  |
| ----------------- | ------ | ------------------------ | ---------------------------------------- |
| `BACKEND_API_URL` | ✓      | `http://localhost:4000`  | server-only (ไม่มี prefix `NEXT_PUBLIC_`) |

## การเทสต์

- **Backend** — Vitest + supertest ใช้ **ฐานข้อมูล `skinx_posts_test` แยกต่างหาก** (Docker Postgres เดิม) TRUNCATE ตาราง + reset cache + clear lockout ระหว่างเทสต์
- **Frontend** — Vitest สำหรับ pure function (HTML sanitizer, date formatter)
- **รวม**: 48 tests — รัน `npm test` ในแต่ละโฟลเดอร์

Setup DB ทดสอบครั้งแรก:

```bash
docker exec skinx_postgres psql -U skinx -d skinx_posts -c "CREATE DATABASE skinx_posts_test;"
cd backend && npm run test:setup
```

## Architecture & Design Decisions

### Data model

```
User ─┬─ Session (jti; expiresAt, revokedAt)
      └─ (ไม่มี relation กับ Post — Post มีอยู่ก่อน user)

Post ─── PostTag ─── Tag     # many-to-many, indexed บน tagId
```

### Layered backend

```
HTTP  →  middleware  →  routes  →  controller  →  service  →  repository  →  Prisma
```

- **Controller** เขียนสั้น 3–5 บรรทัด: รับ req → เรียก service → ส่ง response
- **Service** ห่อ business rule (throw `NotFound`, คำนวณ `totalPages`, rate-limit per-email, bcrypt compare แบบ timing-safe)
- **Repository** เป็นจุดเดียวที่คุยกับ Prisma — เปลี่ยน ORM จุดเดียวจบ
- **Schema (Zod)** เป็น single source of truth ของ DTO types

### Auth

- **JWT HS256** + **Session table ใน DB** — JWT มี `jti` claim ชี้ไปที่แถว `Session` logout → set `revokedAt` middleware reject ถ้า revoked stateless scaling + revocation จริงๆ
- **Timing-safe login** — ถ้า email ไม่มีจริง ก็ยัง bcrypt compare กับ dummy hash เพื่อไม่ให้ response time leak ว่า user มีอยู่หรือไม่
- **Per-email lockout** — 5 ครั้งล้มเหลวใน 15 นาที lock email นั้น (ไม่ขึ้นกับ IP) ต้านการสลับ IP ทำ credential stuffing
- **httpOnly + SameSite=Lax + Secure (prod)** cookie — JWT ไม่ถึง JS, SameSite ป้องกัน CSRF

### Security hardening

- **Helmet** explicit (ปิด CSP ใน API, เปิด CORP `same-site`)
- **Rate limit** — global 300 req/min, per `/api/auth/*` 20 req/15min (ปิดใน test env)
- **CORS whitelist** — เปิดเฉพาะ origin ที่กำหนด, `credentials: true` สำหรับ cookie auth
- **Gzip compression** + filter **ยกเว้น `/api/auth/*`** — ปิดช่อง BREACH attack ตอน response มี JWT
- **`trust proxy`** เป็น opt-in via env — ไม่ default เป็น `1` เพื่อกัน spoof `X-Forwarded-For`
- **HTML sanitization** — `sanitize-html` whitelist ฝั่ง server ก่อน `dangerouslySetInnerHTML`, auto-add `rel="noopener noreferrer" target="_blank"` บน `<a>`, บล็อก `javascript:` / `data:`
- **CSP + HSTS** เปิดเฉพาะ production (dev ของ Next ต้องใช้ inline scripts)
- **Password policy** — ≥ 8 ตัว + ต้องมีตัวอักษร + ตัวเลข + สัญลักษณ์
- **Open redirect protection** — login `next` query ต้องขึ้นต้น `/` และไม่ขึ้น `//`
- **404 ระดับ proxy** — `?page=` ที่ invalid → rewrite เป็น status 404 จริง (แก้ Next 16 quirk)

### Performance

- **Indexed queries** — `Post.postedAt desc`, `Post.postedBy`, `PostTag.tagId`, `Session.userId`, `Session.expiresAt`
- **Pagination บังคับจาก server** — default 20, สูงสุด 100 ต่อหน้า
- **In-memory cache** — `count()` cache key ด้วย `tag+q` (TTL 60s, จำกัด 256 entry); tags list cache (TTL 5 นาที)
- **Gzip** ลด payload ~66% (วัดจริง: 9.2KB → 3.1KB บน `pageSize=50`)
- **Parallel fetch** หน้า list — `Promise.all([list, tags])`
- **Batched seed** — 9,837 posts + 24,573 tag links ใน ~7 วินาที

### Frontend design

- Tailwind v4 `@theme` tokens: **primary orange `#FF5300`** scale 50–900 + ink greyscale + secondary white
- Custom animations: `fade-in`, `fade-in-up`, `scale-in`, `slide-in-right`, `shimmer`
- `.stagger` utility เด้ง card แบบ cascaded
- Honor `prefers-reduced-motion` (animations ลดเหลือเกือบ 0)
- Server Components เป็น default; `'use client'` เฉพาะ form กับปุ่มที่มี state

### Route protection

`src/proxy.ts` (Next 16 รีเนมจาก middleware.ts) รันบน Node runtime:

1. Redirect user ที่ไม่ล็อกอินจาก path ที่ protected → `/login`
2. Redirect user ที่ล็อกอินแล้วจาก `/login` / `/register` → `/posts`
3. Validate `?page=` — ถ้า malformed rewrite ไป `/not-found` พร้อม status **404**

## ข้อจำกัดปัจจุบัน / งานที่ควรทำต่อ

- **Lockout เป็น in-memory per-process** — ถ้า scale horizontal ต้องย้ายไป Redis
- **ไม่มี session cleanup job** — แถว `sessions` ที่ expired/revoked จะโตขึ้นเรื่อยๆ เพิ่ม cron รายวัน: `DELETE FROM sessions WHERE expiresAt < NOW() OR revokedAt < NOW() - INTERVAL '7 days'`
- **ค้นหา `q` ใน `Post.title`** ใช้ `ILIKE` ไม่มี `pg_trgm` GIN index — พอกับ 9,837 แถว ถ้าโตมากกว่านี้ควรเพิ่ม trigram index
- **ไม่มี CSRF double-submit token** — พึ่ง SameSite=Lax ถ้าต้องรองรับ browser เก่าหรือ compliance เข้ม ควรเพิ่ม
- **Backend ไม่มี ESLint / Prettier config**

## Troubleshooting

| ปัญหา                                        | วิธีแก้                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `/api/posts/:id` → 500 ใน dev                | ลบ `.next` cache (`rm -rf frontend/.next`) แล้ว restart `npm run dev`            |
| Login ได้ 429 หลังจากเทสต์                    | Lockout in-memory — รอ 15 นาที หรือ restart backend                              |
| `JWT_SECRET must be at least 32 chars`       | Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| Docker ขึ้น `DockerDesktop must be owned…`   | ปัญหาของ Docker Desktop 4.68: ลบ `C:\ProgramData\DockerDesktop` ด้วยสิทธิ์ admin |
| Browser มี JWT ค้างจาก schema เก่า           | เปิด `/api/auth/clear` — ล้าง cookie แล้ว redirect ไป login                       |
