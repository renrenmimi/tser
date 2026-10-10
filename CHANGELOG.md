# Changelog

## 2026-10-09 — audit fixes

An audit of the site covered bugs, UI and UX, accessibility, performance and the teaching
content in both languages. Each fix below is its own pull request, and all are merged into
`master`. The before and after figures were measured on local production builds
(`next start`) of `ae5feb8` and `f7adc58` in headless Chrome.

### Bugs

- Theme, language and sidebar settings come back from storage when React renders the root
  again on the client, and the pre-paint scripts moved from `<head>` to the top of
  `<body>`, which removed what made hydration fail on about one cold load in seventeen in
  the audit ([#10]).
- Keyboard users can mark a task as done: the checkbox is no longer nested inside the row
  that expands the task ([#12]).
- Two open tabs no longer overwrite each other's progress ([#12]).
- The compiler lab's editor is no longer a keyboard trap: Esc, then Tab, leaves it. Tab
  indents every selected line, Shift+Tab outdents, and undo keeps working ([#14]).
- Squiggles from the previous check are hidden as soon as the code changes instead of being
  drawn over the wrong characters ([#14]).
- When the compiler cannot load, a banner replaces the overlay that blurred the code, and
  "Open in Playground" carries the current code ([#14]).
- Presets with teaching comments come in both languages, so a Chinese reader no longer gets
  English comments after a click ([#14]).
- Builds no longer download fonts from Google, which failed at random: the fonts are
  self-hosted ([#10]).

### Teaching content

- Corrections in every chapter, two at a time: prologue and chapter 01 ([#17]), 02 and 03
  ([#18]), 04 and 05 ([#19]), 06 and 07 ([#20]), 08 and 09 ([#21]), 10 and the finale
  ([#22]). Among them:
  - the prologue no longer says that `tsc` writes no output when it reports a type error;
    it still writes the `.js` ([#17]);
  - chapter 01's `any` example no longer claims that arithmetic on `any` stays `any`
    ([#17]);
  - narrowing inside callbacks follows the TypeScript 5.4 rule, and inferred type
    predicates the TypeScript 5.5 conditions ([#18]);
  - the module-detection callout accounts for `moduleDetection`, which `tsc --init` sets
    to `force`, and a `declare module` you wrote is shown to override a library's own
    types ([#21]);
  - the finale's first task gives TS2352 for a misspelled key under `as`, and every
    summary of `as` describes its comparability check ([#22]).
- The Chinese copy no longer renders the 1,572 stray spaces that JSX made from line breaks;
  a unit test guards the rule ([#9]).
- The Chinese copy uses a formal register, one term per concept (注解, 悬停, 动手任务,
  非空断言), and the quiz sections are called 「本章测验」 ([#17]–[#22], [#26]).
- Fill-in answers accept full-width forms, curly quotes and single quotes ([#13], [#22]).

### Interaction and accessibility

- The drawer and the collapsed sidebar are inert while off screen, the drawer takes focus
  and gives it back, the command palette is a modal combobox, and a skip link leads to the
  content ([#11]).
- The quiz keeps keyboard focus after an answer, announces verdicts, and ignores Enter while
  an input method is composing ([#13]).
- Screen readers hear one error summary from the compiler lab, and its tabs follow the
  WAI-ARIA tabs pattern ([#14]).
- Text, code comments, status colours and primary buttons meet WCAG AA in both themes, and
  the visualisations drawn on the always-dark code background keep readable colours in the
  light theme. In a scan of every page, text below the threshold went from 1,451 elements
  (light) and 1,360 (dark) to none ([#15]).
- Code renders as typed, without ligatures ([#15]).
- Each page has its own title in the reader's language, and unknown paths get a real 404
  page ([#10]).
- Selectable buttons in the visualisations expose `aria-pressed` ([#17]–[#22]).

### Layout

- Callouts and the narrowing guards grid stay inside narrow screens: elements running past
  the viewport went from 12–14 at 360 and 390 px (and one at 1440 px) to none ([#15]).
- Task titles wrap instead of being cut off, file names show in full on phones, and
  highlighted code lines keep their band when scrolled sideways ([#12], [#15]).
- Content stays visible without JavaScript and when printed ([#10], [#15]).
- Text fields are 16px on phones, so iOS does not zoom ([#11], [#13], [#14]).

### Performance

- Pages no longer prefetch every other chapter after loading: 0 requests in the seven
  seconds after the load event instead of 30–33 (378–415 KB) ([#11]).
- English pages no longer download Noto Sans SC: 3 font files (86 KB) instead of 10
  (362 KB) ([#10]).
- Idle pages no longer restyle every frame: 4–7 style recalculations in 3 s instead of
  180 ([#15]); the utility hero's carousel goes round once and stops ([#20]).
- Switching the language runs in a transition ([#10]).

### Project

- `public/tslab/typescript.js` and `libs.json` (11.6 MB that nothing loaded) are no longer
  tracked ([#14]).
- Dependency advisories for undici, Next.js, sharp and source-map-js are patched ([#16]).
- CLAUDE.md describes the course after these fixes ([#23]).

### Not changed

- English is the default language and readers switch to Chinese by hand; a reader who chose
  Chinese briefly sees the English server HTML before hydration.
- The task labels (LAB 01, EASY, MEDIUM, HARD) and the chapter eyebrow (CHAPTER 03 · …)
  stay in English in both languages, as part of the visual style.
- Language switching re-renders the page inside a transition; rendering both languages and
  hiding one with CSS was not adopted, because it would double the DOM.

[#9]: https://github.com/renrenmimi/tser/pull/9
[#10]: https://github.com/renrenmimi/tser/pull/10
[#11]: https://github.com/renrenmimi/tser/pull/11
[#12]: https://github.com/renrenmimi/tser/pull/12
[#13]: https://github.com/renrenmimi/tser/pull/13
[#14]: https://github.com/renrenmimi/tser/pull/14
[#15]: https://github.com/renrenmimi/tser/pull/15
[#16]: https://github.com/renrenmimi/tser/pull/16
[#17]: https://github.com/renrenmimi/tser/pull/17
[#18]: https://github.com/renrenmimi/tser/pull/18
[#19]: https://github.com/renrenmimi/tser/pull/19
[#20]: https://github.com/renrenmimi/tser/pull/20
[#21]: https://github.com/renrenmimi/tser/pull/21
[#22]: https://github.com/renrenmimi/tser/pull/22
[#23]: https://github.com/renrenmimi/tser/pull/23
[#26]: https://github.com/renrenmimi/tser/pull/26
