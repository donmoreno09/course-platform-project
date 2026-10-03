# 00003 — TypeScript from zero: basics, objects, classes, OOP and design patterns

> **Who this is for:** an absolute beginner.
> **What you'll learn:** what TypeScript is, how the language works (variables, functions, loops,
> objects), how classes and object-oriented programming (OOP) work, and a first tour of design patterns.
> **How to use it:** read a section, then **type the examples yourself** (see section 1.3 for how to run
> them). Reading code is not the same as writing it.

Previous: `00002-drizzle-and-the-drizzle-folder.md`.

---

## 1. What is TypeScript?

### 1.1 The one-sentence answer

**TypeScript = JavaScript + types.**

- **JavaScript (JS)** is the programming language every web browser understands, and the one Node.js
  runs on a server. Next.js and React are written in it.
- **Types** are labels that say *what kind of data* something is: a number, a piece of text, a course
  object...
- **TypeScript (TS)** is JavaScript plus those labels. Every valid JavaScript program is also a valid
  TypeScript program; TS only *adds* things.

### 1.2 Why bother with the labels?

Plain JavaScript lets you do silly things and only tells you **when the program is already running**
(often in front of a customer). TypeScript tells you **while you are typing**, with a red underline in
your editor:

```ts
const price: number = 20;

// @ts-expect-error  → TypeScript complains here: a string is not a number
const total = price * "two";
```

Think of it as a spell-checker for code. Benefits:

1. **Mistakes are caught early** (typos in names, wrong kind of data, forgotten cases).
2. **Autocomplete** in your editor: it *knows* what properties an object has.
3. **Code explains itself:** a function's signature tells you what goes in and what comes out.
4. **Safe refactoring:** rename something and the editor shows everything that breaks.

This is exactly why Drizzle (document `00002`) is pleasant: your tables are typed, so a wrong column name
is a red underline, not a crash.

### 1.3 How TypeScript runs (important to understand)

Browsers and Node don't run TypeScript directly. A tool **removes the types** and leaves plain
JavaScript:

```text
 your-file.ts  ──(compiler / type-stripper)──►  plain JavaScript  ──►  runs
      ▲                    │
      │                    └─ checks types, reports errors
   you write this
```

Two important consequences:

- **Types exist only while you write and build.** At runtime they're gone. You cannot ask "is this a
  `Course`?" at runtime using a type; you check real values (see `typeof`, `instanceof` below).
- **In this project you don't compile by hand.** Next.js does it for you when you run `npm run dev`.
  To only *check* types without running anything:

```bash
npx tsc --noEmit
```

(`tsc` = the TypeScript compiler; `--noEmit` = "just check, don't write any output files".)

**How to try the examples in this document:**

- Easiest, nothing to install: the online **TypeScript Playground** at <https://www.typescriptlang.org/play>.
  Paste code on the left, see errors and the JS result on the right.
