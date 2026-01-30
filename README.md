# Sis-ERP Backend
Backend module for ERP system.

## How to Run

### Requirements
- Docker
- Docker Compose

### Steps

copy .env
```
cp .env.example .env
```

up containers
```
./run dc up -d
```

generate prisma client

```
./run cmd pnpm prisma generate
```

run migrations

```
./run cmd pnpm prisma migrate dev
```

API URL:
```
http://localhost:3000
```