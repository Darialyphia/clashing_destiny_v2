<script setup lang="ts">
import {
  useCard,
  useGameClient,
  useMyPlayer
} from '../composables/useGameClient';
import Card from '@/card/components/Card.vue';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
  type PopoverContentProps
} from 'reka-ui';
import CardActions from './CardActions.vue';
import SmallCard from '@/card/components/SmallCard.vue';

const {
  cardId,
  actionsOffset = -50,
  actionsSide,
  variant = 'default',
  isInteractive = true
} = defineProps<{
  cardId: string;
  actionsOffset?: number;
  actionsSide?: PopoverContentProps['side'];
  variant?: 'default' | 'small';
  isInteractive?: boolean;
}>();

const card = useCard(computed(() => cardId));

const client = useGameClient();

const isActionsPopoverOpened = computed({
  get() {
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(card.value);
  },
  set(value) {
    if (value) {
      client.value.ui.select(card.value);
    } else {
      client.value.ui.unselect();
    }
  }
});

const isTargetable = computed(() => {
  return (
    card.value.canBeTargeted ||
    client.value.ui.selectedManaCostIndices.includes(card.value.indexInHand!)
  );
});

const myPlayer = useMyPlayer();

const handleClick = () => {
  if (!isInteractive) return;
  client.value.ui.onCardClick(card.value);
};

const classes = computed(() => {
  return {
    exhausted: isInteractive && card.value.isExhausted,
    disabled: !card.value.canPlay && card.value.location === 'hand',
    selected: client.value.ui.selectedCard?.equals(card.value),
    targetable: isTargetable.value,
    flipped: !myPlayer.value.equals(card.value.player)
  };
});
</script>

<template>
  <PopoverRoot v-model:open="isActionsPopoverOpened">
    <PopoverAnchor>
      <Card
        v-if="variant === 'default'"
        :is-animated="false"
        :id="card.id"
        :card="{
          id: card.id,
          name: card.name,
          unlockedSpellSchools: card.unlockedSpellSchools,
          spellSchool: card.spellSchool,
          description: card.description,
          image: card.imagePath,
          kind: card.kind,
          level: card.level,
          rarity: card.rarity,
          speed: card.speed,
          manaCost: card.manaCost,
          baseManaCost: card.baseManaCost,
          destinyCost: card.destinyCost,
          baseDestinyCost: card.baseDestinyCost,
          atk: card.atk,
          hp: card.hp,
          spellpower: card.spellpower,
          durability: card.durability,
          abilities: card.abilities.map(ability => ability.description)
        }"
        class="game-card"
        :class="classes"
        @click="handleClick"
      />
      <SmallCard
        v-else-if="variant === 'small'"
        :id="card.id"
        :card="{
          id: card.id,
          image: card.imagePath,
          kind: card.kind,
          atk: card.atk,
          hp: card.hp,
          durability: card.durability
        }"
        class="game-card"
        :class="classes"
        @click="handleClick"
      />
    </PopoverAnchor>

    <PopoverPortal
      :disabled="
        card.location === 'hand' ||
        card.location === 'discardPile' ||
        card.location === 'banishPile' ||
        card.location === 'destinyDeck'
      "
    >
      <PopoverContent :side-offset="actionsOffset" :side="actionsSide">
        <CardActions :card="card" v-model:is-opened="isActionsPopoverOpened" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
/* @keyframes card-glow {
  0%,
  80%,
  100% {
    box-shadow: 0 0 10px hsl(var(--glow-hsl) / 0.25);
  }
  40% {
    box-shadow: 0 0 30px hsl(var(--glow-hsl) / 0.75);
  }
} */

.selected {
  filter: brightnes(1.2);
}

/* .highlighted::after {
  content: '';
  position: absolute;
  inset: 0;
  --glow-hsl: var(--cyan-4-hsl);
  animation: card-glow 2.5s infinite;
} */

.game-card {
  transition: all 0.3s var(--ease-2);

  &.exhausted {
    filter: grayscale(0.4) brightness(0.8);
    transform: none;
  }
  &.targetable {
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: hsl(200 100% 50% / 0.25);
    }
  }
}

/* @keyframes horizontal-shaking {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
} */

.flipped:deep(.image) {
  scale: -1 1;
  translate: -100% 0;
}
</style>
