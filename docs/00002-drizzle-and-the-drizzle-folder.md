# 00002 — What is Drizzle, and what's inside the `drizzle` folder?

> **Who this is for:** an absolute beginner.
> **What you'll learn:** what a database is, what Drizzle does for you, and what every file in
> `src/drizzle/` (plus the two files connected to it) is for.

Previous: `00001-setup-commands.md`.

---

## 1. First, the problem Drizzle solves

### What is a database?

A website needs to **remember** things: courses, products, who bought what. That memory is a
**database**. Ours is **PostgreSQL** (people say "Postgres"): a program running on a server that stores
data in **tables** — think of Excel sheets:

**Table `courses`**

| id | name | description | createdAt | updatedAt |
|---|---|---|---|---|
| 8f3c… | Intro to React | Learn the basics | 2026-10-01 | 2026-10-01 |
| a21b… | Advanced SQL | Joins and more | 2026-10-02 | 2026-10-02 |

- A **table** = one kind of thing (courses, products...).
- A **column** = one property (name, description...).
- A **row** = one actual item (one course).

### How do you talk to a database?

In a language called **SQL**:

```sql
SELECT name FROM courses WHERE name = 'Intro to React';
```

Writing SQL by hand inside TypeScript has two annoyances:

1. It's just **text**. A typo like `nmae` isn't noticed until the app runs and crashes.
2. TypeScript can't know what shape the answer has.

### Enter Drizzle

**Drizzle is an ORM** ("Object-Relational Mapper"): a translator between your TypeScript code and the
database. You describe your tables **in TypeScript**, and then write queries **in TypeScript**, which
Drizzle turns into SQL for you. Because TypeScript knows your tables, your editor autocompletes column
names and warns you about mistakes *before* you run anything.

Roughly (you'll write this later in the tutorial, it's not in the project yet):

```ts
// instead of the SQL text above:
const result = await db.select({ name: CourseTable.name }).from(CourseTable);
```

Drizzle comes as **two packages** that you installed in `00001`:

| Package | Nickname | Job |
|---|---|---|
| `drizzle-orm` | "the library" | Used **by your app while it runs**: defines tables (`pgTable`, `text`, ...) and runs queries. |
| `drizzle-kit` | "the toolbox" | Used **by you in the terminal**: reads your table descriptions and creates/updates the real tables in Postgres. |

And a third helper, `pg`, is the driver that physically connects to Postgres.

---

## 2. The workflow you'll follow with Drizzle

1. **Describe** your tables in TypeScript (the *schema*). ← *we've done this part already*
2. **Connect** to the database (`db.ts`). ← *file exists but is still empty*
3. **Generate a migration:** `drizzle-kit` compares your description with the database and writes a
   `.sql` file with the needed changes. (*migration* = a recorded step that changes the database
   structure, like "create table courses".)
4. **Apply the migration** to the database (`drizzle-kit migrate`), or push directly during development
   (`drizzle-kit push`).
5. **Use** `db` in your pages and server code to read and write data.

Whenever you change a table later (add a column, etc.), you repeat steps 1 → 3 → 4.

---

## 3. The map of the folder

```
course-platform-project/
├── drizzle.config.ts          ← settings for drizzle-kit (project root)
└── src/
    ├── data/env/
    │   ├── server.ts          ← checks the DATABASE_* secrets exist
    │   └── client.ts          ← (empty for now)
    └── drizzle/
        ├── db.ts              ← the database connection        (empty for now)
        ├── schema.ts          ← the "front door" of the schema (empty for now)
        ├── schemaHelpers.ts   ← reusable columns: id, createdAt, updatedAt
        └── schema/
            ├── course.ts          ← table "courses"
            ├── product.ts         ← table "products" (+ a status list)
            └── courseProduct.ts   ← table "course_products" (links the two)
```

Two files are **empty on purpose** right now (`db.ts`, `schema.ts`). The tutorial fills them in a later
step, so an empty file isn't a mistake.

---

## 4. The tables we designed (the big picture)

