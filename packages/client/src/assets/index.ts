import {
  CARD_KINDS,
  CARD_SPEED,
  FACTIONS,
  RARITIES,
  RUNES
} from '@game/engine/src/card/card.enums';

const rawAssets = import.meta.glob('./**/*.png', {
  eager: true,
  query: 'url'
}) as Record<string, string>;

export class Asset {
  constructor(public path: string) {}

  get css() {
    return `url(${this.path})`;
  }
}

export const assets: Record<string, Asset> = {};
for (const [path, url] of Object.entries(rawAssets)) {
  const cleanedPath = path.replace('./assets/', '');

  assets[cleanedPath] = new Asset(url);
}
console.log(assets);
export const uiAssets = {
  card: {
    front: assets['ui/card/card-front.png'],
    back: assets['ui/card/card-back.png'],
    tintMask: assets['ui/card/card-tint-mask.png'],
    nameFrame: assets['ui/card/name-frame.png'],
    manaCost: assets['ui/card/mana-cost.png'],
    destinyCost: assets['ui/card/destiny-cost.png'],
    attack: assets['ui/card/attack.png'],
    health: assets['ui/card/health.png'],
    durability: assets['ui/card/durability.png'],
    countdown: assets['ui/card/countdown.png'],
    descriptionFrame: assets['ui/card/description-frame.png'],
    rarity: {
      [RARITIES.BASIC]: assets['ui/card/rarity-common.png'],
      [RARITIES.TOKEN]: assets['ui/card/rarity-common.png'],
      [RARITIES.COMMON]: assets['ui/card/rarity-common.png'],
      [RARITIES.RARE]: assets['ui/card/rarity-rare.png'],
      [RARITIES.EPIC]: assets['ui/card/rarity-epic.png'],
      [RARITIES.LEGENDARY]: assets['ui/card/rarity-legendary.png']
    },
    speed: {
      [CARD_SPEED.SLOW]: assets['ui/card/speed-slow.png'],
      [CARD_SPEED.FAST]: assets['ui/card/speed-fast.png'],
      [CARD_SPEED.BURST]: assets['ui/card/speed-burst.png']
    },
    kind: {
      [CARD_KINDS.SPELL]: assets['ui/card/kind-spell.png'],
      [CARD_KINDS.ARTIFACT]: assets['ui/card/kind-artifact.png'],
      [CARD_KINDS.MINION]: assets['ui/card/kind-minion.png'],
      [CARD_KINDS.HERO]: assets['ui/card/kind-hero.png'],
      [CARD_KINDS.SIGIL]: assets['ui/card/kind-sigil.png']
    },
    faction: {
      [FACTIONS.ARCANE.id]: assets['ui/card/faction-arcane.png'],
      [FACTIONS.CHAOS.id]: assets['ui/card/faction-chaos.png'],
      [FACTIONS.GENESIS.id]: assets['ui/card/faction-genesis.png'],
      [FACTIONS.ORDER.id]: assets['ui/card/faction-order.png'],
      [FACTIONS.OBLIVION.id]: assets['ui/card/faction-oblivion.png'],
      [FACTIONS.PRIMAL.id]: assets['ui/card/faction-primal.png'],
      [FACTIONS.NEUTRAL.id]: assets['ui/card/faction-neutral.png']
    },
    rune: {
      [RUNES.FOCUS]: assets['ui/card/rune-focus.png'],
      [RUNES.MIGHT]: assets['ui/card/rune-might.png'],
      [RUNES.KNOWLEDGE]: assets['ui/card/rune-knowledge.png'],
      [RUNES.RESONANCE]: assets['ui/card/rune-resonance.png']
    }
  },
  cardText: {
    manaCost: assets['ui/mana-cost']
  }
};
