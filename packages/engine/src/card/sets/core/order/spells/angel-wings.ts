import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const angelWings: SpellBlueprint = {
  id: 'angel-wings',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Angel Wings',
  description: dedent`
  Give an allied minion +1 Health, and @Honor@ this turn. If it already had @Honor@, draw a card into your Destiny zone.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay(game, card) {
    return singleAllyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets({
      game,
      card,
      origin: {
        type: 'card',
        card
      },
      label: 'Select an allied minion to buff',
      timeoutFallback: []
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const targetMinion = targets[0] as MinionCard;
    if (!targetMinion) return;

    await targetMinion.modifiers.add(
      new SimpleHealthBuffModifier('angel-wings-buff', game, targetMinion, {
        amount: 1
      })
    );

    const hasHonor = targetMinion.modifiers.has(HonorModifier);
    await targetMinion.modifiers.add(
      new HonorModifier(game, card, { mixins: [new UntilEndOfTurnModifierMixin(game)] })
    );

    if (hasHonor) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
