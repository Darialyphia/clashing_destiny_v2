import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { ElusiveModifier } from '../../../../modifier/modifiers/elusive.modiier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { MinionCard } from '../../../entities/minion.entity';
import { CardInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';

export const alluringDancer: MinionBlueprint = {
  id: 'alluring-dancer',
  name: 'Alluring Dancer',
  cardIconId: 'minions/alluring-dancer',
  description: dedent`
  @Elusive@.
  @[level] 2+@: Fast Speed.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<MinionCard>;
    await card.modifiers.add(new ElusiveModifier(game, card));

    await card.modifiers.add(
      new Modifier<MinionCard>('alluring-dancer-speed-buff', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => levelMod.isActive),
          new CardInterceptorModifierMixin(game, {
            key: 'speed',
            interceptor: () => CARD_SPEED.FAST
          })
        ]
      })
    );
  },
  async onPlay() {}
};
