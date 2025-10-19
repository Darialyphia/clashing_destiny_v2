<script setup lang="ts">
import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import FancyButton from '@/ui/components/FancyButton.vue';
import { api, GIFT_KINDS, GIFT_STATES } from '@game/api';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
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

definePage({
  name: 'Gifts'
});

const { isLoading, data: gifts } = useAuthedQuery(api.gifts.list, {});

const { mutate: claim } = useAuthedMutation(api.gifts.claim);
</script>

<template>
  <div class="gifts-page">
    <AuthenticatedHeader />

    <div v-if="isLoading" class="loading-state">Loading your gifts...</div>

    <div
      v-else
      class="container"
      :style="{ '--container-size': 'var(--size-md)' }"
    >
      <h2 class="my-6">Your Gifts</h2>
      <AccordionRoot
        v-if="gifts && gifts.length > 0"
        class="flex flex-col gap-4"
        type="multiple"
      >
        <AccordionItem
          v-for="gift in gifts"
          :key="gift.id"
          :value="gift.id"
          class="surface"
        >
          <AccordionHeader class="flex gap-4 items-center block w-full">
            <div>{{ gift.name }}</div>
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
