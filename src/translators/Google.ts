import { asyncSleep } from "../utils/mod.ts";
import { Translator } from "./trait.ts";
import * as GoogleTranslatorApi from "google-translate-api-x";

export type SupportedSourceLangCodesByGoogle =
  keyof typeof GoogleTranslatorApi.languages;
export type SupportedTargetLangCodesByGoogle = Exclude<
  SupportedSourceLangCodesByGoogle,
  "auto"
>;

export class GoogleTranslator extends Translator<
  SupportedSourceLangCodesByGoogle,
  SupportedTargetLangCodesByGoogle
> {
  static isSupported(code: string): code is SupportedTargetLangCodesByGoogle {
    return GoogleTranslatorApi.isSupported(code);
  }

  name(_target?: SupportedTargetLangCodesByGoogle): string {
    return "Google";
  }

  async translate_to(
    target: SupportedSourceLangCodesByGoogle,
    input: string,
  ): Promise<string> {
    const trimmed = input.trim();
    if (trimmed.length <= 1) {
      // avoid perform an API call for single simbols
      return input;
    }
    const initialSpaces = input.match(/^\s+/)?.[0] || "";
    const finalSpaces = input.match(/\s+$/)?.[0] || "";

    const performTranslate = async () => {
      const res = await GoogleTranslatorApi.translate(trimmed, {
        from: this.source,
        to: target,
        forceTo: true,
        forceBatch: false,
        autoCorrect: false,
      });
      return `${initialSpaces}${res.text}${finalSpaces}`;
    };

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await performTranslate();
      } catch (e) {
        if (attempt == 4) {
          throw new Error(`Error translating "${input}" to ${target}: ${e}`);
        }
        await asyncSleep(250);
      }
    }

    // this will never be reached
    return "";
  }
}
