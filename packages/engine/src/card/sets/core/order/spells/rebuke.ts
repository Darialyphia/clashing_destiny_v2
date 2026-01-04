import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { isMinion } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { GAME_PHASES } from '../../../../../game/game.enums';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { SpellCard } from '../../../../entities/spell.entity';

export const rebuke: SpellBlueprint = {
  id: 'rebuke',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Rebuke',
  description: dedent`
    Return a minion attacking your @hero@ to the top of its owner's deck.
    @[lvl] 2+@: This costs @[mana] 1@ less.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
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
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay(game, card) {
    const phaseCtx = game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;

    const attacker = phaseCtx.ctx.attacker;
    const target = phaseCtx.ctx.target;

    return (
      !!attacker && isMinion(attacker) && !!target && target.equals(card.player.hero)
    );
  },
  async getPreResponseTargets() {
    return [];
  },
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<SpellCard>;

    await card.modifiers.add(
      new SimpleManacostModifier(`${card.id}-cost-discount`, game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
  },
  async onPlay(game) {
    const phaseCtx = game.gamePhaseSystem.getContext();
    if (phaseCtx.state === GAME_PHASES.ATTACK && phaseCtx.ctx.attacker) {
      const attacker = phaseCtx.ctx.attacker;
      if (isMinion(attacker)) {
        attacker.removeFromCurrentLocation();

        if (attacker.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
          attacker.player.cardManager.destinyDeck.addToTop(attacker);
        } else {
          attacker.player.cardManager.mainDeck.addToTop(attacker);
        }
      }
    }
  }
};