- On your computer: create a file `scratch.ts` **outside** `src/` (so it doesn't mix with the app) and run
  `npx tsx scratch.ts` (`tsx` is a tool that runs TypeScript directly; npx downloads it on first use).

### 1.4 Files and settings in this project

| Thing | Where | Meaning |
|---|---|---|
| `.ts` | e.g. `src/drizzle/schema/course.ts` | TypeScript file with no HTML-like syntax |
| `.tsx` | e.g. `src/app/page.tsx` | TypeScript file that also contains **JSX** (HTML-like tags inside code, used by React) |
| `tsconfig.json` | project root | The compiler's settings |
| `"strict": true` | in `tsconfig.json` | Turns on the **strictest and most useful** checks. Keep it on. |

Everything below assumes `strict` mode, like your project.

---

## 2. The basics

### 2.1 Variables: `const`, `let` (never `var`)

```ts
const siteName = "Course Platform"; // const: cannot be reassigned
let visitors = 0;                   // let: can be reassigned
visitors = visitors + 1;

// @ts-expect-error  → cannot reassign a const
siteName = "Other";
```

Rule of thumb: **use `const` by default**, `let` only when the value must change. Avoid the old `var`.

### 2.2 The basic types

```ts
const title: string = "Intro to React";      // text
const lessons: number = 24;                   // any number (whole or decimal)
const isPublished: boolean = true;            // true or false
const nothing: null = null;                   // "deliberately empty"
const notSet: undefined = undefined;          // "no value was given"
const big: bigint = 9007199254740993n;        // huge whole numbers (rarely needed)
```

Text can use backticks for **template strings** that insert values:

```ts
const course = "Intro to React";
const lessonCount = 24;
const message = `The course "${course}" has ${lessonCount} lessons.`;
console.log(message);
```

### 2.3 Type inference: you often don't have to write the type

TypeScript can **work out** the type from the value:

```ts
const city = "Rome";   // TS knows: string
let count = 5;         // TS knows: number

// @ts-expect-error  → count is a number, so a string is rejected
count = "five";
```

Style tip: let TS infer when it's obvious; write the type for function **parameters** and when the type
isn't clear from the value.

### 2.4 `any` and `unknown` — the escape hatches

```ts
let risky: any = "hello";
risky = 42;                // allowed: `any` switches the checking OFF
// risky.foo.bar();         // compiles, but would CRASH when run. Avoid `any`.

let safe: unknown = "hello";
// @ts-expect-error  → you can't use an `unknown` value until you check what it is
safe.toUpperCase();

if (typeof safe === "string") {
  console.log(safe.toUpperCase()); // OK: inside this `if`, TS knows it is a string
}
```

- **`any`** = "trust me" (turns off the safety). Avoid.
- **`unknown`** = "I don't know yet — make me check first". Prefer it.

### 2.5 Arrays and tuples

```ts
const titles: string[] = ["React", "SQL", "Next.js"];   // an array of strings
const prices: Array<number> = [10, 20, 30];             // same idea, other spelling

titles.push("Drizzle");
console.log(titles.length, titles[0]);                  // 4 "React"

// @ts-expect-error  → a number can't go into a string array
titles.push(5);

// A tuple: a fixed-length array where each position has its own type
const lesson: [string, number] = ["Variables", 12];
const [lessonTitle, minutes] = lesson;                  // "destructuring"
console.log(lessonTitle, minutes);
```

### 2.6 Union types and literal types

A **union** (`|`) means "one of these":

```ts
let id: string | number;
id = "abc-123";
id = 42;

// A literal type is a specific value used as a type:
type Status = "public" | "private";
let status: Status = "private";

// @ts-expect-error  → only "public" or "private" are allowed
status = "hidden";
```

This is the very same idea as `productStatuses` in your `product.ts`: a closed list of allowed values.

### 2.7 Narrowing: how TS follows your `if`s

```ts
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());  // here id is a string
  } else {
    console.log(id.toFixed(2));     // here id is a number
  }
}
printId("abc");
printId(3.14159);
```

### 2.8 `null`, `undefined` and the safe-access operators

With `strict`, a value that **might** be missing must be declared so, and you must handle it:

```ts
function findCourse(name: string): { name: string; lessons: number } | undefined {
  return name === "React" ? { name, lessons: 24 } : undefined;
}

const found = findCourse("SQL");

// @ts-expect-error  → `found` may be undefined
console.log(found.lessons);

console.log(found?.lessons);          // ?. "optional chaining": gives undefined instead of crashing
console.log(found?.lessons ?? 0);     // ?? "nullish coalescing": use 0 if the left side is null/undefined
if (found) {
  console.log(found.lessons);         // fine: we checked
}
```

- `?.` = "if it exists, go on; otherwise stop with `undefined`".
- `??` = "if the left is `null` or `undefined`, use the right".
- Beware of `||`: `0 || 5` gives `5` (because 0 is "falsy"), while `0 ?? 5` gives `0`.

### 2.9 Type aliases and interfaces

Both give a **name** to the shape of an object:

```ts
type Lesson = {
  title: string;
  minutes: number;
  videoUrl?: string;          // ? = optional (may be missing)
  readonly id: string;        // readonly = cannot be changed after creation
};

interface Product {
  id: string;
  name: string;
  priceInDollars: number;
}

const l: Lesson = { id: "l1", title: "Intro", minutes: 10 };
// @ts-expect-error  → readonly
l.id = "other";

// Interfaces can extend each other
interface DigitalProduct extends Product {
  downloadUrl: string;
}

// Types can combine with & (intersection)
type Timestamps = { createdAt: Date; updatedAt: Date };
type ProductRow = Product & Timestamps;
```

`type` vs `interface`: for objects they're nearly interchangeable. A practical rule: use `interface` for
object shapes and things classes will implement, `type` for unions (`"a" | "b"`), tuples and everything
else.

### 2.10 Enums vs "union of literals"

TypeScript has an `enum` keyword, but most modern projects (including this one) prefer a **list of
strings turned into a type**, which leaves no extra code at runtime:

```ts
const statuses = ["public", "private"] as const;     // as const: "keep these exact words"
type ProductStatus = (typeof statuses)[number];      // "public" | "private"

function isStatus(value: string): value is ProductStatus {
  return (statuses as readonly string[]).includes(value);
}
console.log(isStatus("public"), isStatus("secret"));  // true false
```

(That is precisely what `product.ts` does.) For reference, the enum syntax:

```ts
enum Role {
  Admin = "admin",
  Student = "student",
}
console.log(Role.Admin); // "admin"
```

### 2.11 Functions

```ts
// Declaration: types for the parameters and for what it returns
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function: very common in React and Drizzle code (`() => ...`)
const multiply = (a: number, b: number): number => a * b;

// Optional and default parameters
function greet(name: string, greeting = "Hello", suffix?: string): string {
  return `${greeting}, ${name}${suffix ?? "!"}`;
}
console.log(greet("Ada"), greet("Ada", "Hi", "?"));

// Rest parameters: any number of arguments collected in an array
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// A function that returns nothing has the return type `void`
function log(message: string): void {
  console.log(message);
}

// Functions are values: you can pass them around, with a function type
function applyTwice(fn: (n: number) => number, value: number): number {
  return fn(fn(value));
}
console.log(applyTwice((n) => n * 2, 5)); // 20
```

> **Why `() => ...` everywhere in Drizzle?** `.references(() => CourseTable.id)` passes a *function*
> instead of a value so that Drizzle can call it **later**, when `CourseTable` surely exists (see the
> note about circular imports in `00002`).

---

## 3. Objects

An **object** groups related data (and behavior) under names:

```ts
const course = {
  id: "c1",
  name: "Intro to React",
  lessons: 24,
  tags: ["react", "frontend"],
  teacher: { name: "Sam", email: "sam@example.com" },
};

console.log(course.name);            // dot notation
console.log(course["lessons"]);      // bracket notation (useful with a variable key)
course.lessons = 25;                 // changing a property is fine even though `course` is const
```

> `const` protects the **variable** from being reassigned, not the **contents** of the object.

### Methods (functions inside objects)

```ts
const counter = {
  value: 0,
  increment() {
    this.value += 1;
    return this.value;
  },
};
counter.increment();
console.log(counter.value); // 1
```

### Destructuring, spread, rest

```ts
const user = { name: "Ada", email: "ada@example.com", role: "student" };

// Destructuring: pull out the pieces you need
const { name, email } = user;
console.log(name, email);

// Rename and default value
const { role: userRole, age = 18 } = { role: "admin" } as { role: string; age?: number };
console.log(userRole, age);

// Spread (...): copy an object / array, optionally changing something
const updated = { ...user, role: "admin" };      // new object; `user` is untouched
const more = [...[1, 2], 3, 4];                  // [1, 2, 3, 4]
console.log(updated, more);

// Rest in destructuring: "everything else"
const { name: _unused, ...others } = user;
console.log(others);                             // { email, role }
```

Copying with spread (instead of changing the original) is the style React expects.

### Dictionaries: `Record` and index signatures

```ts
const priceByCourse: Record<string, number> = {   // keys are strings, values are numbers
  react: 49,
  sql: 39,
};
priceByCourse["next"] = 59;

for (const [key, value] of Object.entries(priceByCourse)) {
  console.log(key, value);
}
console.log(Object.keys(priceByCourse), Object.values(priceByCourse));
```

### Arrays of objects (what you'll handle all day)

```ts
type Item = { name: string; price: number; published: boolean };

const items: Item[] = [
  { name: "React", price: 49, published: true },
  { name: "SQL", price: 39, published: false },
  { name: "Next.js", price: 59, published: true },
];

const names = items.map((i) => i.name);                       // transform each → ["React", "SQL", "Next.js"]
const live = items.filter((i) => i.published);                // keep some
const total = items.reduce((sum, i) => sum + i.price, 0);     // fold into one value → 147
const sql = items.find((i) => i.name === "SQL");              // first match or undefined
const anyFree = items.some((i) => i.price === 0);             // true/false
const allLive = items.every((i) => i.published);              // true/false
const sorted = [...items].sort((a, b) => a.price - b.price);  // copy first, then sort
console.log(names, live.length, total, sql, anyFree, allLive, sorted[0]);
```

---

## 4. Control flow and loops

### 4.1 Conditions

```ts
const score = 72;

if (score >= 90) {
  console.log("A");
} else if (score >= 60) {
  console.log("Pass");
} else {
  console.log("Fail");
}

// Ternary: a one-line if/else that produces a value
const label = score >= 60 ? "Pass" : "Fail";

// Comparison: use === and !== (three equals). Avoid == and !=.
console.log(label, 5 === 5, "5" === 5 as unknown);   // "Pass" true false
```

`&&`, `||`, `!` mean AND, OR, NOT.

### 4.2 `switch`

```ts
type Plan = "free" | "pro" | "team";

function seats(plan: Plan): number {
  switch (plan) {
    case "free":
      return 1;
    case "pro":
      return 5;
    case "team":
      return 50;
  }
}
console.log(seats("pro"));
```

Bonus: because `Plan` has exactly three cases and all are covered, TypeScript knows the function always
returns. Add a fourth plan to the type and TS will immediately complain — a free safety net.

### 4.3 Loops

```ts
const names = ["Ada", "Linus", "Grace"];

// 1) Classic for: when you need the index
for (let i = 0; i < names.length; i++) {
  console.log(i, names[i]);
}

// 2) for...of: loops over the VALUES (the one you'll use most)
for (const n of names) {
  console.log(n);
}

// 3) for...in: loops over the KEYS of an object
const stock = { react: 3, sql: 0 };
for (const key in stock) {
  console.log(key, stock[key as keyof typeof stock]);
}

// 4) while: repeat as long as a condition is true
let countdown = 3;
while (countdown > 0) {
  console.log(countdown);
  countdown--;
}

// 5) do...while: always runs at least once
let tries = 0;
do {
  tries++;
} while (tries < 3);

// 6) Array methods (very common in React): forEach / map
names.forEach((n, index) => console.log(index, n));
const shouted = names.map((n) => n.toUpperCase());
console.log(shouted);

// break stops the loop, continue skips to the next round
for (const n of names) {
  if (n === "Linus") continue;
  if (n === "Grace") break;
  console.log(n);
}
```

> **Pitfall:** `for...in` is for object keys. For arrays use `for...of`.

---

## 5. Classes

A **class** is a **blueprint** for creating objects. The objects created from it are **instances**.

```ts
class Course {
  // properties (the data)
  name: string;
  lessons: number;

  // constructor: runs when you write `new Course(...)`
  constructor(name: string, lessons: number) {
    this.name = name;       // `this` = "the object being built / used"
    this.lessons = lessons;
  }

  // method (the behavior)
  describe(): string {
    return `${this.name} (${this.lessons} lessons)`;
  }
}

const react = new Course("Intro to React", 24);   // an instance
const sql = new Course("SQL", 12);                 // another, independent instance
console.log(react.describe(), sql.describe());
```

### Shorter: parameter properties

Putting a modifier (`public`, `private`, `readonly`) in the constructor parameter declares **and** assigns
the property in one go:

```ts
class Lesson {
  constructor(
    public readonly id: string,
    public title: string,
    private minutes: number,
  ) {}

  get duration(): string {                // a "getter": used like a property, `lesson.duration`
    return `${this.minutes} min`;
  }
}
const lesson = new Lesson("l1", "Variables", 12);
console.log(lesson.title, lesson.duration);
```

### Access modifiers

| Keyword | Who can use it |
|---|---|
| `public` (default) | Anyone |
| `private` | Only code **inside this class** (checked by TypeScript) |
| `protected` | This class **and its subclasses** |
| `readonly` | Can be set once (at creation), never changed |
| `#name` | **Truly** private at runtime too (JavaScript's own `#` private fields) |

### Static members, getters and setters

```ts
class Counter {
  static instances = 0;                  // belongs to the CLASS, not to each object
  #value = 0;                            // really private

  constructor() {
    Counter.instances++;
  }

  get value(): number {
    return this.#value;
  }

  set value(next: number) {              // a "setter": validation lives here
    if (next < 0) throw new Error("Value cannot be negative");
    this.#value = next;
  }

  static create(): Counter {             // called as Counter.create(), without `new`
    return new Counter();
  }
}

const c = Counter.create();
c.value = 5;
console.log(c.value, Counter.instances);

// @ts-expect-error  → #value is private
console.log(c.#value);
```

---

## 6. Object-Oriented Programming (OOP)

OOP is a way of organizing code around **objects** that bundle data and the functions that use it. It
rests on **four pillars**:

| Pillar | One-line meaning | Tools in TS |
|---|---|---|
| **Encapsulation** | Hide the insides, expose a small safe surface | `private`, `#`, getters/setters |
| **Abstraction** | Show *what* something does, hide *how* | `abstract` classes, interfaces |
| **Inheritance** | A class reuses and extends another | `extends`, `super` |
| **Polymorphism** | Same call, different behavior depending on the object | method overriding, interfaces |

### 6.1 Encapsulation

```ts
class BankAccount {
  #balance = 0;                               // nobody outside can touch this directly

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.#balance += amount;
  }

  withdraw(amount: number): void {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
  }

  get balance(): number {
    return this.#balance;                     // read-only from outside
  }
}

const account = new BankAccount();
account.deposit(100);
account.withdraw(30);
console.log(account.balance); // 70

// @ts-expect-error  → "balance" has a getter but no setter, so it is read-only
account.balance = 1_000_000;
```

The outside world can only use `deposit`/`withdraw`, so the rules (no negative amounts, no overdraft)
can't be bypassed.

### 6.2 Inheritance and the class hierarchy

```text
           Animal            ← base class (parent / superclass)
          /      \
        Dog      Cat         ← derived classes (children / subclasses)
         |
      Puppy                  ← a hierarchy can go several levels deep
```

```ts
class Animal {
  constructor(public name: string) {}

  speak(): string {
    return `${this.name} makes a sound`;
  }

  move(): string {
    return `${this.name} moves`;
  }
}

class Dog extends Animal {                    // Dog "is an" Animal
  constructor(name: string, public breed: string) {
    super(name);                              // call the parent's constructor FIRST
  }

  override speak(): string {                  // replace the parent's behavior
    return `${this.name} barks`;
  }

  fetch(): string {                           // new behavior only dogs have
    return `${this.name} fetches the ball`;
  }
}

class Puppy extends Dog {
  override speak(): string {
    return `${super.speak()} (squeakily)`;    // reuse the parent version with super.method()
  }
}

const rex = new Dog("Rex", "Labrador");
console.log(rex.speak(), rex.move(), rex.fetch());
console.log(new Puppy("Bit", "Beagle").speak()); // "Bit barks (squeakily)"

// instanceof checks the real class at runtime
console.log(rex instanceof Dog, rex instanceof Animal, rex instanceof Puppy); // true true false
```

Rule of thumb: inherit only when the sentence "**X is a Y**" is true (a Dog **is an** Animal). If it's
"X **has a** Y", use composition (see 6.6).

### 6.3 Polymorphism

*Poly-morph* = "many shapes". You treat different objects through the same parent type and each reacts
in its own way:

```ts
class Animal {
  constructor(public name: string) {}
  speak(): string {
    return `${this.name} makes a sound`;
  }
}
class Dog extends Animal {
  override speak(): string {
    return `${this.name} barks`;
  }
}
class Cat extends Animal {
  override speak(): string {
    return `${this.name} meows`;
  }
}

const zoo: Animal[] = [new Dog("Rex"), new Cat("Tom"), new Animal("Generic")];

for (const animal of zoo) {
  console.log(animal.speak());   // the SAME call; each object answers differently
}
// Rex barks / Tom meows / Generic makes a sound
```

The loop doesn't know (or care) which kind of animal it holds — that's what lets you add a `Bird` later
without touching the loop.

### 6.4 Abstract classes

An **abstract class** is a **half-finished blueprint**: it can't be instantiated itself; it defines a
common shape and forces subclasses to fill in the blanks.

```ts
abstract class Shape {
  constructor(public readonly name: string) {}

  abstract area(): number;                       // no body: every subclass MUST implement it

  describe(): string {                           // shared, already-written behavior
    return `${this.name} with area ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super("Circle");
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super("Rectangle");
  }
  area(): number {
    return this.width * this.height;
  }
}

