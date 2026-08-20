"use client";

// 09 · Modules and declaration files —— 动手任务 LABS + 通关测验 QUIZ 数据。
// 双语:内容用 { en, zh } 对;教学代码的可执行行在两种语言里逐字节相同,
// 只有注释分 en / zh。编译器报错原文一律不翻译。
// 所有报错文案、报错码与生成结果均已用 tsc 5.9.3 + Node 22 实测核对。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import type { Loc } from "@/lib/i18n";
import { CodeBlock } from "@/lib/code";

/* ---------- lab code strings ---------- */

const LAB_PLAYGROUND = `export interface MenuItem {
  name: string;
  price: number;
}

export function cheapest(items: MenuItem[]): MenuItem {
  return [...items].sort((a, b) => a.price - b.price)[0];
}`;

const LAB_SCOPE_SHELL: Loc<string> = {
  en: `mkdir scope-lab && cd scope-lab
echo 'const TAX = 0.06;' > a.ts
echo 'const TAX = 0.08;' > b.ts

npx tsc --noEmit a.ts b.ts
# a.ts(1,7): error TS2451: Cannot redeclare
#   block-scoped variable 'TAX'.
# b.ts(1,7): error TS2451: Cannot redeclare
#   block-scoped variable 'TAX'.

printf 'export {};\\nconst TAX = 0.08;\\n' > b.ts
npx tsc --noEmit a.ts b.ts
# no output — b.ts is a module now, so its TAX is its own`,
  zh: `mkdir scope-lab && cd scope-lab
echo 'const TAX = 0.06;' > a.ts
echo 'const TAX = 0.08;' > b.ts

npx tsc --noEmit a.ts b.ts
# a.ts(1,7): error TS2451: Cannot redeclare
#   block-scoped variable 'TAX'.
# b.ts(1,7): error TS2451: Cannot redeclare
#   block-scoped variable 'TAX'.

printf 'export {};\\nconst TAX = 0.08;\\n' > b.ts
npx tsc --noEmit a.ts b.ts
# 没有输出 —— b.ts 现在是模块,它的 TAX 只属于它自己`,
};

const LAB_DECL_SHELL: Loc<string> = {
  en: `mkdir dts-lab && cd dts-lab
cat > order.ts << 'EOF'
export interface Order {
  id: string;
  total: number;
}
export function createOrder(total: number): Order {
  return { id: "MT-" + Date.now(), total };
}
EOF

npx tsc order.ts --declaration
ls
# order.d.ts  order.js  order.ts`,
  zh: `mkdir dts-lab && cd dts-lab
cat > order.ts << 'EOF'
export interface Order {
  id: string;
  total: number;
}
export function createOrder(total: number): Order {
  return { id: "MT-" + Date.now(), total };
}
EOF

npx tsc order.ts --declaration
ls
# order.d.ts  order.js  order.ts`,
};

const LAB_DECL_DTS = `export interface Order {
    id: string;
    total: number;
}
export declare function createOrder(total: number): Order;`;

const LAB_TYPES_SHELL: Loc<string> = {
  en: `mkdir types-lab && cd types-lab
npm init -y
npm i lodash

echo 'import { debounce } from "lodash";
debounce(() => {}, 300);' > index.ts

npx tsc --noEmit --strict index.ts
# error TS7016: Could not find a declaration file for
#   module 'lodash'. '.../node_modules/lodash/lodash.js'
#   implicitly has an 'any' type.
#   Try \`npm i --save-dev @types/lodash\` if it exists or
#   add a new declaration (.d.ts) file containing
#   \`declare module 'lodash';\`

npm i -D @types/lodash
npx tsc --noEmit --strict index.ts
# no output = no errors`,
  zh: `mkdir types-lab && cd types-lab
npm init -y
npm i lodash

echo 'import { debounce } from "lodash";
debounce(() => {}, 300);' > index.ts

npx tsc --noEmit --strict index.ts
# error TS7016: Could not find a declaration file for
#   module 'lodash'. '.../node_modules/lodash/lodash.js'
#   implicitly has an 'any' type.
#   Try \`npm i --save-dev @types/lodash\` if it exists or
#   add a new declaration (.d.ts) file containing
#   \`declare module 'lodash';\`

npm i -D @types/lodash
npx tsc --noEmit --strict index.ts
# 没有输出 = 没有报错`,
};

const LAB_PROMISE_DTS = `declare module "boba-sdk" {
  export function fetchMenu(shopId: string): Promise<string[]>;
}`;

const LAB_PROMISE_SHELL: Loc<string> = {
  en: `echo 'import { fetchMenu } from "boba-sdk";
fetchMenu("hz-001").then(console.log);' > shop.ts

npx tsc --noEmit shop.ts types/boba-sdk.d.ts
# no output — the compiler accepted the declaration

npx tsc shop.ts types/boba-sdk.d.ts && node shop.js
# Error: Cannot find module 'boba-sdk'
# Node looks for the real package in node_modules.
# Nothing is there.`,
  zh: `echo 'import { fetchMenu } from "boba-sdk";
fetchMenu("hz-001").then(console.log);' > shop.ts

npx tsc --noEmit shop.ts types/boba-sdk.d.ts
# 没有输出 —— 编译器采信了这份声明

npx tsc shop.ts types/boba-sdk.d.ts && node shop.js
# Error: Cannot find module 'boba-sdk'
# Node 会去 node_modules 找真正的包。
# 那里什么都没有。`,
};

