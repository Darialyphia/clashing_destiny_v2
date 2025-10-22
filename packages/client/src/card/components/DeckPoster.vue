<script setup lang="ts">
import { CARD_KINDS, type SpellSchool } from '@game/engine/src/card/card.enums';
import type {
  CardBlueprint,
  HeroBlueprint
} from '@game/engine/src/card/card-blueprint';
import BlueprintSmallCard from './BlueprintSmallCard.vue';
import { domToPng } from 'modern-screenshot';
import { Icon } from '@iconify/vue';

const { spellSchools, mainDeck, destinyDeck, name } = defineProps<{
  spellSchools: SpellSchool[];
  mainDeck: Array<{ blueprint: CardBlueprint; copies: number }>;
  destinyDeck: Array<{ blueprint: CardBlueprint; copies: number }>;
  name: string;
}>();

const heroes = computed(() =>
  destinyDeck
    .filter(item => item.blueprint.kind === CARD_KINDS.HERO)
    .sort(
      (a, b) =>
        (a.blueprint as HeroBlueprint).level -
        (b.blueprint as HeroBlueprint).level
    )
);
const otherDestinyCards = computed(() =>
  destinyDeck.filter(item => item.blueprint.kind !== CARD_KINDS.HERO)
);

const minions = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.MINION)
);
const spells = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.SPELL)
);
const artifacts = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.ARTIFACT)
);
const sigils = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.SIGIL)
);

const root = useTemplateRef('root');
const saveButton = useTemplateRef('saveButton');
const saveImage = async () => {
  if (!root.value) return;
  saveButton.value!.style.display = 'none';
  await nextTick();
  const dataUrl = await domToPng(root.value);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${name}-deck-poster.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  saveButton.value!.style.display = '';
};
</script>

<template>
  <div class="surface p-8" ref="root">
    <header class="flex gap-4 items-center mb-5">
      <h2 class="dual-text" :data-text="name">{{ name }}</h2>
      <div class="spellschools">
        <img
          v-for="spellSchool in spellSchools"
          :key="spellSchool"
          :src="`/assets/ui/spell-school-${spellSchool.toLocaleLowerCase()}.png`"
          :alt="spellSchool"
        />
      </div>
      <div class="flex gap-2 ml-auto">
        <div>
          <span class="font-bold text-3">
            {{ minions.length }}
          </span>
          {{ minions.length <= 1 ? 'Minion' : 'Minions' }}
        </div>
        <div>
          <span class="font-bold text-3">
            {{ spells.length }}
          </span>
          {{ spells.length <= 1 ? 'Spell' : 'Spells' }}
        </div>
        <div>
          <span class="font-bold text-3">
            {{ artifacts.length }}
          </span>
          {{ artifacts.length <= 1 ? 'Artifact' : 'Artifacts' }}
        </div>
        <div>
          <span class="font-bold text-3">
            {{ sigils.length }}
          </span>
          {{ sigils.length <= 1 ? 'Sigil' : 'Sigils' }}
        </div>
      </div>
      <button @click="saveImage" ref="saveButton">
        <Icon icon="material-symbols-light:download" class="w-7 h-7" />
      </button>
    </header>

    <div class="content">
      <div>
        <section>
          <BlueprintSmallCard
            v-for="item in heroes"
            :key="item.blueprint.id"
            :blueprint="item.blueprint"
            :show-text="false"
          />
          <BlueprintSmallCard
            v-for="item in otherDestinyCards"
            :key="item.blueprint.id"
            :blueprint="item.blueprint"
            :show-text="false"
          />
        </section>
        <section>
          <div
            v-for="item in [...minions, ...spells, ...artifacts, ...sigils]"
            :key="item.blueprint.id"
            class="card-wrapper"
          >
            <BlueprintSmallCard
              v-for="i in item.copies"
              :key="i"
              :blueprint="item.blueprint"
              :show-text="false"
            />
          </div>
        </section>
      </div>

      <div class="listing">
        <h3 class="dual-text" data-text="Destiny Deck">Destiny Deck</h3>
        <ul>
          <li
            v-for="item in heroes"
            :key="item.blueprint.id"
            :class="item.blueprint.rarity.toLocaleLowerCase()"
          >
            {{ item.copies }}x {{ item.blueprint.name }}
          </li>

          <li
            v-for="item in otherDestinyCards"
            :key="item.blueprint.id"
            :class="item.blueprint.rarity.toLocaleLowerCase()"
          >
            {{ item.copies }}x {{ item.blueprint.name }}
          </li>
        </ul>
        <h3 class="dual-text" data-text="Main Deck">Main Deck</h3>
        <ul>
          <li v-for="item in minions" :key="item.blueprint.id">
            {{ item.copies }}x
            <span :class="item.blueprint.rarity.toLocaleLowerCase()">
              {{ item.blueprint.name }}
            </span>
          </li>
          <li v-for="item in spells" :key="item.blueprint.id">
            {{ item.copies }}x
            <span :class="item.blueprint.rarity.toLocaleLowerCase()">
              {{ item.blueprint.name }}
            </span>
          </li>
          <li v-for="item in artifacts" :key="item.blueprint.id">
            {{ item.copies }}x
            <span :class="item.blueprint.rarity.toLocaleLowerCase()">
              {{ item.blueprint.name }}
            </span>
          </li>
          <li v-for="item in sigils" :key="item.blueprint.id">
            {{ item.copies }}x
            <span :class="item.blueprint.rarity.toLocaleLowerCase()">
              {{ item.blueprint.name }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@layer components {
  .dual-text {
    color: transparent;
    position: relative;
    --_top-color: var(--top-color, #fcfcfc);
    --_bottom-color: var(--bottom-color, #ffb270);
    &::before,
    &::after {
      position: absolute;
      content: attr(data-text);
      color: transparent;
      inset: 0;
    }
    &:after {
      background: linear-gradient(
        var(--_top-color),
        var(--_top-color) 50%,
        var(--_bottom-color) 50%
      );
      line-height: 1.2;
      background-clip: text;
      background-size: 100% 1lh;
      background-repeat: repeat-y;
      translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
    }
    &:before {
      -webkit-text-stroke: calc(2px * var(--pixel-scale)) black;
      z-index: -1;
      translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
    }
  }

  h2 {
    font-family: 'Cinzel Decorative', serif;
    --dual-text-offset-y: 5px;
  }

  .spellschools {
    display: flex;
    gap: var(--size-2);
    img {
      --pixel-scale: 2;
      width: calc(var(--pixel-scale) * 22px);
      height: calc(var(--pixel-scale) * 20px);
    }
  }

  h3 {
    font-family: 'Cinzel Decorative', serif;
    font-size: var(--font-size-3);
  }

  section {
    --pixel-scale: 1;
    display: flex;
    flex-wrap: wrap;
    margin-block-end: var(--size-4);
    gap: var(--size-2);
  }
}

.card-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  padding-bottom: var(--size-7);
  > * {
    grid-column: 1;
    grid-row: 1;
    transform: translateY(calc(10px * (var(--child-index) - 1)));
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr var(--size-13);
}

.listing {
  font-size: var(--font-size-0);
  h3 {
    margin-block-end: var(--size-2);
    &:not(:first-of-type) {
      margin-block-start: var(--size-4);
    }
  }

  .rare {
    color: var(--blue-4);
  }

  .epic {
    color: var(--purple-4);
  }

  .legendary {
    color: var(--orange-4);
  }
}
</style>