// @ts-expect-error  → cannot create an instance of an abstract class
const nope = new Shape("Generic");

const shapes: Shape[] = [new Circle(2), new Rectangle(3, 4)];
shapes.forEach((s) => console.log(s.describe()));
```

A subclass that forgets `area()` is a compile error — that's the point.

### 6.5 Interfaces: a contract without any code

An `interface` only says *what* must exist. A class **`implements`** it:

```ts
interface PaymentProvider {
  readonly name: string;
  charge(amountInCents: number): string;
}

class StripeProvider implements PaymentProvider {
  readonly name = "Stripe";
  charge(amountInCents: number): string {
    return `Charged ${amountInCents} cents via Stripe`;
  }
}

class PayPalProvider implements PaymentProvider {
  readonly name = "PayPal";
  charge(amountInCents: number): string {
    return `Charged ${amountInCents} cents via PayPal`;
  }
}

// This function works with ANY provider: it only knows the contract
function checkout(provider: PaymentProvider, amount: number): void {
  console.log(`[${provider.name}]`, provider.charge(amount));
}

checkout(new StripeProvider(), 4900);
checkout(new PayPalProvider(), 4900);

// A class can implement several interfaces (but extend only ONE class)
interface Printable {
  print(): void;
}
interface Savable {
  save(): void;
}
class Report implements Printable, Savable {
  print() {
    console.log("printing");
  }
  save() {
    console.log("saving");
  }
}
new Report().print();
```

| | Abstract class | Interface |
|---|---|---|
| Can hold real code | Yes | No (just the shape) |
| Can hold data/state | Yes | No |
| A class can use | only **one** (`extends`) | **many** (`implements`) |
| Exists at runtime | Yes | No (erased) |

Choose an interface for a pure contract; an abstract class when subclasses should share code.

### 6.6 Composition over inheritance

Deep inheritance trees become rigid. Often it's better to **build objects out of smaller parts**
("has a") instead of "is a":

```ts
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class EnrollmentService {
  // It HAS a logger; it doesn't inherit from one. Easy to swap (e.g. for tests).
  constructor(private logger: Logger) {}

  enroll(student: string, course: string): void {
    this.logger.log(`${student} enrolled in ${course}`);
  }
}

