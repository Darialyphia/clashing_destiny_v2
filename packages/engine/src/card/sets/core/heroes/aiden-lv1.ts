import type { HeroBlueprint } from '../../../card-blueprint';
import { isArtifact } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const aidenLv1: HeroBlueprint = {
  id: 'aiden-lv1',
  name: "Aiden, Crusader's Heir",
  description: '',
  cardIconId: 'heroes/aiden-lv1',
  kind: CARD_KINDS.HERO,
  level: 1,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.WARRIOR],
  spellSchools: [SPELL_SCHOOLS.FIRE, SPELL_SCHOOLS.LIGHT],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: 'aiden',
  spellPower: 0,
  atk: 0,
  maxHp: 15,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'aiden-lv1-ability',
      canUse(game, card) {
        return (
          card.player.artifactManager.artifacts.length <
            game.config.MAX_EQUIPPED_ARTIFACTS && card.location === 'board'
        );
      },
      label: '@[exhaust]@ : Equip an artifact',
      description:
        '@[exhaust]@ : Equip a weapon artifact from your deck that costs 1 or less. @Seal@ this ability.',
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card, targets, ability) {
        const choices = card.player.cardManager.mainDeck.cards.filter(
          c =>
            isArtifact(c) &&
            c.blueprint.subKind === ARTIFACT_KINDS.WEAPON &&
            c.manaCost <= 1
        );
        const [artifact] = await game.interaction.chooseCards({
          player: card.player,
          choices,
          minChoiceCount: 0,
          maxChoiceCount: 1,
          label: 'Choose a weapon artifact to equip'
        });
        if (!artifact) return;
        artifact.removeFromCurrentLocation();
        await artifact.play(() => {});
        ability.seal();
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
