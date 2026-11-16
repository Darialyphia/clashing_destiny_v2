import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { ProtectorModifier } from '../../../../modifier/modifiers/protector.modifier';
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';
import { FACTION_IDS } from '../../../factions/factions';
import { LevelTogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const ironcliffeGuardian: MinionBlueprint = {
  id: 'ironcliffe-guardian',
  name: 'Ironcliffe Guardian',
  description: dedent /*html*/ `
  <rt-keyword>Protector</rt-keyword>.
  <rt-level-bonus level="4"></rt-level-bonus><rt-keyword>Vigilant</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/ironcliffe-guardian'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 6,
  manaSupply: 2,
  level: 2,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 8,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new VigilantModifier(game, card, {
        mixins: [new LevelTogglableModifierMixin(game, 4)]
      })
    );
    await card.modifiers.add(new ProtectorModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
