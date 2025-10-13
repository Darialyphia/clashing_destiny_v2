import type { Game } from '../../../../game/game';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { AnyCard } from '../../../entities/card.entity';
import { MinionCard } from '../../../entities/minion.entity';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane-conduit',
  name: 'Arcane Conduit',
  cardIconId: 'minions/arcane-conduit',
  description: `When you play a spell, gain a stack of Arcane Static.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.MAGE,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'arcane-conduit-ability',
      label: 'Deal 1 damage to all enemies.',
      description: `Remove 2 stacks of Arcane Static to deal 1 damage to all enemies.`,
      speed: CARD_SPEED.FAST,
      manaCost: 0,
      shouldExhaust: false,
      canUse(game, card) {
        const mod = card.modifiers.get(ArcaneStaticModifier);
        if (!mod) return false;
        if (mod.stacks < 2) return false;
        return card.location === 'board';
      },
      getPreResponseTargets: () => Promise.resolve([]),
      async onResolve(game, card) {
        const mod = card.modifiers.get(ArcaneStaticModifier);
        await mod!.removeStacks(2);

        const enemies = [card.player.enemyHero, ...card.player.enemyMinions];
        for (const enemy of enemies) {
          await enemy.takeDamage(card, new AbilityDamage(1));
        }
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('arcane-conduit-spellwatch', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.isAlly(card)) return;
              if (event.data.card.kind !== CARD_KINDS.SPELL) return;

              await card.modifiers.add(new ArcaneStaticModifier(game, card));
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};

class ArcaneStaticModifier extends Modifier<MinionCard> {
  constructor(game: Game, card: AnyCard) {
    super('arcane-static', game, card, {
      isUnique: true,
      name: 'Arcane Static',
      description: `When you play a spell, gain a stack of Arcane Static.`,
      icon: 'keyword-arcane-conduit',
      mixins: []
    });
  }
}
