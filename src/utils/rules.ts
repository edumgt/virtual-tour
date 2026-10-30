import { TimePreset } from '../types';

export interface LightConfig {
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  ambientIntensity: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  exposure: number;
  lanternIntensity: number;
}

export function getLightingPreset(preset: TimePreset): LightConfig {
  switch (preset) {
    case 'day':
      return {
        sunColor: 0xfffaed,
        sunIntensity: 2.2,
        sunPosition: [40, 65, 35],
        hemiSkyColor: 0x90c2ff,
        hemiGroundColor: 0x5a5040,
        hemiIntensity: 1.1,
        ambientIntensity: 0.35,
        fogColor: 0xd8e8f8,
        fogNear: 60,
        fogFar: 360,
        exposure: 1.15,
        lanternIntensity: 0.0,
      };
    case 'sunset':
      return {
        sunColor: 0xff8c42,
        sunIntensity: 2.5,
        sunPosition: [-80, 22, -40],
        hemiSkyColor: 0xffaa66,
        hemiGroundColor: 0x482d22,
        hemiIntensity: 0.9,
        ambientIntensity: 0.3,
        fogColor: 0xe88a55,
        fogNear: 50,
        fogFar: 320,
        exposure: 1.25,
        lanternIntensity: 0.6,
      };
    case 'night':
      return {
        sunColor: 0x4a6fa5, // Moonlight
        sunIntensity: 0.45,
        sunPosition: [20, 60, -40],
        hemiSkyColor: 0x121b2d,
        hemiGroundColor: 0x080c14,
        hemiIntensity: 0.3,
        ambientIntensity: 0.15,
        fogColor: 0x0d1424,
        fogNear: 40,
        fogFar: 280,
        exposure: 1.35,
        lanternIntensity: 2.2, // Bright royal lanterns
      };
    case 'dawn':
      return {
        sunColor: 0xffdfba,
        sunIntensity: 1.4,
        sunPosition: [70, 18, 50],
        hemiSkyColor: 0x7fa2c8,
        hemiGroundColor: 0x3e3830,
        hemiIntensity: 0.7,
        ambientIntensity: 0.3,
        fogColor: 0xa4b8ce,
        fogNear: 35,
        fogFar: 260,
        exposure: 1.1,
        lanternIntensity: 0.4,
      };
  }
}

/**
 * Exponential damp helper for camera transition
 */
export function dampVector3(
  current: [number, number, number],
  target: [number, number, number],
  lambda: number,
  delta: number
): [number, number, number] {
  const factor = 1 - Math.exp(-lambda * delta);
  return [
    current[0] + (target[0] - current[0]) * factor,
    current[1] + (target[1] - current[1]) * factor,
    current[2] + (target[2] - current[2]) * factor,
  ];
}

/**
 * Distance between two 3D points
 */
export function distance3D(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Bounds checking to clamp camera within Joseon palace viewing envelope
 */
export function clampCameraPosition(
  pos: [number, number, number]
): [number, number, number] {
  const minX = -120;
  const maxX = 120;
  const minY = 1.2;
  const maxY = 130;
  const minZ = -180;
  const maxZ = 160;

  return [
    Math.max(minX, Math.min(maxX, pos[0])),
    Math.max(minY, Math.min(maxY, pos[1])),
    Math.max(minZ, Math.min(maxZ, pos[2])),
  ];
}
