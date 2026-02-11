import type { SigilBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { SigilCard } from '../../../../entities/sigil.entity';
import dedent from 'dedent';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { isSpell } from '../../../../card-utils';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const sigilOfWisdom: SigilBlueprint = {
  id: 'sigil-of-wisdom',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sigil of Wisdom',
  description: dedent`
  The first spell you play each turn costs @[mana] 1@ less.
  @[lvl] 2 Bonus@: @On Enter@: @Empower@.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  abilities: [],
  maxCountdown: 3,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<SigilCard>('sigil-of-wisdom-aura', game, card, {
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                .length === 0
          ),
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.isAlly(card) &&
                isSpell(candidate) &&
                candidate.location === CARD_LOCATIONS.HAND
              );
            },
            getModifiers(candidate) {
              return [
                new SimpleManacostModifier('sigil-of-wisdom-cost-reduction', game, card, {
                  amount: -1
                })
              ];
            }
          })
        ]
      })
    );

    const levelBonusMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<SigilCard>;

    await card.modifiers.add(
      new OnEnterModifier<SigilCard>(game, card, {
        handler: async () => {
          await card.player.hero.modifiers.add(
            new EmpowerModifier(game, card, { amount: 1 })
          );
        },
        mixins: [new TogglableModifierMixin(game, () => levelBonusMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
