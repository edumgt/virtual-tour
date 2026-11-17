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
  createRafterEndTexture,
  createDragonCeilingTexture,
  createGableHapgakTexture,
  createIronBandTexture,
  createModernGlassFacadeTexture,
  createKyoboFacadeTexture,
  createGovernmentFacadeTexture,
  createAsphaltRoadTexture,
  createLotteTowerGlassTexture,
  createLotteMallFacadeTexture,
  createMagicCastleWallTexture,
  createNamsanTowerBodyTexture,
  createHannamVillaTexture,
  createGermanRoofTileTexture,
  createGermanWallTexture,
  createGermanStoneWallTexture,
  createGermanCobbleTexture,
  createCoastalLawnTexture,
  createWaterNormalTexture,
  createTreeBarkTexture,
  createLeafCanopyTexture,
  createBlossomCanopyTexture,
  createCoastalRockTexture,
  createRedBrickTexture,
  createHanokWallTexture,
} from './textures';

export interface PalaceMaterials {
  giwaRoof: THREE.MeshStandardMaterial;
  dancheong: THREE.MeshStandardMaterial;
  dancheongWood: THREE.MeshStandardMaterial;
  granite: THREE.MeshStandardMaterial;
  granitePlinth: THREE.MeshStandardMaterial;
  royalWood: THREE.MeshStandardMaterial;
  pillarCrimson: THREE.MeshStandardMaterial;
  latticeWindow: THREE.MeshStandardMaterial;
  goldLeaf: THREE.MeshStandardMaterial;
  bronzeStatue: THREE.MeshStandardMaterial;
  waterPond: THREE.MeshPhysicalMaterial;
  lanternGlow: THREE.MeshStandardMaterial;
  eavesWhite: THREE.MeshStandardMaterial;
  mountainStone: THREE.MeshStandardMaterial;
  pineNeedles: THREE.MeshStandardMaterial;
  treeBark: THREE.MeshStandardMaterial;
  leafCanopy: THREE.MeshStandardMaterial;
  blossomCanopy: THREE.MeshStandardMaterial;
  coastalRock: THREE.MeshStandardMaterial;
  ilworobongdo: THREE.MeshStandardMaterial;
  gwanghwamunSign: THREE.MeshStandardMaterial;
  geunjeongjeonSign: THREE.MeshStandardMaterial;
  gyeonghoeruSign: THREE.MeshStandardMaterial;
  rafterEnd: THREE.MeshStandardMaterial;
  dragonCeiling: THREE.MeshStandardMaterial;
  gableHapgak: THREE.MeshStandardMaterial;
  ironBand: THREE.MeshStandardMaterial;
  dumuBronze: THREE.MeshStandardMaterial;
  // Modern Architecture & Streetscape
  modernGlass: THREE.MeshStandardMaterial;
  kyoboFacade: THREE.MeshStandardMaterial;
  modernGovernment: THREE.MeshStandardMaterial;
  asphaltRoad: THREE.MeshStandardMaterial;
  modernConcrete: THREE.MeshStandardMaterial;
  modernMullion: THREE.MeshStandardMaterial;
  // Seokchon Lake & Lotte World Complex
  lotteTowerGlass: THREE.MeshStandardMaterial;
  lotteTowerFin: THREE.MeshStandardMaterial;
  lotteMallFacade: THREE.MeshStandardMaterial;
  magicCastleWall: THREE.MeshStandardMaterial;
  castleTurretBlue: THREE.MeshStandardMaterial;
  seokchonWater: THREE.MeshPhysicalMaterial;
  cherryBlossomPink: THREE.MeshStandardMaterial;
  woodDeck: THREE.MeshStandardMaterial;
  // Namsan Tower, Hannam-dong & Han River Bridge
  namsanTowerPod: THREE.MeshStandardMaterial;
  namsanSpireRed: THREE.MeshStandardMaterial;
  hannamVilla: THREE.MeshStandardMaterial;
  leeumTerracotta: THREE.MeshStandardMaterial;
  bridgeSteel: THREE.MeshStandardMaterial;
  hanRiverWater: THREE.MeshPhysicalMaterial;
  // Namhae German Village & Mulgeon Bay
  germanRoofTile: THREE.MeshStandardMaterial;
  germanHouseWall: THREE.MeshStandardMaterial;
  namhaeSeaWater: THREE.MeshPhysicalMaterial;
  lighthouseRed: THREE.MeshStandardMaterial;
  namhaeStoneWall: THREE.MeshStandardMaterial;
  namhaeCobbleRoad: THREE.MeshStandardMaterial;
  namhaeLawn: THREE.MeshStandardMaterial;
  // Jeonju Hanok Village
  jeondongBrick: THREE.MeshStandardMaterial;
  hanokWall: THREE.MeshStandardMaterial;
  jeonjuWater: THREE.MeshPhysicalMaterial;
  wireframeMode: boolean;
  updateWaterTime: (timeSec: number) => void;
  dispose: () => void;
}