Our platform sells **products**, and a product can contain one or more **courses**. For example, a
"Full-Stack Bundle" product might include the React course and the SQL course; and the React course can
also appear in other bundles. That's a **many-to-many** relationship, and databases model it with a
third, "bridge" table:

```
  courses                course_products                products
┌───────────┐          ┌──────────────────┐          ┌────────────────┐
│ id        │◄─────────│ courseId         │          │ id             │
│ name      │          │ productId        │─────────►│ name           │
│ descript… │          │ createdAt        │          │ description    │
│ createdAt │          │ updatedAt        │          │ imageUrl       │
│ updatedAt │          └──────────────────┘          │ priceInDollars │
└───────────┘           (one row = "this course      │ status         │
                         is in this product")        │ createdAt      │
                                                     │ updatedAt      │
                                                     └────────────────┘
```

One row in `course_products` says "course X belongs to product Y".

---

## 5. File by file

### 5.1 `src/drizzle/schemaHelpers.ts` — columns we reuse everywhere

Every table needs an id and "created / updated" dates. Instead of copy-pasting them into each table,
we define them **once** here:

```ts
export const id = uuid().primaryKey().defaultRandom();
export const createdAt = timestamp({ withTimezone: true }).notNull().defaultNow();
export const updatedAt = timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
```

Reading each chain from left to right:

- **`id`**
  - `uuid()` — the column holds a UUID: a long random-looking code such as
    `8f3c2a1e-...`. They're better than 1, 2, 3 because they can't be guessed and are unique everywhere.
  - `.primaryKey()` — this column **identifies the row**. No two rows may share it.
  - `.defaultRandom()` — if you don't provide one, the database invents a random UUID itself.
- **`createdAt`**
  - `timestamp({ withTimezone: true })` — a date-and-time column that remembers the time zone (a good
    habit for any app used from different places).
  - `.notNull()` — it can never be empty.
  - `.defaultNow()` — when a row is created, fill it with the current time automatically.
