# Destates Backend API

REST API server for the Destates real estate investment platform. Built with Express, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **ORM**: Prisma 7
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt

## Prerequisites

- Node.js 18+
- PostgreSQL running locally or remotely

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and update the values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `JWT_SECRET` | Secret key for JWT signing |
   | `PORT` | Server port (default: 5000) |
   | `FRONTEND_URL` | Frontend URL for CORS |

3. **Set up the database**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:5000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Properties

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/properties` | No | List properties (filters: city, status, minROI, maxPrice, type) |
| GET | `/api/properties/:id` | No | Get property by ID |

### Land Plots

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/plots` | No | List plots (filters: city, minArea, maxPrice) |
| GET | `/api/plots/:id` | No | Get plot by ID |

### PG Listings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/pgs` | No | List PGs (filters: city, roomType, maxRent) |
| GET | `/api/pgs/:id` | No | Get PG by ID |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | Yes | Get cart items |
| POST | `/api/cart` | Yes | Add item to cart |
| PATCH | `/api/cart/:id` | Yes | Update cart item quantity |
| DELETE | `/api/cart/:id` | Yes | Remove cart item |
| DELETE | `/api/cart` | Yes | Clear entire cart |

### Admin (requires ADMIN role)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard counts |
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/admin/inquiries` | Admin | List contact inquiries |
| GET | `/api/admin/testimonials` | Admin | List testimonials |
| POST | `/api/admin/properties` | Admin | Create property |
| PUT | `/api/admin/properties/:id` | Admin | Update property |
| DELETE | `/api/admin/properties/:id` | Admin | Delete property |
| POST | `/api/admin/plots` | Admin | Create plot |
| PUT | `/api/admin/plots/:id` | Admin | Update plot |
| DELETE | `/api/admin/plots/:id` | Admin | Delete plot |
| POST | `/api/admin/pgs` | Admin | Create PG listing |
| PUT | `/api/admin/pgs/:id` | Admin | Update PG listing |
| DELETE | `/api/admin/pgs/:id` | Admin | Delete PG listing |
| POST | `/api/admin/testimonials` | Admin | Create testimonial |
| PUT | `/api/admin/testimonials/:id` | Admin | Update testimonial |
| DELETE | `/api/admin/testimonials/:id` | Admin | Delete testimonial |

### Image Upload (requires ADMIN role)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload/image` | Admin | Upload single image (max 5 MB) |
| POST | `/api/upload/images` | Admin | Upload multiple images (max 10 files) |

Uploaded images are stored in `uploads/` and served statically at `/uploads/<filename>`.
Allowed formats: JPG, JPEG, PNG, GIF, WEBP, SVG.

### Other

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | No | Submit contact inquiry |
| GET | `/api/testimonials` | No | Get all testimonials |
| GET | `/api/health` | No | Health check |

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database models
│   ├── prisma.config.ts    # Prisma v7 config
│   └── seed.ts             # Seed data
├── uploads/                   # Uploaded images (served at /uploads/*)
├── src/
│   ├── index.ts               # Entry point, middleware, route registration
│   ├── utils/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts            # JWT auth middleware
│   │   ├── admin.ts           # ADMIN role check middleware
│   │   └── validate.ts        # Request validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── property.routes.ts
│   │   ├── plot.routes.ts
│   │   ├── pg.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── contact.routes.ts
│   │   ├── testimonial.routes.ts
│   │   ├── admin.routes.ts    # Admin CRUD routes
│   │   └── upload.routes.ts   # Image upload routes
│   └── controllers/
│       ├── auth.controller.ts
│       ├── property.controller.ts
│       ├── plot.controller.ts
│       ├── pg.controller.ts
│       ├── cart.controller.ts
│       ├── contact.controller.ts
│       └── admin.controller.ts # Admin CRUD handlers
├── .env.example
├── package.json
└── tsconfig.json
```
