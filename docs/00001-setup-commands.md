# 00001 — The commands we used to start this project

> **Who this is for:** an absolute beginner. No coding knowledge assumed.
> **What you'll learn:** what every command we ran at the very beginning does, why we ran it, and what
> it left behind in the project folder.

---

## 0. A quick note on honesty

Some of these commands I can **see** in the project's history (for example the `git` commits and the
list of installed libraries in `package.json`). The exact words typed in the tutorial for the
`npm install` step I had to **reconstruct** from `package.json`, because the terminal history is not
saved in the repo. The end result is identical, so you can trust the explanation. Where I reconstructed
something, I say so.

---

## 1. The big picture (read this first)

Building a website like a course platform means stacking several tools on top of each other:

| Layer | Tool | What it does in plain words |
|---|---|---|
| The website itself | **Next.js** + **React** | Draws the pages you see in the browser and runs the server code behind them |
| The language | **TypeScript** | JavaScript with "spell-check" (it warns you when you mix up types of data) |
| The look | **Tailwind CSS** (and later **shadcn/ui**) | Styling and ready-made buttons, forms, etc. |
| The storage | **PostgreSQL** + **Drizzle** | The database (where courses, users, etc. are saved) and the tool that talks to it |
| The money | **Stripe** (later) | Takes payments |

Every one of those tools is a **package** — a bundle of code someone else wrote and shared publicly. You
download packages with a program called **npm**. Most of the commands below are just "download this
package" or "run this package's tool".

---

## 2. Before the first command: what you need installed

You need two things on your computer:

1. **Node.js** — lets your computer run JavaScript outside of a browser. Next.js needs it.
2. **npm** — "Node Package Manager". It is installed automatically together with Node.js.

You can check that they exist by typing these in a terminal:

```bash
node --version
npm --version
```

Each prints a version number (like `v22.x.x`). If you get "command not found", install Node.js first
from <https://nodejs.org>.

> **What is a terminal?** A text window where you type commands instead of clicking. You are using one
> right now (PowerShell on Windows). You type a command, press Enter, the computer runs it.

---

## 3. Command #1 — creating the project

```bash
npx create-next-app@canary .
```

This is the command from the start of the tutorial. Let's take it apart word by word:

| Piece | Meaning |
|---|---|
| `npx` | "Download this tool temporarily and run it once." It comes with npm. You don't have to install `create-next-app` permanently. |
| `create-next-app` | The tool made by the Next.js team. It builds a brand-new, ready-to-run Next.js project for you (like a house builder that hands you a house with the walls already up). |
| `@canary` | Which **version** to use. `canary` means "the newest, still-being-tested version". Normal people use `@latest` (the stable one). The tutorial uses canary to get the newest features. Your `package.json` shows `next` at `16.4.0-canary.54` — that `-canary.54` is this. |
| `.` | A single dot means **"this folder, right here"**. Without it, the tool would create a new subfolder. With it, the project is built directly inside `course-platform-project`. |

### The questions it asks

While it runs, `create-next-app` asks you yes/no questions (use TypeScript? use Tailwind? ...). I can't
see your exact answers, but the files in the project tell the story:

- **TypeScript: yes** — there is a `tsconfig.json` and files end in `.ts` / `.tsx`.
- **ESLint: yes** — there is an `eslint.config.mjs` (a "grammar checker" for code).
- **Tailwind CSS: yes** — `tailwindcss` is in `package.json`.
- **App Router: yes** — pages live in an `app/` folder (this is the modern way of building pages in
  Next.js).

### What it created

Right after this command, the first commit in the history (`Initial commit from Create Next App`)
contains these files:

| File / folder | What it is |
|---|---|
| `package.json` | **The shopping list of the project.** Name, scripts you can run, and every package the project depends on. The most important file to know. |
| `package-lock.json` | The **exact** versions that were actually downloaded, so everyone who clones the project gets the same thing. You never edit it by hand. |
| `app/` (now `src/app/`) | Your website's pages. `page.tsx` is the home page, `layout.tsx` is the frame around every page (the `<html>` and `<body>` parts), `globals.css` is the site-wide styling. |
| `public/` | Static files served as-is (images, icons). |
| `next.config.ts` | Settings for Next.js itself. |
| `tsconfig.json` | Settings for TypeScript. |
| `eslint.config.mjs` | Settings for ESLint. |
| `.gitignore` | A list of things Git should **not** save (e.g. `node_modules`, `.env` files with passwords). |
| `README.md` | The default welcome text. |
| `AGENTS.md` | Instructions for AI coding assistants like the one helping you now. Next.js generates this one. |

