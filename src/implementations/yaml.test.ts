import { assertEquals, assertMatch } from "@std/assert";
import { MockTranslator } from "../translators/Mock.ts";
import { YamlTranslator } from "./yaml.ts";
import yml from "yaml";

function makeTranslator(yaml: string) {
  const t = new YamlTranslator(yaml, new MockTranslator());
  t.gap = 0;
  return t;
}

Deno.test("translates yaml string values", async () => {
  const t = makeTranslator("greeting: hello\nfarewell: goodbye\n");
  const result = await t.translate_to("es");
  const parsed = yml.parse(result);
  assertEquals(parsed.greeting, "[es] hello");
  assertEquals(parsed.farewell, "[es] goodbye");
});

Deno.test("output is valid yaml", async () => {
  const t = makeTranslator("a: text\nb: more text\n");
  const result = await t.translate_to("es");
  assertEquals(typeof result, "string");
  assertMatch(result, /:/);
  const parsed = yml.parse(result);
  assertEquals(typeof parsed, "object");
});

Deno.test("translates nested yaml", async () => {
  const t = makeTranslator("section:\n  title: hello\n  body: world\n");
  const result = await t.translate_to("es");
  const parsed = yml.parse(result);
  assertEquals(parsed.section.title, "[es] hello");
  assertEquals(parsed.section.body, "[es] world");
});

Deno.test("output yaml keys are sorted", async () => {
  const t = makeTranslator("z: last\na: first\n");
  const result = await t.translate_to("es");
  const keys = Object.keys(yml.parse(result));
  assertEquals(keys[0], "a");
  assertEquals(keys[1], "z");
});

Deno.test("source() returns sorted yaml and hash table", () => {
  const t = makeTranslator("b: second\na: first\n");
  const { yaml, hashTable } = t.source();
  const parsed = yml.parse(yaml);
  const keys = Object.keys(parsed);
  assertEquals(keys[0], "a");
  assertEquals(hashTable.size, 2);
});

Deno.test("amount() returns count of string leaves", () => {
  const t = makeTranslator("a: one\nb: two\nc: three\n");
  assertEquals(t.amount(), 3);
});
