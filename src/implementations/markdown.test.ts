import { assert, assertStringIncludes } from "@std/assert";
import { MockTranslator } from "../translators/Mock.ts";
import { MarkdownTranslator } from "./markdown.ts";

function makeTranslator(markdown: string) {
  const t = new MarkdownTranslator(markdown, new MockTranslator());
  t.gap = 0;
  return t;
}

Deno.test("translates inline text nodes", async () => {
  const t = makeTranslator("Hello world\n");
  const result = await t.translate_to("es");
  assertStringIncludes(result, "[es] Hello world");
});

Deno.test("translates paragraph text", async () => {
  const t = makeTranslator("This is a paragraph.\n");
  const result = await t.translate_to("es");
  assertStringIncludes(result, "[es] This is a paragraph.");
});

Deno.test("output is a string", async () => {
  const t = makeTranslator("Some text\n");
  const result = await t.translate_to("es");
  assert(typeof result === "string");
});

Deno.test("preserves markdown heading structure", async () => {
  const t = makeTranslator("# Title\n\nParagraph.\n");
  const result = await t.translate_to("es");
  assertStringIncludes(result, "# ");
  assertStringIncludes(result, "[es] Title");
  assertStringIncludes(result, "[es] Paragraph.");
});

Deno.test("translates yaml frontmatter", async () => {
  const t = makeTranslator("---\ntitle: hello\n---\n\nBody text.\n");
  const result = await t.translate_to("es");
  assertStringIncludes(result, "[es] hello");
  assertStringIncludes(result, "[es] Body text.");
});

Deno.test("preserves links while translating link text", async () => {
  const t = makeTranslator("[click here](https://example.com)\n");
  const result = await t.translate_to("es");
  // remark escapes brackets in text nodes, so [es] becomes \[es\]
  assertStringIncludes(result, "https://example.com");
  assertStringIncludes(result, "click here");
});
