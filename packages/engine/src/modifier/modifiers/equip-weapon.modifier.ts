import type { Game } from '../..';
import { KEYWORDS } from '../../card/card-keywords';
import type { CardSpeed } from '../../card/card.enums';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { SimpleAttackBuffModifier } from './simple-attack-buff.modifier';

export class EquipWeaponModifier extends Modifier<ArtifactCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      manaCost: number;
      speed: CardSpeed;
      mixins?: ModifierMixin<ArtifactCard>[];
    }
  ) {
    super(KEYWORDS.EQUIP_WEAPON.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.EQUIP_WEAPON),
        new GrantAbilityModifierMixin(game, {
          id: 'equip-weapon-ability',
          description: KEYWORDS.EQUIP_WEAPON.description,
          label: 'Equip Weapon',
          canUse: () => true,
          getPreResponseTargets: () => Promise.resolve([]),
          manaCost: options.manaCost,
          shouldExhaust: true,
          speed: options.speed,
          onResolve: async (game, card) => {
            await card.player.hero.modifiers.add(
              new SimpleAttackBuffModifier('equip-weapon-attack-buff', game, card, {
                amount: card.atkBonus ?? 0
              })
            );
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
