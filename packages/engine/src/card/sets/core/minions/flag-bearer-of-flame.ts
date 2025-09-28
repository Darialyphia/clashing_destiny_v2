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
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellSchoolAffinityModifier } from '../../../../modifier/modifiers/spell-school-affinity.modifier';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';

export const flagBearerOfFlame: MinionBlueprint = {
  id: 'flagbearer-of-flame',
  name: 'Flag Bearer of Flame',
  cardIconId: 'minions/flag-bearer-of-flame',
  description: dedent`
  The ally in front of this minion has +1@[attack]@.
  @[level] 2+ bonus@: @Fire Affinity@: it has +2@[attack]@ instead.,
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
    const affinityMod = (await card.modifiers.add(
      new SpellSchoolAffinityModifier(game, card, SPELL_SCHOOLS.FIRE)
    )) as SpellSchoolAffinityModifier<MinionCard>;

    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<MinionCard>;

    const attackBuff = new Modifier<MinionCard>('flag-bearer-of-flame-buff', game, card, {
      icon: 'keyword-attack-buff',
      name: 'Flag Bearer of Flame',
      description: () => `+${affinityMod.isActive && levelMod.isActive ? 2 : 1} Attack`,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => {
            return value + (affinityMod.isActive && levelMod.isActive ? 2 : 1);
          }
        })
      ]
    });
    await card.modifiers.add(
      new Modifier<MinionCard>('flag-bearer-of-flame-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            canSelfApply: false,
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
