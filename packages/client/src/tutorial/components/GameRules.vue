<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { assets } from '@/assets';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
const searchQuery = ref('');
const isMobileMenuActive = ref(false);
const activeSectionId = ref('overview');

const categories = [
  {
    name: 'Introduction',
    icon: 'i-mdi-book-open-variant',
    items: [
      { id: 'overview', title: '1. Game Overview' },
      { id: 'how-to-win', title: '2. How To Win' }
    ]
  },
  {
    name: 'Decks & Resources',
    icon: 'i-mdi-cards-outline',
    items: [
      { id: 'decks', title: '3. Decks' },
      { id: 'card-types', title: '4. Card Types' },
      { id: 'resource-system', title: '5. Resource System' }
    ]
  },
  {
    name: 'Board & Setup',
    icon: 'i-mdi-layers-outline',
    items: [
      { id: 'board-structure', title: '6. Board Structure' },
      { id: 'setup', title: '7. Setup' }
    ]
  },
  {
    name: 'Gameplay Flow',
    icon: 'i-mdi-clock-outline',
    items: [
      { id: 'turn-structure', title: '8. Turn Structure' },
      { id: 'ready-exhaust', title: '9. Readying & Exhausting' }
    ]
  },
  {
    name: 'Actions in Detail',
    icon: 'i-mdi-sword-cross',
    items: [
      { id: 'scoring', title: '10. Scoring' },
      { id: 'movement', title: '11. Movement' },
      { id: 'combat', title: '12. Combat' },
      { id: 'effect-chains', title: '13. Effect Chains' },
      { id: 'card-speeds', title: '14. Card Speeds' },
      { id: 'passing', title: '15. Passing' }
    ]
  },
  {
    name: 'Reference',
    icon: 'i-mdi-book-information-variant',
    items: [
      { id: 'common-keywords', title: '16. Common Keywords' },
      { id: 'alternative-scoring', title: '17. Alternative Scoring' }
    ]
  }
];

const searchTerms: Record<string, string> = {
  overview:
    'clash of destinies alternating action two-player digital card game fighting over battlefields victory points vp earn win committing units fight move score 6 points',
  'how-to-win':
    'win victory points highest influence board reset end turn tie tied',
  decks:
    'decks main deck destiny deck copies hero units spells artifacts neutral affinity deckbuilding 40 cards 3 copies one hero',
  'card-types':
    'card types heroes affinities fire water air earth light dark arcane abilities passive active units exhausted commandment attack health stats spells one-time effects discard artifacts durability banished destinies possess symmetrical effects cycle on board',
  'resource-system':
    'resource system mana runes might red wisdom blue focus green resonance yellow resource action pass initiative draw card cost reduction',
  'board-structure':
    'board structure deck hand destiny pile base slots battlefields discard banishment slots safe area units play space slots',
  setup: 'setup starting hand draw cards mulligan prepare first turn procedure',
  'turn-structure':
    'turn structure draw card ready exhausted mana action phase end turn scoring cleanup cycle destiny pass passing initiative',
  'ready-exhaust':
    'ready readying exhausting exhausted attacks scores uses ability card effect ready again status',
  scoring:
    'scoring ready unit battlefield exhaust add influence commandment score action',
  movement:
    'movement move base battlefields legal positions movement rules ready',
  combat:
    'combat attack damage health destroy enemy units ready target defense exhaust retaliate player persistent',
  'effect-chains':
    'effect chains stack spell activated abilities initiative pass opponent resolve trigger destroy draw stables trigger timing',
  'card-speeds':
    'card speeds speed slow fast initiative chains stack play anytime',
  passing: 'passing pass choose actions initiative soft pass wait',
  'common-keywords':
    'common keywords entering play on enter destroyed move attack retaliate score instant duration taunt channel burn rush stealth attacker defender static active effects',
  'alternative-scoring':
    'alternative scoring influence triggers play spell adding score action'
};

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories;
  const query = searchQuery.value.toLowerCase().trim();

  return categories
    .map(cat => {
      const items = cat.items.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSearchTerms = (searchTerms[item.id] || '')
          .toLowerCase()
          .includes(query);
        return matchTitle || matchSearchTerms;
      });
      return { ...cat, items };
    })
    .filter(cat => cat.items.length > 0);
});

const matchesSearch = (itemId: string) => {
  if (!searchQuery.value) return true;
  const query = searchQuery.value.toLowerCase().trim();
  const catItem = categories.flatMap(c => c.items).find(i => i.id === itemId);
  if (!catItem) return false;
  return (
    catItem.title.toLowerCase().includes(query) ||
    (searchTerms[itemId] || '').toLowerCase().includes(query)
  );
};

const activeSectionTitle = computed(() => {
  const allItems = categories.flatMap(c => c.items);
  const active = allItems.find(i => i.id === activeSectionId.value);
  return active ? active.title : '1. Game Overview';
});

