// Every chapter has its own tab title in the reader's language, and a path outside the
// course is a page of its own, not the prologue.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { CHAPTERS, PAGE_NOT_FOUND, chapterByPath } from "@/lib/curriculum";
import { LangProvider, useLang } from "@/lib/i18n";

let currentPath = "/";
vi.mock("next/navigation", () => ({ usePathname: () => currentPath }));

const { DocumentTitle, SITE_TITLE, titleFor } = await import("@/app/document-title");

function ZhSwitch() {
  const { setLang } = useLang();
  return <button onClick={() => setLang("zh")}>zh</button>;
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = "<title>TSer - an interactive TypeScript course</title>";
});

describe("chapterByPath", () => {
  it("finds the chapter of a path, including sub-paths", () => {
    expect(chapterByPath("/").id).toBe("home");
    expect(chapterByPath("/generics").id).toBe("generics");
    expect(chapterByPath("/type-magic/anything").id).toBe("type-magic");
  });

  it("does not pretend that an unknown path is the prologue", () => {
    expect(chapterByPath("/no-such-page")).toBe(PAGE_NOT_FOUND);
    expect(CHAPTERS.some((c) => c.id === chapterByPath("/no-such-page").id)).toBe(false);
  });
});

describe("tab titles", () => {
  it("are distinct for every chapter, in both languages", () => {
    for (const lang of ["en", "zh"] as const) {
      const titles = CHAPTERS.map((c) => titleFor(c.href, lang));
      expect(new Set(titles).size).toBe(CHAPTERS.length);
    }
    expect(titleFor("/", "zh")).toBe(SITE_TITLE.zh);
    expect(titleFor("/narrowing", "zh")).toBe("联合类型与收窄 · TSer");
    expect(titleFor("/no-such-page", "en")).toBe("Page not found · TSer");
  });

  it("follow the reader's language and survive Next.js rewriting the <title>", async () => {
    localStorage.setItem("tser-lang", "zh");
    currentPath = "/generics";
    const view = render(
      <LangProvider>
        <DocumentTitle />
      </LangProvider>,
    );
    expect(document.title).toBe("泛型 · TSer");

    // What Next.js does when the route's metadata hydrates: it writes the English title.
    await act(async () => {
      document.title = "Generics · TSer";
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(document.title).toBe("泛型 · TSer");

    currentPath = "/";
    view.rerender(
      <LangProvider>
        <DocumentTitle />
        <ZhSwitch />
      </LangProvider>,
    );
    expect(document.title).toBe(SITE_TITLE.zh);
  });

  it("come from a server layout in every chapter folder", () => {
    for (const c of CHAPTERS.filter((x) => x.href !== "/")) {
      const file = resolve(process.cwd(), `app${c.href}/layout.tsx`);
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file, "utf8")).toContain(`chapterMetadata("${c.id}")`);
    }
    expect(readdirSync(resolve(process.cwd(), "app"))).toContain("not-found.tsx");
  });
});
