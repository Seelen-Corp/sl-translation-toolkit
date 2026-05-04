import yml from "yaml";
import type { Translator } from "../lib.ts";
import { FileTranslator } from "./trait.ts";
import { ObjectTranslator } from "./object.ts";

export class YamlTranslator<
  Source extends string,
  Target extends string,
  Impl_Translator extends Translator<Source, Target>,
> extends FileTranslator<Impl_Translator> {
  private object_translator: ObjectTranslator<object, Source, Target, Impl_Translator>;

  constructor(yaml: string, translator: Impl_Translator, hashTable?: Map<string, string>) {
    super(translator);
    this.object_translator = new ObjectTranslator(yml.parse(yaml), translator, hashTable);
  }

  /** return sorted and sanitized source, as well hashtable to be saved */
  source(): { yaml: string; hashTable: Map<string, string> } {
    return {
      yaml: yml.stringify(this.object_translator.source().obj),
      hashTable: this.object_translator.source().hashTable,
    };
  }

  override amount(): number {
    return this.object_translator.amount();
  }

  async translate_to(target: Target): Promise<string> {
    return yml.stringify(await this.object_translator.translate_to(target));
  }
}
