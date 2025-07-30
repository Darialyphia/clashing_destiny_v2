import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { PreResponseTarget, SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';

export const channelTheFlames: SpellBlueprint<PreResponseTarget> = {
  id: 'channel-the-flames',
  name: 'Channel the Flames',
  cardIconId: 'spell-channel-the-flames',
  description:
    'Remove @Burn@ from all minions. Draw a card and deal 2 damage to your hero for each removed.',
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  async getPreResponseTargets() {
    return [];
  },
  async onInit() {},
  async onPlay(game, card) {
    const minionsWithBurn = [
      ...card.player.boardSide.getAllMinions(),
      ...card.player.opponent.boardSide.getAllMinions()
    ].filter(minion => minion.modifiers.has(BurnModifier));

    await card.player.cardManager.draw(minionsWithBurn.length);
    await card.player.hero.takeDamage(card, new SpellDamage(minionsWithBurn.length));
  }
};