new EnrollmentService(new ConsoleLogger()).enroll("Ada", "React");
```

Passing the dependency in through the constructor is called **dependency injection**.

### 6.7 SOLID in five lines

Five guidelines that make OOP code easier to change:

- **S**ingle responsibility: a class should have one reason to change.
- **O**pen/closed: add behavior by adding code (a new subclass), not by editing old code.
- **L**iskov substitution: a subclass must work anywhere its parent is expected.
- **I**nterface segregation: many small interfaces beat one giant one.
- **D**ependency inversion: depend on interfaces (contracts), not on concrete classes.

---

## 7. Generics: code that works for many types

A **generic** is a type placeholder (conventionally `T`) filled in at use time. It lets one piece of code
stay type-safe for different data.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([1, 2, 3]);          // TS infers T = number
const s = first(["a", "b"]);         // T = string
console.log(n, s);

// A generic class
class Stack<T> {
  private items: T[] = [];
  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
  get size(): number {
    return this.items.length;
  }
}

const numbers = new Stack<number>();
numbers.push(1);
// @ts-expect-error  → this stack only accepts numbers
numbers.push("two");

// A constraint: T must at least have an `id`
function byId<T extends { id: string }>(list: T[], id: string): T | undefined {
  return list.find((item) => item.id === id);
}
console.log(byId([{ id: "a", name: "A" }], "a")?.name);

// A generic type
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
const okResult: ApiResult<number> = { ok: true, data: 42 };
console.log(okResult);
```

