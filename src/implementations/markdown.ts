import type { Translator } from "../translators/trait.ts";
import { FileTranslator } from "./trait.ts";

// @deno-types="npm:@types/mdast@4.0.4"
import type { Parent, Root } from "mdast";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import rfdc from "rfdc";
import { YamlTranslator } from "./yaml.ts";

const clone = rfdc({ proto: true });

export class MarkdownTranslator<
  Source extends string,
  Target extends string,
  Impl_Translator extends Translator<Source, Target>,
> extends FileTranslator<Impl_Translator> {
  private processor = remark().use(remarkFrontmatter, ["yaml"]).use(remarkGfm);
  private markdown: Root;

  constructor(markdown: string, translator: Impl_Translator) {
    super(translator);
    this.markdown = this.processor.parse(markdown);
  }

  override amount(): number {
    return 0;
  }

  private static create_translation_tasks(
    mut_ast: Parent,
    target: string,
    translator: Translator<string, string>,
    mut_tasks: Array<() => Promise<void>>,
  ) {
    for (const child of mut_ast.children) {
      if (child.type == "text") {
        mut_tasks.push(async () => {
          child.value = await translator.translate_to(target, child.value);
        });
        continue;
      }

      if (child.type == "yaml") {
        mut_tasks.push(async () => {
          const yamlTranslator = new YamlTranslator(child.value, translator);
          child.value = await yamlTranslator.translate_to(target);
        });
        continue;
      }

      if ("children" in child) {
        MarkdownTranslator.create_translation_tasks(
          child,
          target,
          translator,
          mut_tasks,
        );
      }
    }
  }

  async translate_to(target: Target): Promise<string> {
    this.printInitialInfoAsNeeded();
    const mut_ast = clone(this.markdown);
    const tasks: Array<() => Promise<void>> = [];
    MarkdownTranslator.create_translation_tasks(
      mut_ast,
      target,
      this.translator,
      tasks,
    );
    await this.performTasks(tasks, target);
    // the &#x20; present on tables could be an issue of the library and should be reported
    return this.processor.stringify(mut_ast).replaceAll("&#x20;", " ");
  }
}
