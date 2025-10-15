import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { MinionCard } from '../../../entities/minion.entity';
import { AbilityDamage } from '../../../../utils/damage';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';

export const navalaSurgingCatalyst: MinionBlueprint = {
  id: 'navala-surging-catalyst',
  name: 'Navala, Surging Catalyst',
  cardIconId: 'minions/navala-surging-catalyst',
  description: dedent`
  @On Enter@ : draw a spell.
  @Sage Affinity@ :After you play a spell deal 1 damage to all enemies.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  atk: 3,
  maxHp: 6,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: HERO_JOBS.MAGE,
  speed: CARD_SPEED.FAST,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const sageMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.SAGE)
    )) as HeroJobAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await card.player.cardManager.drawOfKind(1, CARD_KINDS.SPELL);
        }
      })
    );

    await card.modifiers.add(
      new Modifier<MinionCard>('arcane-conduit-spellwatch', game, card, {
        mixins: [
          new TogglableModifierMixin(
            game,
            () => card.location === 'board' && sageMod.isActive
          ),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.isAlly(card)) return;
              if (event.data.card.kind !== CARD_KINDS.SPELL) return;

              const targets = [card.player.enemyHero, ...card.player.enemyMinions];
              for (const target of targets) {
                await target.takeDamage(card, new AbilityDamage(1));
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