You'll see generics constantly: `Promise<string>`, `Array<number>`, React's `useState<string>()`.

### Utility types: ready-made transformations

```ts
interface Product {
  id: string;
  name: string;
  priceInDollars: number;
  status: "public" | "private";
}

type NewProduct = Omit<Product, "id">;                 // everything except id
type ProductPreview = Pick<Product, "id" | "name">;    // only these fields
type ProductPatch = Partial<Product>;                  // every field optional
type ReadOnlyProduct = Readonly<Product>;              // nothing can be changed
type PriceByStatus = Record<Product["status"], number>; // { public: number; private: number }

const patch: ProductPatch = { name: "New name" };
const preview: ProductPreview = { id: "1", name: "Course" };
const prices: PriceByStatus = { public: 10, private: 0 };

function makeProduct(): Product {
  return { id: "1", name: "Course", priceInDollars: 49, status: "public" };
}
type Made = ReturnType<typeof makeProduct>;            // the type a function returns
const made: Made = makeProduct();
console.log(patch, preview, prices, made);
```

(Drizzle uses this idea too: it can derive the "shape of a row" of a table directly from the table
definition, so you never write that type by hand.)

---

## 8. Asynchronous code: `Promise`, `async`, `await`

Some things take time (reading from a database, calling an API). JavaScript doesn't freeze while it
waits; it hands you a **Promise**: "I'll give you the result later (or an error)".

