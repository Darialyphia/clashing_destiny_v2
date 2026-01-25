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
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { IntimidateModifier } from '../../../../../modifier/modifiers/intimidate.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { EFFECT_TYPE } from '../../../../../game/game.enums';
import type { Effect } from '../../../../../game/effect-chain';
import { isArtifact, isMinion, isSigil } from '../../../../card-utils';
import { SilencedModifier } from '../../../../../modifier/modifiers/silenced.modifier';

export const hadranielGodsMajesty: MinionBlueprint = {
  id: 'hadraniel-gods-majesty',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: "Hadraniel, God's Majesty",
  description: dedent`
    @Pride 2@, @Intimidate 2@.

    @On Enter@: Negate target ability activation from a Minion, Artifact or Sigil, then @Silence@ it.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
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
  destinyCost: 4,
  speed: CARD_SPEED.FAST,
  atk: 2,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 2));
    await card.modifiers.add(new IntimidateModifier(game, card, { level: 2 }));

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const isElligible = (effect: Effect) =>
            effect.type === EFFECT_TYPE.ABILITY &&
            (isMinion(effect.source) ||
              isSigil(effect.source) ||
              isArtifact(effect.source));
          if (!game.effectChainSystem.currentChain) return;
          const hasTarget =
            await game.effectChainSystem.currentChain.stack.some(isElligible);
          if (!hasTarget) return;

          const effect = await game.interaction.chooseChainEffect({
            player: card.player,
            isElligible,
            label: `Select an ability activation to negate.`
          });

          if (!effect) return;

          game.effectChainSystem.currentChain.negateEffect(effect.id);
          await effect.source.modifiers.add(new SilencedModifier(game, card));
        }
      })
    );
  },
  async onPlay() {}
};
