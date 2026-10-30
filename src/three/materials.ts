import * as THREE from 'three';
import {
  createGiwaRoofTexture,
  createDancheongTexture,
  createGraniteStoneTexture,
  createWoodGrainTexture,
  createLatticeWindowTexture,
  createIlworobongdoTexture,
  createGwanghwamunSignTexture,
  createGeunjeongjeonSignTexture,
  createGyeonghoeruSignTexture,
} from './textures';

export interface PalaceMaterials {
  giwaRoof: THREE.MeshStandardMaterial;
  dancheong: THREE.MeshStandardMaterial;
  granite: THREE.MeshStandardMaterial;
  royalWood: THREE.MeshStandardMaterial;
  pillarCrimson: THREE.MeshStandardMaterial;
  latticeWindow: THREE.MeshStandardMaterial;
  goldLeaf: THREE.MeshStandardMaterial;
  bronzeStatue: THREE.MeshStandardMaterial;
  waterPond: THREE.MeshStandardMaterial;
  lanternGlow: THREE.MeshStandardMaterial;
  eavesWhite: THREE.MeshStandardMaterial;
  mountainStone: THREE.MeshStandardMaterial;
  pineNeedles: THREE.MeshStandardMaterial;
  ilworobongdo: THREE.MeshStandardMaterial;
  gwanghwamunSign: THREE.MeshStandardMaterial;
  geunjeongjeonSign: THREE.MeshStandardMaterial;
  gyeonghoeruSign: THREE.MeshStandardMaterial;
  wireframeMode: boolean;
  dispose: () => void;
}

export function initPalaceMaterials(): PalaceMaterials {
  const giwaTex = createGiwaRoofTexture();
  giwaTex.repeat.set(4, 4);

  const dancheongTex = createDancheongTexture();
  dancheongTex.repeat.set(4, 1);

  const graniteTex = createGraniteStoneTexture();
  graniteTex.repeat.set(8, 8);

  const woodTex = createWoodGrainTexture();
  woodTex.repeat.set(1, 4);

  const latticeTex = createLatticeWindowTexture();
  const ilworoTex = createIlworobongdoTexture();
  const gwanghwamunSignTex = createGwanghwamunSignTexture();
  const geunjeongjeonSignTex = createGeunjeongjeonSignTexture();
  const gyeonghoeruSignTex = createGyeonghoeruSignTexture();

  const giwaRoof = new THREE.MeshStandardMaterial({
    map: giwaTex,
    bumpMap: giwaTex,
    bumpScale: 0.08,
    color: 0xffffff,
    roughness: 0.65,
    metalness: 0.08,
  });

  const dancheong = new THREE.MeshStandardMaterial({
    map: dancheongTex,
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.04,
  });

  const granite = new THREE.MeshStandardMaterial({
    map: graniteTex,
    bumpMap: graniteTex,
    bumpScale: 0.04,
    color: 0xd8d2c4,
    roughness: 0.85,
    metalness: 0.02,
  });

  const royalWood = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0x8a2f24, // Joseon vermilion pillar tint
    roughness: 0.65,
    metalness: 0.04,
  });

  const pillarCrimson = new THREE.MeshStandardMaterial({
    color: 0x9b2a1e,
    roughness: 0.55,
    metalness: 0.05,
  });

  const latticeWindow = new THREE.MeshStandardMaterial({
    map: latticeTex,
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.02,
  });

  const goldLeaf = new THREE.MeshStandardMaterial({
    color: 0xfcc232,
    roughness: 0.22,
    metalness: 0.88,
  });

  const bronzeStatue = new THREE.MeshStandardMaterial({
    color: 0x4d4239,
    roughness: 0.38,
    metalness: 0.72,
  });

  const waterPond = new THREE.MeshStandardMaterial({
    color: 0x1b434e,
    roughness: 0.12,
    metalness: 0.18,
    transparent: true,
    opacity: 0.86,
  });

  const lanternGlow = new THREE.MeshStandardMaterial({
    color: 0xff8833,
    emissive: 0xffaa44,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });

  const eavesWhite = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.75,
    metalness: 0.02,
  });

  const mountainStone = new THREE.MeshStandardMaterial({
    color: 0x6e6e66,
    roughness: 0.95,
    metalness: 0.02,
    flatShading: true,
  });

  const pineNeedles = new THREE.MeshStandardMaterial({
    color: 0x1a452a,
    roughness: 0.8,
    metalness: 0.02,
  });

  const ilworobongdo = new THREE.MeshStandardMaterial({
    map: ilworoTex,
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.02,
  });

  const gwanghwamunSign = new THREE.MeshStandardMaterial({
    map: gwanghwamunSignTex,
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.2,
  });

  const geunjeongjeonSign = new THREE.MeshStandardMaterial({
    map: geunjeongjeonSignTex,
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.2,
  });

  const gyeonghoeruSign = new THREE.MeshStandardMaterial({
    map: gyeonghoeruSignTex,
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.2,
  });

  const allMaterials = [
    giwaRoof,
    dancheong,
    granite,
    royalWood,
    pillarCrimson,
    latticeWindow,
    goldLeaf,
    bronzeStatue,
    waterPond,
    lanternGlow,
    eavesWhite,
    mountainStone,
    pineNeedles,
    ilworobongdo,
    gwanghwamunSign,
    geunjeongjeonSign,
    gyeonghoeruSign,
  ];

  return {
    giwaRoof,
    dancheong,
    granite,
    royalWood,
    pillarCrimson,
    latticeWindow,
    goldLeaf,
    bronzeStatue,
    waterPond,
    lanternGlow,
    eavesWhite,
    mountainStone,
    pineNeedles,
    ilworobongdo,
    gwanghwamunSign,
    geunjeongjeonSign,
    gyeonghoeruSign,
    wireframeMode: false,
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
      giwaTex.dispose();
      dancheongTex.dispose();
      graniteTex.dispose();
      woodTex.dispose();
      latticeTex.dispose();
      ilworoTex.dispose();
      gwanghwamunSignTex.dispose();
      geunjeongjeonSignTex.dispose();
      gyeonghoeruSignTex.dispose();
    },
  };
}
