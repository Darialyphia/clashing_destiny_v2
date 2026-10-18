<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { GIFT_KINDS, GIFT_STATES } from '@game/api';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardRoot
} from 'reka-ui';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { useClaimGift, useGifts } from '@/player/composables/useGifts';
import { useDayjs } from '@/shared/composables/useDayjs';
import PageTitle from '@/shared/components/PageTitle.vue';

definePage({
  name: 'Gifts',
  meta: {
    wrapperClass: 'page-blur'
  }
});
const { isLoading, data: gifts } = useGifts();

const { mutate: claim } = useClaimGift();

const dayjs = useDayjs();
const formatTimeAgo = (timestamp: number) => {
  return dayjs(timestamp).fromNow();
};
</script>

<template>
  <div class="gifts-page">
    <FancyButton
      class="absolute top-10 left-8 lt-lg:top-3 lt-lg:left-0"
      text="Back"
      size="md"
      :to="{ name: 'ClientHome' }"
    />

    <div v-if="isLoading" class="loading-state">Loading your gifts...</div>

    <div
      v-else
      class="container inner"
      :style="{ '--container-size': 'var(--size-md)' }"
    >
      <div>
        <PageTitle title="Your Gifts" />
      </div>
      <AccordionRoot
        v-if="gifts && gifts.length > 0"
        class="list fancy-scrollbar"
        type="multiple"
      >
        <AccordionItem
          v-for="gift in gifts"
          :key="gift.id"
          :value="gift.id"
          class="surface"
        >
          <AccordionHeader class="flex gap-4 items-center block w-full">
            <div class="flex flex-col gap-1">
              {{ gift.name }}
              <div class="text-sm opacity-70 font-4">
                Received {{ formatTimeAgo(gift.receivedAt) }}
              </div>
            </div>
            <FancyButton
              v-if="gift.state === GIFT_STATES.ISSUED"
              text="Claim"
              class="ml-auto"
              @click.stop="claim({ giftId: gift.id })"
            />
            <div v-else-if="gift.state === GIFT_STATES.CLAIMED" class="ml-auto">
              Claimed
            </div>
            <AccordionTrigger as-child>
              <FancyButton text="?" size="sm" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <ul>
              <li v-for="(line, index) in gift.contents" :key="index">
                <template v-if="line.kind === GIFT_KINDS.DECK">
                  1 X {{ line.deckId }}
                </template>

                <ul v-if="line.kind === GIFT_KINDS.CARDS">
                  <li
                    v-for="(cardLine, cardIndex) in line.cards"
                    :key="cardIndex"
                    class="py-2"
                  >
                    <HoverCardRoot :open-delay="0" :close-delay="0">
                      <HoverCardTrigger>
                        {{ cardLine.amount }} X
                        {{
                          CARDS_DICTIONARY[cardLine.blueprintId]?.name ||
                          cardLine.blueprintId
                        }}
                      </HoverCardTrigger>
                      <HoverCardContent side="right">
                        <BlueprintCard
                          :blueprint="CARDS_DICTIONARY[cardLine.blueprintId]"
                        />
                      </HoverCardContent>
                    </HoverCardRoot>
                  </li>
                </ul>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
      <div v-else class="empty-state">You have no gifts at the moment.</div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.gifts-page {
  height: 100dvh;
  overflow: hidden;
  background: url('@/assets/backgrounds/main-menu-overlay.png');
  background-size: 100% 100%;
  padding-top: var(--size-10);
  @screen lt-lg {
    padding-top: var(--size-3);
  }
}

.inner {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  overflow: hidden;
  padding-bottom: var(--size-6);
}

.list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}
</style>
