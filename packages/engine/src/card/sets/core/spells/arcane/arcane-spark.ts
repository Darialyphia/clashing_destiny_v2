import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SpellDamage } from '../../../../../utils/damage';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const arcaneSpark: SpellBlueprint<MinionCard> = {
  id: 'arcaneSpark',
  name: 'Arcane Spark',
  description: dedent /*html*/ `
  <rt-keyword>Echo</rt-keyword>.
  Deal 1 damage to a minion at a battlefield. 
  If you played another spell this turn, this costs <rt-mana>1</rt-mana> less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isOnBattlefield),
  getTargets: (game, card) =>
    singleMinionTargetRules.getTargets({
      game,
      card,
      predicate: c => c.isOnBattlefield,
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(
        game,
        card,
        c => c.isOnBattlefield
      )
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('arcane-spark-discount', game, card, {
        amount: -1,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                .length > 0
          )
        ]
      })
    );
    await card.modifiers.add(new EchoModifier(game, card, { mixins: [] }));
  },
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (target.isOnBattlefield) {
      await targets.cards[0].takeDamage(card, new SpellDamage(1, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
