import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { shuffleArray } from '@game/shared';
import { isMinion } from '../../../../card-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import type { SpellCard } from '../../../../entities/spell.entity';

export const protectTheHolySpire: SpellBlueprint = {
  id: 'protect-the-holy-spire',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Protect the Holy Spire',
  description: dedent`
  Summon 2 minions with @Honor@ from your deck with a mana cost equal or less than your Hero's level.
  @[lvl] 3 Bonus@: This is @[BURST]@ speed.
  `,
  dynamicDescription(game, card) {
    return dedent`
    Summon 2 minions with @Honor@ from your deck with a mana cost of @[dynamic]${card.player.hero.level}|Hero level@ or less.
    @[lvl] 3 Bonus@: This is @[BURST]@ speed.
    `;
  },
  faction: FACTIONS.ORDER,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
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
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay() {
    return true;
  },
  getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card) {
    const lvlMod = card.modifiers.get(LevelBonusModifier);
    await card.modifiers.add(
      new Modifier<SpellCard>('protect-the-holy-spire-speed-bonus', game, card, {
        mixins: [
          new CardInterceptorModifierMixin(game, {
            key: 'speed',
            interceptor: value => (lvlMod?.isActive ? CARD_SPEED.BURST : value)
          })
        ]
      })
    );

    const candidates = shuffleArray(
      game.cardSystem.cards.filter(
        c =>
          c.isAlly(card) &&
          isMinion(c) &&
          c.location === CARD_LOCATIONS.MAIN_DECK &&
          c.modifiers.has(HonorModifier) &&
          c.manaCost <= card.player.hero.level
      ),
      game.rngSystem.next
    );
    if (candidates.length === 0) return;

    const toSummon = candidates.slice(0, 2) as MinionCard[];
    for (const summonCard of toSummon) {
      await summonCard.removeFromCurrentLocation();
      await summonCard.playImmediately();
    }
  }
};
