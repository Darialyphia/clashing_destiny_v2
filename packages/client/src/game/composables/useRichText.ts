import { useSafeInject } from '@/shared/composables/useSafeInject';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { Nullable } from '@game/shared';
import type { Ref, InjectionKey } from 'vue';

export type RichTextContext = {
  card: Ref<Nullable<CardViewModel>>;
};

export const RICH_TEXT_CONTEXT_KEY = Symbol(
  'rich-text-context'
) as InjectionKey<RichTextContext>;
export const provideRichTextContext = (context: RichTextContext) => {
  provide(RICH_TEXT_CONTEXT_KEY, context);
  return context;
};

export const useRichTextContext = () => useSafeInject(RICH_TEXT_CONTEXT_KEY);