```ts
type CourseData = { id: string; name: string };

// A function that simulates a slow database call
function loadCourse(id: string): Promise<CourseData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === "") reject(new Error("Missing id"));
      else resolve({ id, name: "Intro to React" });
    }, 100);
  });
}

// async/await: write waiting code that reads top to bottom
async function showCourse(id: string): Promise<void> {
  try {
    const course = await loadCourse(id);       // pause HERE until the promise finishes
    console.log(course.name);
  } catch (error) {
    // In `strict` mode `error` is `unknown`: check before using it
    if (error instanceof Error) console.error(error.message);
  } finally {
    console.log("done");                        // runs in both cases
  }
}
showCourse("c1");

// Run several things at the same time
async function loadMany(): Promise<CourseData[]> {
  return Promise.all([loadCourse("a"), loadCourse("b")]);
}
loadMany().then((courses) => console.log(courses.length));
```

Rules to remember:

- `await` only works inside an `async` function (or at the top level of a module).
- An `async` function **always returns a Promise**.
- Forgetting `await` is a classic bug: you get the Promise instead of the data.
- Your Drizzle queries (`await db.select()...`) and Stripe calls will all be async.

---

## 9. Errors

```ts
class ValidationError extends Error {          // your own error type, via inheritance!
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validatePrice(price: number): void {
  if (price < 0) throw new ValidationError("price", "Price cannot be negative");
}

try {
  validatePrice(-5);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Problem with ${error.field}: ${error.message}`);
  } else {
    throw error;                               // not ours: don't hide it
  }
}
```

---

## 10. Modules: `import` and `export`

Every file is its own little box. What you want to share you **export**; what you need you **import**:

```ts
// ---- file: math.ts ----
export const PI = 3.14159;
export function square(n: number): number {
  return n * n;
}
export default function cube(n: number): number {   // one "default" export per file is allowed
  return n * n * n;
}

// ---- file: main.ts ----
// import cube, { PI, square } from "./math";
// import { square as sq } from "./math";           // rename on import
// import * as math from "./math";                  // everything under one name
// export * from "./math";                          // re-export all (what your schema.ts will do)
```

(Those lines are commented out because this block is a single file; in real life they live in two
files.) The `export * from "./schema/course"` idea in `00002` is exactly this.

---

## 11. Design patterns

A **design pattern** is a **named, proven solution to a problem that keeps coming back** — not a library
you install, but a way of arranging classes and functions. They give developers a shared vocabulary
("let's use a factory here"). They're grouped in three families:

| Family | Concerned with | Examples below |
|---|---|---|
| **Creational** | How objects get *created* | Singleton, Factory, Builder |
| **Structural** | How objects are *put together* | Adapter, Decorator |
| **Behavioral** | How objects *talk and share work* | Strategy, Observer |

Plus one architectural pattern you'll meet with databases: **Repository**.

> Don't force patterns everywhere. Learn to *recognize* them; use one when the problem it solves actually
> shows up.

### 11.1 Singleton — exactly one instance

**Problem:** you need exactly one shared object (a database connection, a config).

```ts
class Database {
  private static instance: Database | null = null;

  private constructor(public readonly url: string) {   // private: nobody can call `new Database()`
    console.log("Connecting to", url);
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database("postgres://localhost/course_platform");
    }
    return Database.instance;
  }
}

const a = Database.getInstance();
const b = Database.getInstance();
console.log(a === b); // true: same object, "Connecting" was printed only once