const selectSection = (id: string) => {
  activeSectionId.value = id;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

let observer: IntersectionObserver | null = null;

onMounted(() => {
  const rootEl = document.querySelector('.how-to-play-container');
  observer = new IntersectionObserver(
    entries => {
      const intersecting = entries.filter(e => e.isIntersecting);
      if (intersecting.length > 0) {
        intersecting.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        );
        activeSectionId.value = intersecting[0].target.id;
      }
    },
    {
      root: rootEl || null,
      rootMargin: '-80px 0px -60% 0px'
    }
  );

  categories.forEach(cat => {
    cat.items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer?.observe(el);
    });
  });
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <!-- Search Input Bar -->
  <div class="w-full mb-8 relative px-4 md:px-0">
    <div class="relative max-w-md mx-auto md:mx-0">
      <span
        class="absolute left-3 top-1/2 -translate-y-1/2 i-mdi-magnify text-slate-400 text-lg"
      />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search keywords, rules, or mechanics..."
        class="w-full pl-8 pr-4 py-2.5 font-serif text-sm text-slate-100 placeholder-slate-500 bg-slate-950/80 border border-[#d7ad42]/30 focus:border-[#d7ad42]/80 focus:outline-none focus:ring-1 focus:ring-[#d7ad42]/40 rounded-lg transition-all shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute right-3 top-1/2 -translate-y-1/2 i-mdi-close text-slate-400 hover:text-slate-100 transition-colors"
      />
    </div>
  </div>

  <!-- Mobile Floating Chapter Selector -->
  <div
    class="block md:hidden sticky top-0 z-40 bg-[#070b19]/95 border border-[#d7ad42]/30 p-3 mx-4 mb-6 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="i-mdi-book-open text-[#d7ad42]" />
        <span class="text-sm font-semibold font-serif text-[#efef9f]">
          Jump to Chapter...
        </span>
      </div>
      <div class="relative">
        <button
          @click="isMobileMenuActive = !isMobileMenuActive"
          class="flex items-center gap-2 bg-[#0c1322] border border-[#d7ad42]/40 rounded-md px-3 py-1.5 text-sm text-[#efef9f]"
        >
          <span>{{ activeSectionTitle }}</span>
          <span
            class="i-mdi-chevron-down text-sm text-[#d7ad42] transition-transform duration-200"
            :style="{
              transform: isMobileMenuActive ? 'rotate(180deg)' : 'none'
            }"
          />
        </button>
        <div
          v-if="isMobileMenuActive"
          class="absolute right-0 mt-2 w-64 bg-[#0a0f1d] border border-[#d7ad42]/60 rounded-md shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-50 fancy-scrollbar"
        >
          <div v-for="cat in filteredCategories" :key="cat.name">
            <div
              class="bg-[#111827] text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5 border-y border-slate-800/80"
            >
              {{ cat.name }}
            </div>
            <button
              v-for="item in cat.items"
              :key="item.id"
              @click="
                selectSection(item.id);
                isMobileMenuActive = false;
              "
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-[#d7ad42]/10 transition-colors border-b border-slate-900/40"
              :class="
                activeSectionId === item.id
                  ? 'text-[#d7ad42] font-bold bg-[#d7ad42]/5'
                  : 'text-slate-300'
              "
            >
              {{ item.title }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Primary Layout Split Container -->
  <div
    class="flex flex-col md:flex-row gap-8 items-start w-full relative pb-16"
  >
    <!-- Desktop Sidebar Sidebar Index -->
    <aside
      class="hidden md:block w-64 pr-2 shrink-0 sticky top-4 max-h-[70vh] overflow-y-auto fancy-scrollbar"
    >
      <div class="space-y-6 pr-2">
        <div
          v-for="cat in filteredCategories"
          :key="cat.name"
          class="space-y-2"
        >
          <div
            class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400 px-1"
          >
            <span :class="cat.icon" class="text-[#d7ad42] text-sm" />
            <span>{{ cat.name }}</span>
          </div>
          <div class="space-y-1 pl-3 border-l border-slate-800/80 ml-1">
            <button
              v-for="item in cat.items"
              :key="item.id"
              @click="selectSection(item.id)"
              class="w-full text-left text-sm py-1.5 px-2.5 rounded transition-all duration-150 border border-transparent flex items-center justify-between"
              :class="
                activeSectionId === item.id
                  ? 'text-[#d7ad42] font-bold bg-[#d7ad42]/10 border-[#d7ad42]/20 translate-x-1 shadow-[0_0_8px_rgba(215,173,66,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              "
            >
              <span>{{ item.title }}</span>
              <span
                v-if="activeSectionId === item.id"
                class="i-mdi-play text-[10px] text-[#d7ad42]"
              />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 w-full max-w-4xl space-y-8 px-4 md:px-0">
      <!-- No Results State -->
      <div
        v-if="filteredCategories.length === 0"
        class="text-center py-16 bg-[#0c1322]/80 border border-red-500/20 rounded-lg p-6 max-w-lg mx-auto"
      >
        <span
          class="i-mdi-alert-circle-outline text-5xl text-red-400 mb-3 block mx-auto animate-pulse"
        />
        <h3 class="text-[#efef9f] font-serif text-lg mb-2">
          No matching rules found
        </h3>
        <p class="text-slate-400 text-sm mb-6">
          Try checking your spelling or searching for a different keyword or
          mechanical term.
        </p>
        <button
          @click="searchQuery = ''"
          class="px-5 py-2 bg-[#d7ad42] hover:bg-[#bb8225] text-black font-bold rounded text-sm transition-colors shadow-md"
        >
          Clear Search
        </button>
      </div>

      <!-- 1. Game Overview -->
      <section
        v-show="matchesSearch('overview')"
        id="overview"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'overview'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 1
        </div>
        <h2>
          <span class="i-mdi-book-open-outline text-[#d7ad42]" />
          Game Overview
        </h2>
        <div
          class="space-y-4 text-slate-300 text-sm md:text-md leading-relaxed"
        >
          <p class="text-[15px] md:text-lg text-slate-200">
            Clash of Destinies is an alternating action two-player digital card
            game about fighting over battlefields to earn
            <span class="game-term vp">Victory Points</span>
            . The first player to reach
            <span class="game-term vp">6 Victory Points</span>
            wins the game!
          </p>
          <p>
            You win by committing units to the battlefield, choosing when they
            fight, when they move, and when they score.
          </p>
        </div>
      </section>

      <!-- 2. How To Win -->
      <section
        v-show="matchesSearch('how-to-win')"
        id="how-to-win"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'how-to-win'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 2
        </div>
        <h2>
          <span class="i-mdi-trophy-outline text-[#d7ad42]" />
          How To Win
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p class="text-md font-medium text-slate-200">
            The first player to reach
            <span class="game-term vp">6 Victory Points</span>
            wins the game.
          </p>
          <p>
            Victory Points are mainly earned by having more
            <span class="game-term influence">Influence</span>
            on a battlefield at the end of a turn. The player with the highest
            <span class="game-term influence">Influence</span>
            gains
            <span class="game-term vp">1 Victory Point</span>
            . If both players are tied, no Victory Point is awarded.
          </p>
        </div>
      </section>

      <!-- 3. Decks -->
      <section
        v-show="matchesSearch('decks')"
        id="decks"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'decks'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 3
        </div>
        <h2>
          <span class="i-mdi-cards-outline text-[#d7ad42]" />
          Decks
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>Each player uses a Main Deck and a Destiny Deck.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <!-- Main Deck Box -->
            <div class="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
              <h3
                class="text-2 font-bold text-[#efef9f] mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-1.5"
              >
                <span class="i-mdi-cards text-[#d7ad42]" />
                Main Deck
              </h3>
              <ul class="space-y-2 text-1 text-slate-300">
                <li class="flex items-start gap-2">
                  <span
                    class="i-mdi-arrow-right text-[#d7ad42] mt-0.5 shrink-0"
                  />
                  Exactly 40 cards.
                </li>
                <li class="flex items-start gap-2">
                  <span
                    class="i-mdi-arrow-right text-[#d7ad42] mt-0.5 shrink-0"
                  />
                  Up to 3 copies of any card.
                </li>
                <li class="flex items-start gap-2">
                  <span
                    class="i-mdi-arrow-right text-[#d7ad42] mt-0.5 shrink-0"
                  />
                  Must contain one, and only one Hero card.
                </li>
                <li class="flex items-start gap-2">
                  <span
                    class="i-mdi-arrow-right text-[#d7ad42] mt-0.5 shrink-0"
                  />
                  Contains units, spells, and artifact cards.
                </li>
              </ul>
            </div>

            <!-- Destiny Deck Box -->
            <div class="border border-slate-800 bg-slate-950/50 p-4 rounded-lg">
              <h3
                class="text-2 font-bold text-[#efef9f] mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-1.5"
              >
                <span class="i-mdi-star-four-points text-[#d7ad42]" />
                Destiny Deck
              </h3>
              <ul class="space-y-2 text-1 text-slate-300">
                <li class="flex items-start gap-2">
                  <span
                    class="i-mdi-arrow-right text-[#d7ad42] mt-0.5 shrink-0"
                  />
                  Contains 4 different Destiny cards.
                </li>
              </ul>
            </div>
          </div>

          <blockquote style="--color: #d7ad42">
            For both decks, cards must share an
            <strong class="text-slate-200">Affinity</strong>
            with your Hero , or have the Neutral affinity.
          </blockquote>
        </div>
      </section>

      <!-- 4. Card Types -->
      <section
        v-show="matchesSearch('card-types')"
        id="card-types"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'card-types'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 4
        </div>
        <h2>
          <span class="i-mdi-badge-account-horizontal-outline text-[#d7ad42]" />
          Card Types
        </h2>
        <div class="space-y-6 text-slate-300 text-sm leading-relaxed">
          <!-- Heroes -->
          <div class="border-b border-slate-900 pb-4">
            <h3
              class="text-md font-bold font-serif text-[#efef9f] mb-2 flex items-center gap-2"
            >
              <span class="i-mdi-crown-outline text-amber-400" />
              Heroes
            </h3>

            <div class="mb-4 flex justify-center">
              <BlueprintCard
                :blueprint="CARDS_DICTIONARY['erina-violet-witch']"
                class="mb-4"
                style="--pixel-scale: 1.5"
              />
            </div>
            <p class="mb-3">
              Each deck has one Hero Card. It defines which affinities you are
              able to use in your deck. There are 7 affinities:
            </p>
            <div class="flex justify-around flex-wrap gap-2 mb-3">
              <span
                class="affinity bg-red-950/40 border border-red-500/30 text-red-400"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-fire`].path" />
                Fire
              </span>
              <span
                class="affinity bg-blue-950/40 border border-blue-500/30 text-blue-400"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-water`].path" />
                Water
              </span>
              <span
                class="affinity bg-teal-950/40 border border-teal-500/30 text-teal-400"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-air`].path" />
                Air
              </span>
              <span
                class="affinity bg-lime-950/40 border border-lime-500/30 text-lime-500"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-earth`].path" />
                Earth
              </span>
              <span
                class="affinity bg-yellow-950/40 border border-yellow-200/30 text-yellow-200"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-light`].path" />
                Light
              </span>
              <span
                class="affinity bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-400"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-dark`].path" />
                Dark
              </span>
              <span
                class="affinity bg-purple-950/40 border border-purple-500/30 text-purple-400"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-arcane`].path" />
                Arcane
              </span>
              <span
                class="affinity bg-slate-900/40 border border-slate-400/30 text-slate-300"
              >
                <img :src="assets[`ui/card/v2/affinity-flag-neutral`].path" />
                Neutral
              </span>
            </div>
            <blockquote style="--color: #d7ad42">
              Heroes also have an ability, whether it's a passive trigger or an
              activated ability. They are revealed at the start of the game and
              always present on the board, but cannot be interacted with.
            </blockquote>
          </div>

          <!-- Units -->
          <div class="border-b border-slate-900 pb-4">
            <h3
              class="text-md font-bold font-serif text-[#efef9f] mb-2 flex items-center gap-2"
            >
              <span class="i-mdi-shield-account text-indigo-400" />
              Units
            </h3>
            <div class="mb-4 flex justify-center">
              <BlueprintCard
                :blueprint="CARDS_DICTIONARY['pyromancer']"
                class="mb-4"
                style="--pixel-scale: 1.5"
              />
            </div>
            <p class="mb-3">
              Units enter the board exhausted and can move, attack, use
              abilities, and score. They have three main stats:
            </p>

            <div
              class="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50 shadow-inner"
            >
              <table class="w-full text-sm">
                <thead>
                  <tr
                    class="bg-slate-900/80 border-b border-slate-800 text-left"
                  >
                    <th class="px-4 py-2 text-[#efef9f] font-bold">Stat</th>
                    <th class="px-4 py-2 text-[#efef9f] font-bold">Meaning</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-900/60">
                  <tr>
                    <td class="px-4 py-2.5 font-bold">
                      <span class="stat-term attack">Attack</span>
                    </td>
                    <td class="px-4 py-2.5 text-slate-300">
                      How much combat damage the unit deals.
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2.5 font-bold">
                      <span class="stat-term health">Health</span>
                    </td>
                    <td class="px-4 py-2.5 text-slate-300">
                      How much damage the unit can take before being destroyed.
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2.5 font-bold">
                      <span class="stat-term commandment">Commandment</span>
                    </td>
                    <td class="px-4 py-2.5 text-slate-300">
                      How much influence the unit adds when it scores.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3
            class="text-md font-bold font-serif text-[#efef9f] mb-2 flex items-center gap-2"
          >
            <span class="i-mdi-flash text-indigo-400" />
            Spells
          </h3>

          <div class="mb-4 flex justify-center">
            <BlueprintCard
              :blueprint="CARDS_DICTIONARY['fireBall']"
              class="mb-4"
              style="--pixel-scale: 1.5"
            />
          </div>
          <p class="text-slate-300 leading-relaxed">
            Spells create one-time effects, such as dealing damage, drawing
            cards, moving units, exhausting units, or altering
            <span class="stat-term commandment">Commandment</span>
            . Spells are sent to the discard pile after resolving.
          </p>

          <h3
            class="text-md font-bold font-serif text-[#efef9f] mb-2 flex items-center gap-2"
          >
            <span class="i-mdi-sword text-indigo-400" />
            Artifacts
          </h3>

          <div class="mb-4 flex justify-center">
            <BlueprintCard
              :blueprint="CARDS_DICTIONARY['runicCatalyst']"
              class="mb-4"
              style="--pixel-scale: 1.5"
            />
          </div>
          <p class="text-slate-300 leading-relaxed">
            Artifacts stay in play and provide ongoing effects or activated
            abilities. They have a
            <strong class="text-amber-500">Durability</strong>
            stat; when durability reaches zero, the artifact is sent to the
            discard pile.
          </p>

          <h3
            class="text-md font-bold font-serif text-[#efef9f] mb-2 flex items-center gap-2"
          >
            <span class="i-mdi-fountain-pen-tip text-indigo-400" />
            Destinies
          </h3>

          <div class="mb-4 flex justify-center">
            <BlueprintCard
              :blueprint="CARDS_DICTIONARY['crowds-favor']"
              class="mb-4"
              style="--pixel-scale: 1.5"
            />
          </div>

          <p class="text-sm text-slate-300 leading-relaxed">
            Destiny cards possess symmetrical effects that modify the rules and
            behavior of battlefields. They cycle across the board each turn,
            ensuring that there's always one Destiny card from each player in
            play.
          </p>

          <blockquote style="--color: #d7ad42">
            There is always one Destiny card from each player in play.
          </blockquote>
        </div>
      </section>

      <!-- 5. Resource System -->
      <section
        v-show="matchesSearch('resource-system')"
        id="resource-system"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'resource-system'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 5
        </div>
        <h2>
          <span class="i-mdi-diamond-stone text-[#d7ad42]" />
          Resource System
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            The game relies on two resources to govern plays:
            <span class="game-term mana">Mana</span>
            and
            <span class="game-term rune">Runes</span>
            .
          </p>

          <div class="space-y-3">
            <div class="border-l-2 border-sky-500 bg-sky-950/5 p-3 rounded-r">
              <h4
                class="font-bold text-sky-400 text-sm mb-1 flex items-center gap-1.5"
              >
                <span class="i-mdi-lightning-bolt" />
                Mana
              </h4>
              <p class="text-sm">
                Each player gains 5 mana at the start of each turn. They spend
                mana to play cards. Unspent mana carries over between turns, up
                to a maximum cap of
                <strong class="text-sky-300">8 mana</strong>
                .
              </p>
            </div>

            <div
              class="border-l-2 border-emerald-500 bg-emerald-950/5 p-3 rounded-r"
            >
              <h4
                class="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5"
              >
                <span class="i-mdi-rhombus-split" />
                Runes
              </h4>
              <p class="text-sm mb-2">
                Runes are a special resource that is not automatically gained.
                Instead you need to gain them via your
                <strong>Resource Action</strong>
              </p>
              <p class="text-sm mb-2">There are 4 kinds of runes:</p>

              <div class="grid grid-cols-4 gap-2">
                <div class="rune-term might">
                  <img :src="assets['ui/card/rune-might'].path" />
                  Might
                </div>
                <div class="rune-term wisdom">
                  <img :src="assets['ui/card/rune-wisdom'].path" />
                  Wisdom
                </div>
                <div class="rune-term focus">
                  <img :src="assets['ui/card/rune-focus'].path" />
                  Focus
                </div>
                <div class="rune-term resonance">
                  <img :src="assets['ui/card/rune-resonance'].path" />
                  Resonance
                </div>
              </div>
              <p class="text-sm mt-2">
                Most cards provide special bonuses if you possess specific
                runes, such as cost reduction, improved stats, or supplementary
                effects.
              </p>

              <p class="text-sm mt-2">
                In addition, some cards or effects may require you to spend one
                or multiple runes.
              </p>
            </div>
          </div>

          <div
            class="border border-slate-800 bg-slate-950/50 p-4 rounded-lg space-y-1.5 mt-2"
          >
            <h4
              class="font-serif text-[#efef9f] font-bold flex items-center gap-1.5"
            >
              <span class="i-mdi-plus-box text-[#d7ad42]" />
              Resource Action
            </h4>
            <p class="text-sm">
              Once per turn, you are allowed to perform a Resource action. This
              action lets you either
              <strong class="text-white">gain one rune</strong>
              of your choosing, or
              <strong class="text-white">draw an additional card</strong>
              .
            </p>
            <p class="text-sm text-slate-400">
              You can perform your resource action whenever you have the
              initiative and the game is in a neutral state.
            </p>
          </div>
        </div>
      </section>

      <!-- 6. Board Structure -->
      <section
        v-show="matchesSearch('board-structure')"
        id="board-structure"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'board-structure'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 6
        </div>
        <h2>
          <span class="i-mdi-map-marker-outline text-[#d7ad42]" />
          Board Structure
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            The board is divided into several areas, each with clear rules of
            engagement:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- Deck -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span class="i-mdi-cards text-slate-500" />
                Deck
              </div>
              <p class="text-sm text-slate-400">Your face-down Main Deck.</p>
            </div>
            <!-- Hand -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span class="i-mdi-hand-back-right-outline text-[#d7ad42]" />
                Hand
              </div>
              <p class="text-sm text-slate-400">Your hand of cards in play.</p>
            </div>
            <!-- Destiny Pile -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span class="i-mdi-star-four-points text-indigo-400" />
                Destiny Pile
              </div>
              <p class="text-sm text-slate-400">
                Your face-down Destiny Deck stack.
              </p>
            </div>
            <!-- Base -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span class="i-mdi-shield-home text-amber-500" />
                Base
              </div>
              <p class="text-sm text-slate-400">
                A "safe" area with 6 card slots. Units are played here initially
                and do not score points unless noted.
              </p>
            </div>
            <!-- Battlefields -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors sm:col-span-2"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span class="i-mdi-sword-cross text-red-400" />
                Battlefields (Contested zones)
              </div>
              <p class="text-sm text-slate-400">
                There are 2 distinct battlefields. You have 3 slots on each.
                This is where units attack enemies and score
                <span class="game-term influence">Influence</span>
                .
              </p>
            </div>
            <!-- Discard Pile -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span class="i-mdi-skull-outline text-slate-500" />
                Discard Pile
              </div>
              <p class="text-sm text-slate-400">
                Where destroyed units and spent spells are sent.
              </p>
            </div>
            <!-- Banishment -->
            <div
              class="bg-slate-950/40 border border-slate-800/60 p-3 rounded hover:border-[#d7ad42]/20 transition-colors"
            >
              <div
                class="flex items-center gap-1.5 text-sm font-bold font-serif text-[#efef9f] mb-1"
              >
                <span
                  class="i-mdi-vortex text-purple-400 animate-spin"
                  style="animation-duration: 8s"
                />
                Banishment
              </div>
              <p class="text-sm text-slate-400">
                Permanently removed cards outside normal play flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Setup -->
      <section
        v-show="matchesSearch('setup')"
        id="setup"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'setup'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 7
        </div>
        <h2>
          <span class="i-mdi-gamepad-circle text-[#d7ad42]" />
          Setup
        </h2>
        <div class="space-y-6 text-slate-300 text-sm leading-relaxed">
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div
              class="bg-slate-950/50 p-4 border border-slate-800/80 rounded-lg text-center relative pt-8"
            >
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#d7ad42]/60 bg-[#0c1322] flex items-center justify-center font-bold text-[#d7ad42] font-serif text-sm shadow-md"
              >
                I
              </div>
              <h4 class="font-serif text-md font-bold text-[#efef9f] mb-1">
                Decks Ready
              </h4>
              <p class="text-sm text-slate-400 leading-normal">
                Prepare Main Deck, Hero card and Destiny deck pile.
              </p>
            </div>

            <div
              class="bg-slate-950/50 p-4 border border-slate-800/80 rounded-lg text-center relative pt-8"
            >
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#d7ad42]/60 bg-[#0c1322] flex items-center justify-center font-bold text-[#d7ad42] font-serif text-sm shadow-md"
              >
                II
              </div>
              <h4 class="font-serif text-md font-bold text-[#efef9f] mb-1">
                Initial Draw
              </h4>
              <p class="text-sm text-slate-400 leading-normal">
                Each player draws their starting hand of 5 cards.
              </p>
            </div>

            <div
              class="bg-slate-950/50 p-4 border border-slate-800/80 rounded-lg text-center relative pt-8"
            >
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#d7ad42]/60 bg-[#0c1322] flex items-center justify-center font-bold text-[#d7ad42] font-serif text-sm shadow-md"
              >
                III
              </div>
              <h4 class="font-serif text-md font-bold text-[#efef9f] mb-1">
                Mulligan
              </h4>
              <p class="text-sm text-slate-400 leading-normal">
                Play may replace one or more cards from their hand.
              </p>
            </div>

            <div
              class="bg-slate-950/50 p-4 border border-slate-800/80 rounded-lg text-center relative pt-8"
            >
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#d7ad42]/60 bg-[#0c1322] flex items-center justify-center font-bold text-[#d7ad42] font-serif text-sm shadow-md"
              >
                IV
              </div>
              <h4 class="font-serif text-md font-bold text-[#efef9f] mb-1">
                Duel Starts
              </h4>
              <p class="text-sm text-slate-400 leading-normal">
                First turn begins and players begin taking actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. Turn Structure -->
      <section
        v-show="matchesSearch('turn-structure')"
        id="turn-structure"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'turn-structure'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 8
        </div>
        <h2>
          <span class="i-mdi-cached text-[#d7ad42]" />
          Turn Structure
        </h2>
        <div
          class="text-slate-300 leading-relaxed relative pl-4 border-l border-dashed border-[#d7ad42]/30 space-y-6 ml-2"
        >
          <!-- Step 1 -->
          <div class="relative">
            <span
              class="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0a0f1d] border-2 border-[#d7ad42] shadow-[0_0_8px_rgba(215,173,66,0.5)]"
            />
            <h3 class="text-sm font-bold font-serif text-[#efef9f] mb-1">
              1. Start of Turn
            </h3>
            <ul class="list-disc pl-4 text-sm text-slate-350 space-y-1">
              <li>Ready all exhausted cards in play.</li>
              <li>
                Each player gains 5
                <span class="game-term mana">Mana</span>
                .
              </li>
              <li>Each player draws a card from their Main Deck.</li>
              <li>Resolve start-of-turn passive triggers and effects.</li>
            </ul>
          </div>

          <!-- Step 2 -->
          <div class="relative">
            <span
              class="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0a0f1d] border-2 border-sky-400"
            />
            <h3 class="text-sm font-bold font-serif text-sky-350 mb-1">
              2. Action Phase
            </h3>
            <p class="text-sm mb-2">
              Players alternate taking actions. When you have initiative, you
              perform one action, then initiative passes.
            </p>
            <div class="p-2.5 rounded border border-slate-900/60">
              <span class="font-bold text-[#d7ad42] block mb-1">
                Permitted Actions:
              </span>
              <ul class="list-disc pl-4 text-slate-300">
                <li>Play a card from hand</li>
                <li>Move a unit base ⇄ battlefield</li>
                <li>Attack with a unit</li>
                <li>Score with a unit</li>
                <li>Activate a card ability</li>
                <li>
                  Perform a resource action (Note: this does not pass initiative
                  to your opponent)
                </li>
                <li>Pass initiative</li>
              </ul>
            </div>
            <p class="mt-2">
              Once both players pass sequentially, the Action Phase ends.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="relative">
            <span
              class="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0a0f1d] border-2 border-amber-500"
            />
            <h3 class="text-sm font-bold font-serif text-amber-400 mb-1">
              3. End of Turn Scoring
            </h3>
            <ul class="list-disc pl-4 text-sm text-slate-350 space-y-1">
              <li>
                Compare
                <span class="game-term influence">Influence</span>
                at each battlefield. Grant
                <span class="game-term vp">1 Victory Point</span>
                to the player with highest influence.
              </li>
              <li>In case of a tie, no player gains Victory Points.</li>
              <li>Resolve end-of-turn triggered effects.</li>
              <li>Reset battlefield influence back to 0.</li>
            </ul>
          </div>

          <!-- Step 4 -->
          <div class="relative">
            <span
              class="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0a0f1d] border-2 border-indigo-400"
            />
            <h3 class="text-sm font-bold font-serif text-indigo-350 mb-1">
              4. Cleanup & Destiny Cycle
            </h3>
            <p class="text-sm text-slate-350 mb-2">
              Rotate the active Destiny cards dynamically across the
              battlefields:
            </p>
            <ol class="list-decimal pl-4 text-sm text-slate-400 space-y-1">
              <li>
                Place the Destiny card on player 2's left into the bottom of its
                owner's destiny pile.
              </li>
              <li>
                Shift the card on player 1's left to the other battlefield.
              </li>
              <li>
                The player without a Destiny card in play draws their top
                destiny card onto player 1's left slot.
              </li>
            </ol>
          </div>
        </div>
        <blockquote style="--color: #d7ad42" class="mt-4">
          This means that, sice both players have 4 Destiny Cards, it will take
          8 turns for a Destiny card to cycle back to its original position.
        </blockquote>
      </section>

      <!-- 9. Readying and Exhausting -->
      <section
        v-show="matchesSearch('ready-exhaust')"
        id="ready-exhaust"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'ready-exhaust'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 9
        </div>
        <h2>
          <span class="i-mdi-flash text-[#d7ad42]" />
          Readying and Exhausting
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Cards toggle between status states determining their action
            readiness:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Ready Card -->
            <div
              class="border border-emerald-500/20 bg-emerald-950/10 p-4 rounded-lg"
            >
              <h3
                class="flex justify-center font-bold text-emerald-400 flex items-center gap-1.5 text-sm font-serif"
              >
                <span class="i-mdi-check-circle" />
                Ready State
              </h3>

              <img
                :src="assets['screenshots/card-awaken'].path"
                class="mx-auto my-2"
              />
              <p class="text-sm text-slate-300 mt-2">
                A ready unit has full energy. It is ready to move, declare
                attacks, trigger abilities, or score.
              </p>
            </div>

            <!-- Exhausted Card -->
            <div class="border border-red-500/20 bg-red-950/10 p-4 rounded-lg">
              <h3
                class="flex justify-center font-bold text-red-400 flex items-center gap-1.5 text-sm font-serif"
              >
                <span class="i-mdi-power-off" />
                Exhausted State
              </h3>
              <img
                :src="assets['screenshots/card-exhausted'].path"
                class="mx-auto my-2"
              />
              <p class="text-sm text-slate-300 mt-2">
                A unit becomes exhausted immediately when it:
                <strong class="text-red-300">
                  attacks, scores, or uses an active ability
                </strong>
                . It cannot act again until readied.
              </p>
            </div>
          </div>
          <blockquote style="--color: #d7ad42">
            Note that moving a unit does not exhaust it.
          </blockquote>
        </div>
      </section>

      <!-- 10. Scoring With Units -->
      <section
        v-show="matchesSearch('scoring')"
        id="scoring"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'scoring'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 10
        </div>
        <h2>
          <span class="i-mdi-crown text-[#d7ad42]" />
          Scoring
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Scoring is a proactive action used to establish battlefield
            dominance:
          </p>
          <div
            class="bg-indigo-950/10 border border-indigo-500/20 p-4 rounded-lg"
          >
            <ol class="space-y-3 text-sm md:text-sm text-slate-300">
              <li class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center font-bold text-indigo-300 text-sm shrink-0"
                >
                  1
                </span>
                <span>
                  Select a ready unit you control currently positioned on a
                  battlefield.
                </span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center font-bold text-indigo-300 text-sm shrink-0"
                >
                  2
                </span>
                <span>Exhaust that unit.</span>
              </li>
              <li class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center font-bold text-indigo-300 text-sm shrink-0"
                >
                  3
                </span>
                <span>
                  Add
                  <span class="game-term influence">Influence</span>
                  directly to that battlefield's tally equal to the unit's
                  <span class="stat-term commandment">Commandment</span>
                  .
                </span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <!-- 11. Movement -->
      <section
        v-show="matchesSearch('movement')"
        id="movement"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'movement'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 11
        </div>
        <h2>
          <span class="i-mdi-compass-outline text-[#d7ad42]" />
          Movement
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>Units can move across the board following these rules:</p>
          <ul class="space-y-3.5 pl-2">
            <li class="flex items-start gap-2.5">
              <span
                class="i-mdi-checkbox-marked-circle text-emerald-400 mt-1 shrink-0"
              />
              <span>
                Units can move freely between your e
                <strong class="text-[#efef9f]">Base</strong>
                and the
                <strong class="text-[#efef9f]">Battlefields</strong>
              </span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="i-mdi-close-circle text-red-400 mt-0.5 shrink-0" />
              <span class="text-slate-400">
                Units
                <strong class="text-red-300">cannot amove</strong>
                from battlefield to battlefield They must route through base
                first.
              </span>
            </li>
            <li class="flex items-start gap-2.5">
              <span
                class="i-mdi-alert-circle-outline text-[#d7ad42] mt-1 shrink-0"
              />
              <span>
                A unit must be in a
                <strong class="text-emerald-400">Awaken</strong>
                to move, but moving does not exhaust it.
              </span>
            </li>
            <li class="flex items-start gap-2.5">
              <span
                class="i-mdi-alert-circle-outline text-[#d7ad42] mt-1 shrink-0"
              />
              A Unit can only move once per turn.
            </li>
          </ul>
        </div>
      </section>

      <!-- 12. Combat -->
      <section
        v-show="matchesSearch('combat')"
        id="combat"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'combat'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 12
        </div>
        <h2>
          <span class="i-mdi-sword-cross text-[#d7ad42]" />
          Combat Resolution
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>Engage in active combat to eliminate opposing threats:</p>
          <div
            class="bg-[#0b0c16]/80 p-4 border border-slate-800/80 rounded-lg"
          >
            <ol class="space-y-3 text-sm md:text-sm text-slate-300">
              <li class="flex items-start gap-2.5">
                <span
                  class="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm shrink-0 mt-0.5"
                >
                  1
                </span>
                <span>Select a ready unit you control on a battlefield.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm shrink-0 mt-0.5"
                >
                  2
                </span>
                <span>
                  Select a legal enemy unit target on that
                  <strong class="text-white">same battlefield</strong>
                  .
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm shrink-0 mt-0.5"
                >
                  3
                </span>
                <span>Exhaust your attacking unit.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm shrink-0 mt-0.5"
                >
                  4
                </span>
                <span>
                  <strong class="text-[#efef9f]">Retaliation Choice:</strong>
                  The defender chooses whether to retaliate. If they do, exhaust
                  the defending unit.
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="w-5 h-5 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm shrink-0 mt-0.5"
                >
                  5
                </span>
                <span>
                  Both units deal damage to each other at the exact same time.
                </span>
              </li>
            </ol>
          </div>

          <blockquote style="--color: #d7ad42">
            If the attack target chose to not retaliate, it will not deal damage
            to the attacker.
          </blockquote>

          <blockquote style="--color: #d7ad42">
            <span class="i-mdi-shield-alert text-red-400 shrink-0" />
            <span>
              Combat damage is
              <strong class="text-white">persistent</strong>
              and carries over across turns! It is not healed at turn cleanup.
            </span>
          </blockquote>
        </div>
      </section>

      <!-- 13. Effect Chains -->
      <section
        v-show="matchesSearch('effect-chains')"
        id="effect-chains"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'effect-chains'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 13
        </div>
        <h2>
          <span class="i-mdi-layers-triple-outline text-[#d7ad42]" />
          Effect Chains
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Some card activities initiate an
            <strong class="text-sky-400">Effect Chain</strong>
            , allowing players to respond before effects resolve:
          </p>

          <div class="border-l-2 border-slate-700 pl-3 space-y-1 my-3">
            <span class="text-[#efef9f] font-serif font-bold">
              Chains are created by:
            </span>
            <div>• Declaring an attack</div>
            <div>• Playing a Spell Card</div>
            <div>• Triggering Activated Card abilities</div>
          </div>

          <p>
            During an effect chain, players alternate adding actions to the
            chain starting with the initiator's opponent. Once both players pass
            in succession, the chain resolves backwards (from the last card
            added to the first). Players cannot make normal plays while a chain
            is mid-resolution.
          </p>

          <!-- Stack Visualization -->
          <div
            class="bg-[#040813] border border-[#d7ad42]/10 rounded p-4 text-center my-4 max-w-sm mx-auto shadow-inner"
          >
            <span
              class="text-[10px] text-slate-500 uppercase font-bo99ld block mb-2"
            >
              Stack Resolution Logic (LIFO)
            </span>
            <div
              class="border border-dashed border-sky-400/40 bg-sky-950/5 text-sm rounded p-1.5 mb-2 font-mono"
            >
              3. Final Counter (Resolves 1st)
            </div>
            <div
              class="border border-dashed border-slate-800/80 bg-slate-900/30 text-sm rounded p-1.5 mb-2 font-mono"
            >
              2. Response played
            </div>
            <div
              class="border border-[#d7ad42]/30 bg-[#d7ad42]/5 text-sm rounded p-1.5 font-mono text-[#efef9f]"
            >
              1. Initial trigger (Resolves last)
            </div>
          </div>

          <h3
            class="text-2 font-bold text-[#efef9f] border-t border-slate-900 pt-3"
          >
            Trigger Timings
          </h3>
          <p class="text-slate-400">
            If a trigger, such as
            <strong class="text-slate-200">On Destroyed</strong>
            activates mid-resolution, the chain pauses, and the trigger resolves
            immediately.
          </p>
          <div
            class="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded text-sm text-slate-400"
          >
            <span class="text-[#d7ad42] font-semibold block mb-1">
              Timing Example:
            </span>
            <p class="italic">
              Card A triggers "On Destroyed: draw a card". Card B triggers "On
              Draw: gain 1 influence". If a resolving effect chain destroys Card
              A, its trigger immediately draws a card, which instantly triggers
              Card B to gain influence. Only after this micro-sequence finishes
              does original chain execution resume.
            </p>
          </div>
        </div>
      </section>

      <!-- 14. Card Speeds -->
      <section
        v-show="matchesSearch('card-speeds')"
        id="card-speeds"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'card-speeds'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 14
        </div>
        <h2>
          <span class="i-mdi-flash text-[#d7ad42]" />
          Card Speeds
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Cards possess inherent speeds deciding when they can legally enter
            the queue:
          </p>

          <div
            class="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50 shadow-inner mt-2"
          >
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-900 border-b border-slate-800 text-left">
                  <th class="px-4 py-2 font-serif text-[#efef9f] font-bold">
                    Speed
                  </th>
                  <th class="px-4 py-2 font-serif text-[#efef9f] font-bold">
                    Initiative requirements to play
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-900">
                <tr>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-0.5 rounded text-sm font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-500"
                    >
                      Slow
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-300">
                    Can only be played when you possess active initiative.
                    Cannot be played in response onto an ongoing effect chain.
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-0.5 rounded text-sm font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400"
                    >
                      Fast
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-300">
                    Can be played onto an active resolving effect chain,
                    regardless of who holds initial initiative.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 15. Passing -->
      <section
        v-show="matchesSearch('passing')"
        id="passing"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'passing'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 15
        </div>
        <h2>
          <span class="i-mdi-hand-wave-outline text-[#d7ad42]" />
          Passing
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Passing is holding back your initiative rather than taking a
            concrete action:
          </p>
          <p class="text-md text-slate-200">
            The game uses
            <strong class="text-[#d7ad42]">Soft Passes</strong>
            : you regain initiative if you pass but your opponent chooses to act
            rather than passing as well.
          </p>
          <div
            class="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded flex items-center gap-2.5 text-sm text-indigo-300"
          >
            <span class="i-mdi-clock-check-outline text-lg" />
            <span>
              When
              <strong class="text-white">both players</strong>
              pass in succession, the Action phase ends and turn scoring
              commences.
            </span>
          </div>
        </div>
      </section>

      <!-- 16. Common Keywords -->
      <section
        v-show="matchesSearch('common-keywords')"
        id="common-keywords"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'common-keywords'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 16
        </div>
        <h2>
          <span class="i-mdi-tag-text-outline text-[#d7ad42]" />
          Common Keywords
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p class="mb-4">
            Standard battle conditions and actions printed on cards:
          </p>

          <!-- Keywords Grid! -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Keyword Items -->
            <div class="keyword-block">
              <div class="keyword-badge">On Enter</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers instantly when the card is played onto the battlefield.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">On Destroyed</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers immediately when the unit is destroyed and sent to the
                discard pile.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">On Move</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers when the unit changes slots manually, or is
                repositioned by card effects.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">On Attack</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers instantly whenever the unit declares a combat attack
                action.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">On Retaliate</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers when the unit chooses to strike back as an exhausted
                defender.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">On Score</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers when the unit successfully resolves its score action.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Instant</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Playing this does not initiate a chain, resolves instantly and
                does not hand over initiative.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Instant Move</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Moving this unit does not trigger chains and keeps your
                initiative intact.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Instant Attack</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Attacking does not generate chains and keeps your initiative
                active.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Instant Score</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Scoring with this unit does not open chains and keeps your
                initiative active.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Taunt</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Opposing units on this battlefield are forced to prioritize
                attacking this unit.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Channel</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Triggers an effect if this unit is standing ready (not
                exhausted) during turn cleanup.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Burn X</div>
              <p class="text-sm text-slate-400 mt-1.5">
                Deals X damage to this card at the transition of each turn
                cleanup.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge">Rush X</div>
              <p class="text-sm text-slate-400 mt-1.5">
                You can choose to spend additional X Mana to ready this unit
                instantly on the turn it is entering play.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge text-indigo-400 border-indigo-500/20">
                Stealth
              </div>
              <p class="text-sm text-slate-400 mt-1.5">
                This card cannot be targeted for combat attacks as long as it
                remains in a Ready state.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge text-indigo-400 border-indigo-500/20">
                Flanking
              </div>
              <p class="text-sm text-slate-400 mt-1.5">
                This unit can move between battlefields.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge text-indigo-400 border-indigo-500/20">
                Intimidate X
              </div>
              <p class="text-sm text-slate-400 mt-1.5">
                This unit cannot be attacked by minions that cost X or less.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge text-indigo-400 border-indigo-500/20">
                Protector
              </div>
              <p class="text-sm text-slate-400 mt-1.5">
                Enemies on the same battlefield as this can only attack this
                unit if able.
              </p>
            </div>
            <div class="keyword-block">
              <div class="keyword-badge text-indigo-400 border-indigo-500/20">
                Vulnerable
              </div>
              <p class="text-sm text-slate-400 mt-1.5">
                This unit takes X more damage from all sources.
              </p>
            </div>
            <div class="keyword-block flex flex-col justify-between">
              <div>
                <span class="keyword-badge text-red-400 border-red-500/20">
                  Attacker X
                </span>
                <span
                  class="keyword-badge text-blue-400 border-blue-500/20 ml-2"
                >
                  Defender X
                </span>
              </div>
              <p class="text-sm text-slate-400 mt-1.5">
                Earn +X Attack command value while proactively attacking, or
                retaliating respectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 17. Alternative Scoring Effects -->
      <section
        v-show="matchesSearch('alternative-scoring')"
        id="alternative-scoring"
        :class="[
          'surface relative border rounded-lg p-6 bg-[#0c1322]/80 backdrop-blur-sm shadow-xl transition-all duration-300',
          activeSectionId === 'alternative-scoring'
            ? 'border-[#d7ad42]/60 ring-1 ring-[#d7ad42]/20'
            : 'border-slate-800/80'
        ]"
      >
        <div
          class="absolute -top-3 left-4 px-2 py-0.5 bg-[#0c1322] border border-[#d7ad42]/30 rounded text-[10px] text-sm font-serif text-[#d7ad42]"
        >
          Chapter 17
        </div>
        <h2>
          <span class="i-mdi-plus-one text-[#d7ad42]" />
          Alternative Scoring
        </h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Some cards allocate extra
            <span class="game-term influence">Influence</span>
            directly without performing normal score actions:
          </p>

          <div class="space-y-3 my-4">
            <!-- blockquote example 1 -->
            <blockquote
              class="border-l-4 border-[#d7ad42] bg-[#d7ad42]/5 p-4 rounded-r-lg italic shadow-inner"
            >
              <p class="text-sm font-semibold text-slate-200">
                "On Attack: Add 1 Influence to this battlefield."
              </p>
            </blockquote>

            <!-- blockquote example 2 -->
            <blockquote
              class="border-l-4 border-[#d7ad42] bg-[#d7ad42]/5 p-4 rounded-r-lg italic shadow-inner"
            >
              <p class="text-sm font-semibold text-slate-200">
                "When you play your second spell this turn, add 1 Influence to a
                battlefield."
              </p>
            </blockquote>
          </div>

          <div
            class="p-3 bg-amber-500/5 border border-[#d7ad42]/20 rounded text-amber-200/90 text-sm"
          >
            <span
              class="i-mdi-alert-decagram-outline text-amber-400 mr-1 text-sm align-middle inline-block"
            />
            <span>
              Unless specifically explicitly detailed on the card, gaining
              Influence through effects
              <strong class="text-white">does not</strong>
              register as a standard Score action and
              <strong class="text-teal-400">does not</strong>
              trigger
              <strong class="text-white">On Score</strong>
              abilities!
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="postcss">
section {
  padding: var(--size-7);
}
h2 {
  margin-top: var(--size-6);
  display: flex;
  align-items: center;
  gap: var(--size-3);
  font-size: var(--font-size-3);
  font-weight: 700;
  margin-block: var(--size-7) var(--size-4);
  font-family: var(--font-slab-serif);
  color: #efef9f;
}

blockquote {
  border: solid var(--border-size-1) hsl(from var(--color) h s l / 0.15);
  border-left: solid var(--border-size-3) var(--color);
  background: hsl(from var(--color) h s l / 0.05);
  padding: var(--size-4);
  border-top-right-radius: var(--radius-2);
  border-bottom-right-radius: var(--radius-2);
  font-style: italic;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
}
/* Custom CSS Variables & Game Term Highlights */
.game-term {
  font-weight: 700;
  padding: 1.5px 5px;
  border-radius: 4px;
}
.game-term.mana {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
}
.game-term.rune {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
}
.game-term.influence {
  color: #fb923c;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.25);
}
.game-term.vp {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.35);
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.3);
}
.game-term.hero {
  color: #fca5a5;
  background: rgba(252, 165, 165, 0.12);
  border: 1px solid rgba(252, 165, 165, 0.25);
}

.rune-term {
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: var(--size-2) var(--size-3);
  border-radius: 4px;
  font-size: var(--font-size-1);
  background: rgba(0, 0, 0, 0.3);
  img {
    width: 34px;
    height: 36px;
  }
}
.rune-term.might {
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}
.rune-term.wisdom {
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}
.rune-term.focus {
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}
.rune-term.resonance {
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stat-term {
  font-weight: 700;
  padding: 1.5px 5.5px;
  border-radius: 4px;
  font-size: 0.9em;
}
.stat-term.attack {
  color: var(--red-5);
  background: hsl(var(--red-5-hsl) / 0.12);
  border: 1px solid hsl(var(--red-5-hsl) / 0.25);
}
.stat-term.health {
  color: var(--green-5);
  background: hsl(var(--green-5-hsl) / 0.12);
  border: 1px solid hsl(var(--green-5-hsl) / 0.5);
}
.stat-term.commandment {
  color: var(--indigo-4);
  background: hsl(var(--indigo-4-hsl) / 0.12);
  border: 1px solid hsl(var(--indigo-4-hsl) / 0.25);
}

.keyword-badge {
  display: inline-block;
  font-weight: 700;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 2.5px 7px;
  border-radius: 4px;
  font-size: 0.8em;
  font-family: 'Cinzel Decorative', serif;
  box-shadow: inset 0 0 5px rgba(245, 158, 11, 0.15);
}

.keyword-block {
  padding: var(--size-3);
  border-radius: 6px;
  border: 1px solid rgba(51, 65, 85, 0.4);
  background: rgba(15, 23, 42, 0.45);
  transition: all 0.2s ease-in-out;
  &:hover {
    border-color: rgba(215, 173, 66, 0.4);
    background: rgba(12, 19, 34, 0.85);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }
}

/* Custom Scrollbar */
.fancy-scrollbar {
  --scrollbar-foreground: hsl(var(--color-primary-hsl) / 0.45);
  --scrollbar-background: transparent;
  scrollbar-color: var(--scrollbar-foreground) var(--scrollbar-background);
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-foreground);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: var(--scrollbar-background);
  }
}

.affinity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-2);
  font-size: var(--font-size-1);
  font-weight: 500;
  width: var(--size-9);
}
</style>
