import dedent from 'dedent';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';

export const flagBearerOfFlame: MinionBlueprint = {
  id: 'flagbearer-of-flame',
  name: 'Flag Bearer of Flame',
  cardIconId: 'minions/flag-bearer-of-flame',
  description: dedent`
  The ally in front of this minion has +1@[attack]@.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const attackBuff = new SimpleAttackBuffModifier(
      'flag-bearer-of-flame-attack-buff',
      game,
      card,
      { amount: 1 }
    );

    await card.modifiers.add(
      new Modifier<MinionCard>('flag-bearer-of-flame-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              if (candidate.location !== 'board') return false;
              if (card.location !== 'board') return false;
              if (candidate.isEnemy(card)) return false;
              return card.slot?.inFront?.minion?.equals(candidate) ?? false;
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(attackBuff);
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(attackBuff);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
