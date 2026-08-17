# TSer — TypeScript, Explained Properly

**▶ [Open the course](https://tser.vercel.app)** — runs in your browser, nothing to install.

An interactive TypeScript course for people starting from zero. It starts at "why types at
all" and goes far enough that you can read the errors, design your own types, and do real
type-level programming.

Sister sites: [APIer](https://apier-eta.vercel.app) (APIs) and
[DataData](https://data-data.vercel.app) (data structures) — same design language.

## The 12 chapters

| # | Chapter | What it covers |
|---|---|---|
| 00 | Why TypeScript | The cost of finding out at runtime · types as a checkpoint · type erasure · your first `tsc` |
| 01 | Basic types and inference | Primitives · arrays and objects · literal types · annotation vs. inference · the pull of `any` |
| 02 | Functions and object types | Parameters and returns · optional and default · `interface` vs. `type` · `readonly` |
| 03 | Unions and narrowing | Unions · `typeof`/`in`/`instanceof` · discriminated unions · exhaustiveness with `never` |
| 04 | Structural typing | Duck typing · assignability · excess property checks · nominal typing compared |
| 05 | Generics | Generic functions · `extends` constraints · generic interfaces · common misconceptions |
| 06 | Built-in utility types | `Partial` · `Pick` · `Omit` · `Record` · `ReturnType` · `Awaited` |
| 07 | Type operators | `keyof` · `typeof` · indexed access · conditional types · `infer` · mapped types |
| 08 | Classes and interfaces | Access modifiers · parameter properties · `abstract` · `implements` |
| 09 | Modules and declaration files | `import type` · `.d.ts` · `declare` · `@types` · DefinitelyTyped |
| 10 | tsconfig and strict mode | The strict family · `target`/`module` · migrating gradually |
| ✦ | Finale — thinking in types | `satisfies` · `as const` · `unknown` as the safe default · type challenges · final quiz |

Each chapter follows the same rhythm: an intuition first, then an interactive
visualization, then real code you can paste straight into the TypeScript Playground to
verify, then the common mistakes, then a hands-on task, then a quiz. Progress is stored
locally in the browser.

Every compiler error quoted in the course is real `tsc` output, not written from memory.

## Running locally

Requires Node 22:

```bash
nvm use
npm install
npm run dev        # http://localhost:3000
```

Build with type checking: `npm run build`.

## Structure

Next.js 15 (App Router) + TypeScript + React 19, plain CSS — no Tailwind, deliberately few
dependencies. Zero backend: no API routes, so the whole site prerenders to static pages.

Each chapter is one folder under `app/` holding its page, its visualizations (`viz.tsx`) and
its own stylesheet, paired with a data file under `lib/` for labs and quizzes.

---

© 2026 Weiren Feng. All rights reserved. Published for reading and portfolio purposes; not
licensed for reuse, modification, or redistribution.
