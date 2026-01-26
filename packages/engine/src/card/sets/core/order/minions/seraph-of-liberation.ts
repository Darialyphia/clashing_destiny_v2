import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { frontlineSkirmisher } from './frontline-skirmisher';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { DoubleAttackModifier } from '../../../../../modifier/modifiers/double-attack.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { OnHitModifier } from '../../../../../modifier/modifiers/on-hit.modifier';

export const seraphOfLiberation: MinionBlueprint = {
  id: 'seraph-of-liberation',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Seraph of Liberation',
  description: dedent`
    @On Hit@: Summon a @${frontlineSkirmisher.name}@.
    @[lvl] 3 bonus@: @Double Attack@.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new DoubleAttackModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );

    await card.modifiers.add(
      new OnHitModifier(game, card, {
        async handler() {
          const skirmisher = await card.player.generateCard<MinionCard>(
            frontlineSkirmisher.id
          );
          await skirmisher.playImmediately();
        }
      })
    );
  },
  async onPlay() {}
};
