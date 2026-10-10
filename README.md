# TSer — an interactive TypeScript course

**▶ [Open the course](https://tser.vercel.app)** — runs in your browser, nothing to install.

An interactive TypeScript course covering the motivation for types, compiler feedback,
application-level type design, and an introduction to type-level programming.

Sister sites: [APIer](https://apier-eta.vercel.app) (APIs) and
[DataData](https://data-data.vercel.app) (data structures) — same design language.

![The course home — 12 chapters from inference to type-level programming](docs/home.jpg)

*The course home — 12 chapters from inference to type-level programming*

![Generics, with code you can paste into the Playground](docs/generics.jpg)

*Generics, with code you can paste into the Playground*

![The compiler lab: edit the code and the real tsc answers with its own error codes](docs/compiler-lab.jpg)

*The compiler lab — TypeScript 5.9.3 itself, running in a Web Worker. Edit the code and the diagnostics are the compiler’s own: real codes, real positions, and the declaration file it would emit.*

## Chapters

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
visualization, then code you can paste into the TypeScript Playground, then the common
mistakes, then a hands-on task, then a chapter quiz. Progress is stored locally in the
browser and stays in step across open tabs.

The whole course is in English and Chinese; switch with the EN / 中文 toggle in the toolbar.
Every page works from the keyboard, meets WCAG AA contrast in both themes, and reads
without JavaScript.

Every compiler error quoted in the course is `tsc` output.

## The compiler ships with the course

Chapters carry live labs, and the compiler in them is the real one: TypeScript 5.9.3
runs in a Web Worker, so the code you type is checked by `tsc` itself. Errors carry
real codes and real message text, underlined on the exact range the compiler reports.
Click a name to read the type it inferred; open the output tabs to see the JavaScript
and the `.d.ts` it actually emits; flip `strict` and watch the verdict change.

Turn a three-state union into a four-state one and the compiler names the branch you
forgot. That is the point of the course, and it is not a recording.

The compiler is loaded on demand (about 2 MB on the first visit), cached, and shared by
every lab on the site. While it loads, and if it cannot load, a banner above the editor
says so; the code stays readable, and the banner offers a retry and a link that opens the
same code in the official Playground.

## Running locally

Requires Node 22:

```bash
nvm use
npm install
npm run dev        # http://localhost:3000
```

Build with type checking: `npm run build`. Run the tests with `npm test` (Vitest); they
cover the compiler worker, the labs, the shell, the quiz and the stylesheet, and check that
the Chinese copy has no stray spaces. CI runs the type check, the tests, the build and a
check that the compiler stays out of the page bundle on every push to `master` and every
pull request.

`npm run dev`, `npm run build` and `npm test` first copy the compiler from
`node_modules/typescript` into `public/tslab/`; those copies are not tracked.

## Structure

Next.js 15 (App Router) + TypeScript + React 19, plain CSS. No API routes, so the whole site prerenders to static pages.

Each chapter is one folder under `app/` holding its page, its visualizations (`viz.tsx`), its
own stylesheet and a server `layout.tsx` that gives the chapter its own title and
description; it is paired with a data file under `lib/` for labs and quizzes. The fonts are
self-hosted from `app/fonts/`, and English pages download no Chinese font.

---

© 2026 Weiren Feng. All rights reserved. Published for reading and portfolio purposes; not
licensed for reuse, modification, or redistribution.