And two folders appear that are **not** saved in Git because they're generated:

- `node_modules/` — the downloaded packages (can be hundreds of megabytes; it's the "warehouse").
  It is listed in `.gitignore`.
- `.next/` — a cache that Next.js builds while running. Also ignored by Git.

> **Tip:** if `node_modules` is ever deleted or broken, the command `npm install` (no package name)
> re-downloads everything listed in `package.json`.

---

## 4. Command #2 — running the project

Inside `package.json` there is a section called `"scripts"`. These are **shortcuts**:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

You run a shortcut with `npm run <name>`:

| Command | What it does | When you use it |
|---|---|---|
| `npm run dev` | Starts a **development** server at <http://localhost:3000>. Every time you save a file, the page in the browser updates by itself. | All the time while building. |
| `npm run build` | Prepares an optimized **production** version of the site. | Before deploying to the internet. |
| `npm run start` | Runs the production version you just built. | After `build`, to test it locally. |
| `npm run lint` | Runs ESLint to find mistakes and bad style in the code. | Now and then, and before committing. |

(For the special name `start`, `npm start` also works, but `npm run dev` always needs the `run`.)

To stop the dev server, click the terminal and press **Ctrl + C**.

> **What is `localhost:3000`?** `localhost` means "this very computer". `3000` is the "door number"
> (port). So the address means: "the website that is running on my own machine, door 3000".

---

## 5. Command #3 — installing libraries with `npm install`

Our commit `feat: installed dependencies; created schemas` added five new packages. The general shape of
the command is:

```bash
npm install <package-name>
```

This does three things: downloads the package into `node_modules/`, adds it to `package.json`, and
updates `package-lock.json`.

Reconstructed from `package.json` (the exact words in the tutorial may have been split differently, the
result is the same):

```bash
npm install drizzle-orm pg zod @t3-oss/env-nextjs
npm install -D drizzle-kit
```

You can list several packages in a row, separated by spaces.

### Normal vs dev dependencies (`-D`)

- `npm install something` → goes under **`dependencies`**: needed by the app **while it runs**.
- `npm install -D something` (long form `--save-dev`) → goes under **`devDependencies`**: only needed
  **while you are building** the project (tools, checkers, type definitions).

`drizzle-kit` is a tool for *you*, the developer, not something the finished website runs, so it's `-D`.

### What each package is

| Package | Type | Plain-words explanation |
|---|---|---|
| `drizzle-orm` | normal | The main Drizzle library: you describe your database tables in TypeScript and write queries in TypeScript. **Explained in detail in document `00002`.** |
| `drizzle-kit` | dev | Drizzle's command-line companion: it turns your table descriptions into real changes in the database (these changes are called *migrations*). Also **explained in `00002`**. |
| `pg` | normal | The "driver" for PostgreSQL: the low-level piece that actually opens a connection to the database and sends messages over it. Drizzle uses it under the hood. |
| `zod` | normal | A **validation** library. It lets you say "this value must be a non-empty text" or "this must be a number", and it checks that for you. |
| `@t3-oss/env-nextjs` | normal | Checks that your **environment variables** (secret settings like the database password) exist and look right, and gives you an error at startup if one is missing. It uses `zod` to do the checking. |

> **What is an environment variable?** A setting that lives *outside* your code, usually in a file
> called `.env` (or `.env.local`). Passwords and secret keys go there so they never end up on GitHub.
> That's why `.gitignore` contains the line `.env*`.
>
> You'll create this file yourself. For this project it needs four values (see `src/data/env/server.ts`):
> `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_PASSWORD`, `DATABASE_USER`.

A small heads-up: `pg` is plain JavaScript, so TypeScript may complain that it has no type
information. If you ever see an error like *"Could not find a declaration file for module 'pg'"*, the fix
is `npm install -D @types/pg`. (It is not installed yet. Don't worry about it until you see the error.)

### Packages that came with the project from the start

You didn't install these yourself — `create-next-app` did:

- `next`, `react`, `react-dom` — the framework and the UI library.
- `typescript`, `@types/node`, `@types/react`, `@types/react-dom` — TypeScript and its "dictionaries"
  describing the other libraries.
- `tailwindcss`, `@tailwindcss/turbopack` — styling.
- `eslint`, `eslint-config-next` — the code checker.

### A note on version numbers

In `package.json` you see things like `"zod": "^4.6.5"`. The `^` means "this version or any newer
compatible one". `4.6.5` reads as MAJOR.MINOR.PATCH — a jump in the first number (4 → 5) can break
things; the other two are usually safe.

---

## 6. Command #4 — saving your work with Git

**Git** is a "save history" tool for code. Every save is called a **commit** and has a short message
describing it. You can see the two commits of this project with:

```bash
git log --oneline
```

```
d3e459e feat: installed dependencies; created schemas
8efef2a Initial commit from Create Next App
```

The commands behind such a history are:

| Command | What it does |
|---|---|
| `git status` | Shows what changed since the last save. Safe to run any time. |
| `git add .` | "Put everything that changed into the next save." (`.` = everything here.) |
| `git commit -m "message"` | Make the save, with a message. |
| `git log --oneline` | Show the list of saves. |
| `git push` | Upload your saves to GitHub (or another online copy). |

Your first commit was created by `create-next-app` itself (it runs `git init` and commits for you), and
the second one you made after installing the packages and creating the Drizzle files.

The `feat:` at the start of the message is a convention called **Conventional Commits**: a short label
that says what kind of change it is (`feat` = new feature, `fix` = bug fix, `docs` = documentation,
`chore` = housekeeping).

---

## 7. Things the project already did that you may notice

Comparing the two commits shows a few manual changes made by the tutorial after the first commit:

1. **The `app` folder was moved into `src/`** → pages are now at `src/app/...`. Many people like to keep
   all code inside `src` so the project root only holds config files.
2. **`next.config.ts`** got `authInterrupts: true` added (a new, experimental Next.js feature for
   handling "you must log in" situations).
3. **New folders** `src/data/env/` (environment variable checks) and `src/drizzle/` (database).

> ⚠️ **Heads-up (worth checking later):** `tsconfig.json` still says `"paths": { "@/*": ["./*"] }`.
> That line lets you write imports like `@/something` as a shortcut. Since the code is now inside
> `src`, that shortcut normally needs to point to `./src/*`. If imports starting with `@/` don't work
> later, this is the place to look. (It has no effect yet because nothing uses `@/` so far.)

---

## 8. What's coming next (so the names don't surprise you)

- **shadcn/ui** — you'll add it with a command like `npx shadcn@latest init`; it copies ready-made,
  nicely styled components (buttons, forms, dialogs) *into your project* so you own the code.
- **Stripe** — added with `npm install stripe` when we reach payments.
- **Drizzle commands** — `drizzle-kit generate`, `migrate`, `studio`... usually wrapped in `npm run`
  shortcuts you'll add to `package.json`. See `00002`.

---

## 9. Cheat sheet

```bash
node --version                         # is Node installed?
npx create-next-app@canary .           # create the project in this folder
npm install                            # download everything listed in package.json
npm install <pkg>                      # add a library the app needs
npm install -D <pkg>                   # add a developer-only tool
npm run dev                            # start the site at http://localhost:3000
npm run build                          # production build
npm run lint                           # check the code for problems
git status                             # what changed?
git add .                              # stage everything
git commit -m "feat: what I did"       # save a snapshot
git log --oneline                      # list the saves
```

### Mini glossary

- **Package / library / dependency** — code written by others that you download and use.
- **npm** — the program that downloads packages.
- **npx** — runs a package's tool without permanently installing it.
- **Terminal** — the text window where you type commands.
- **Port** — the "door number" a program listens on (3000 here).
- **Environment variable** — a setting kept outside the code (secrets live here).
- **Commit** — one saved snapshot in Git's history.
- **Canary** — the newest, less-stable release channel of a package.

Next: **`00002-drizzle-and-the-drizzle-folder.md`**.