// @ts-expect-error  → the constructor is private
const c = new Database("x");
```

> **Good to know:** `private` is a **TypeScript-only** rule. The editor and `tsc` reject the last line,
> but the types are erased at runtime, so if you forced the code to run anyway, that line *would* create
> a second connection. (When I ran this example, it printed "Connecting to x" for exactly that reason.)
> If you need a guarantee that survives at runtime, the constructor itself has to check and throw; in
> practice, just don't ignore red underlines.

You'll recognise this in your `db.ts`: a single exported `db` object that the whole app imports. In
JavaScript, a module that exports one created object is already a singleton — no class needed.

### 11.2 Factory — one place decides which class to create

**Problem:** the caller shouldn't need to know every concrete class.

```ts
interface Notifier {
  send(message: string): string;
}
class EmailNotifier implements Notifier {
  send(message: string) {
    return `Email: ${message}`;
  }
}
class SmsNotifier implements Notifier {
  send(message: string) {
    return `SMS: ${message}`;
  }
}

type Channel = "email" | "sms";

function createNotifier(channel: Channel): Notifier {
  switch (channel) {
    case "email":
      return new EmailNotifier();
    case "sms":
      return new SmsNotifier();
  }
}

console.log(createNotifier("sms").send("Your course is ready"));
```

Add `"push"` later: you change the factory only, not the code that uses notifiers.

### 11.3 Builder — build a complex object step by step

**Problem:** many optional settings make a constructor unreadable.

```ts
type CourseDraft = { name: string; description: string; price: number; tags: string[] };

class CourseBuilder {
  private draft: CourseDraft = { name: "", description: "", price: 0, tags: [] };

  name(value: string): this {
    this.draft.name = value;
    return this;                       // returning `this` allows chaining
  }
  description(value: string): this {
    this.draft.description = value;
    return this;
  }
  price(value: number): this {
    this.draft.price = value;
    return this;
  }
  tag(value: string): this {
    this.draft.tags.push(value);
    return this;
  }
  build(): CourseDraft {
    if (!this.draft.name) throw new Error("A course needs a name");
    return { ...this.draft };
  }
}

const draft = new CourseBuilder()
  .name("Intro to React")
  .description("Learn the basics")
  .price(49)
  .tag("react")
  .tag("frontend")
  .build();
console.log(draft);
```

Drizzle's own query style (`db.select().from(...).where(...)`) is a builder: each call adds one step.

### 11.4 Adapter — make incompatible things fit

**Problem:** you have a class/library with the "wrong" shape and you don't want to change the rest of
your code.

```ts
// Our app expects this:
interface PriceSource {
  getPriceInDollars(): number;
}

// A third-party thing we can't change, which talks in cents:
class LegacyBilling {
  fetchPriceCents(): number {
    return 4900;
  }
}

// The adapter translates between the two
class LegacyBillingAdapter implements PriceSource {
  constructor(private legacy: LegacyBilling) {}
  getPriceInDollars(): number {
    return this.legacy.fetchPriceCents() / 100;
  }
}

const source: PriceSource = new LegacyBillingAdapter(new LegacyBilling());
console.log(source.getPriceInDollars()); // 49
```

### 11.5 Decorator — add behavior by wrapping

**Problem:** add something (logging, caching, timing) without touching the original code. (Not to be
confused with TypeScript's `@decorator` syntax; this is the *pattern*.)

```ts
type Fn<A extends unknown[], R> = (...args: A) => R;

function withLogging<A extends unknown[], R>(name: string, fn: Fn<A, R>): Fn<A, R> {
  return (...args: A): R => {
    console.log(`Calling ${name} with`, args);
    const result = fn(...args);
    console.log(`${name} returned`, result);
    return result;
  };
}

const add = (a: number, b: number): number => a + b;
const loggedAdd = withLogging("add", add);
loggedAdd(2, 3);   // logs the call, then the result 5
```

### 11.6 Strategy — swap an algorithm at runtime

**Problem:** several ways to do the same thing (discounts, sorting, payment), chosen while the program
runs, without a giant `if/else`.

```ts
interface DiscountStrategy {
  apply(price: number): number;
}

const noDiscount: DiscountStrategy = { apply: (price) => price };
const percentOff = (percent: number): DiscountStrategy => ({
  apply: (price) => price * (1 - percent / 100),
});
const blackFriday: DiscountStrategy = percentOff(30);

class Cart {
  constructor(private price: number, private discount: DiscountStrategy = noDiscount) {}

  setDiscount(strategy: DiscountStrategy): void {
    this.discount = strategy;
  }
  total(): number {
    return this.discount.apply(this.price);
  }
}

const cart = new Cart(100);
console.log(cart.total());       // 100
cart.setDiscount(blackFriday);
console.log(cart.total());       // 70
```

The payment-providers example in 6.5 is the same idea: swap Stripe for PayPal without touching `checkout`.

### 11.7 Observer — "tell me when something happens"

**Problem:** many parts of the app must react when one thing changes, without that thing knowing about
them (like a YouTube channel and its subscribers).

```ts
type Listener<T> = (payload: T) => void;

