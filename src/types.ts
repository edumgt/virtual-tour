export type TimePreset = 'day' | 'sunset' | 'night' | 'dawn';

export type RenderingMode = 'pbr' | 'architectural' | 'night_lanterns';

export interface LandmarkInfo {
  id: string;
  nameKo: string;
  nameEn: string;
  nameHanja: string;
  category: '국보' | '사적' | '명소' | '조각/상징' | '자연';
  summaryKo: string;
  summaryEn: string;
  detailsKo: string[];
  detailsEn: string[];
  historicalEra: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  highlightCoordinates: [number, number, number];
  audioPrompt?: string;
}

export interface CameraPreset {
  id: string;
  titleKo: string;
  titleEn: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}