- **`updatedAt`** — same, plus `.$onUpdate(() => new Date())`: whenever a row is updated *through
  Drizzle*, set it to the current time again. (This is done by Drizzle in your code, not by a Postgres
  trigger, so edits made directly in the database wouldn't touch it.)

### 5.2 `src/drizzle/schema/course.ts` — the `courses` table

```ts
export const CourseTable = pgTable("courses", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    createdAt,
    updatedAt,
})
```

- `pgTable("courses", {...})` — "define a **Postgres table** named `courses`". The text `"courses"` is
  the name in the database; `CourseTable` is the name you'll use in your TypeScript code.
- `id`, `createdAt`, `updatedAt` — the shared columns from the helpers file.
- `name` and `description` — `text()` columns (any length of text) that `.notNull()` (can't be empty).

Below it there's:

```ts
export const ProductTableRelations = relations(CourseTable,
    ({ many }) => ({
    courseProducts: many(CourseProductTable),
}))
```

This is a **relation**, which is easy to confuse with a database link, so let's be precise:

| | What it is | Where it lives |
|---|---|---|
| `.references(...)` | A real **foreign key** — the database itself enforces it. | In the database. |
| `relations(...)` | A **hint for Drizzle** so you can later write "give me the course *with* its products" in one query. | Only in your TypeScript. The database never sees it. |

Here: "one course has **many** `courseProducts` rows".

> ⚠️ **Probable typo to fix.** In `course.ts` this variable is called `ProductTableRelations`, but it
> describes the *course* table. `product.ts` has a variable with the **same name**. Each file is fine
> alone, but once `schema.ts` re-exports both (see 5.6), TypeScript will complain that two exports
> have the same name. The name here should most likely be `CourseTableRelations`. (I didn't change it
> for you — compare with the tutorial first.)

### 5.3 `src/drizzle/schema/product.ts` — the `products` table

```ts
export const productStatuses = ["public", "private"] as const;
export type ProductStatus = (typeof productStatuses)[number];
export const productStatusEnum = pgEnum("product_status", productStatuses);
```

This creates an **enum**: a column that may only contain one of a fixed list of values — here
`"public"` or `"private"`. Step by step:

1. `productStatuses` — the allowed values. `as const` tells TypeScript "treat these exact words as fixed,
   not as just any text".
2. `ProductStatus` — a **TypeScript type** automatically derived from that list: `"public" | "private"`.
   You'll use it for variables and function parameters, so a typo like `"publc"` is caught immediately.
3. `productStatusEnum` — the same list registered as a real **Postgres enum** called `product_status`,
   so the database also refuses any other value.

```ts
export const ProductTable = pgTable("products", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    imageUrl: text().notNull(),
    priceInDollars: integer().notNull(),
    status: productStatusEnum().notNull().default("private"),
    createdAt,
    updatedAt,
})
```

- `imageUrl` — the web address of the product picture (stored as text).
- `priceInDollars: integer()` — a whole number. Prices are stored as whole numbers (not `19.99`) to avoid
  the tiny rounding errors computers make with decimals. Note the name says **Dollars**, so this holds
  whole dollars. (Many Stripe-based apps store *cents* instead — worth keeping in mind when we reach
  payments.)
- `status` — uses the enum above; `.default("private")` means new products start hidden until someone
  makes them public.

The `relations(ProductTable, ...)` at the bottom says: one product has **many** `courseProducts`.

### 5.4 `src/drizzle/schema/courseProduct.ts` — the bridge table

```ts
export const CourseProductTable = pgTable("course_products", {
    courseId: uuid()
        .notNull()
        .references(() => CourseTable.id, { onDelete: "restrict" }),
    productId: uuid()
        .notNull()
        .references(() => ProductTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
}, t => [primaryKey({ columns: [t.courseId, t.productId] })]
)
```

This table has **no `id` column** of its own. Let's see why and what the rest means:

- `courseId` / `productId` — each holds the UUID of a course / a product.
- **`.references(() => CourseTable.id, ...)`** — makes it a **foreign key**: the database guarantees that
  the value *really exists* in the `courses` table. You can't link a product to a course that doesn't
  exist.
- **`onDelete`** — what happens to this row when the thing it points to is deleted:
  - `"restrict"` on `courseId`: **you can't delete a course** that is still included in some product.
    This protects customers who paid for it.
  - `"cascade"` on `productId`: if a product is deleted, **its link rows are deleted automatically**
    (the courses themselves stay).
- **`primaryKey({ columns: [courseId, productId] })`** — a **composite primary key**: the *pair* is the
  identity. So the same course can't be linked to the same product twice, and there's no need for a
  separate `id`.
- `t => [ ... ]` — the third argument of `pgTable` is a function that receives the table's columns (`t`)
  and returns extra rules, like this key.

Below it, `relations(CourseProductTable, ({ one }) => ...)` tells Drizzle that each row points to **one**
course and **one** product. Here we tell it *which* columns link them: `fields` (my column) →
`references` (their column).

> 🔁 A curiosity: `course.ts` and `courseProduct.ts` import each other (a "circular import"). Normally
> that's a red flag, but it works here because each one only uses the other **inside a function**
> (`() => ...`), which runs later, once everything has loaded. This is why you see so many `() =>` in
> Drizzle schemas.

### 5.5 `src/drizzle/db.ts` — the connection (empty for now)

Later this file will create the single `db` object the whole app uses: it combines the `pg` driver, the
credentials from `env`, and the schema. Every query will start with `db.`. (Drizzle's table names are
used there too, so it will import `schema.ts`.)

### 5.6 `src/drizzle/schema.ts` — the front door (empty for now)

This file will **re-export** all the table files in one place, something like:

```ts
export * from "./schema/course";
export * from "./schema/product";
export * from "./schema/courseProduct";
```

Why it matters: `drizzle.config.ts` (next section) points at **this** file to know which tables exist.
**While it's empty, `drizzle-kit` sees no tables**, so generating migrations right now would produce
nothing. Fill it in before the first `generate`.

---

## 6. The two connected files (outside the drizzle folder)

### 6.1 `drizzle.config.ts` (project root) — settings for `drizzle-kit`

```ts
export default defineConfig({
    out: "./src/drizzle/migrations",
    schema: "./src/drizzle/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: { host, database, password, user, ssl: false }
});
```

It's the control panel for the toolbox. Line by line:

| Setting | Meaning |
|---|---|
| `out` | **Where migration files will be written.** The folder `src/drizzle/migrations` doesn't exist yet; it appears after your first `generate`. Commit its contents to Git. |
| `schema` | **Which file describes your tables** (the front door, 5.6). |
| `dialect` | Which database flavour: `"postgresql"`. |
| `strict` | Ask for confirmation before running risky changes (like dropping data). |
| `verbose` | Print every SQL statement being run, so you can learn from it. |
| `dbCredentials` | How to log in to the database: host, database name, user, password. `ssl: false` = no encrypted connection, fine for a database on your own computer. |

The credentials are not typed here: they come from `env`, explained next.

### 6.2 `src/data/env/server.ts` — checks your secrets

```ts
export const env = createEnv({
  server: {
    DATABASE_HOST: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_USER: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});
```

- It uses `@t3-oss/env-nextjs` (+ `zod`) from `00001`.
- `z.string().min(1)` = "must be text with at least 1 character", i.e. **not missing and not empty**.
- `process.env` is where Node.js keeps the environment variables (from your `.env` file).
- Any other file can then `import { env } from ...` and use `env.DATABASE_HOST`, with autocompletion
  and a guarantee the value is there. If one is missing, the app **refuses to start** with a clear
  message instead of failing mysteriously later.
- The `server` folder-name matters: these values are secrets and must **never** be sent to the browser.
  `client.ts` is for values that are safe for the browser; it's empty for now.

**You still need to create the `.env` file** (in the project root) with your own local database
details, for example:

```bash
DATABASE_HOST=localhost
DATABASE_NAME=course_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password-here
```

This file is ignored by Git (`.env*` in `.gitignore`), so your password stays private. Never paste real
passwords in documents or commits.

---

## 7. Commands you'll meet soon

You'll likely add shortcuts to `package.json`'s `"scripts"` (they aren't there yet):

| Command | What it does |
|---|---|
| `npx drizzle-kit generate` | Compares your schema to the previous state and **writes a new SQL migration file** in `out`. Nothing touches the database yet. |
| `npx drizzle-kit migrate` | **Runs** the pending migration files on the database. |
| `npx drizzle-kit push` | Shortcut for development: applies the schema directly, with no migration files. Quick, but leaves no history. |
| `npx drizzle-kit studio` | Opens a web page to browse and edit your data like a spreadsheet. Great for learning. |

Wrapped as `npm run db:generate` and so on, they are shorter to type and easier to remember.

---

## 8. A few more things worth knowing

- **Column names in the database.** In the schema, columns like `createdAt` are written without a
  name (`timestamp()`), so Drizzle uses the TypeScript property name. Many projects add a `casing`
  option (`"snake_case"`) in `db.ts` and `drizzle.config.ts` so the database gets `created_at` while your
  code keeps `createdAt`. If the tutorial adds that, now you know why.
- **Naming style used here.** Tables are named `CourseTable`, `ProductTable`, ... (TypeScript side) while
  the real tables are lowercase plurals (`courses`, `products`, `course_products`). That keeps the two
  worlds easy to tell apart.
- **Where is "users" and "purchases"?** Not yet — the tutorial adds more tables as the app grows. The
  same recipe applies: one file in `src/drizzle/schema/`, one `export *` line in `schema.ts`, then
  generate and migrate.

---

## 9. Mini glossary

- **ORM** — translator between your code and the database.
- **Schema** — the description of all your tables and columns.
- **Table / column / row** — a sheet / a property / one item.
- **Primary key** — the column(s) that uniquely identify a row.
- **Foreign key** — a column that points to a row in another table (`.references`).
- **Many-to-many** — each A can relate to many Bs and vice-versa; needs a bridge table.
- **Enum** — a column that accepts only a fixed list of values.
- **Migration** — a recorded change to the database structure.
- **Driver (`pg`)** — the piece that actually talks to Postgres.
- **Environment variable** — a setting kept outside the code, in `.env`.
- **UUID** — a long unique random identifier.
