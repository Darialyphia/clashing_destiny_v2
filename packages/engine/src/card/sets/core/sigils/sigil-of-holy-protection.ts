import dedent from 'dedent';
import type { SigilBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SigilCard } from '../../../entities/sigil.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const sigilOfHolyProtection: SigilBlueprint = {
  id: 'sigil-of-holy-protection',
  name: 'Sigil of Holy Protection',
  cardIconId: 'sigils/sigil-of-holy-protection',
  description: dedent`Adjacent minions cannot be targeted.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  maxCountdown: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.SIGIL,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const MODIFIER_ID = 'sigil-of-holy-protection-targeting-immunity';
    await card.modifiers.add(
      new Modifier<SigilCard>('sigil-of-holy-protection-aura', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return !!card.slot?.adjacentMinions.some(m => m.equals(candidate));
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new Modifier<MinionCard>(MODIFIER_ID, game, card, {
                  mixins: [
                    new MinionInterceptorModifierMixin(game, {
                      key: 'canBeTargeted',
                      interceptor: () => false
                    })
                  ]
                })
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
