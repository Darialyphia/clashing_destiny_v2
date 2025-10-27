import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const magicChanneler: MinionBlueprint = {
  id: 'magic-channeler',
  name: 'Magic Channeler',
  cardIconId: 'minions/magic-channeler',
  description: `@Spellpower 1`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.MAGE,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const MODIFIER_ID = 'magic-channeler-spellpower';
    await card.modifiers.add(
      new Modifier('magic-channeler-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return card.location === 'board' && candidate.equals(card.player.hero);
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
