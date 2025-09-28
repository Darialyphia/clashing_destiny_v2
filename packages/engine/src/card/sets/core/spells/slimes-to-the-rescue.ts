import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { multipleEmptyAllySlot, singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { friendlySlime } from '../minions/friendlySlime';
import { MINION_SLOT_ZONES } from '../../../../board/board;constants';
import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { InterceptModifier } from '../../../../modifier/modifiers/intercept.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const slimesToTheRescue: SpellBlueprint = {
  id: 'slimes-to-the-rescue',
  name: 'Slimes, To The Rescue!',
  cardIconId: 'spells/slimes-to-the-rescue',
  description: dedent`
  You can only play this card if your opponent controls more minions than you.
  Summon 2 ${friendlySlime.name} and give them @Intercept@ this turn.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FLASH,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: multipleEmptyAllySlot.canPlay(1),
  getPreResponseTargets(game, card) {
    return multipleEmptyAllySlot.getPreResponseTargets({
      min: 1,
      max: 2
    })(game, card);
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionPosition[]) {
      const slime = await card.player.generateCard<MinionCard>(friendlySlime.id);
      await slime.playAt(target);
      await slime.modifiers.add(
        new InterceptModifier(game, slime, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
