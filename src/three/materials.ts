import * as THREE from 'three';
import giwaRoofUrl from '../assets/images/korean_giwa_roof_1793327454001.jpg';
import graniteWallUrl from '../assets/images/korean_granite_wall_1793327439167.jpg';
import {
  createDancheongTexture,
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
  granitePlinth: THREE.MeshStandardMaterial;
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
  const loader = new THREE.TextureLoader();

  // Photorealistic high-resolution authentic textures matching user reference
  const giwaTex = loader.load(giwaRoofUrl);
  giwaTex.wrapS = THREE.RepeatWrapping;
  giwaTex.wrapT = THREE.RepeatWrapping;
  giwaTex.colorSpace = THREE.SRGBColorSpace;
  giwaTex.repeat.set(1.5, 1.5); // Natural scale for Korean ceramic Giwa tile ribs

  const graniteTex = loader.load(graniteWallUrl);
  graniteTex.wrapS = THREE.RepeatWrapping;
  graniteTex.wrapT = THREE.RepeatWrapping;
  graniteTex.colorSpace = THREE.SRGBColorSpace;
  graniteTex.repeat.set(4, 2.5);

  const dancheongTex = createDancheongTexture();
  dancheongTex.repeat.set(4, 1);

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
    color: 0x3d4147, // Authentic dark charcoal ceramic tile matching reference image
    roughness: 0.52,
    metalness: 0.1,
  });

  const dancheong = new THREE.MeshStandardMaterial({
    map: dancheongTex,
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.04,
  });

  const granite = new THREE.MeshStandardMaterial({
    map: graniteTex,
    bumpMap: graniteTex,
    bumpScale: 0.05,
    color: 0xf5f1e8, // Authentic weathered Ashlar granite matching reference
    roughness: 0.82,
    metalness: 0.02,
  });

  const granitePlinth = new THREE.MeshStandardMaterial({
    map: graniteTex,
    bumpMap: graniteTex,
    bumpScale: 0.07,
    color: 0x4e4a44, // Dark charcoal stone plinth course at the bottom of the wall
    roughness: 0.88,
    metalness: 0.02,
  });

  const royalWood = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0x5a2016, // Rich Joseon aged dark vermilion wood
    roughness: 0.62,
    metalness: 0.05,
  });

  const pillarCrimson = new THREE.MeshStandardMaterial({
    color: 0x7e261e, // Deep Joseon cinnabar vermilion
    roughness: 0.52,
    metalness: 0.05,
  });

  const latticeWindow = new THREE.MeshStandardMaterial({
    map: latticeTex,
    color: 0xffffff,
    roughness: 0.38,
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
    granitePlinth,
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
    granitePlinth,
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
      graniteTex.dispose();
      dancheongTex.dispose();
      woodTex.dispose();
      latticeTex.dispose();
      ilworoTex.dispose();
      gwanghwamunSignTex.dispose();
      geunjeongjeonSignTex.dispose();
      gyeonghoeruSignTex.dispose();
    },
  };
}
