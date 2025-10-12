import dedent from 'dedent';
import type { SigilBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { SigilCard } from '../../../entities/sigil.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { isHero } from '../../../card-utils';

export const sigilOfVoid: SigilBlueprint = {
  id: 'sigil-of-void',
  name: 'Sigil of Void',
  cardIconId: 'sigils/sigil-of-void',
  description: dedent`
  When a minion on the same row as this attacks, banish it after combat.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  maxCountdown: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.SIGIL,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SigilCard>('sigil-of-void', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
            handler: async event => {
              if (isHero(event.data.attacker)) return;
              if (event.data.attacker.position?.slot === card.position?.slot) {
                await event.data.attacker.sendToBanishPile();
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
