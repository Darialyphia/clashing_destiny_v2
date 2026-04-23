import type { JobId } from '@game/engine/src/card/card.enums';
import type { InjectionKey, Ref } from 'vue';

export type RichTextContext = {
  heroLevel: Ref<number>;
  heroJobs: Ref<JobId[]>;
};

export const RICH_TEXT_CONTEXT_KEY = Symbol(
  'rich-text-context'
) as InjectionKey<RichTextContext>;
export const provideRichTextContext = (context: RichTextContext) => {
  provide(RICH_TEXT_CONTEXT_KEY, context);
  return context;
};

export const useRichTextContext = () => {
  const context = inject(RICH_TEXT_CONTEXT_KEY);

  return context;
};
