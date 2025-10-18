import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';

export const flameExorcist: MinionBlueprint = {
  id: 'flame-exorcist',
  name: 'Flame Exorcist',
  cardIconId: 'minions/flame-exorcist',
  description: `@Spellpower 1@ as long as you have played a Fire card this turn.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const MODIFIER_ID = 'flame-exorcist-spellpower';

    await card.modifiers.add(
      new Modifier('flame-exorcist-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return (
                card.location === 'board' &&
                candidate.equals(card.player.hero) &&
                card.player.cardTracker.cardsPlayedThisGameTurn.some(
                  c => isSpell(c.card) && c.card.spellSchool === SPELL_SCHOOLS.FIRE
                )
              );
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new SimpleSpellpowerBuffModifier(MODIFIER_ID, game, card, { amount: 1 })
              );
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(MODIFIER_ID);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
