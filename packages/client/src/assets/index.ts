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
