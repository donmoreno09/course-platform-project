# Course Platform

An online **course platform**: a website where courses are packaged into **products** that people can
browse and buy. The goal of the finished app is a place to sell and deliver courses, with a
catalogue of courses and products, and payments.

> **Status: early development, built as a learning project.**
> This repository is being built step by step while following a full-length tutorial on building a
> course platform, with the aim of learning the stack below. Most of the app does not exist yet: right
> now the project contains the Next.js starter, the dependencies, and the first database tables.
> Expect frequent change.

## Tech stack

| Area | Tool | Status |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router, canary build) + [React](https://react.dev) | In use |
| Language | [TypeScript](https://www.typescriptlang.org) (strict mode) | In use |
| Styling | [Tailwind CSS](https://tailwindcss.com) | Installed |
| Database | [PostgreSQL](https://www.postgresql.org) | Schema designed, connection not wired up yet |
| ORM / migrations | [Drizzle](https://orm.drizzle.team) (`drizzle-orm`, `drizzle-kit`) with the `pg` driver | Tables defined |
| Env validation | [Zod](https://zod.dev) + [`@t3-oss/env-nextjs`](https://env.t3.gg) | Server variables defined |
| UI components | [shadcn/ui](https://ui.shadcn.com) | Planned |
| Payments | [Stripe](https://stripe.com) | Planned |

## What exists so far

- A Next.js + TypeScript + Tailwind project, with the code under `src/`.
- **Database schema** (Drizzle) for three tables:
  - `courses`: a course (name, description).
  - `products`: something that can be sold (name, description, image, price in dollars, and a
    `public`/`private` status; new products start as `private`).
  - `course_products`: links courses to products (a product can include several courses, and a
    course can appear in several products).
- Validation of the database environment variables at startup.

Not done yet: the database connection (`src/drizzle/db.ts` and `src/drizzle/schema.ts` are empty
placeholders), migrations, pages, authentication, the UI library and payments.

## Getting started

**Requirements:** [Node.js](https://nodejs.org) and npm. A local PostgreSQL server is needed once you
start using the database tooling.

```bash
# 1. Install the dependencies
npm install

# 2. Create a .env file in the project root with your local database settings
#    (the file is ignored by Git, so your password stays private)
DATABASE_HOST=localhost
DATABASE_NAME=course_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password-here

# 3. Start the development server
npm run dev
```

Then open <http://localhost:3000>.

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with live reload |
| `npm run build` | Creates an optimized production build |
| `npm run start` | Runs the production build |
| `npm run lint` | Checks the code with ESLint |

## Project structure

```text
.
├── docs/                      Beginner-friendly guides (see below)
├── drizzle.config.ts          Settings for drizzle-kit (migrations)
├── next.config.ts             Next.js settings
├── public/                    Static files
└── src/
    ├── app/                   Pages and layouts (Next.js App Router)
    ├── data/env/              Validated environment variables (server / client)
    └── drizzle/
        ├── db.ts              Database connection (to be written)
        ├── schema.ts          Entry point that collects all tables (to be written)
        ├── schemaHelpers.ts   Shared columns: id, createdAt, updatedAt
        └── schema/            One file per table: course, product, courseProduct
```

## Documentation

The `docs/` folder holds numbered guides written for beginners:

1. [`00001-setup-commands.md`](docs/00001-setup-commands.md): the commands used to start the project
   (`create-next-app`, `npm install`, Git) and what each one does.
2. [`00002-drizzle-and-the-drizzle-folder.md`](docs/00002-drizzle-and-the-drizzle-folder.md): what
   Drizzle is, and a file-by-file tour of the database code.
3. [`00003-typescript-basics-oop-and-patterns.md`](docs/00003-typescript-basics-oop-and-patterns.md):
   TypeScript from the basics to classes, OOP and design patterns.

## A note on Next.js

This project uses a **canary** (pre-release) version of Next.js, whose APIs can differ from what most
tutorials and older documentation describe. The version-matched docs ship inside the package, in
`node_modules/next/dist/docs/`; check them first when something behaves unexpectedly. See also
`AGENTS.md` for guidance aimed at AI coding assistants.
