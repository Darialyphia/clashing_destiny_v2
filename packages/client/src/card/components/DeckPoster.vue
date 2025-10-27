<script setup lang="ts">
import { CARD_KINDS, type SpellSchool } from '@game/engine/src/card/card.enums';
import type {
  CardBlueprint,
  HeroBlueprint
} from '@game/engine/src/card/card-blueprint';
import BlueprintSmallCard from './BlueprintSmallCard.vue';
import { domToPng } from 'modern-screenshot';
import BlueprintCard from './BlueprintCard.vue';
import UiButton from '@/ui/components/UiButton.vue';

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
const minionsCount = computed(() =>
  minions.value.reduce((sum, item) => sum + item.copies, 0)
);
const spells = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.SPELL)
);
const spellsCount = computed(() =>
  spells.value.reduce((sum, item) => sum + item.copies, 0)
);
const artifacts = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.ARTIFACT)
);
const artifactsCount = computed(() =>
  artifacts.value.reduce((sum, item) => sum + item.copies, 0)
);
const sigils = computed(() =>
  mainDeck.filter(item => item.blueprint.kind === CARD_KINDS.SIGIL)
);
const sigilsCount = computed(() =>
  sigils.value.reduce((sum, item) => sum + item.copies, 0)
);

const root = useTemplateRef('root');
const optionsBar = useTemplateRef('optionsBar');
const saveImage = async () => {
  if (!root.value) return;
  optionsBar.value!.style.display = 'none';
  root.value.style.maxHeight = 'none';
  await nextTick();
  const dataUrl = await domToPng(root.value);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${name}-deck-poster.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  optionsBar.value!.style.display = '';
  root.value.style.maxHeight = '';
};

const mode = ref('condensed' as 'full' | 'condensed');

const cardComponent = computed(() =>
  mode.value === 'full' ? BlueprintCard : BlueprintSmallCard
);
</script>

<template>
  <div
    class="surface deck-poster-root fancy-scrollbar"
    :class="mode"
    ref="root"
  >
    <div class="flex gap-3 items-center" ref="optionsBar">
      <UiButton class="primary-button" @click="saveImage">
        Download PNG
      </UiButton>
      <input type="radio" id="full" value="full" v-model="mode" />
      <label for="full">Full</label>
      <input type="radio" id="condensed" value="condensed" v-model="mode" />
      <label for="condensed">Condensed</label>
    </div>
    <header class="flex gap-4 items-center mb-5">
      <h2 :data-text="name">{{ name }}</h2>
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
            {{ minionsCount }}
          </span>
          {{ minionsCount <= 1 ? 'Minion' : 'Minions' }}
        </div>
        <div>
          <span class="font-bold text-3">
            {{ spellsCount }}
          </span>
          {{ spellsCount <= 1 ? 'Spell' : 'Spells' }}
        </div>
        <div>
          <span class="font-bold text-3">
            {{ artifactsCount }}
          </span>
          {{ artifactsCount <= 1 ? 'Artifact' : 'Artifacts' }}
        </div>
        <div>
          <span class="font-bold text-3">
            {{ sigilsCount }}
          </span>
          {{ sigilsCount <= 1 ? 'Sigil' : 'Sigils' }}
        </div>
      </div>
    </header>

    <div class="content">
      <div>
        <section>
          <component
            v-for="item in heroes"
            :key="item.blueprint.id"
            :is="cardComponent"
            :blueprint="item.blueprint"
          />
          <component
            v-for="item in otherDestinyCards"
            :key="item.blueprint.id"
            :is="cardComponent"
            :blueprint="item.blueprint"
          />
        </section>

        <div class="divider" />
        <section>
          <div
            v-for="item in [...minions, ...spells, ...artifacts, ...sigils]"
            :key="item.blueprint.id"
            class="card-wrapper"
          >
            <component
              v-for="i in item.copies"
              :key="i"
              :is="cardComponent"
              :blueprint="item.blueprint"
            />
          </div>
        </section>
      </div>

      <div class="listing">
        <h3 data-text="Destiny Deck">Destiny Deck</h3>
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
        <h3 data-text="Main Deck">Main Deck</h3>
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
.deck-poster-root {
  padding: var(--size-8);
  max-height: 100dvh;
  overflow: auto;

  &.full {
    --pixel-scale: 2;
  }
  &.condensed {
    --pixel-scale: 1;
  }
}
/* the modern-screenshot library seems to not understand the backface-visibility css rule */
:global(.deck-poster-root .card-back) {
  display: none;
}

h2 {
  font-family: 'Cinzel Decorative', serif;
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
  display: flex;
  flex-wrap: wrap;
  margin-block-end: var(--size-4);
  gap: var(--size-2);
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