export const LABS: Lab[] = [
  {
    id: "script-vs-module",
    title: {
      en: "Turn a script into a module and watch the collision disappear",
      zh: "把脚本变成模块,看那个命名冲突消失",
    },
    d: "easy",
    tags: {
      en: ["module scope", "ts(2451)", "local"],
      zh: ["模块作用域", "ts(2451)", "本地实操"],
    },
    task: {
      en: (
        <p>
          Create two files in an empty directory. Put{" "}
          <code>const TAX = 0.06;</code> in <code>a.ts</code> and{" "}
          <code>const TAX = 0.08;</code> in <code>b.ts</code>. Neither file has
          any <code>import</code> or <code>export</code>. Run{" "}
          <code>npx tsc --noEmit a.ts b.ts</code>. Then add one line,{" "}
          <code>export {"{}"}</code>, at the top of <code>b.ts</code> and run it
          again. What changed about where <code>TAX</code> lives?
        </p>
      ),
      zh: (
        <p>
          在一个空目录里建两个文件:<code>a.ts</code> 里写{" "}
          <code>const TAX = 0.06;</code>,<code>b.ts</code> 里写{" "}
          <code>const TAX = 0.08;</code>,两个文件都不写任何 import / export。
          先跑 <code>npx tsc --noEmit a.ts b.ts</code>;再往 <code>b.ts</code>{" "}
          顶上加一行 <code>export {"{}"}</code>,重跑一次。
          <code>TAX</code> 这个名字的归属发生了什么变化?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The first run reports the same error twice, once in each file. That is
          the clue: both declarations sit in the same scope, so they can see each
          other.
        </>
      ),
      zh: (
        <>
          第一次会在两个文件里各报一次同样的错。这就是线索:
          两个声明在同一个作用域里,所以它们互相看得见。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="bash" title="terminal" code={LAB_SCOPE_SHELL} />
          <p>
            A file with no top-level <code>import</code> and no top-level{" "}
            <code>export</code> is a <b>script</b>. Its top-level declarations go
            into the global scope, which every script in the program shares, so
            two scripts declaring the same name collide. Adding{" "}
            <code>export {"{}"}</code> makes the file a <b>module</b>: its
            top-level names belong to that file, and other files can only see
            them if you export them and they import them.
          </p>
          <p>
            The rest of this chapter rests on this one distinction, including the
            reason a declaration file behaves differently depending on whether it
            exports anything.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="bash" title="terminal" code={LAB_SCOPE_SHELL} />
          <p>
            一个顶层既没有 <code>import</code> 也没有 <code>export</code>{" "}
            的文件是<b>脚本</b>。它的顶层声明会进入全局作用域,
            而程序里所有脚本共用这一个作用域,
            所以两个脚本声明同名变量就会撞车。加上 <code>export {"{}"}</code>{" "}
            之后,文件变成<b>模块</b>:顶层的名字只属于这个文件,
            别的文件只有在你导出、它导入之后才看得见。
          </p>
          <p>
            本章后面的内容都建立在这个区分之上 ——
            包括同一份声明文件「有没有导出」会表现得完全不同的原因。
          </p>
        </>
      ),
    },
  },
  {
    id: "playground-dts",
    title: {
      en: "Watch a declaration file being generated in the Playground",
      zh: "在 Playground 亲眼看声明文件生成出来",
    },
    d: "easy",
    tags: {
      en: [".D.TS", "type erasure", "Playground"],
      zh: [".D.TS", "类型擦除", "Playground"],
    },
    task: {
      en: (
        <p>
          Open the TypeScript Playground (typescriptlang.org/play). Write one{" "}
          <code>interface</code> and one exported function that returns a value.
          Then look at the two panels on the right: the <b>.D.TS tab</b> (the
          generated declaration file) and the <b>.JS tab</b> (the emitted
          JavaScript). Compare them. What happens to the interface in each one?
        </p>
      ),
      zh: (
        <p>
          打开 TypeScript Playground(typescriptlang.org/play),写一个{" "}
          <code>interface</code> 和一个带返回值的导出函数。然后看右侧两个面板:
          <b>.D.TS 标签页</b>(生成的声明文件)和 <b>.JS 标签页</b>
          (编译出来的 JavaScript)。对照着看:interface 在两边各是什么结果?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          In .D.TS the function keeps only its signature and gains the word{" "}
          <code>declare</code>. In .JS the interface is not there at all. Try to
          state the job of each panel in one sentence.
        </>
      ),
      zh: (
        <>
          .D.TS 里函数只剩签名,前面还多了 <code>declare</code>;
          .JS 里 interface 一点痕迹都没有。试着用一句话说出这两个面板各管什么。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="ts" title="playground.ts" code={LAB_PLAYGROUND} />
          <p>
            The .D.TS panel shows{" "}
            <code>
              export declare function cheapest(items: MenuItem[]): MenuItem;
            </code>{" "}
            — the signature only, no function body — and the interface is copied
            over unchanged. The .JS panel is the opposite: the function body is
            there and the interface is gone.
          </p>
          <p>
            One source file, two outputs. The <code>.js</code> file is the code
            that runs. The <code>.d.ts</code> file is the description the
            compiler reads.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="ts" title="playground.ts" code={LAB_PLAYGROUND} />
          <p>
            .D.TS 面板里是{" "}
            <code>
              export declare function cheapest(items: MenuItem[]): MenuItem;
            </code>{" "}
            —— 只有签名,没有函数体;interface 则被原样抄了过去。
            .JS 面板正相反:函数体在,interface 不见了。
          </p>
          <p>
            同一份源码,两样产物:<code>.js</code> 是真正运行的代码,
            <code>.d.ts</code> 是给编译器读的描述。
          </p>
        </>
      ),
    },
  },
  {
    id: "tsc-declaration",
    title: {
      en: "Generate a .d.ts locally with tsc",
      zh: "在本地用 tsc 生成一份 .d.ts",
    },
    d: "medium",
    tags: {
      en: ["tsc", "--declaration", "local"],
      zh: ["tsc", "--declaration", "本地实操"],
    },
    task: {
      en: (
        <p>
          In an empty directory, write an <code>order.ts</code> that exports one
          function and one interface. Run{" "}
          <code>npx tsc order.ts --declaration</code>. Open both generated files
          and compare them with the source.
        </p>
      ),
      zh: (
        <p>
          找个空目录,写一个 <code>order.ts</code>,导出一个函数和一个 interface。
          然后跑 <code>npx tsc order.ts --declaration</code>,
          打开生成的两个文件,和源码对照着看。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          You should get two files: <code>order.js</code> and{" "}
          <code>order.d.ts</code>. Want only the declaration file? Add{" "}
          <code>--emitDeclarationOnly</code>.
        </>
      ),
      zh: (
        <>
          产物应该有两个:<code>order.js</code> 和 <code>order.d.ts</code>。
          只想要声明文件?再加 <code>--emitDeclarationOnly</code>。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="bash" title="terminal" code={LAB_DECL_SHELL} />
          <CodeBlock
            lang="dts"
            title={{
              en: "order.d.ts · what tsc generated",
              zh: "order.d.ts · tsc 生成的结果",
            }}
            code={LAB_DECL_DTS}
          />
          <p>
            This is exactly how a TypeScript library ships its own types. Turn on{" "}
            <code>declaration</code> when you build, then point the{" "}
            <code>types</code> field in <code>package.json</code> at the
            generated <code>.d.ts</code>. That is the first of the three places
            types can come from.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="bash" title="terminal" code={LAB_DECL_SHELL} />
          <CodeBlock
            lang="dts"
            title={{
              en: "order.d.ts · what tsc generated",
              zh: "order.d.ts · tsc 生成的结果",
            }}
            code={LAB_DECL_DTS}
          />
          <p>
            TS 写的库「出厂自带类型」就是这么做的:编译时打开{" "}
            <code>declaration</code>,再用 <code>package.json</code> 的{" "}
            <code>types</code> 字段指到这份 <code>.d.ts</code>。
            这就是类型三个来源里的第一个。
          </p>
        </>
      ),
    },
  },
  {
    id: "types-before-after",
    title: {
      en: "One error, before and after installing @types",
      zh: "装 @types 前后,同一个报错的生与死",
    },
    d: "medium",
    tags: {
      en: ["@types", "ts(7016)", "local"],
      zh: ["@types", "ts(7016)", "本地实操"],
    },
    task: {
      en: (
        <p>
          In a new directory run <code>npm init -y</code>, then{" "}
          <code>npm i lodash</code> — <b>do not</b> install{" "}
          <code>@types/lodash</code> yet. Write an <code>index.ts</code> that
          imports <code>debounce</code>, and run{" "}
          <code>npx tsc --noEmit --strict index.ts</code>. Read the full error.
          Then run <code>npm i -D @types/lodash</code> and try again.
        </p>
      ),
      zh: (
        <p>
          新建目录,跑 <code>npm init -y</code>,再 <code>npm i lodash</code>{" "}
          —— 注意<b>先别装</b> <code>@types/lodash</code>。写一个{" "}
          <code>index.ts</code> 导入 <code>debounce</code>,跑{" "}
          <code>npx tsc --noEmit --strict index.ts</code>,把报错读全。
          然后 <code>npm i -D @types/lodash</code>,重跑一次。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The first run gives you ts(7016). Do not look up the fix — the error
          message already contains it.
        </>
      ),
      zh: <>第一次会撞上 ts(7016)。别急着查解法 —— 报错原文里就写着。</>,
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="bash" title="terminal" code={LAB_TYPES_SHELL} />
          <p>
            The moment <code>@types/lodash</code> is installed, completion and
            parameter hints for <code>debounce</code> appear in the editor. The
            library itself did not change. Only its type declarations arrived.
            Open <code>node_modules/@types/lodash</code> and look: it is all{" "}
            <code>.d.ts</code> files and not one line of implementation.
          </p>
          <p>
            <code>--strict</code> matters here. ts(7016) is an
            implicit-<code>any</code> error, reported because{" "}
            <code>noImplicitAny</code> is on. Without it the import is quietly
            typed <code>any</code>, which is worse: no error and no checking
            either.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="bash" title="terminal" code={LAB_TYPES_SHELL} />
          <p>
            <code>@types/lodash</code> 装好的那一刻,编辑器里{" "}
            <code>debounce</code> 的补全和参数提示同时出现。
            库本体没变,变的只是类型声明到货了。打开{" "}
            <code>node_modules/@types/lodash</code> 看一眼:全是{" "}
            <code>.d.ts</code>,一行实现都没有。
          </p>
          <p>
            这里 <code>--strict</code> 是关键。ts(7016) 属于隐式{" "}
            <code>any</code> 报错,是 <code>noImplicitAny</code>{" "}
            打开才会报的。不开的话,这个导入会被静悄悄推成 <code>any</code>{" "}
            —— 那更糟:既没有报错,也没有检查。
          </p>
        </>
      ),
    },
  },
  {
    id: "declare-module-promise",
    title: {
      en: "Write a declare module, then find out what it cannot do",
      zh: "手写 declare module,再看清它做不到什么",
    },
    d: "hard",
    tags: {
      en: ["declare module", ".d.ts", "local"],
      zh: ["declare module", ".d.ts", "本地实操"],
    },
    task: {
      en: (
        <p>
          Stay in the same directory and write a declaration for a package that{" "}
          <b>does not exist</b>. Create <code>types/boba-sdk.d.ts</code> with a{" "}
          <code>declare module</code> block describing <code>fetchMenu</code>.
          Write a <code>shop.ts</code> that imports and calls it. Then do two
          things: run the type check, then compile it and run the output with{" "}
          <code>node</code>. What does each result tell you?
        </p>
      ),
      zh: (
        <p>
          还在同一个目录里,给一个<b>并不存在的包</b>写声明:建{" "}
          <code>types/boba-sdk.d.ts</code>,用 <code>declare module</code> 描出{" "}
          <code>fetchMenu</code> 的形状;再写一个 <code>shop.ts</code>{" "}
          导入并调用它。然后做两件事:先跑类型检查,再编译并用{" "}
          <code>node</code> 跑产物。两个结果分别说明了什么?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Pass the <code>.d.ts</code> to <code>tsc</code> along with the source
          file. Also check that no real <code>boba-sdk</code> sits in any parent
          directory&apos;s <code>node_modules</code>, or Node will find it. The
          type check will pass and Node will fail. Work out why those two results
          do not contradict each other.
        </>
      ),
      zh: (
        <>
          把 <code>.d.ts</code> 和源文件一起交给 <code>tsc</code>。
          另外确认任何上级目录的 <code>node_modules</code> 里都没有真的{" "}
          <code>boba-sdk</code>,否则 Node 会把它找出来。
          类型检查会通过,Node 会失败 —— 想清楚这两个结果为什么不矛盾。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="dts"
            title="types/boba-sdk.d.ts"
            code={LAB_PROMISE_DTS}
          />
          <CodeBlock lang="bash" title="terminal" code={LAB_PROMISE_SHELL} />
          <p>
            A declaration is a claim about what exists at run time. The compiler
            takes the claim as given; it has no way to check it. Node never reads{" "}
            <code>.d.ts</code> files — it looks for the actual module and fails
            when it is missing.
          </p>
          <p>
            So <code>declare module</code> is for a package that{" "}
            <b>is installed but has no types</b>. It is not a way to import
            something you have not installed.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="dts"
            title="types/boba-sdk.d.ts"
            code={LAB_PROMISE_DTS}
          />
          <CodeBlock lang="bash" title="terminal" code={LAB_PROMISE_SHELL} />
          <p>
            声明是对「运行时有什么」的一个断言。编译器只能采信它,无从核实。
            Node 从不读 <code>.d.ts</code> —— 它去找真正的模块,找不到就报错。
          </p>
          <p>
            所以 <code>declare module</code> 面对的是<b>装了但没有类型</b>的包,
            而不是一种「不装也能导入」的办法。
          </p>
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          A TypeScript file has no top-level <code>import</code> and no top-level{" "}
          <code>export</code>. What is it, and where do its top-level
          declarations live?
        </>
      ),
      zh: (
        <>
          一个 TypeScript 文件顶层既没有 <code>import</code> 也没有{" "}
          <code>export</code>。它是什么?它的顶层声明住在哪里?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            A script — its top-level declarations go into the global scope, so
            another script can collide with them
          </>
        ),
        zh: <>它是脚本 —— 顶层声明进入全局作用域,另一个脚本可能和它撞名</>,
      },
      {
        en: <>A module that exports nothing, so its names are private to it</>,
        zh: <>它是一个什么都没导出的模块,名字只属于它自己</>,
      },
      {
        en: <>Not valid TypeScript — every file needs at least one export</>,
        zh: <>它不是合法的 TypeScript —— 每个文件至少要有一个导出</>,
      },
      {
        en: (
          <>
            A module, because the tsconfig <code>module</code> option decides
            this
          </>
        ),
        zh: (
          <>
            它是模块,因为这件事由 tsconfig 的 <code>module</code> 选项决定
          </>
        ),
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            That is what happens <i>after</i> you add <code>export {"{}"}</code>.
            With no top-level import or export the file is not a module at all,
            and its names are shared rather than private.
          </>
        ),
        zh: (
          <>
            那是加上 <code>export {"{}"}</code> <i>之后</i>的情况。
            顶层没有任何 import / export 时,这个文件根本不算模块,
            它的名字是共享的,不是私有的。
          </>
        ),
      },
      {
        en: (
          <>
            It compiles fine. A script is a legal kind of file — that is how all
            JavaScript worked before ES modules existed.
          </>
        ),
        zh: (
          <>
            它能正常编译。脚本是一种合法的文件形态 ——
            ES 模块出现之前,所有 JavaScript 都是这样的。
          </>
        ),
      },
      {
        en: (
          <>
            <code>module</code> chooses the output format (<code>esnext</code>,{" "}
            <code>commonjs</code>, and so on). Whether a given file is a module
            is decided by the file itself: does it have a top-level import or
            export?
          </>
        ),
        zh: (
          <>
            <code>module</code> 决定的是输出格式(<code>esnext</code>、
            <code>commonjs</code> 等)。某个文件到底是不是模块,由文件自己决定:
            顶层有没有 import / export?
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Two scripts that both declare <code>const TAX</code> at the top level
          produce{" "}
          <code>
            error TS2451: Cannot redeclare block-scoped variable &apos;TAX&apos;.
          </code>{" "}
          One line, <code>export {"{}"}</code>, gives the file module scope and
          the error goes away. Every declaration file in this chapter depends on
          this distinction.
        </>
      ),
      zh: (
        <>
          两个脚本都在顶层声明 <code>const TAX</code>,就会得到{" "}
          <code>
            error TS2451: Cannot redeclare block-scoped variable &apos;TAX&apos;.
          </code>{" "}
          加一行 <code>export {"{}"}</code> 让文件获得模块作用域,报错就消失。
          本章所有关于声明文件的内容都建立在这个区分之上。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What is inside a .d.ts file?</>,
      zh: <>一个 .d.ts 文件里装的是什么?</>,
    },
    opts: [
      {
        en: <>Type declarations only — shapes, with no implementation code</>,
        zh: <>只有类型声明(形状),没有任何实现代码</>,
      },
      {
        en: <>A minified copy of the implementation</>,
        zh: <>实现代码的压缩版本</>,
      },
      {
        en: <>Type declarations plus the implementation of the key functions</>,
        zh: <>类型声明,外加关键函数的实现</>,
      },
      { en: <>Compiler cache data</>, zh: <>编译器的缓存数据</> },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            A minified implementation is a <code>.min.js</code> file. A{" "}
            <code>.d.ts</code> has no function bodies at all — every function
            stops at its signature and a semicolon.
          </>
        ),
        zh: (
          <>
            压缩后的实现是 <code>.min.js</code> 的事。<code>.d.ts</code>{" "}
            里一个函数体都没有 —— 每个函数都止步于签名和一个分号。
          </>
        ),
      },
      {
        en: (
          <>
            No implementation is allowed. That is what <code>declare</code>{" "}
            means: the implementation is somewhere else. The file that carries an
            implementation is a <code>.ts</code> file.
          </>
        ),
        zh: (
          <>
            一行实现都不允许。<code>declare</code> 的含义正是「实现在别处」。
            带实现的那份文件叫 <code>.ts</code>。
          </>
        ),
      },
      {
        en: (
          <>
            Compiler cache lives in <code>.tsbuildinfo</code>. A{" "}
            <code>.d.ts</code> is source you can read and edit, and it is what
            gets published with a package.
          </>
        ),
        zh: (
          <>
            编译缓存是 <code>.tsbuildinfo</code> 的活。<code>.d.ts</code>{" "}
            是能读能改的源码,而且会随包一起发布。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A <code>.d.ts</code> file describes what each export looks like and
          emits nothing. The running code sits in the matching <code>.js</code>{" "}
          file. Because describing a shape does not require changing the code, a{" "}
          <code>.d.ts</code> can describe any JavaScript library, including one
          that was never written in TypeScript.
        </>
      ),
      zh: (
        <>
          <code>.d.ts</code> 描述每个导出长什么样,自己不产出任何代码;
          真正运行的代码在旁边那份 <code>.js</code> 里。
          因为描述形状不需要改动代码,<code>.d.ts</code>{" "}
          可以描述任何 JavaScript 库 —— 包括从来不是用 TypeScript 写的库。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>import type {"{ Order }"} from &quot;./order&quot;</code> — what
          does this line become in the emitted JavaScript?
        </>
      ),
      zh: (
        <>
          <code>import type {"{ Order }"} from &quot;./order&quot;</code> ——
          这一行编译成 JavaScript 后是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Nothing. The whole line is removed</>,
        zh: <>什么都没有,整行被删掉</>,
      },
      {
        en: (
          <>
            <code>import {"{ Order }"} from &quot;./order&quot;</code>
          </>
        ),
        zh: (
          <>
            <code>import {"{ Order }"} from &quot;./order&quot;</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>require(&quot;./order&quot;)</code>
          </>
        ),
        zh: (
          <>
            <code>require(&quot;./order&quot;)</code>
          </>
        ),
      },
      {
        en: (
          <>It is kept as written, and the browser decides whether to load it</>
        ),
        zh: <>原样保留,由浏览器决定要不要加载</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            That would be a value import, and <code>./order</code> would really
            be loaded at run time. The point of <code>type</code> is to say that
            this line carries types only, so the whole line can go.
          </>
        ),
        zh: (
          <>
            那就成了值导入,运行时会真的去加载 <code>./order</code>。
            <code>type</code> 的意义正是声明「这一行只有类型」,
            所以整行都可以删掉。
          </>
        ),
      },
      {
        en: (
          <>
            <code>require</code> appears when the output format is CommonJS,
            which is a separate question. A type-only import is removed before
            the output format matters.
          </>
        ),
        zh: (
          <>
            <code>require</code> 是输出格式为 CommonJS 时才出现的东西,
            那是另一个问题。纯类型导入在轮到输出格式之前就已经被删掉了。
          </>
        ),
      },
      {
        en: (
          <>
            The browser does not understand TypeScript&apos;s <code>type</code>{" "}
            keyword, so this line has to be handled at compile time. Nothing is
            left for the run time to decide.
          </>
        ),
        zh: (
          <>
            浏览器不认识 TypeScript 的 <code>type</code> 关键字,
            所以这一行必须在编译期处理掉,没有任何东西留给运行时决定。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Types are erased, so a type-only import has nothing left to import.
          Removing the line also removes the module load, and that part matters:
          a <code>.js</code> module can run code when it is loaded, and you do
          not want that to happen just because you needed a type name.
        </>
      ),
      zh: (
        <>
          类型会被擦除,所以纯类型导入没有任何东西可导入。
          删掉这一行同时也删掉了那次模块加载 —— 这一点很重要:
          <code>.js</code> 模块被加载时可以执行代码,
          而你不希望仅仅因为需要一个类型名字就触发它。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Why write <code>import type</code> explicitly instead of leaving it to
          the compiler?
        </>
      ),
      zh: (
        <>
          为什么要<b>显式</b>写 <code>import type</code>,而不是交给编译器判断?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Single-file transpilers such as esbuild and SWC cannot tell whether a
            name is a value or a type, so the explicit marker removes the guess
          </>
        ),
        zh: (
          <>
            esbuild、SWC 这类单文件转译器分不清一个名字是值还是类型,
            显式标注让它们不必猜
          </>
        ),
      },
      { en: <>A type import loads faster</>, zh: <>类型导入加载更快</> },
      {
        en: (
          <>
            Without <code>type</code>, types would leak into the run time
          </>
        ),
        zh: (
          <>
            不写 <code>type</code>,类型就会漏进运行时
          </>
        ),
      },
      {
        en: <>It is only a style preference with no real effect</>,
        zh: <>纯粹是风格偏好,没有实际差别</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The line is gone after compilation, so there is no loading to speak
            of. The benefit is that the build tool does not have to guess, not
            run-time speed.
          </>
        ),
        zh: (
          <>
            这一行编译后就没了,谈不上加载。
            收益在于构建工具不用猜,而不是运行时速度。
          </>
        ),
      },
      {
        en: (
          <>
            Types never reach the run time; erasure is unconditional. The real
            risk runs the other way: a tool guesses wrong, drops an import that a{" "}
            <b>value</b> needed, and the program fails at run time.
          </>
        ),
        zh: (
          <>
            类型永远到不了运行时,擦除是无条件的。真正的风险方向相反:
            工具猜错,把某个<b>值</b>需要的导入删掉了,程序在运行时才失败。
          </>
        ),
      },
      {
        en: (
          <>
            For a project compiled only by <code>tsc</code> the difference is
            small. Add a single-file transpiler and it becomes a correctness
            problem, which is why TypeScript 5.0 added{" "}
            <code>verbatimModuleSyntax</code> to make the rule explicit.
          </>
        ),
        zh: (
          <>
            只用 <code>tsc</code> 编译的项目,差别确实不大。
            一旦接入单文件转译器,它就成了正确性问题 ——
            这也是 TypeScript 5.0 加入 <code>verbatimModuleSyntax</code>{" "}
            把规则明确下来的原因。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>tsc</code> sees the whole project, so it can work out which
          imports are type-only. Vite, esbuild, and SWC compile one file at a
          time and cannot. With <code>verbatimModuleSyntax</code> on, import and
          export statements are kept exactly as written, and importing a type
          without <code>type</code> is reported as <code>ts(1484)</code>:
          &quot;&apos;Order&apos; is a type and must be imported using a
          type-only import when &apos;verbatimModuleSyntax&apos; is
          enabled.&quot; Re-exporting one gets the matching{" "}
          <code>ts(1205)</code>.
        </>
      ),
      zh: (
        <>
          <code>tsc</code> 看得到整个项目,能推断出哪些导入只有类型;
          Vite、esbuild、SWC 一次只编译一个文件,推断不了。打开{" "}
          <code>verbatimModuleSyntax</code> 后,import / export
          语句会被原样保留,导入类型时不写 <code>type</code> 会报{" "}
          <code>ts(1484)</code>:&quot;&apos;Order&apos; is a type and must be
          imported using a type-only import when
          &apos;verbatimModuleSyntax&apos; is enabled.&quot; 转手导出则报对应的{" "}
          <code>ts(1205)</code>。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You import <code>lodash</code> and get ts(7016), &quot;Could not find a
          declaration file for module &apos;lodash&apos;&quot;. What should you
          do first?
        </>
      ),
      zh: (
        <>
          导入 <code>lodash</code> 时撞上 ts(7016)「Could not find a declaration
          file for module &apos;lodash&apos;」。最该先做的是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>npm i -D @types/lodash</code>
          </>
        ),
        zh: (
          <>
            <code>npm i -D @types/lodash</code>
          </>
        ),
      },
      {
        en: (
          <>
            Reinstall the package with <code>npm i lodash</code>
          </>
        ),
        zh: (
          <>
            用 <code>npm i lodash</code> 重装一遍
          </>
        ),
      },
      {
        en: (
          <>
            Annotate the imported value as <code>any</code> and move on
          </>
        ),
        zh: (
          <>
            把导入的东西标成 <code>any</code>,继续干活
          </>
        ),
      },
      {
        en: (
          <>
            Turn off <code>strict</code> so the error goes away
          </>
        ),
        zh: (
          <>
            关掉 <code>strict</code>,让报错消失
          </>
        ),
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The package is already installed. If it were not, the error would be{" "}
            <code>ts(2307): Cannot find module &apos;lodash&apos;</code>{" "}
            instead. What is missing is the type declarations, and reinstalling
            does not add them.
          </>
        ),
        zh: (
          <>
            包已经装好了 —— 没装的话,报错会是{" "}
            <code>ts(2307): Cannot find module &apos;lodash&apos;</code>。
            缺的是类型声明,重装并不会带来它。
          </>
        ),
      },
      {
        en: (
          <>
            It compiles, but every one of lodash&apos;s functions is now{" "}
            <code>any</code>: no completion, no argument checking, no return
            type. That is a lot to give up to silence one line.
          </>
        ),
        zh: (
          <>
            能编译通过,但 lodash 的每个函数从此都是 <code>any</code>:
            没有补全、不检查参数、没有返回类型。
            为了消掉一行报错,代价太大。
          </>
        ),
      },
      {
        en: (
          <>
            That weakens checking across the whole project because of one
            library. And the error message already states the correct fix.
          </>
        ),
        zh: (
          <>
            为了一个库,把整个项目的检查都削弱了。
            而正确的解法,报错原文里已经写着。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Check the three sources in order: bundled with the package, then{" "}
          <code>@types</code>, then a declaration you write yourself. lodash is
          an established library, so <code>@types/lodash</code> exists. One
          command restores types, completion, and documentation hints.
        </>
      ),
      zh: (
        <>
          按顺序检查三个来源:包自带 → <code>@types</code> → 自己写声明。
          lodash 是老牌库,<code>@types/lodash</code> 一定有。
          一条命令,类型、补全和文档提示就都回来了。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          What is the name of the community-maintained repository that the{" "}
          <code>@types/*</code> packages are published from?
        </>
      ),
      zh: (
        <>
          <code>@types/*</code> 这些包是从哪个社区维护的仓库发布出来的?
          (英文原名)
        </>
      ),
    },
    placeholder: { en: "Repository name…", zh: "输入仓库名…" },
    answers: ["DefinitelyTyped", "definitely typed"],
    hint: {
      en: (
        <>
          Two English words written as one, on GitHub. The name is a claim about
          the libraries it covers: they definitely have types now.
        </>
      ),
      zh: (
        <>
          两个英文单词连写,在 GitHub 上。
          这个名字是在讲它收录的那些库:现在它们「确实有类型了」。
        </>
      ),
    },
    why: {
      en: (
        <>
          DefinitelyTyped holds community-written declarations for thousands of
          JavaScript libraries and publishes them as <code>@types/*</code>. You
          can send a pull request too, so the next person does not have to write
          the same declarations again.
        </>
      ),
      zh: (
        <>
          DefinitelyTyped 收录了几千个 JavaScript 库的社区声明,并发布成{" "}
          <code>@types/*</code>。你也可以给它提 PR,
          让下一个人不必再写一遍同样的声明。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What do you get after installing <code>@types/node</code>?
        </>
      ),
      zh: (
        <>
          装了 <code>@types/node</code> 之后,你得到的是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Type declarations for Node&apos;s built-in modules: <code>fs</code>,{" "}
            <code>path</code>, <code>process</code>, and the rest
          </>
        ),
        zh: (
          <>
            Node 内置模块的类型声明:<code>fs</code>、<code>path</code>、
            <code>process</code> 等等
          </>
        ),
      },
      {
        en: (
          <>
            The ability for Node to run <code>.ts</code> files directly
          </>
        ),
        zh: (
          <>
            让 Node 能直接运行 <code>.ts</code> 文件的能力
          </>
        ),
      },
      {
        en: <>Type declarations for the browser DOM APIs</>,
        zh: <>浏览器 DOM API 的类型声明</>,
      },
      {
        en: <>Types for every package on npm, in one bundle</>,
        zh: <>npm 上所有包的类型合集</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            An <code>@types</code> package contains types only and changes
            nothing at run time. Node running TypeScript directly is a Node
            feature (type stripping, added in Node 22.6), unrelated to this
            package.
          </>
        ),
        zh: (
          <>
            <code>@types</code> 包里只有类型,不改变任何运行时能力。
            Node 能直接跑 TypeScript 是 Node 自己的功能
            (类型剥离,Node 22.6 加入),和这个包无关。
          </>
        ),
      },
      {
        en: (
          <>
            DOM types ship with TypeScript in <code>lib.dom.d.ts</code> and are
            controlled by the <code>lib</code> option. That is a different source
            entirely.
          </>
        ),
        zh: (
          <>
            DOM 的类型随 TypeScript 一起发布,在 <code>lib.dom.d.ts</code> 里,
            由 <code>lib</code> 选项控制 —— 完全是另一个来源。
          </>
        ),
      },
      {
        en: (
          <>
            One package, one set of declarations. <code>@types/node</code> covers
            Node&apos;s own APIs. For lodash you still install{" "}
            <code>@types/lodash</code>.
          </>
        ),
        zh: (
          <>
            一个包一份声明。<code>@types/node</code> 只管 Node 自己的 API;
            lodash 的还得另装 <code>@types/lodash</code>。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>fs</code>, <code>path</code>, and <code>process</code> are not
          part of the JavaScript language. Node provides them, so their
          declarations are not in TypeScript&apos;s bundled libs. They come from{" "}
          <code>@types/node</code>, which is why almost every Node project
          installs it.
        </>
      ),
      zh: (
        <>
          <code>fs</code>、<code>path</code>、<code>process</code>{" "}
          不属于 JavaScript 语言本身,它们由 Node 提供,
          所以声明不在 TypeScript 自带的那几本 lib 里,而来自{" "}
          <code>@types/node</code>。这也是几乎每个 Node 项目都要装它的原因。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which statements about <code>declare</code> are correct? (multiple)
        </>
      ),
      zh: (
        <>
          关于 <code>declare</code>,哪些说法是对的?(多选)
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>declare</code> describes types and emits no code
          </>
        ),
        zh: (
          <>
            <code>declare</code> 只描述类型,不产出任何代码
          </>
        ),
      },
      {
        en: (
          <>
            Adding a field to <code>window</code> from inside a module file
            requires a <code>declare global</code> block
          </>
        ),
        zh: (
          <>
            在模块文件里给 <code>window</code> 加字段,要写在{" "}
            <code>declare global</code> 块里
          </>
        ),
      },
      {
        en: (
          <>
            Anything you <code>declare</code> is guaranteed to exist at run time
          </>
        ),
        zh: (
          <>
            <code>declare</code> 过的东西,运行时保证存在
          </>
        ),
      },
      {
        en: (
          <>
            <code>declare module</code> only accepts npm package names, not other
            module specifiers
          </>
        ),
        zh: (
          <>
            <code>declare module</code> 只接受 npm 包名,不能写其他模块标识
          </>
        ),
      },
    ],
    correct: [0, 1],
    missHint: {
      en: (
        <>
          You missed one. Think about the declaration file that adds a field to{" "}
          <code>window</code>. What has to wrap the{" "}
          <code>interface Window</code> block?
        </>
      ),
      zh: (
        <>
          漏了一条。想想那份给 <code>window</code> 加字段的声明文件:
          <code>interface Window</code> 那一块外面得包着什么?
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your picks is wrong. A declaration convinces the compiler. It
          does not put anything on the shelf at run time.
        </>
      ),
      zh: <>有一项选错了。声明能说服编译器,但它不会让运行时凭空多出一样东西。</>,
    },
    why: {
      en: (
        <>
          <code>declare</code> states a type and emits nothing, so when the claim
          is wrong the failure happens at run time, inside your program.{" "}
          <code>declare global</code> is the correct way to reach the global
          scope from inside a module, and using it elsewhere is{" "}
          <code>ts(2669)</code>. As for module specifiers,{" "}
          <code>declare module</code> takes any string a module can be imported
          by — a package name, a path, or a wildcard such as{" "}
          <code>&quot;*.css&quot;</code>.
        </>
      ),
      zh: (
        <>
          <code>declare</code> 只陈述类型、不产出代码,
          所以断言错了,失败会发生在运行时、发生在你的程序里。
          <code>declare global</code> 是从模块内部触及全局作用域的正确写法,
          写在别处会报 <code>ts(2669)</code>。至于模块标识,
          <code>declare module</code> 接受任何能用来导入模块的字符串 ——
          包名、路径,或者像 <code>&quot;*.css&quot;</code> 这样的通配符。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Your <code>tsconfig.json</code> maps <code>&quot;@/*&quot;</code> to{" "}
          <code>&quot;./src/*&quot;</code> under <code>paths</code>, and{" "}
          <code>tsc</code> reports no errors. You run the emitted JavaScript with
          plain <code>node</code>. What happens?
        </>
      ),
      zh: (
        <>
          你的 <code>tsconfig.json</code> 在 <code>paths</code> 里把{" "}
          <code>&quot;@/*&quot;</code> 映射到 <code>&quot;./src/*&quot;</code>,
          <code>tsc</code> 没有任何报错。现在直接用 <code>node</code>{" "}
          运行编译产物,会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            It fails: <code>tsc</code> leaves <code>&quot;@/tax&quot;</code> in
            the output as written, and Node has no such mapping
          </>
        ),
        zh: (
          <>
            会失败:<code>tsc</code> 把 <code>&quot;@/tax&quot;</code>{" "}
            原样留在产物里,而 Node 没有这条映射
          </>
        ),
      },
      {
        en: (
          <>
            It works — <code>tsc</code> rewrites the alias into a relative path
          </>
        ),
        zh: (
          <>
            能正常运行 —— <code>tsc</code> 会把别名改写成相对路径
          </>
        ),
      },
      {
        en: (
          <>
            It works, because Node reads <code>paths</code> from{" "}
            <code>tsconfig.json</code>
          </>
        ),
        zh: (
          <>
            能正常运行,因为 Node 会读 <code>tsconfig.json</code> 里的{" "}
            <code>paths</code>
          </>
        ),
      },
      {
        en: (
          <>
            It fails, and <code>tsc</code> would have reported the problem first
          </>
        ),
        zh: (
          <>
            会失败,而且 <code>tsc</code> 本来就会先报错
          </>
        ),
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            <code>tsc</code> does not rewrite module specifiers. Check the output
            yourself: the emitted file still says{" "}
            <code>import {"{ TAX }"} from &quot;@/tax&quot;</code>.
          </>
        ),
        zh: (
          <>
            <code>tsc</code> 不会改写模块标识。自己看一眼产物就知道:
            emit 出来的文件里还是{" "}
            <code>import {"{ TAX }"} from &quot;@/tax&quot;</code>。
          </>
        ),
      },
      {
        en: (
          <>
            Node never reads <code>tsconfig.json</code>. It treats{" "}
            <code>&quot;@/tax&quot;</code> as a package name and reports{" "}
            <code>Cannot find package &apos;@/tax&apos;</code>.
          </>
        ),
        zh: (
          <>
            Node 从不读 <code>tsconfig.json</code>。它会把{" "}
            <code>&quot;@/tax&quot;</code> 当包名来解析,然后报{" "}
            <code>Cannot find package &apos;@/tax&apos;</code>。
          </>
        ),
      },
      {
        en: (
          <>
            It does fail, but <code>tsc</code> stays quiet. <code>paths</code>{" "}
            told the compiler where to look, and the file was there, so from the
            compiler&apos;s point of view everything was correct.
          </>
        ),
        zh: (
          <>
            确实会失败,但 <code>tsc</code> 不会出声。<code>paths</code>{" "}
            告诉了编译器去哪里找,文件也确实在那儿 ——
            从编译器的角度看,一切正常。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>paths</code> is a compile-time mapping. It only tells the
          compiler which file a specifier refers to. Whatever runs the code —
          Node, a bundler, a test runner — needs its own matching configuration,
          or the import fails. Next.js, Vite, and webpack read{" "}
          <code>tsconfig.json</code> paths or offer an equivalent alias option,
          which is why aliases usually work inside an app and break the first
          time you run plain <code>node</code> on the output.
        </>
      ),
      zh: (
        <>
          <code>paths</code> 是编译期的映射,
          它只告诉编译器某个标识指向哪个文件。真正运行代码的那一方 ——
          Node、打包器、测试运行器 —— 需要一份自己的对应配置,否则导入就会失败。
          Next.js、Vite、webpack 会读 <code>tsconfig.json</code> 的 paths,
          或者提供等价的别名选项;这就是为什么别名在应用里通常好用,
          却在你第一次用纯 <code>node</code> 跑产物时失败。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What does <code>&quot;skipLibCheck&quot;: true</code> skip?
        </>
      ),
      zh: (
        <>
          <code>&quot;skipLibCheck&quot;: true</code> 跳过的是什么检查?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Type checking inside <code>.d.ts</code> files — your own calls into
            those libraries are still checked
          </>
        ),
        zh: (
          <>
            <code>.d.ts</code> 文件内部的类型检查 ——
            你自己代码对这些库的调用照查不误
          </>
        ),
      },
      {
        en: <>Every place in your code that uses a third-party library</>,
        zh: <>你代码里所有用到第三方库的地方</>,
      },
      {
        en: (
          <>
            Compilation of the JavaScript files in <code>node_modules</code>
          </>
        ),
        zh: (
          <>
            <code>node_modules</code> 里 JavaScript 文件的编译
          </>
        ),
      },
      {
        en: (
          <>
            The same thing as turning <code>strict</code> off
          </>
        ),
        zh: (
          <>
            相当于把 <code>strict</code> 关掉
          </>
        ),
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The other way around. Pass the wrong argument or misspell a method
            and you still get an error. What is skipped is checking the
            declarations against each other, not checking how you use them.
          </>
        ),
        zh: (
          <>
            方向反了。参数传错、方法名拼错,照样报错。
            跳过的是声明之间的互相检查,不是「你用得对不对」。
          </>
        ),
      },
      {
        en: (
          <>
            JavaScript in <code>node_modules</code> is not type checked to begin
            with, unless you turn on <code>allowJs</code> and include it.{" "}
            <code>skipLibCheck</code> is about <code>.d.ts</code> files.
          </>
        ),
        zh: (
          <>
            <code>node_modules</code> 里的 JavaScript 本来就不参与类型检查,
            除非你打开 <code>allowJs</code> 并把它 include 进来。
            <code>skipLibCheck</code> 管的是 <code>.d.ts</code>。
          </>
        ),
      },
      {
        en: (
          <>
            <code>strict</code> controls how strictly your own code is checked.
            The two are independent, and <code>strict: true</code> together with{" "}
            <code>skipLibCheck: true</code> is a common combination.
          </>
        ),
        zh: (
          <>
            <code>strict</code> 管的是你自己代码的严格程度,两者互不相干。
            <code>strict: true</code> 加 <code>skipLibCheck: true</code>{" "}
            是很常见的组合。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Declaration files can conflict with each other. Two{" "}
          <code>@types</code> packages might declare the same global with
          different types, and you cannot fix either of them.{" "}
          <code>skipLibCheck</code> skips those conflicts and speeds up
          compilation. The trade-off is real but small: a genuine mistake inside
          a declaration file is not reported, so you may only notice it when a
          type looks wrong at a call site.
        </>
      ),
      zh: (
        <>
          声明文件之间会互相冲突:两个 <code>@types</code> 包可能用不同的类型
          声明了同一个全局变量,而这两份你都改不了。
          <code>skipLibCheck</code> 跳过这类冲突,同时让编译更快。
          代价真实存在但不大:声明文件内部真有错也不会报出来,
          你可能只能在调用处发现某个类型不对劲。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A project has <code>helpers.d.ts</code> but no matching{" "}
          <code>helpers.js</code>. You write{" "}
          <code>import {"{ helper }"} from &quot;./helpers&quot;</code> and run
          the output with Node. What happens?
        </>
      ),
      zh: (
        <>
          项目里只有 <code>helpers.d.ts</code>,没有对应的{" "}
          <code>helpers.js</code>。你写{" "}
          <code>import {"{ helper }"} from &quot;./helpers&quot;</code>,
          然后用 Node 运行产物,结果是?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            The type check passes, and Node fails with{" "}
            <code>Cannot find module</code>
          </>
        ),
        zh: (
          <>
            类型检查通过,Node 报 <code>Cannot find module</code> 失败
          </>
        ),
      },
      {
        en: <>The type check fails, so it is caught at compile time</>,
        zh: <>类型检查就会报错,拦在编译期</>,
      },
      {
        en: (
          <>
            It runs — the <code>.d.ts</code> is used as the implementation
          </>
        ),
        zh: (
          <>
            能正常运行 —— <code>.d.ts</code> 会被当作实现
          </>
        ),
      },
      {
        en: (
          <>
            <code>helper</code> is <code>undefined</code> at run time, with no
            error
          </>
        ),
        zh: (
          <>
            运行时 <code>helper</code> 是 <code>undefined</code>,但不报错
          </>
        ),
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The compiler does not stop you. The declaration file is there and the
            shape matches, so the import resolves. That is what makes this
            mistake easy to miss: everything is green until you run it.
          </>
        ),
        zh: (
          <>
            编译器不会拦。声明文件在,形状也对得上,导入就解析成功了。
            这正是这个坑容易漏过去的地方:一路绿灯,直到运行才出问题。
          </>
        ),
      },
      {
        en: (
          <>
            A <code>.d.ts</code> file emits nothing, so there is no
            implementation to use. However detailed the declaration is, it cannot
            produce code.
          </>
        ),
        zh: (
          <>
            <code>.d.ts</code> 不产出任何东西,没有实现可用。
            声明写得再详细,也变不出代码。
          </>
        ),
      },
      {
        en: (
          <>
            It never gets that far. The module itself does not exist, so the
            import fails before any binding is read.
          </>
        ),
        zh: (
          <>
            根本走不到那一步。模块本身不存在,
            导入这一步就失败了,轮不到读取任何绑定。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The compiler reads declarations. The run time looks for real files.
          Both have to exist. Under ESM, Node reports{" "}
          <code>
            Error [ERR_MODULE_NOT_FOUND]: Cannot find module
            &apos;.../helpers.js&apos;
          </code>
          ; under CommonJS it is{" "}
          <code>Error: Cannot find module &apos;./helpers&apos;</code>. Either
          way, a declaration only satisfies the compiler.
        </>
      ),
      zh: (
        <>
          编译器读声明,运行时找真实文件,两样都得在。在 ESM 下 Node 报{" "}
          <code>
            Error [ERR_MODULE_NOT_FOUND]: Cannot find module
            &apos;.../helpers.js&apos;
          </code>
          ,在 CommonJS 下报{" "}
          <code>Error: Cannot find module &apos;./helpers&apos;</code>。
          无论哪种,声明只能让编译器满意。
        </>
      ),
    },
  },
];
