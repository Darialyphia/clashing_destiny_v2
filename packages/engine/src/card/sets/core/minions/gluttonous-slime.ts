import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { TauntModifier } from '../../../../modifier/modifiers/taunt.modifier';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { isDefined } from '@game/shared';
import type { MinionCard } from '../../../entities/minion.entity';
import { friendlySlime } from './friendly-slime';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const gluttonousSlime: MinionBlueprint = {
  id: 'gluttonous-slime',
  name: 'Gluttonous Slime',
  cardIconId: 'unit-big-slime',
  description: dedent`
  @[level] 3+@: @Taunt@.
  @On Death@: Summon two @Friendly Slime@ next to this.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new TauntModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async (event, modifier, position) => {
          const slot = card.player.boardSide.getSlot(position.zone, position.slot)!;
          const positions = [slot.left, slot.right].filter(
            slot => isDefined(slot) && !slot.isOccupied
          );

          for (const position of positions) {
            const slime = await card.player.generateCard<MinionCard>(friendlySlime.id);
            await slime.playAt({
              player: card.player,
              slot: position!.slot,
              zone: position!.zone
            });
          }
        }
      })
    );
  },
  async onPlay() {}
};
