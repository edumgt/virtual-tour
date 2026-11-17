import { SceneZone } from '../types';
import { clampCameraPosition } from './rules';

export interface ZoneMapBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  viewWidth: number;
  viewHeight: number;
}

export interface ProjectedMapPoint {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  isOutOfBounds: boolean;
}

export interface SchematicShape {
  kind: 'rect' | 'ellipse' | 'path';
  layer: 'terrain' | 'water' | 'road' | 'building' | 'foliage';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  ry?: number;
  cx?: number;
  cy?: number;
  d?: string;
  strokeWidth?: number;
  labelKo?: string;
  labelEn?: string;
}

export interface ZoneMapConfig {
  zone: SceneZone;
  titleKo: string;
  titleEn: string;
  bounds: ZoneMapBounds;
  shapes: SchematicShape[];
}

export const MAP_VIEW_WIDTH = 240;
export const MAP_VIEW_HEIGHT = 180;

export const ZONE_MAP_CONFIGS: Record<SceneZone, ZoneMapConfig> = {
  gwanghwamun: {
    zone: 'gwanghwamun',
    titleKo: '경복궁 · 광화문',
    titleEn: 'Gwanghwamun & Palace',
    bounds: {
      minX: -120,
      maxX: 120,
      minZ: -200,
      maxZ: 205,
      viewWidth: MAP_VIEW_WIDTH,
      viewHeight: MAP_VIEW_HEIGHT,
    },
    shapes: [
      // Mt. Bugaksan northern ridge
      { kind: 'ellipse', layer: 'terrain', cx: 0, cy: -175, rx: 112, ry: 36, labelKo: '북악산', labelEn: 'Bugaksan' },
      // Gyeonghoeru Lotus Pond
      { kind: 'rect', layer: 'water', x: -94, y: -90, width: 48, height: 46, rx: 4 },
      // Palace Courtyard Precinct
      { kind: 'rect', layer: 'terrain', x: -42, y: -118, width: 84, height: 116, rx: 3 },
      // Sejong-daero & Gwanghwamun Crossroad
      { kind: 'rect', layer: 'road', x: -24, y: 12, width: 48, height: 185 },
      { kind: 'rect', layer: 'road', x: -116, y: 138, width: 232, height: 26 },
      { kind: 'rect', layer: 'road', x: -116, y: 4, width: 232, height: 14 },
      // Gwanghwamun Square center pedestrian promenade
      { kind: 'rect', layer: 'foliage', x: -7, y: 38, width: 14, height: 100, rx: 2 },
      // Geunjeongjeon, Gyeonghoeru, Gwanghwamun footprints
      { kind: 'rect', layer: 'building', x: -16, y: -76, width: 32, height: 22, rx: 2 },
      { kind: 'rect', layer: 'building', x: -78, y: -76, width: 20, height: 16, rx: 2 },
      { kind: 'rect', layer: 'building', x: -18, y: -4, width: 36, height: 10, rx: 2 },
      // Modern Gwanghwamun buildings
      { kind: 'rect', layer: 'building', x: -86, y: 46, width: 24, height: 28, rx: 2 },
      { kind: 'rect', layer: 'building', x: -84, y: 100, width: 26, height: 30, rx: 2 },
      { kind: 'rect', layer: 'building', x: 56, y: 34, width: 24, height: 24, rx: 2 },
      { kind: 'rect', layer: 'building', x: 56, y: 146, width: 28, height: 28, rx: 2 },
    ],
  },
  jamsil: {
    zone: 'jamsil',
    titleKo: '석촌호수 · 롯데타워',
    titleEn: 'Seokchon · Lotte',
    bounds: {
      minX: -135,
      maxX: 135,
      minZ: -85,
      maxZ: 245,
      viewWidth: MAP_VIEW_WIDTH,
      viewHeight: MAP_VIEW_HEIGHT,
    },
    shapes: [
      // Seokchon Lake Park green belt
      { kind: 'rect', layer: 'foliage', x: -120, y: 14, width: 240, height: 96, rx: 14 },
      // West Lake & East Lake
      { kind: 'ellipse', layer: 'water', cx: -60, cy: 62, rx: 48, ry: 34 },
      { kind: 'ellipse', layer: 'water', cx: 62, cy: 62, rx: 48, ry: 34 },
      // Magic Island inside West Lake
      { kind: 'ellipse', layer: 'terrain', cx: -68, cy: 56, rx: 16, ry: 12 },
      // Olympic-ro & Songpa-daero crossroad
      { kind: 'rect', layer: 'road', x: -132, y: -8, width: 264, height: 16 },
      { kind: 'rect', layer: 'road', x: -8, y: -82, width: 16, height: 318 },
      // Lotte World Adventure dome, Lotte Mall & Tower
      { kind: 'rect', layer: 'building', x: -94, y: -56, width: 52, height: 38, rx: 6 },
      { kind: 'rect', layer: 'building', x: 16, y: -44, width: 88, height: 30, rx: 3 },
      { kind: 'ellipse', layer: 'building', cx: 52, cy: -36, rx: 14, ry: 14 },
      { kind: 'rect', layer: 'building', x: -74, y: 50, width: 12, height: 12, rx: 2 },
    ],
  },
  namsan_han: {
    zone: 'namsan_han',
    titleKo: '남산 · 한남 · 한강대교',
    titleEn: 'Namsan & Han River',
    bounds: {
      minX: -140,
      maxX: 140,
      minZ: -145,
      maxZ: 205,
      viewWidth: MAP_VIEW_WIDTH,
      viewHeight: MAP_VIEW_HEIGHT,
    },
    shapes: [
      // Mt. Namsan & Hannam hillside
      { kind: 'ellipse', layer: 'foliage', cx: 0, cy: -98, rx: 128, ry: 44 },
      { kind: 'ellipse', layer: 'terrain', cx: 0, cy: -36, rx: 124, ry: 28 },
      // Han River channel
      { kind: 'rect', layer: 'water', x: -138, y: 12, width: 276, height: 100 },
      // Gangbyeonbuk-ro, Olympic-daero, Han River Bridge
      { kind: 'rect', layer: 'road', x: -138, y: -5, width: 276, height: 12 },
      { kind: 'rect', layer: 'road', x: -138, y: 122, width: 276, height: 14 },
      { kind: 'rect', layer: 'road', x: -9, y: -10, width: 18, height: 190 },
      // N Seoul Tower, Palgakjeong, Hannam Villas, Some Sevit
      { kind: 'ellipse', layer: 'building', cx: 3, cy: -102, rx: 9, ry: 9 },
      { kind: 'rect', layer: 'building', x: -16, y: -100, width: 10, height: 9, rx: 2 },
      { kind: 'rect', layer: 'building', x: -46, y: -44, width: 22, height: 16, rx: 2 },
      { kind: 'rect', layer: 'building', x: 24, y: -46, width: 26, height: 16, rx: 2 },
      { kind: 'ellipse', layer: 'building', cx: 66, cy: 72, rx: 14, ry: 10 },
    ],
  },
  namhae_german: {
    zone: 'namhae_german',
    titleKo: '남해 독일마을',
    titleEn: 'Namhae German Village',
    bounds: {
      minX: -125,
      maxX: 125,
      minZ: -85,
      maxZ: 155,
      viewWidth: MAP_VIEW_WIDTH,
      viewHeight: MAP_VIEW_HEIGHT,
    },
    shapes: [
      // Mulgeon Bay & Coastal Ocean
      { kind: 'rect', layer: 'water', x: -124, y: 34, width: 248, height: 118 },
      // Coastal amphitheater slope & Windbreak crescent forest
      { kind: 'ellipse', layer: 'terrain', cx: 0, cy: -22, rx: 112, ry: 54 },
      {
        kind: 'path',
        layer: 'foliage',
        d: 'M -92 26 Q 0 42 92 26',
        strokeWidth: 9,
      },
      // Breakwater pier & German-ro S-curve
      {
        kind: 'path',
        layer: 'road',
        d: 'M -86 38 L -48 70',
        strokeWidth: 5,
      },
      {
        kind: 'path',
        layer: 'road',
        d: 'M -62 12 C -26 4, 24 -8, 0 -42',
        strokeWidth: 4,
      },
      // Padoch Hall & Terraced German villas + Lighthouse
      { kind: 'rect', layer: 'building', x: -10, y: -52, width: 20, height: 14, rx: 2 },
      { kind: 'rect', layer: 'building', x: -46, y: -18, width: 14, height: 10, rx: 2 },
      { kind: 'rect', layer: 'building', x: 24, y: -16, width: 14, height: 10, rx: 2 },
      { kind: 'rect', layer: 'building', x: -24, y: 2, width: 14, height: 10, rx: 2 },
      { kind: 'rect', layer: 'building', x: 18, y: 4, width: 14, height: 10, rx: 2 },
      { kind: 'ellipse', layer: 'building', cx: -48, cy: 70, rx: 5, ry: 5 },
    ],
  },
  jeonju_hanok: {
    zone: 'jeonju_hanok',
    titleKo: '전주 한옥마을',
    titleEn: 'Jeonju Hanok Village',
    bounds: {
      minX: -135,
      maxX: 135,
      minZ: -95,
      maxZ: 158,
      viewWidth: MAP_VIEW_WIDTH,
      viewHeight: MAP_VIEW_HEIGHT,
    },
    shapes: [
      // Kirinbong north hills & Omokdae eastern ridge
      { kind: 'ellipse', layer: 'foliage', cx: 0, cy: -80, rx: 130, ry: 24 },
      { kind: 'ellipse', layer: 'foliage', cx: 88, cy: 26, rx: 32, ry: 34 },
      // Jeonjucheon Stream
      { kind: 'rect', layer: 'water', x: -132, y: 60, width: 264, height: 28 },
      // Taejo-ro (E-W), Eunhaeng-ro (N-S) & Namcheongyo Bridge
      { kind: 'rect', layer: 'road', x: -78, y: 13, width: 144, height: 10 },
      { kind: 'rect', layer: 'road', x: 10, y: -36, width: 8, height: 96 },
      { kind: 'rect', layer: 'road', x: -7, y: 56, width: 14, height: 36 },
      // Gyeonggijeon Shrine & Bamboo grove
      { kind: 'rect', layer: 'terrain', x: -34, y: -62, width: 48, height: 42, rx: 2 },
      { kind: 'rect', layer: 'foliage', x: -32, y: -68, width: 44, height: 10, rx: 2 },
      { kind: 'rect', layer: 'building', x: -20, y: -48, width: 20, height: 14, rx: 2 },
      // Jeondong Cathedral & Omokdae Pavilion & Cheongyeonru
      { kind: 'rect', layer: 'building', x: -86, y: 10, width: 16, height: 18, rx: 3 },
      { kind: 'rect', layer: 'building', x: 80, y: 22, width: 12, height: 12, rx: 2 },
      { kind: 'rect', layer: 'building', x: -6, y: 69, width: 12, height: 10, rx: 2 },
      // Representative Hanok blocks along Taejo-ro
      { kind: 'rect', layer: 'building', x: -58, y: -12, width: 20, height: 16, rx: 1 },
      { kind: 'rect', layer: 'building', x: -28, y: -12, width: 22, height: 16, rx: 1 },
      { kind: 'rect', layer: 'building', x: 28, y: -12, width: 22, height: 16, rx: 1 },
      { kind: 'rect', layer: 'building', x: -58, y: 30, width: 22, height: 16, rx: 1 },
      { kind: 'rect', layer: 'building', x: -26, y: 30, width: 22, height: 16, rx: 1 },
      { kind: 'rect', layer: 'building', x: 28, y: 30, width: 22, height: 16, rx: 1 },
    ],
  },
};

