import { Translator } from "./trait.ts";

export class MockTranslator extends Translator<string, string> {
  constructor() {
    super({ source: "en" });
  }

  name(): string {
    return "mock";
  }

  translate_to(to: string, input: string): Promise<string> {
    return new Promise((res) => {
      res(`[${to}] ${input}`);
    });
  }
}
