import type { MainDeckCard } from '../../../../board/board.system';
import { discover } from '../../../card-actions-utils';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const elementalist: HeroBlueprint = {
  id: 'elementalist',
  name: 'Elementalist',
  description: '@On Enter@: @Discover@ a spell of the affinity you unlocked.',
  cardIconId: 'hero-elementalist',
  level: 2,
  destinyCost: 2,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.FIRE, AFFINITIES.WIND, AFFINITIES.WATER],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 21,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'elementalist-ability',
      label: 'Master of the Elements',
      description:
        '@[exhaust]@ @[mana] 1 @ : Replace one of your unlocked affinities with a different one available for Elementalist.',
      manaCost: 1,
      shouldExhaust: true,
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      async onResolve(game, card) {
        const affinityToRemove = await game.interaction.chooseAffinity({
          player: card.player,
          label: 'Choose an affinity to replace',
          choices: card.player.unlockedAffinities
        });
        const newAffinity = await game.interaction.chooseAffinity({
          player: card.player,
          label: 'Choose a new affinity',
          choices: card.blueprint.unlockableAffinities
        });

        if (!affinityToRemove || !newAffinity) {
          return;
        }

        await card.player.removeAffinity(affinityToRemove);
        await card.player.unlockAffinity(newAffinity);
      }
    }
  ],
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    const choicePool = await Promise.all(
      Object.values(game.cardPool)
        .filter(
          blueprint =>
            blueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
            card.player.unlockedAffinities.includes(blueprint.affinity) &&
            blueprint.kind === CARD_KINDS.SPELL
        )
        .map(blueprint => card.player.generateCard<MainDeckCard>(blueprint.id))
    );
    await discover(game, card, choicePool);
  }
};