/**
 * Projects Three.js world (X, Z) coordinates into 2D SVG map coordinates and percentage positions.
 */
export function projectWorldToMap(
  worldX: number,
  worldZ: number,
  zone: SceneZone
): ProjectedMapPoint {
  const { minX, maxX, minZ, maxZ, viewWidth, viewHeight } = ZONE_MAP_CONFIGS[zone].bounds;
  const rawNormX = (worldX - minX) / (maxX - minX);
  const rawNormZ = (worldZ - minZ) / (maxZ - minZ);
  const isOutOfBounds = rawNormX < 0 || rawNormX > 1 || rawNormZ < 0 || rawNormZ > 1;

  const pad = 0.035;
  const normX = Math.max(pad, Math.min(1 - pad, rawNormX));
  const normZ = Math.max(pad, Math.min(1 - pad, rawNormZ));

  return {
    x: normX * viewWidth,
    y: normZ * viewHeight,
    xPercent: normX * 100,
    yPercent: normZ * 100,
    isOutOfBounds,
  };
}

/**
 * Inverse projects normalized [0..1] click coordinates on the 2D map back to world (X, Z).
 */
export function mapNormToWorldXZ(
  normX: number,
  normY: number,
  zone: SceneZone
): [number, number] {
  const { minX, maxX, minZ, maxZ } = ZONE_MAP_CONFIGS[zone].bounds;
  const clampedX = Math.max(0, Math.min(1, normX));
  const clampedY = Math.max(0, Math.min(1, normY));
  return [
    minX + clampedX * (maxX - minX),
    minZ + clampedY * (maxZ - minZ),
  ];
}

