export const rawAssets = import.meta.glob('./**/*.{png,jpg}', {
  eager: true,
  query: 'url'
}) as Record<string, { default: string }>;
export class Asset {
  constructor(public path: string) {}

  get css() {
    return `url(${this.path})`;
  }
}

export const assets: Record<string, Asset> = {};
for (const [path, url] of Object.entries(rawAssets)) {
  const cleanedPath = path
    .replace('.png', '')
    .replace('.jpg', '')
    .replace('./', '');

  assets[cleanedPath] = new Asset(url.default);
}
// export const uiAssets = {
//   card: {
//     front: assets['ui/card/card_front'],
//     back: assets['ui/card/card-back'],
//     tintMask: assets['ui/card/card-tint-mask'],
//     nameFrame: assets['ui/card/name-frame'],
//     manaCost: assets['ui/card/mana-cost'],
//     destinyCost: assets['ui/card/destiny-cost'],
//     attack: assets['ui/card/attack'],
//     health: assets['ui/card/health'],
//     durability: assets['ui/card/durability'],
//     countdown: assets['ui/card/countdown'],
//     descriptionFrame: assets['ui/card/description-frame'],
//     rarity: {
//       [RARITIES.BASIC]: assets['ui/card/rarity-common'],
//       [RARITIES.TOKEN]: assets['ui/card/rarity-common'],
//       [RARITIES.COMMON]: assets['ui/card/rarity-common'],
//       [RARITIES.RARE]: assets['ui/card/rarity-rare'],
//       [RARITIES.EPIC]: assets['ui/card/rarity-epic'],
//       [RARITIES.LEGENDARY]: assets['ui/card/rarity-legendary']
//     },
//     speed: {
//       [CARD_SPEED.SLOW]: assets['ui/card/speed-slow'],
//       [CARD_SPEED.FAST]: assets['ui/card/speed-fast'],
//       [CARD_SPEED.BURST]: assets['ui/card/speed-burst']
//     },
//     kind: {
//       [CARD_KINDS.SPELL]: assets['ui/card/kind-spell'],
//       [CARD_KINDS.ARTIFACT]: assets['ui/card/kind-artifact'],
//       [CARD_KINDS.MINION]: assets['ui/card/kind-minion'],
//       [CARD_KINDS.HERO]: assets['ui/card/kind-hero'],
//       [CARD_KINDS.SIGIL]: assets['ui/card/kind-sigil']
//     },
//     faction: {
//       [FACTIONS.ARCANE.id]: assets['ui/card/faction-arcane'],
//       [FACTIONS.CHAOS.id]: assets['ui/card/faction-chaos'],
//       [FACTIONS.GENESIS.id]: assets['ui/card/faction-genesis'],
//       [FACTIONS.ORDER.id]: assets['ui/card/faction-order'],
//       [FACTIONS.OBLIVION.id]: assets['ui/card/faction-oblivion'],
//       [FACTIONS.PRIMAL.id]: assets['ui/card/faction-primal'],
//       [FACTIONS.NEUTRAL.id]: assets['ui/card/faction-neutral']
//     },
//     rune: {
//       [RUNES.FOCUS]: assets['ui/card/rune-focus'],
//       [RUNES.MIGHT]: assets['ui/card/rune-might'],
//       [RUNES.KNOWLEDGE]: assets['ui/card/rune-knowledge'],
//       [RUNES.RESONANCE]: assets['ui/card/rune-resonance']
//     }
//   },
//   cardText: {
//     manaCost: assets['ui/mana-cost']
//   }
// };
