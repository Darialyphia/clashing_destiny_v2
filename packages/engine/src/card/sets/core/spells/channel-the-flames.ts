import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const channelTheFlames: SpellBlueprint = {
  id: 'channel-the-flames',
  name: 'Channel the Flames',
  cardIconId: 'spell-channel-the-flames',
  description: 'Sacrifice an allied minion. Gain @Ember@ stacks equal to its health',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: singleAllyMinionTargetRules.canPlay,
  getPreResponseTargets: (game, card) =>
    singleAllyMinionTargetRules.getPreResponseTargets(game, card, { type: 'card', card }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    if (!target) return;

    const hp = target.remainingHp;

    await target.destroy();

    await card.player.hero.modifiers.add(new EmberModifier(game, card, hp));
  }
};
