import { useClaimGift, useGifts } from '@/player/composables/useGifts';
import { useDayjs } from '@/shared/composables/useDayjs';
import { useSafeInject } from '@/shared/composables/useSafeInject';
import { GIFT_KINDS, GIFT_STATES, type GiftState } from '@game/api';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import type { ComputedRef, InjectionKey, Ref } from 'vue';

type GiftsData = NonNullable<ReturnType<typeof useGifts>['data']['value']>;
export type Gift = GiftsData[number];

export type GiftItem =
  | { key: string; kind: 'gold'; label: string; amount: number }
  | { key: string; kind: 'dust'; label: string; amount: number }
  | { key: string; kind: 'deck'; label: string; amount: number }
  | {
      key: string;
      kind: 'card';
      label: string;
      amount: number;
      blueprint?: CardBlueprint;
    };

export type GiftsContext = {
  isLoading: Ref<boolean>;
  gifts: ComputedRef<Gift[]>;
  claimableGifts: ComputedRef<Gift[]>;
  isClaiming: Ref<boolean>;
  isClaimingGift: (giftId: Gift['id']) => boolean;
  canClaim: (gift: Gift) => boolean;
  claim: (giftId: Gift['id']) => Promise<void>;
  claimAll: () => Promise<void>;
  formatTimeAgo: (timestamp: number) => string;
  getItems: (gift: Gift) => GiftItem[];
};

export const GiftsInjectionKey = Symbol('gifts') as InjectionKey<GiftsContext>;

export const provideGiftsPage = () => {
  const { isLoading, data } = useGifts();
  const { mutate } = useClaimGift();
  const dayjs = useDayjs();

  const gifts = computed(() => data.value ?? []);
  const isClaimable = (state: GiftState) => state === GIFT_STATES.ISSUED;
  const claimableGifts = computed(() =>
    gifts.value.filter(gift => isClaimable(gift.state))
  );

  const claimingIds = ref(new Set<string>());
  const isClaiming = computed(() => claimingIds.value.size > 0);

  const claim = async (giftId: Gift['id']) => {
    if (claimingIds.value.has(giftId)) return;
    claimingIds.value.add(giftId);
    try {
      await mutate({ giftId });
    } finally {
      claimingIds.value.delete(giftId);
    }
  };

  const api: GiftsContext = {
    isLoading,
    gifts,
    claimableGifts,
    isClaiming,
    isClaimingGift: giftId => claimingIds.value.has(giftId),
    canClaim: gift => isClaimable(gift.state),
    claim,
    claimAll: async () => {
      for (const gift of claimableGifts.value) {
        await claim(gift.id);
      }
    },
    formatTimeAgo: timestamp => dayjs(timestamp).fromNow(),
    getItems: gift =>
      gift.contents.flatMap((line, lineIndex): GiftItem[] => {
        const key = `${gift.id}-${lineIndex}`;
        switch (line.kind) {
          case GIFT_KINDS.GOLD:
            return [{ key, kind: 'gold', label: 'Gold', amount: line.amount }];
          case GIFT_KINDS.CRAFTING_DUST:
            return [
              { key, kind: 'dust', label: 'Crafting Shards', amount: line.amount }
            ];
          case GIFT_KINDS.DECK:
            return [{ key, kind: 'deck', label: 'Deck', amount: 1 }];
          case GIFT_KINDS.CARDS:
            return line.cards.map((card, cardIndex) => {
              const blueprint = CARDS_DICTIONARY[card.blueprintId];
              return {
                key: `${key}-${cardIndex}`,
                kind: 'card',
                label: blueprint?.name ?? card.blueprintId,
                amount: card.amount,
                blueprint
              };
            });
        }
      })
  };

  provide(GiftsInjectionKey, api);
  return api;
};

export const useGiftsPage = () => useSafeInject(GiftsInjectionKey);