class EventEmitter<T> {
  private listeners: Listener<T>[] = [];

  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    return () => {                                    // returns an "unsubscribe" function
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(payload: T): void {
    this.listeners.forEach((listener) => listener(payload));
  }
}

type Purchase = { student: string; course: string };
const purchases = new EventEmitter<Purchase>();

const unsubscribeEmail = purchases.subscribe((p) => console.log(`Email to ${p.student}`));
purchases.subscribe((p) => console.log(`Unlock ${p.course} for ${p.student}`));

purchases.emit({ student: "Ada", course: "React" });  // both listeners run
unsubscribeEmail();
purchases.emit({ student: "Linus", course: "SQL" });  // only the second one runs
```

(React's `useEffect`, DOM `addEventListener` and Stripe **webhooks** all follow this "subscribe and
react" idea.)

### 11.8 Repository — hide *how* data is stored

**Problem:** the rest of the app shouldn't care whether data lives in Postgres, a file, or memory.

```ts
interface Course {
  id: string;
  name: string;
}

interface CourseRepository {
  findById(id: string): Promise<Course | undefined>;
  save(course: Course): Promise<void>;
}

// An in-memory version: perfect for learning and for tests
class InMemoryCourseRepository implements CourseRepository {
  private store = new Map<string, Course>();

  async findById(id: string): Promise<Course | undefined> {
    return this.store.get(id);
  }
  async save(course: Course): Promise<void> {
    this.store.set(course.id, course);
  }
}

// A Drizzle version would implement the SAME interface, using `db.select()...` inside.

async function main(repo: CourseRepository): Promise<void> {
  await repo.save({ id: "c1", name: "Intro to React" });
  console.log(await repo.findById("c1"));
}
main(new InMemoryCourseRepository());
```

Business code depends on the **interface**; swapping the storage means writing one new class.

### Other patterns worth a search later

Prototype, Facade, Proxy, Composite, Command, State, Template Method, Iterator, Mediator. The classic book
is *Design Patterns* by the "Gang of Four"; more beginner-friendly: refactoring.guru (free, with
TypeScript examples).

---

## 12. Where you'll see all of this in *your* project

| Idea from this document | Where it appears |
|---|---|
| Union / literal types, `as const` | `productStatuses` in `src/drizzle/schema/product.ts` |
| Type derived from a value (`typeof`, `[number]`) | `ProductStatus` type in the same file |
| Arrow functions as values | `.references(() => CourseTable.id)`, `.$onUpdate(() => new Date())` |
| Destructuring | `({ many }) => ...` in the `relations(...)` calls |
| Method chaining (builder style) | `uuid().primaryKey().defaultRandom()` |
| `import` / `export` | Every file; `export *` planned in `schema.ts` |
| Validation + inferred types | `zod` and `createEnv` in `src/data/env/server.ts` |
| Async/await | Coming: every database query and Stripe call |
| Singleton | The `db` object that `db.ts` will export |
| Classes | Few! React + Drizzle code is mostly functions and objects |

A reassuring note: modern React/Next.js code uses **far fewer classes** than this document's OOP
chapters might suggest. Functions, objects, types and async code are your daily bread; OOP and patterns
are tools you'll recognise in libraries and use when a problem calls for them.

---

## 13. Cheat sheet

```text
Types      string number boolean null undefined bigint any unknown void never
Compound   T[]   [A, B]   A | B   A & B   "literal"   Record<K, V>   Promise<T>
Shapes     type X = {...}     interface X {...}
Optional   prop?: T           readonly prop: T
Safe       a?.b   a ?? b   typeof x === "string"   x instanceof Class
Functions  function f(a: T): R {}     const f = (a: T): R => ...
Classes    class A extends B implements C { private x; constructor() { super() } }
Abstract   abstract class A { abstract m(): void }
Generics   function f<T>(x: T): T      class Box<T> {}      T extends {...}
Utility    Partial Required Readonly Pick Omit Record ReturnType
Async      async function f() { const x = await g(); }
Modules    export const a = 1;   import { a } from "./file";
```

### Mini glossary

- **Type** — a label describing what kind of data a value is.
- **Compiler (`tsc`)** — checks the types and strips them to produce JavaScript.
- **Inference** — TypeScript working out a type by itself.
- **Union / intersection** — `A | B` (one of) / `A & B` (both at once).
- **Narrowing** — TS refining a type inside an `if`/`typeof`/`instanceof` check.
- **Class / instance** — blueprint / an object built from it.
- **Inheritance** — a class extending another to reuse its code.
- **Polymorphism** — same method call, different behavior per object.
- **Abstract class** — a blueprint that can't be instantiated and may demand that subclasses fill in methods.
- **Interface** — a contract describing a shape, with no code.
- **Generic** — a type placeholder like `T`, filled in on use.
- **Promise** — a value that will arrive later.
- **Design pattern** — a named, reusable solution to a common design problem.
- **Dependency injection** — passing the things an object needs in from outside (via the constructor).

### Where to practice next

1. The TypeScript Playground (<https://www.typescriptlang.org/play>) — instant feedback.
2. The official handbook: <https://www.typescriptlang.org/docs/handbook/intro.html>.
3. Small exercises: re-implement `Stack<T>`, the `Cart` with discounts, and the event emitter without
   looking, then compare.
