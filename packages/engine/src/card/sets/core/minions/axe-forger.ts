import { isDefined } from '@game/shared';
import { ArtifactInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleArtifactTargetRules } from '../../../card-utils';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { ArtifactCard } from '../../../entities/artifact.entity';
import { Modifier } from '../../../../modifier/modifier.entity';

export const axeforger: MinionBlueprint = {
  id: 'axe-forger',
  name: 'Axe Forger',
  cardIconId: 'minions/axe-forger',
  description: `@On Enter@ : Give an Weapon Artifact +1 @[attack]@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const isAllyWeapon = (artifact: ArtifactCard) =>
      artifact.isAlly(card) && artifact.subkind === ARTIFACT_KINDS.WEAPON;
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const hasTarget = singleArtifactTargetRules.canPlay(game, card, isAllyWeapon);
          if (!hasTarget) return;
          const [target] = await singleArtifactTargetRules.getPreResponseTargets(
            game,
            card,
            {
              type: 'card',
              card
            },
            isAllyWeapon
          );

          await target.modifiers.add(
            new Modifier<ArtifactCard>('axe-forger-attack-buff', game, card, {
              mixins: [
                new ArtifactInterceptorModifierMixin(game, {
                  key: 'attackBonus',
                  interceptor(value) {
                    if (!isDefined(value)) return value;
                    return value + 1;
                  }
                })
              ]
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
