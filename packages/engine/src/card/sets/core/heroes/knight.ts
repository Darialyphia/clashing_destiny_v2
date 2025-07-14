import type { HeroBlueprint } from '../../../card-blueprint';
import { isArtifact, sealAbility } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const knight: HeroBlueprint = {
  id: 'knight',
  name: 'Knight',
  description: '',
  cardIconId: 'hero-knight',
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  affinities: [AFFINITIES.FIRE],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 20,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'knight-ability-1',
      canUse(game, card) {
        return (
          card.player.artifactManager.artifacts.length <
          game.config.MAX_EQUIPPED_ARTIFACTS
        );
      },
      label: 'Equip an artifact',
      description:
        '@[exhaust]@: Equip a weapon artifact from your deck that costs 1 or less. @Seal@ this ability.',
      manaCost: 1,
      shouldExhaust: false,
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        const choices = card.player.cardManager.mainDeck.cards.filter(
          c =>
            isArtifact(c) &&
            c.blueprint.subKind === ARTIFACT_KINDS.WEAPON &&
            c.manaCost <= 1
        );
        const [artifact] = await game.interaction.chooseCards({
          player: card.player,
          choices,
          minChoiceCount: 1,
          maxChoiceCount: 1,
          label: 'Choose a weapon artifact to equip'
        });

        await artifact.play();
        sealAbility(card, 'knight-ability-1');
      }
    }
  ],
  tags: [],
  async onInit() {},
  async onPlay() {},
  talentTree: {
    nodes: []
  }
};
