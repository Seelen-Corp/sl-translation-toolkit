import yml from "yaml";
import type { Translator } from "../lib.ts";
import { FileTranslator } from "./trait.ts";
import { ObjectTranslator } from "./object.ts";

export class YamlTranslator<
  Source extends string,
  Target extends string,
  Impl_Translator extends Translator<Source, Target>,
> extends FileTranslator<Impl_Translator> {
  private object_translator: ObjectTranslator<
    object,
    Source,
    Target,
    Impl_Translator
  >;

  constructor(yaml: string, translator: Impl_Translator) {
    super(translator);
    this.object_translator = new ObjectTranslator(yml.parse(yaml), translator);
  }

  override amount(): number {
    return this.object_translator.amount();
  }

  async translate_to(target: Target): Promise<string> {
    return yml.stringify(await this.object_translator.translate_to(target));
  }
}