export function initPalaceMaterials(maxAnisotropy = 4): PalaceMaterials {
  const loader = new THREE.TextureLoader();

  const applyAniso = <T extends THREE.Texture>(tex: T): T => {
    tex.anisotropy = Math.max(1, Math.min(maxAnisotropy, 8));
    return tex;
  };

  // Photorealistic high-resolution authentic textures matching user reference
  const giwaTex = applyAniso(loader.load(giwaRoofUrl));
  giwaTex.wrapS = THREE.RepeatWrapping;
  giwaTex.wrapT = THREE.RepeatWrapping;
  giwaTex.colorSpace = THREE.SRGBColorSpace;
  giwaTex.repeat.set(1.5, 1.5);

  const graniteTex = applyAniso(loader.load(graniteWallUrl));
  graniteTex.wrapS = THREE.RepeatWrapping;
  graniteTex.wrapT = THREE.RepeatWrapping;
  graniteTex.colorSpace = THREE.SRGBColorSpace;
  graniteTex.repeat.set(4, 2.5);

  const dancheongTex = applyAniso(createDancheongTexture());
  dancheongTex.repeat.set(4, 1);

  const woodTex = applyAniso(createWoodGrainTexture());
  woodTex.repeat.set(1, 4);

  const latticeTex = applyAniso(createLatticeWindowTexture());
  latticeTex.repeat.set(16, 1);
  const ilworoTex = applyAniso(createIlworobongdoTexture());
  const gwanghwamunSignTex = applyAniso(createGwanghwamunSignTexture());
  const geunjeongjeonSignTex = applyAniso(createGeunjeongjeonSignTexture());
  const gyeonghoeruSignTex = applyAniso(createGyeonghoeruSignTexture());
  const rafterEndTex = applyAniso(createRafterEndTexture());
  const dragonCeilingTex = applyAniso(createDragonCeilingTexture());
  const gableHapgakTex = applyAniso(createGableHapgakTexture());
  const ironBandTex = applyAniso(createIronBandTexture());

  // Modern Architecture Textures
  const modernGlassTex = applyAniso(createModernGlassFacadeTexture());
  modernGlassTex.repeat.set(2, 4);
  const kyoboTex = applyAniso(createKyoboFacadeTexture());
  kyoboTex.repeat.set(2, 4);
  const governmentTex = applyAniso(createGovernmentFacadeTexture());
  governmentTex.repeat.set(2, 4);
  const asphaltTex = applyAniso(createAsphaltRoadTexture());
  asphaltTex.repeat.set(1, 6);

  // Seokchon Lake & Lotte World Textures
  const lotteTowerTex = applyAniso(createLotteTowerGlassTexture());
  lotteTowerTex.repeat.set(3, 8);
  const lotteMallTex = applyAniso(createLotteMallFacadeTexture());
  lotteMallTex.repeat.set(4, 2);
  const magicCastleTex = applyAniso(createMagicCastleWallTexture());
  magicCastleTex.repeat.set(2, 2);

  // Namsan, Hannam-dong & Han River Textures
  const namsanPodTex = applyAniso(createNamsanTowerBodyTexture());
  namsanPodTex.repeat.set(2, 1);
  const hannamVillaTex = applyAniso(createHannamVillaTexture());
  hannamVillaTex.repeat.set(2, 1);

  // Namhae German Village Textures
  const germanRoofTex = applyAniso(createGermanRoofTileTexture());
  germanRoofTex.repeat.set(2, 2);
  const germanWallTex = applyAniso(createGermanWallTexture());
  germanWallTex.repeat.set(1, 1);
  const namhaeStoneTex = applyAniso(createGermanStoneWallTexture());
  namhaeStoneTex.repeat.set(26, 1.5);
  const namhaeCobbleTex = applyAniso(createGermanCobbleTexture());
  namhaeCobbleTex.repeat.set(1, 4);
  const namhaeLawnTex = applyAniso(createCoastalLawnTexture());
  namhaeLawnTex.repeat.set(20, 4);

  // Realism Upgrade Textures (Water Normals, Bark, Leaves, Blossoms, Rocks)
  const pondWaterNormalTex = applyAniso(createWaterNormalTexture());
  pondWaterNormalTex.repeat.set(8, 8);

  const seaWaterNormalTex = applyAniso(createWaterNormalTexture());
  seaWaterNormalTex.repeat.set(22, 12);

  const barkTex = applyAniso(createTreeBarkTexture());
  barkTex.repeat.set(2, 3);

  const leafTex = applyAniso(createLeafCanopyTexture());
  leafTex.repeat.set(2, 2);

  const blossomTex = applyAniso(createBlossomCanopyTexture());
  blossomTex.repeat.set(2, 2);

  const coastalRockTex = applyAniso(createCoastalRockTexture());
  coastalRockTex.repeat.set(3, 3);

  const jeondongBrickTex = applyAniso(createRedBrickTexture());
  jeondongBrickTex.repeat.set(3, 3);

  const hanokWallTex = applyAniso(createHanokWallTexture());
  hanokWallTex.repeat.set(2, 1);

  const waterTimeUniform = { value: 0 };

  const giwaRoof = new THREE.MeshStandardMaterial({
    map: giwaTex,
    bumpMap: giwaTex,
    bumpScale: 0.08,
    color: 0x3d4147,
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
    bumpScale: 0.06,
    color: 0xf5f1e8,
    roughness: 0.82,
    metalness: 0.02,
  });

  const granitePlinth = new THREE.MeshStandardMaterial({
    map: graniteTex,
    bumpMap: graniteTex,
    bumpScale: 0.08,
    color: 0x4e4a44,
    roughness: 0.88,
    metalness: 0.02,
  });

  const royalWood = new THREE.MeshStandardMaterial({
    map: woodTex,
    bumpMap: woodTex,
    bumpScale: 0.03,
    color: 0x5a2016,
    roughness: 0.62,
    metalness: 0.05,
  });

  const pillarCrimson = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0x7e261e,
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

  const waterPond = new THREE.MeshPhysicalMaterial({
    color: 0x164a54,
    normalMap: pondWaterNormalTex,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.08,
    metalness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.65,
    transparent: true,
    opacity: 0.88,
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
    map: coastalRockTex,
    bumpMap: coastalRockTex,
    bumpScale: 0.09,
    color: 0x7d7b72,
    roughness: 0.94,
    metalness: 0.02,
  });

  const pineNeedles = new THREE.MeshStandardMaterial({
    map: leafTex,
    bumpMap: leafTex,
    bumpScale: 0.04,
    color: 0x3b6c3e,
    roughness: 0.84,
    metalness: 0.02,
  });

  const treeBark = new THREE.MeshStandardMaterial({
    map: barkTex,
    bumpMap: barkTex,
    bumpScale: 0.07,
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.0,
  });

  const leafCanopy = new THREE.MeshStandardMaterial({
    map: leafTex,
    bumpMap: leafTex,
    bumpScale: 0.045,
    color: 0xffffff,
    roughness: 0.82,
    metalness: 0.02,
  });

  const blossomCanopy = new THREE.MeshStandardMaterial({
    map: blossomTex,
    bumpMap: blossomTex,
    bumpScale: 0.035,
    color: 0xffffff,
    roughness: 0.76,
    metalness: 0.02,
  });

  const coastalRock = new THREE.MeshStandardMaterial({
    map: coastalRockTex,
    bumpMap: coastalRockTex,
    bumpScale: 0.08,
    color: 0xb2aba0,
    roughness: 0.9,
    metalness: 0.04,
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

  const dancheongWood = new THREE.MeshStandardMaterial({
    color: 0x184838,
    roughness: 0.65,
    metalness: 0.02,
  });

  const rafterEnd = new THREE.MeshStandardMaterial({
    map: rafterEndTex,
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.03,
  });

  const dragonCeiling = new THREE.MeshStandardMaterial({
    map: dragonCeilingTex,
    color: 0xffffff,
    roughness: 0.38,
    metalness: 0.15,
  });

  const gableHapgak = new THREE.MeshStandardMaterial({
    map: gableHapgakTex,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.02,
  });

  const ironBand = new THREE.MeshStandardMaterial({
    map: ironBandTex,
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0.65,
  });

  const dumuBronze = new THREE.MeshStandardMaterial({
    color: 0x4a433c,
    roughness: 0.45,
    metalness: 0.75,
  });

  // Modern Buildings & Streetscape Materials
  const modernGlass = new THREE.MeshStandardMaterial({
    map: modernGlassTex,
    color: 0xffffff,
    roughness: 0.14,
    metalness: 0.84,
    envMapIntensity: 1.5,
  });

  const kyoboFacade = new THREE.MeshStandardMaterial({
    map: kyoboTex,
    bumpMap: kyoboTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.62,
    metalness: 0.1,
  });

  const modernGovernment = new THREE.MeshStandardMaterial({
    map: governmentTex,
    bumpMap: governmentTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.56,
    metalness: 0.06,
  });

  const asphaltRoad = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    bumpMap: asphaltTex,
    bumpScale: 0.02,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.02,
  });

  const modernConcrete = new THREE.MeshStandardMaterial({
    map: coastalRockTex,
    color: 0xe3e6ea,
    roughness: 0.76,
    metalness: 0.04,
  });

  const modernMullion = new THREE.MeshStandardMaterial({
    color: 0x1f232b,
    roughness: 0.32,
    metalness: 0.78,
  });

  // Seokchon Lake & Lotte World Materials
  const lotteTowerGlass = new THREE.MeshStandardMaterial({
    map: lotteTowerTex,
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.84,
    envMapIntensity: 1.6,
  });

  const lotteTowerFin = new THREE.MeshStandardMaterial({
    color: 0xe3eaf2,
    roughness: 0.22,
    metalness: 0.88,
  });

  const lotteMallFacade = new THREE.MeshStandardMaterial({
    map: lotteMallTex,
    bumpMap: lotteMallTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.46,
    metalness: 0.18,
  });

  const magicCastleWall = new THREE.MeshStandardMaterial({
    map: magicCastleTex,
    bumpMap: magicCastleTex,
    bumpScale: 0.04,
    color: 0xffffff,
    roughness: 0.74,
    metalness: 0.04,
  });

  const castleTurretBlue = new THREE.MeshStandardMaterial({
    color: 0x265c96,
    roughness: 0.32,
    metalness: 0.32,
  });

  const seokchonWater = new THREE.MeshPhysicalMaterial({
    color: 0x155d72,
    normalMap: pondWaterNormalTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.07,
    metalness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.07,
    envMapIntensity: 1.75,
    transparent: true,
    opacity: 0.9,
  });

  const cherryBlossomPink = new THREE.MeshStandardMaterial({
    map: blossomTex,
    color: 0xf7b2c9,
    roughness: 0.82,
    metalness: 0.0,
  });

  const woodDeck = new THREE.MeshStandardMaterial({
    map: woodTex,
    bumpMap: woodTex,
    bumpScale: 0.03,
    color: 0x9b6844,
    roughness: 0.78,
    metalness: 0.02,
  });

  // Namsan Tower, Hannam-dong & Han River Bridge Materials
  const namsanTowerPod = new THREE.MeshStandardMaterial({
    map: namsanPodTex,
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0.65,
    envMapIntensity: 1.45,
  });

  const namsanSpireRed = new THREE.MeshStandardMaterial({
    color: 0xd92b2b,
    roughness: 0.34,
    metalness: 0.45,
  });

  const hannamVilla = new THREE.MeshStandardMaterial({
    map: hannamVillaTex,
    bumpMap: hannamVillaTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.56,
    metalness: 0.06,
  });

  const leeumTerracotta = new THREE.MeshStandardMaterial({
    map: coastalRockTex,
    bumpMap: coastalRockTex,
    bumpScale: 0.03,
    color: 0xa44d33,
    roughness: 0.68,
    metalness: 0.12,
  });

  const bridgeSteel = new THREE.MeshStandardMaterial({
    color: 0xd3dce6,
    roughness: 0.28,
    metalness: 0.78,
    envMapIntensity: 1.35,
  });

  // Realistic Flowing Han River Water with undulating current & wave normals
  const hanRiverWater = new THREE.MeshPhysicalMaterial({
    color: 0x10536d,
    normalMap: seaWaterNormalTex,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughness: 0.06,
    metalness: 0.28,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.85,
    transparent: true,
    opacity: 0.92,
  });
  hanRiverWater.customProgramCacheKey = () => 'han_river_water_v1';
  hanRiverWater.onBeforeCompile = (shader) => {
    shader.uniforms.uWaterTime = waterTimeUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec3 vRiverPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float waveA = sin(transformed.x * 0.09 - uWaterTime * 1.6) * 0.065;
        float waveB = cos(transformed.y * 0.21 + uWaterTime * 1.1) * 0.045;
        transformed.z += waveA + waveB;
        vRiverPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec3 vRiverPos;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float bankFactor = smoothstep(8.0, 22.0, vRiverPos.z) * smoothstep(116.0, 100.0, vRiverPos.z);
        vec3 shallowRiver = vec3(0.10, 0.44, 0.54);
        vec3 deepRiver = vec3(0.05, 0.25, 0.36);
        diffuseColor.rgb = mix(shallowRiver, deepRiver, bankFactor);
        float rippleGlint = sin(vRiverPos.x * 0.28 - uWaterTime * 2.1 + sin(vRiverPos.z * 0.4)) * 0.5 + 0.5;
        diffuseColor.rgb += vec3(0.02, 0.04, 0.05) * smoothstep(0.7, 1.0, rippleGlint);`
      );
  };

  // Namhae German Village & Mulgeon Bay Materials
  const germanRoofTile = new THREE.MeshStandardMaterial({
    map: germanRoofTex,
    bumpMap: germanRoofTex,
    bumpScale: 0.08,
    color: 0xffffff,
    roughness: 0.62,
    metalness: 0.04,
  });

  const germanHouseWall = new THREE.MeshStandardMaterial({
    map: germanWallTex,
    bumpMap: germanWallTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.02,
  });

  // Realistic Namhae Emerald South Sea with coastal swell, shallow turquoise depth gradient, and lapping shoreline foam
  const namhaeSeaWater = new THREE.MeshPhysicalMaterial({
    color: 0x0d7484,
    normalMap: seaWaterNormalTex,
    normalScale: new THREE.Vector2(1.05, 1.05),
    roughness: 0.05,
    metalness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.95,
    transparent: true,
    opacity: 0.94,
  });
  namhaeSeaWater.customProgramCacheKey = () => 'namhae_sea_water_v1';
  namhaeSeaWater.onBeforeCompile = (shader) => {
    shader.uniforms.uWaterTime = waterTimeUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec3 vSeaWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 preWorld = modelMatrix * vec4(transformed, 1.0);
        float shoreAtten = smoothstep(32.0, 56.0, preWorld.z);
        float swell1 = sin(preWorld.x * 0.065 + preWorld.z * 0.14 - uWaterTime * 1.45) * 0.18;
        float swell2 = cos(preWorld.x * 0.13 - preWorld.z * 0.19 + uWaterTime * 1.1) * 0.11;
        transformed.z += (swell1 + swell2) * (0.25 + 0.75 * shoreAtten);
        vSeaWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec3 vSeaWorldPos;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float depthT = smoothstep(34.0, 92.0, vSeaWorldPos.z);
        vec3 shallowTurquoise = vec3(0.11, 0.62, 0.64);
        vec3 midEmerald = vec3(0.05, 0.43, 0.53);
        vec3 deepSapphire = vec3(0.03, 0.25, 0.38);
        vec3 seaCol = mix(shallowTurquoise, midEmerald, smoothstep(0.0, 0.45, depthT));
        seaCol = mix(seaCol, deepSapphire, smoothstep(0.45, 1.0, depthT));

        // Gentle surf wave crests & organic dappled coastal shoreline whitewater foam
        float surfWave = sin(vSeaWorldPos.z * 0.85 - uWaterTime * 1.8 + sin(vSeaWorldPos.x * 0.08) * 1.6);
        float waveNoise = sin(vSeaWorldPos.x * 0.22 + vSeaWorldPos.z * 0.35) * 0.32 + cos(vSeaWorldPos.x * 0.43 - uWaterTime * 1.2) * 0.22;
        float shoreZone = 1.0 - smoothstep(34.5, 42.5, vSeaWorldPos.z);
        float foamMask = shoreZone * smoothstep(0.2, 0.85, surfWave + shoreZone * 0.65 + waveNoise * 0.45);
        diffuseColor.rgb = mix(seaCol, vec3(0.93, 0.97, 0.99), clamp(foamMask * 0.72, 0.0, 0.76));`
      );
  };

  const lighthouseRed = new THREE.MeshStandardMaterial({
    color: 0xd9382c,
    roughness: 0.4,
    metalness: 0.2,
  });

  const namhaeStoneWall = new THREE.MeshStandardMaterial({
    map: namhaeStoneTex,
    bumpMap: namhaeStoneTex,
    bumpScale: 0.07,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.02,
  });

  const namhaeCobbleRoad = new THREE.MeshStandardMaterial({
    map: namhaeCobbleTex,
    bumpMap: namhaeCobbleTex,
    bumpScale: 0.04,
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.03,
  });

  const namhaeLawn = new THREE.MeshStandardMaterial({
    map: namhaeLawnTex,
    bumpMap: namhaeLawnTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.0,
  });

  // Jeonju Hanok Village Materials
  const jeondongBrick = new THREE.MeshStandardMaterial({
    map: jeondongBrickTex,
    bumpMap: jeondongBrickTex,
    bumpScale: 0.05,
    color: 0xffffff,
    roughness: 0.78,
    metalness: 0.03,
  });

  const hanokWall = new THREE.MeshStandardMaterial({
    map: hanokWallTex,
    bumpMap: hanokWallTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.84,
    metalness: 0.01,
  });

  const jeonjuWater = new THREE.MeshPhysicalMaterial({
    color: 0x186670,
    normalMap: pondWaterNormalTex,
    normalScale: new THREE.Vector2(0.75, 0.75),
    roughness: 0.07,
    metalness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.75,
    transparent: true,
    opacity: 0.88,
  });
  jeonjuWater.customProgramCacheKey = () => 'jeonju_stream_water_v1';
  jeonjuWater.onBeforeCompile = (shader) => {
    shader.uniforms.uWaterTime = waterTimeUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec3 vStreamPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float riffle = sin(transformed.x * 0.16 - uWaterTime * 2.1) * 0.045 + cos(transformed.y * 0.35 + uWaterTime * 1.4) * 0.03;
        transformed.z += riffle;
        vStreamPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec3 vStreamPos;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float midStream = smoothstep(64.0, 71.0, vStreamPos.z) * smoothstep(84.0, 77.0, vStreamPos.z);
        vec3 shallows = vec3(0.14, 0.50, 0.54);
        vec3 channel = vec3(0.06, 0.31, 0.40);
        diffuseColor.rgb = mix(shallows, channel, midStream);
        float glint = sin(vStreamPos.x * 0.32 - uWaterTime * 2.4 + sin(vStreamPos.z * 0.5)) * 0.5 + 0.5;
        diffuseColor.rgb += vec3(0.03, 0.05, 0.05) * smoothstep(0.72, 1.0, glint);`
      );
  };

  const allMaterials: THREE.Material[] = [
    giwaRoof,
    dancheong,
    dancheongWood,
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
    treeBark,
    leafCanopy,
    blossomCanopy,
    coastalRock,
    ilworobongdo,
    gwanghwamunSign,
    geunjeongjeonSign,
    gyeonghoeruSign,
    rafterEnd,
    dragonCeiling,
    gableHapgak,
    ironBand,
    dumuBronze,
    modernGlass,
    kyoboFacade,
    modernGovernment,
    asphaltRoad,
    modernConcrete,
    modernMullion,
    lotteTowerGlass,
    lotteTowerFin,
    lotteMallFacade,
    magicCastleWall,
    castleTurretBlue,
    seokchonWater,
    cherryBlossomPink,
    woodDeck,
    namsanTowerPod,
    namsanSpireRed,
    hannamVilla,
    leeumTerracotta,
    bridgeSteel,
    hanRiverWater,
    germanRoofTile,
    germanHouseWall,
    namhaeSeaWater,
    lighthouseRed,
    namhaeStoneWall,
    namhaeCobbleRoad,
    namhaeLawn,
    jeondongBrick,
    hanokWall,
    jeonjuWater,
  ];

  const allTextures: THREE.Texture[] = [
    giwaTex,
    graniteTex,
    dancheongTex,
    woodTex,
    latticeTex,
    ilworoTex,
    gwanghwamunSignTex,
    geunjeongjeonSignTex,
    gyeonghoeruSignTex,
    rafterEndTex,
    dragonCeilingTex,
    gableHapgakTex,
    ironBandTex,
    modernGlassTex,
    kyoboTex,
    governmentTex,
    asphaltTex,
    lotteTowerTex,
    lotteMallTex,
    magicCastleTex,
    namsanPodTex,
    hannamVillaTex,
    germanRoofTex,
    germanWallTex,
    namhaeStoneTex,
    namhaeCobbleTex,
    namhaeLawnTex,
    pondWaterNormalTex,
    seaWaterNormalTex,
    barkTex,
    leafTex,
    blossomTex,
    coastalRockTex,
    jeondongBrickTex,
    hanokWallTex,
  ];

  return {
    giwaRoof,
    dancheong,
    dancheongWood,
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
    treeBark,
    leafCanopy,
    blossomCanopy,
    coastalRock,
    ilworobongdo,
    gwanghwamunSign,
    geunjeongjeonSign,
    gyeonghoeruSign,
    rafterEnd,
    dragonCeiling,
    gableHapgak,
    ironBand,
    dumuBronze,
    modernGlass,
    kyoboFacade,
    modernGovernment,
    asphaltRoad,
    modernConcrete,
    modernMullion,
    lotteTowerGlass,
    lotteTowerFin,
    lotteMallFacade,
    magicCastleWall,
    castleTurretBlue,
    seokchonWater,
    cherryBlossomPink,
    woodDeck,
    namsanTowerPod,
    namsanSpireRed,
    hannamVilla,
    leeumTerracotta,
    bridgeSteel,
    hanRiverWater,
    germanRoofTile,
    germanHouseWall,
    namhaeSeaWater,
    lighthouseRed,
    namhaeStoneWall,
    namhaeCobbleRoad,
    namhaeLawn,
    jeondongBrick,
    hanokWall,
    jeonjuWater,
    wireframeMode: false,
    updateWaterTime: (timeSec: number) => {
      waterTimeUniform.value = timeSec;
      pondWaterNormalTex.offset.set(timeSec * 0.015, timeSec * 0.01);
      seaWaterNormalTex.offset.set(timeSec * 0.022, -timeSec * 0.016);
    },
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
      allTextures.forEach((t) => t.dispose());
    },
  };
}