/**
 * Computes horizontal viewing direction in degrees for 2D map rendering.
 * 0 deg points North (-Z / up on map), 90 deg points East (+X / right on map).
 */
export function computeCameraYawDeg(
  position: [number, number, number],
  target: [number, number, number]
): number {
  const dx = target[0] - position[0];
  const dz = target[2] - position[2];
  if (Math.abs(dx) < 1e-4 && Math.abs(dz) < 1e-4) {
    return 0;
  }
  const rad = Math.atan2(dx, -dz);
  const deg = (rad * 180) / Math.PI;
  return (deg + 360) % 360;
}

/**
 * Computes a comfortable camera fly-to pose when the user clicks a point (worldX, worldZ)
 * on the 2D minimap, preserving the viewing angle while keeping elevation sensible.
 */
export function panCameraToWorldXZ(
  currentPos: [number, number, number],
  currentTarget: [number, number, number],
  worldX: number,
  worldZ: number
): { position: [number, number, number]; target: [number, number, number] } {
  const rawDx = currentPos[0] - currentTarget[0];
  const rawDz = currentPos[2] - currentTarget[2];
  const horizDist = Math.hypot(rawDx, rawDz);
  const maxOffset = 64;
  const scale = horizDist > maxOffset ? maxOffset / horizDist : horizDist < 12 ? 28 / Math.max(1, horizDist) : 1;

  const dx = horizDist < 1 ? 0 : rawDx * scale;
  const dz = horizDist < 1 ? 28 : rawDz * scale;
  const dy = Math.max(12, Math.min(48, currentPos[1] - currentTarget[1]));
  const targetY = Math.max(2, Math.min(28, currentTarget[1]));

  const nextTarget: [number, number, number] = [worldX, targetY, worldZ];
  const nextPos = clampCameraPosition([worldX + dx, targetY + dy, worldZ + dz]);
  return { position: nextPos, target: nextTarget };
}
