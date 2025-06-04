import { GAME_EVENTS } from '../../../../game/game.events';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { scry } from '../../../card-actions-utils';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const magicGrimoire: ArtifactBlueprint = {
  id: 'magic-grimoire',
  name: 'Magic Grimoire',
  cardIconId: 'magic-grimoire',
  description: '@On Enter@: @Scry 2@.',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 3,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.ARCANE,
  durability: 1,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'magic-grimoire-ability',
      label: 'Gain Affinity',
      description:
        '@[mana] 1@ @[exhaust]@ : Gain an affinity of your current Hero until the end of the turn. This loses 1 durability',
      manaCost: 1,
      shouldExhaust: true,
      canUse: () => true,
      getPreResponseTargets: async () => [],
      async onResolve(game, card) {
        const affinity = await game.interaction.chooseAffinity({
          player: card.player,
          choices: card.player.hero.unlockableAffinities
        });

        const remove = await card.player.addInterceptor(
          'unlockedAffinities',
          affinities => {
            return [...new Set([...affinities, affinity!])];
          }
        );

        await card.loseDurability(1);

        game.once(GAME_EVENTS.GAME_TURN_END, async () => {
          await remove();
        });
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        await scry(game, card, 2);
      })
    );
  },
  async onPlay() {}
};
