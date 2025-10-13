import dedent from 'dedent';
import type { BoardPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anyMinionSlot, isMinion } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  HERO_JOBS,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import type { SpellCard } from '../../../entities/spell.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const grandCross: SpellBlueprint = {
  id: 'grand-cross',
  name: 'Grand Cross',
  cardIconId: 'spells/grand-cross',
  description: dedent`
    Select a space. Deal 3 damage to all enemy minions and heal for 3 all ally minions that are on the same row or column.
    @Paladin Affinity@: this costs 2 less.
    `,
  collectable: true,
  unique: false,
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: anyMinionSlot.canPlay,
  getPreResponseTargets: anyMinionSlot.getPreResponseTargets({
    min: 1,
    max: 1,
    allowRepeat: false
  }),
  async onInit(game, card) {
    const paladinMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.PALADIN)
    )) as HeroJobAffinityModifier<SpellCard>;

    await card.modifiers.add(
      new SimpleManacostModifier('grand-cross-paladin-affinity', game, card, {
        amount: -2,
        mixins: [new TogglableModifierMixin(game, () => paladinMod.isActive)]
      })
    );
  },
  async onPlay(game, card, targets) {
    const [center] = targets as BoardPosition[];

    const affectedMinions = new Set([
      ...game.boardSystem.getColumn(center.slot).minions,
      ...center.player.boardSide.getMinions(center.zone)
    ]);

    for (const minion of affectedMinions) {
      if (minion.isAlly(card)) {
        await minion.heal(3);
      } else {
        await minion.takeDamage(card, new SpellDamage(3, card));
      }
    }
  }
};
