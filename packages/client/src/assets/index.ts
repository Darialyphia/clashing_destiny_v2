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

export const preloadAsset = (path: string) => {
  const img = new Image();
  img.src = assets[path].path;

  return new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = err => reject(err);
  });
};

interface AsepriteFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
  duration: number;
  sourceSize: { w: number; h: number };
}

interface AsepriteJson {
  frames: AsepriteFrame[];
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

export type SpriteData = {
  id: string;
  frameSize: { w: number; h: number };
  sheetSize: { w: number; h: number };
  frameDuration: number;
  animations: Record<
    string,
    { startFrame: number; endFrame: number; frameDuration: number }
  >;
};

export const rawSprites = import.meta.glob('./**/*.json', {
  eager: true
}) as Record<string, { default: AsepriteJson }>;
export const sprites: Record<string, SpriteData> = {};
for (const [path, data] of Object.entries(rawSprites)) {
  const cleanedPath = path.replace('.json', '').replace('./', '');
  const json = data.default;
  const spriteId = cleanedPath;

  const animations: Record<
    string,
    { startFrame: number; endFrame: number; frameDuration: number }
  > = {};

  let currentAnimName: string | null = null;
  let currentAnimStart = 0;
  let currentAnimFrameDuration = 0;
  if (!Array.isArray(json.frames)) {
    console.warn(`Sprite JSON file ${path} has no frames array.`);
  } else {
    json.frames?.forEach((frame, index) => {
      // Parse animation name from filename (e.g. "attack-0" -> "attack")
      // Assumes format "name-index"
      const match = frame.filename.match(/^(.+)-\d+$/);
      const animName = match ? match[1] : 'default';

      if (animName !== currentAnimName) {
        // Close previous animation
        if (currentAnimName) {
          animations[currentAnimName] = {
            startFrame: currentAnimStart,
            endFrame: index - 1,
            frameDuration: currentAnimFrameDuration
          };
        }
        // Start new animation
        currentAnimName = animName;
        currentAnimStart = index;
        currentAnimFrameDuration = frame.duration;
      }
    });
  }

  // Close last animation
  if (currentAnimName) {
    animations[currentAnimName] = {
      startFrame: currentAnimStart,
      endFrame: json.frames.length - 1,
      frameDuration: currentAnimFrameDuration
    };
  }

  // Extract common data from the first frame
  const firstFrame = json.frames[0];

  sprites[spriteId] = {
    id: spriteId,
    frameSize: {
      w: firstFrame?.sourceSize.w ?? 0,
      h: firstFrame?.sourceSize.h ?? 0
    },
    sheetSize: { w: json.meta.size.w, h: json.meta.size.h },
    frameDuration: firstFrame?.duration ?? 0,
    animations
  };
}
