import { assertEquals } from "@std/assert";
import { MockTranslator } from "../translators/Mock.ts";
import { ObjectTranslator } from "./object.ts";

function makeTranslator(obj: object) {
  const t = new ObjectTranslator(obj, new MockTranslator());
  t.gap = 0;
  return t;
}

Deno.test("translates flat object", async () => {
  const t = makeTranslator({ hello: "hello", world: "world" });
  const result = await t.translate_to("es");
  assertEquals(result, { hello: "[es] hello", world: "[es] world" });
});

Deno.test("translates nested object", async () => {
  const t = makeTranslator({ a: { b: "text", c: "more" } });
  const result = await t.translate_to("es");
  assertEquals(result, { a: { b: "[es] text", c: "[es] more" } });
});

Deno.test("skips keys starting with _ or $", async () => {
  const t = makeTranslator({ _skip: "skip me", $also: "skip", keep: "keep" });
  const result = await t.translate_to("es");
  assertEquals(result, { keep: "[es] keep" });
});

Deno.test("skips falsy values", async () => {
  const t = makeTranslator({ empty: "", keep: "text" });
  const result = await t.translate_to("es");
  assertEquals(result, { keep: "[es] text" });
});

Deno.test("removes keys absent in source from cached result", async () => {
  const t = makeTranslator({ a: "text" });
  const result = await t.translate_to("es", { a: "[es] text", stale: "[es] stale" } as never);
  assertEquals(result, { a: "[es] text" });
});

Deno.test("array source returns array result", async () => {
  const t = makeTranslator(["hello", "world"] as never);
  const result = await t.translate_to("es");
  assertEquals(Array.isArray(result), true);
  assertEquals(result, ["[es] hello", "[es] world"]);
});

Deno.test("array source with wrong cached object still returns array", async () => {
  const t = makeTranslator(["hello", "world"] as never);
  const result = await t.translate_to("es", {} as never);
  assertEquals(Array.isArray(result), true);
  assertEquals(result, ["[es] hello", "[es] world"]);
});

Deno.test("array source with correct cached array reuses cached values", async () => {
  const t = makeTranslator(["hello", "world"] as never);
  const cached = ["[es] hello", "[es] world"] as never;
  const result = await t.translate_to("es", cached);
  assertEquals(Array.isArray(result), true);
  assertEquals(result, ["[es] hello", "[es] world"]);
});

Deno.test("array of objects source returns array result", async () => {
  const t = makeTranslator([{ name: "hello" }, { name: "world" }] as never);
  const result = await t.translate_to("es") as Array<{ name: string }>;
  assertEquals(Array.isArray(result), true);
  assertEquals(result[0]?.name, "[es] hello");
  assertEquals(result[1]?.name, "[es] world");
});

Deno.test("does not retranslate unchanged strings when cached matches hash", async () => {
  const source = { a: "text", b: "other" };
  const first = makeTranslator(source);
  first.gap = 0;
  const firstResult = await first.translate_to("es");

  const second = new ObjectTranslator(source, new MockTranslator(), first.source().hashTable);
  second.gap = 0;
  const secondResult = await second.translate_to("es", firstResult as never);

  assertEquals(secondResult, firstResult);
});

Deno.test("source() returns sorted object and hash table", () => {
  const t = makeTranslator({ z: "last", a: "first" });
  const { obj, hashTable } = t.source();
  const keys = Object.keys(obj);
  assertEquals(keys[0], "a");
  assertEquals(keys[1], "z");
  assertEquals(hashTable.size, 2);
});

Deno.test("amount() counts all string leaves", () => {
  const t = makeTranslator({ a: "x", b: { c: "y", d: { e: "z" } } });
  assertEquals(t.amount(), 3);
});
