import { BackwardMapping, isSupported } from "./DeeplUtils.ts";
import { Translator } from "./trait.ts";
import * as DeeplTranslatorApi from "deepl-node";

export type SupportedSourceLangCodesByDeepl =
  DeeplTranslatorApi.SourceLanguageCode;
export type SupportedTargetLangCodesByDeepl =
  DeeplTranslatorApi.TargetLanguageCode;

export class DeeplTranslator extends Translator<
  SupportedSourceLangCodesByDeepl,
  SupportedTargetLangCodesByDeepl
> {
  private __inner: DeeplTranslatorApi.Translator;
  private alreadyWarned: Record<string, boolean> = {};

  static isSupported(code: string): code is SupportedTargetLangCodesByDeepl {
    return isSupported(code);
  }

  constructor({
    source,
    apiKey,
    options,
  }: {
    source: SupportedSourceLangCodesByDeepl;
    apiKey: string;
    options?: DeeplTranslatorApi.TranslatorOptions;
  }) {
    super({ source });
    this.__inner = new DeeplTranslatorApi.Translator(apiKey, options);
  }

  name(_target?: SupportedTargetLangCodesByDeepl): string {
    return "DeepL";
  }

  async translate_to(
    target: DeeplTranslatorApi.TargetLanguageCode,
    input: string,
  ): Promise<string> {
    const trimmed = input.trim();
    if (trimmed.length <= 1) {
      // avoid perform an API call for single simbols
      return input;
    }
    const initialSpaces = input.match(/^\s+/)?.[0] || "";
    const finalSpaces = input.match(/\s+$/)?.[0] || "";

    if (BackwardMapping[target] && !this.alreadyWarned[target]) {
      console.warn(
        `    Deprecated target '${target}' was mapped to '${
          BackwardMapping[target]
        }'`,
      );
      this.alreadyWarned[target] = true;
    }

    const res = await this.__inner.translateText(
      input,
      this.source,
      BackwardMapping[target] || target,
    );
    // manually mantain the format
    return `${initialSpaces}${res.text}${finalSpaces}`;
  }
}
