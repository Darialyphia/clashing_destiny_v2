import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { singleEmptyAllySlot } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { phoenix } from '../minions/phoenix';

export const immortalFlame: ArtifactBlueprint = {
  id: 'immortal-flame',
  name: 'Immortal Flame',
  cardIconId: 'immortal-flame',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  atk: 2,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  abilities: [
    {
      id: 'immortal-blade-ability',
      label: 'Use ability',
      description: `Banish this card. Summon a @${phoenix.name}@ on your side of the field.`,
      manaCost: 4,
      shouldExhaust: true,
      canUse: singleEmptyAllySlot.canPlay,
      async getPreResponseTargets() {
        return []; // phoenix play method will take card of target selection
      },
      async onResolve(game, card) {
        card.sendToBanishPile();
        const phoenix = await card.player.generateCard(immortalFlame.id);
        await phoenix.play();
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
