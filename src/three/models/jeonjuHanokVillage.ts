import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createKoreanRoof,
  createColumnPlinth,
  createDapoFacadeRow,
  createGyejaBalustrade,
  createStoneBalustradeLine,
} from './architecturalCraft';
import {
  createRealisticBroadleafTrunkGeometry,
  createRealisticBroadleafCrownGeometry,
  createKoreanPineTrunkGeometry,
  createKoreanPineCrownGeometry,
  createHeroKoreanPine,
} from './realisticTrees';
import { calculateEavesHeight } from '../../utils/rules';

/**
 * Evaluates natural hill elevation for Omokdae (오목대) on the east side
 * and Kirinbong / Namsan foothill ridge on the far north/east perimeter.
 */
function getOmokdaeHeight(x: number, z: number): number {
  const dx = (x - 86) / 36;
  const dz = (z - 28) / 34;
  const r2 = dx * dx + dz * dz;
  if (r2 >= 1) return 0;
  // Flat summit plateau inside r < 0.25 at elevation 16.5m for Omokdae Pavilion
  const t = Math.max(0, 1 - r2);
  const plateau = Math.min(1, t / 0.72);
  return Math.pow(plateau, 1.35) * 16.5;
}

function getJeonjuFoothillHeight(x: number, z: number): number {
  let h = 0;
  if (z < -58) {
    const nwRidge = Math.max(0, 1 - ((x + 112) / 96) ** 2 - ((z + 106) / 56) ** 2) * 28;
    const northRidge = Math.max(0, 1 - ((x + 12) / 145) ** 2 - ((z + 110) / 54) ** 2) * 34;
    const nePeak = Math.max(0, 1 - ((x - 102) / 96) ** 2 - ((z + 96) / 56) ** 2) * 42;
    h = Math.max(nwRidge, northRidge, nePeak);
  }
  if (x > 96) {
    const eastRidge = Math.max(0, 1 - ((x - 146) / 58) ** 2 - ((z + 12) / 92) ** 2) * 36;
    h = Math.max(h, eastRidge);
  }
  if (x < -108) {
    const westRidge = Math.max(0, 1 - ((x + 158) / 58) ** 2 - ((z + 24) / 92) ** 2) * 24;
    h = Math.max(h, westRidge);
  }
  return h;
}

/**
 * Builds a lightweight authentic curved Korean giwa roof (팔작 / 맞배 곡선 지붕)
 * for neighborhood Hanok houses so 26+ houses form a sweeping sea of eaves curves.
 */
function buildHanokWingRoof(
  width: number,
  depth: number,
  height: number,
  materials: PalaceMaterials,
  isPaljak = true
): THREE.Group {
  const roofGroup = new THREE.Group();
  const segX = 8;
  const segZ = 6;
  const halfW = width * 0.5;
  const halfD = depth * 0.5;
  const ridgeRatio = isPaljak ? 0.56 : 0.94;
  const flare = 0.24;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= segZ; iz++) {
    const v = iz / segZ;
    const zPos = -halfD + v * depth;
    const zNorm = (v - 0.5) * 2;
    for (let ix = 0; ix <= segX; ix++) {
      const u = ix / segX;
      const xPos = -halfW + u * width;
      const xNorm = (u - 0.5) * 2;
      const yPos = calculateEavesHeight(xNorm, zNorm, flare, height, ridgeRatio);
      positions.push(xPos, yPos, zPos);
      uvs.push(u * 2.0, v * 1.4);
    }
  }

  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * (segX + 1) + ix;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roofGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roofMesh = new THREE.Mesh(roofGeo, materials.giwaRoof);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofGroup.add(roofMesh);

  // Underside warm timber soffit / rafter fascia band
  const underBox = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.5, 0.16, depth - 0.5),
    materials.royalWood
  );
  underBox.position.y = 0.12;
  roofGroup.add(underBox);

  // Yongmaru Main Ridge & Yangseong White Plaster Strip (용마루 · 양성마루) - raised cleanly above roof mesh
  const ridgeLen = width * ridgeRatio + 0.35;
  const ridgeBase = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeLen, 0.22, 0.26),
    materials.eavesWhite
  );
  ridgeBase.position.y = height + 0.18;
  const ridgeTop = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeLen + 0.16, 0.2, 0.32),
    materials.giwaRoof
  );
  ridgeTop.position.y = height + 0.34;
  roofGroup.add(ridgeBase, ridgeTop);

  // Hapgak gable triangles at both ends (clean extruded triangular gable fill)
  if (isPaljak) {
    const gHalf = depth * 0.22;
    const gH = height * 0.44;
    const hapgakShape = new THREE.Shape();
    hapgakShape.moveTo(-gHalf, 0);
    hapgakShape.lineTo(gHalf, 0);
    hapgakShape.lineTo(0, gH);
    hapgakShape.closePath();
    const hapgakGeo = new THREE.ExtrudeGeometry(hapgakShape, { depth: 0.14, bevelEnabled: false });
    hapgakGeo.rotateY(Math.PI * 0.5);

    [-1, 1].forEach((side) => {
      const hapgak = new THREE.Mesh(hapgakGeo, materials.gableHapgak);
      hapgak.position.set(side * (width * ridgeRatio * 0.5 + 0.06) - 0.07, height * 0.54, 0);
      roofGroup.add(hapgak);
    });
  }

  return roofGroup;
}

/**
 * Builds a single composite traditional Hanok wing (기단 + 화방벽 + 한지창호 + 툇마루 + 기와지붕)
 */
function buildHanokWing(
  w: number,
  h: number,
  d: number,
  materials: PalaceMaterials,
  hasMaru = true,
  isPaljak = true
): THREE.Group {
  const wing = new THREE.Group();

  // Stone foundation plinth (기단)
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.7, 0.52, d + 0.9),
    materials.granitePlinth
  );
  plinth.position.y = 0.26;
  plinth.receiveShadow = true;
  wing.add(plinth);

  // Main exterior wall (화방벽 + 회벽)
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials.hanokWall);
  wall.position.y = 0.52 + h * 0.5;
  wall.castShadow = true;
  wall.receiveShadow = true;
  wing.add(wall);

  // Wooden lattice doors & windows along front facade (한지 창호)
  const winWidth = Math.max(1.8, w * 0.58);
  const lattice = new THREE.Mesh(
    new THREE.BoxGeometry(winWidth, h * 0.72, 0.14),
    materials.latticeWindow
  );
  lattice.position.set(0, 0.52 + h * 0.46, d * 0.5 + 0.04);
  wing.add(lattice);

  // Timber corner & mid columns (목조 기둥)
  const colPositions = [-w * 0.48, -w * 0.18, w * 0.18, w * 0.48];
  colPositions.forEach((cx) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, h + 0.08, 0.18), materials.royalWood);
    col.position.set(cx, 0.52 + h * 0.5, d * 0.5 + 0.06);
    wing.add(col);
  });

  // Front wooden veranda (툇마루)
  if (hasMaru) {
    const maru = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.2, 0.22, 1.35),
      materials.woodDeck
    );
    maru.position.set(0, 0.54, d * 0.5 + 0.65);
    maru.receiveShadow = true;
    wing.add(maru);
  }

  // Curved overhanging Giwa roof
  const roof = buildHanokWingRoof(w + 1.9, d + 2.2, Math.max(1.65, d * 0.34), materials, isPaljak);
  roof.position.y = 0.52 + h - 0.12;
  wing.add(roof);

  return wing;
}

/**
 * Builds a complete Jeonju Hanok compound (본채 + ㄱ자/ㄷ자 사랑채 + 담장 + 장독대)
 */
function buildHanokCompound(
  x: number,
  z: number,
  rotY: number,
  style: 'L' | 'U' | 'I',
  scale: number,
  materials: PalaceMaterials,
  onggiMat: THREE.Material
): THREE.Group {
  const compound = new THREE.Group();
  compound.position.set(x, 0.08, z);
  compound.rotation.y = rotY;
  compound.scale.setScalar(scale);

  // Main Anchae Hall (안채)
  const anchae = buildHanokWing(10.8, 2.7, 5.2, materials, true, true);
  anchae.position.set(0, 0, -2.2);
  compound.add(anchae);

  // Courtyard soil/flagstone floor (마당)
  const yard = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.08, 10.6),
    materials.granite
  );
  yard.position.set(0, 0.04, 0.5);
  yard.receiveShadow = true;
  compound.add(yard);

  if (style === 'L' || style === 'U') {
    const sarangLeft = buildHanokWing(6.2, 2.4, 4.0, materials, true, false);
    sarangLeft.rotation.y = Math.PI * 0.5;
    sarangLeft.position.set(-4.3, 0, 2.2);
    compound.add(sarangLeft);
  }

  if (style === 'U') {
    const sarangRight = buildHanokWing(5.8, 2.3, 3.8, materials, true, false);
    sarangRight.rotation.y = -Math.PI * 0.5;
    sarangRight.position.set(4.3, 0, 2.0);
    compound.add(sarangRight);
  }

  // Tiled Courtyard Damjang Wall (기와 돌담장) + Gatehouse Post
  const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.55, 0.36), materials.hanokWall);
  frontWallLeft.position.set(-4.1, 0.78, 5.8);
  const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.55, 0.36), materials.hanokWall);
  frontWallRight.position.set(4.1, 0.78, 5.8);
  const frontCapLeft = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.24, 0.54), materials.giwaRoof);
  frontCapLeft.position.set(-4.1, 1.66, 5.8);
  const frontCapRight = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.24, 0.54), materials.giwaRoof);
  frontCapRight.position.set(4.1, 1.66, 5.8);

  // Small Soseuldaemun Gate (솟을대문)
  const gateRoof = buildHanokWingRoof(3.4, 2.2, 1.1, materials, false);
  gateRoof.position.set(0, 2.1, 5.8);
  const gatePostL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.1, 0.24), materials.royalWood);
  gatePostL.position.set(-1.3, 1.05, 5.8);
  const gatePostR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.1, 0.24), materials.royalWood);
  gatePostR.position.set(1.3, 1.05, 5.8);
  const gateDoors = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.85, 0.16), materials.royalWood);
  gateDoors.position.set(0, 0.95, 5.8);

  compound.add(
    frontWallLeft,
    frontWallRight,
    frontCapLeft,
    frontCapRight,
    gateRoof,
    gatePostL,
    gatePostR,
    gateDoors
  );

  // Courtyard Jangdokdae Terracotta Pottery Platform (장독대 옹기 항아리)
  const jangBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 1.4), materials.granitePlinth);
  jangBase.position.set(3.4, 0.12, 2.8);
  compound.add(jangBase);
  const jarCoords: [number, number, number][] = [
    [2.7, 2.6, 0.28],
    [3.35, 2.55, 0.34],
    [4.0, 2.65, 0.26],
    [3.0, 3.1, 0.22],
    [3.7, 3.1, 0.24],
  ];
  jarCoords.forEach(([jx, jz, jr]) => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(jr * 0.78, jr * 0.65, jr * 1.9, 8), onggiMat);
    jar.position.set(jx, 0.23 + jr * 0.9, jz);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(jr * 0.85, jr * 0.85, 0.08, 8), onggiMat);
    lid.position.set(jx, 0.23 + jr * 1.9, jz);
    compound.add(jar, lid);
  });

  return compound;
}

/**
 * Builds the photorealistic Jeonju Hanok Village (전북 전주 한옥마을):
 * - Clustered ㄱ/ㄷ/ㅁ Hanok sea of roofs along Taejo-ro & Eunhaeng-ro with courtyards & jangdokdae
 * - Gyeonggijeon Royal Shrine (경기전) with Hongsalmun, Samdaemun, Jeongjeon hall & bamboo grove
 * - Jeondong Romanesque Cathedral (전동성당) in fired red brick, twin bell turrets & central dome
 * - Omokdae Wooded Hill & Overlook Pavilion (오목대) with stepped granite ascent
 * - Jeonjucheon Stream & Namcheongyo Cheongyeonru Bridge Pavilion (남천교 청연루 & 전주천)
 */
export function buildJeonjuHanokVillage(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'jeonju_hanok_village_root';

  const soilTex = materials.coastalRock.map!.clone();
  soilTex.repeat.set(34, 20);
  soilTex.needsUpdate = true;

  const villageSoilMat = new THREE.MeshStandardMaterial({
    map: soilTex,
    bumpMap: soilTex,
    bumpScale: 0.025,
    color: 0xc2b298,
    roughness: 0.96,
    metalness: 0.0,
  });

  const ewCobbleTex = materials.namhaeCobbleRoad.map!.clone();
  ewCobbleTex.repeat.set(22, 1.4);
  ewCobbleTex.needsUpdate = true;
  const taejoCobbleMat = new THREE.MeshStandardMaterial({
    map: ewCobbleTex,
    bumpMap: ewCobbleTex,
    bumpScale: 0.035,
    color: 0xffffff,
    roughness: 0.86,
    metalness: 0.03,
  });

  const nsCobbleTex = materials.namhaeCobbleRoad.map!.clone();
  nsCobbleTex.repeat.set(1.2, 18);
  nsCobbleTex.needsUpdate = true;
  const alleyCobbleMat = new THREE.MeshStandardMaterial({
    map: nsCobbleTex,
    bumpMap: nsCobbleTex,
    bumpScale: 0.035,
    color: 0xffffff,
    roughness: 0.86,
    metalness: 0.03,
  });

  const walkCobbleTex = materials.namhaeCobbleRoad.map!.clone();
  walkCobbleTex.repeat.set(38, 1);
  walkCobbleTex.needsUpdate = true;
  const riverWalkMat = new THREE.MeshStandardMaterial({
    map: walkCobbleTex,
    bumpMap: walkCobbleTex,
    bumpScale: 0.03,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.02,
  });

  const hillLawnTex = materials.namhaeLawn.map!.clone();
  hillLawnTex.repeat.set(14, 14);
  hillLawnTex.needsUpdate = true;
  const jeonjuHillMat = new THREE.MeshStandardMaterial({
    map: hillLawnTex,
    bumpMap: hillLawnTex,
    bumpScale: 0.025,
    color: 0xb8cf9e,
    roughness: 0.93,
    metalness: 0.0,
  });

  const onggiGlazeMat = new THREE.MeshStandardMaterial({
    color: 0x3b2216,
    roughness: 0.24,
    metalness: 0.14,
  });

  const slateRoofMat = new THREE.MeshStandardMaterial({
    color: 0x2d353e,
    roughness: 0.54,
    metalness: 0.22,
  });

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x36322d,
    roughness: 0.35,
    metalness: 0.82,
  });

  const roseGlassMat = new THREE.MeshStandardMaterial({
    color: 0x32589c,
    emissive: 0xffaa44,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.3,
  });

  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0x457a3b,
    roughness: 0.55,
    metalness: 0.05,
  });

  // ========================================================
  // 1. Village Ground Apron & Pedestrian Streets (태조로 & 은행로)
  // ========================================================
  const villageGround = new THREE.Mesh(
    new THREE.BoxGeometry(310, 0.12, 168),
    villageSoilMat
  );
  villageGround.position.set(0, 0.04, -18);
  villageGround.receiveShadow = true;

  // Southern Riverside Park Ground (south of Jeonjucheon)
  const southBankGround = new THREE.Mesh(
    new THREE.BoxGeometry(310, 0.18, 42),
    jeonjuHillMat
  );
  southBankGround.position.set(0, 0.08, 106);
  southBankGround.receiveShadow = true;

  // Taejo-ro Pedestrian Boulevard (태조로, E-W at Z = 18)
  const taejoRo = new THREE.Mesh(
    new THREE.BoxGeometry(168, 0.12, 8.6),
    taejoCobbleMat
  );
  taejoRo.position.set(-14, 0.12, 18);
  taejoRo.receiveShadow = true;

  // Eunhaeng-ro Pedestrian Alley (은행로, N-S at X = 18)
  const eunhaengRo = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.12, 102),
    alleyCobbleMat
  );
  eunhaengRo.position.set(18, 0.12, 12);
  eunhaengRo.receiveShadow = true;

  // Ornamental stone streamlet running down center of Eunhaeng-ro (은행로 실개천)
  const alleyBrook = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.14, 86),
    materials.waterPond
  );
  alleyBrook.position.set(18, 0.14, 14);

  // West & East cross alleys
  const westAlley = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.12, 86),
    alleyCobbleMat
  );
  westAlley.position.set(-34, 0.12, 19);
  westAlley.receiveShadow = true;

  const southApproach = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.14, 42),
    alleyCobbleMat
  );
  southApproach.position.set(0, 0.14, 82);
  southApproach.receiveShadow = true;

  root.add(
    villageGround,
    southBankGround,
    taejoRo,
    eunhaengRo,
    alleyBrook,
    westAlley,
    southApproach
  );

  // Traditional street lanterns along Taejo-ro & Eunhaeng-ro
  const addHanokLantern = (lx: number, lz: number) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 3.0, 6), bronzeMat);
    post.position.set(lx, 1.5, lz);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.42), materials.lanternGlow);
    housing.position.set(lx, 3.15, lz);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.3, 4), materials.giwaRoof);
    cap.rotation.y = Math.PI * 0.25;
    cap.position.set(lx, 3.55, lz);
    root.add(post, housing, cap);
  };
  [-56, -34, -12, 8, 32, 48].forEach((lx) => addHanokLantern(lx, 13.4));
  [-8, 6, 30, 46].forEach((lz) => addHanokLantern(14.5, lz));

  // ========================================================
  // 2. Jeonjucheon Stream & Namcheongyo Bridge + Cheongyeonru Pavilion (전주천 & 남천교 청연루)
  // ========================================================
  const streamGroup = new THREE.Group();
  streamGroup.name = 'jeonjucheon_cheongyeonru';

  const streamBed = new THREE.Mesh(
    new THREE.BoxGeometry(310, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0x0b2226, roughness: 0.96 })
  );
  streamBed.position.set(0, 0.04, 74);

  // Rippling animated Jeonjucheon stream water cleanly elevated above streamBed
  const streamWater = new THREE.Mesh(
    new THREE.PlaneGeometry(310, 22, 54, 12),
    materials.jeonjuWater
  );
  streamWater.rotation.x = -Math.PI * 0.5;
  streamWater.position.set(0, 0.44, 74);
  streamWater.receiveShadow = true;

  // North & South stone embankment levees (전주천 석축 제방)
  [62.2, 85.8].forEach((bz) => {
    const levee = new THREE.Mesh(new THREE.BoxGeometry(310, 1.65, 2.2), materials.granitePlinth);
    levee.position.set(0, 0.82, bz);
    levee.receiveShadow = true;
    const walkway = new THREE.Mesh(new THREE.BoxGeometry(310, 0.18, 3.6), riverWalkMat);
    walkway.position.set(0, 1.62, bz + (bz < 74 ? -2.2 : 2.2));
    walkway.receiveShadow = true;
    streamGroup.add(levee, walkway);
  });

  // Stepping Stones across Jeonjucheon (전주천 징검다리)
  [-46, 48].forEach((sx) => {
    for (let s = 0; s < 10; s++) {
      const sz = 65 + s * 2.0;
      const stone = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.65, 0.95), materials.coastalRock);
      stone.position.set(sx + Math.sin(s * 0.9) * 0.35, 0.36, sz);
      stone.rotation.y = s * 0.25;
      streamGroup.add(stone);
    }
  });

  // Namcheongyo Multi-Arch Stone Bridge (남천교 무지개 석교)
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(0, 0, 74);

  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.85, 27.5), materials.granite);
  bridgeDeck.position.set(0, 2.95, 0);
  bridgeDeck.castShadow = true;
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);

  // 4 Stone bridge piers & arched spans
  [-9.5, -3.2, 3.2, 9.5].forEach((pz) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(11.6, 2.8, 1.65), materials.granitePlinth);
    pier.position.set(0, 1.4, pz);
    pier.castShadow = true;
    bridgeGroup.add(pier);
  });

  const leftBridgeRail = createStoneBalustradeLine(27, materials, 1.05);
  leftBridgeRail.rotation.y = Math.PI * 0.5;
  leftBridgeRail.position.set(-5.3, 3.38, 0);
  const rightBridgeRail = createStoneBalustradeLine(27, materials, 1.05);
  rightBridgeRail.rotation.y = Math.PI * 0.5;
  rightBridgeRail.position.set(5.3, 3.38, 0);
  bridgeGroup.add(leftBridgeRail, rightBridgeRail);

  // Cheongyeonru Pavilion crowning the center of Namcheongyo Bridge (청연루 누각)
  const pavGroup = new THREE.Group();
  pavGroup.position.set(0, 3.38, 0);

  const pavDeck = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.36, 8.2), materials.woodDeck);
  pavDeck.position.y = 0.72;
  pavDeck.castShadow = true;
  pavDeck.receiveShadow = true;
  pavGroup.add(pavDeck);

  // Pavilion Pillars on stone plinths
  const pavColXs = [-6.0, -2.0, 2.0, 6.0];
  const pavColZs = [-3.4, 3.4];
  pavColXs.forEach((px) => {
    pavColZs.forEach((pz) => {
      const plinth = createColumnPlinth(0.32, materials);
      plinth.position.set(px, 0.88, pz);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 3.6, 12), materials.pillarCrimson);
      col.position.set(px, 2.75, pz);
      col.castShadow = true;
      pavGroup.add(plinth, col);
    });
  });

  // Gyeja Balustrades around Pavilion
  const pRailFront = createGyejaBalustrade(12.2, materials, 0.9);
  pRailFront.position.set(0, 0.9, 3.7);
  const pRailBack = createGyejaBalustrade(12.2, materials, 0.9);
  pRailBack.position.set(0, 0.9, -3.7);
  pavGroup.add(pRailFront, pRailBack);

  // Dapo bracket frieze & Authentic Paljak Roof
  const pavDapoRow = createDapoFacadeRow(12.2, 6.8, pavColXs, materials);
  pavDapoRow.position.set(0, 4.35, 0);
  pavGroup.add(pavDapoRow);

  const pavRoof = createKoreanRoof(16.4, 10.6, 3.5, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.58,
    eavesFlare: 0.42,
    showJapsang: true,
    japsangCount: 5,
  });
  pavRoof.position.y = 5.14;
  pavGroup.add(pavRoof);

  // Warm Cheongsachorong lanterns under pavilion eaves
  [-4, 0, 4].forEach((lx) => {
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 8), materials.lanternGlow);
    lantern.position.set(lx, 3.9, 3.65);
    pavGroup.add(lantern);
  });

  bridgeGroup.add(pavGroup);
  streamGroup.add(streamBed, streamWater, bridgeGroup);
  root.add(streamGroup);

  // ========================================================
  // 3. Jeondong Romanesque Cathedral (전동성당) at West End of Taejo-ro
  // ========================================================
  const cathedral = new THREE.Group();
  cathedral.name = 'jeondong_cathedral';
  cathedral.position.set(-78, 0.08, 18);
  cathedral.rotation.y = Math.PI * 0.5; // Main Romanesque portal faces East (+X) down Taejo-ro

  // Granite stepped terrace plaza
  const cathPlinth = new THREE.Mesh(new THREE.BoxGeometry(20, 1.0, 29), materials.granitePlinth);
  cathPlinth.position.y = 0.5;
  cathPlinth.receiveShadow = true;
  const cathSteps = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.55, 2.8), materials.granite);
  cathSteps.position.set(0, 0.28, 15.6);
  cathedral.add(cathPlinth, cathSteps);

  // Red-brick Main Nave & Cross Transept
  const nave = new THREE.Mesh(new THREE.BoxGeometry(13.2, 10.2, 22), materials.jeondongBrick);
  nave.position.set(0, 6.1, 0);
  nave.castShadow = true;
  nave.receiveShadow = true;

  const transept = new THREE.Mesh(new THREE.BoxGeometry(18.6, 9.8, 7.6), materials.jeondongBrick);
  transept.position.set(0, 5.9, -2.5);
  transept.castShadow = true;
  transept.receiveShadow = true;

  // Semicircular Sanctuary Apse at rear (-Z)
  const apse = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 8.8, 14), materials.jeondongBrick);
  apse.position.set(0, 5.4, -11.2);
  const apseRoof = new THREE.Mesh(new THREE.ConeGeometry(5.1, 3.2, 14), slateRoofMat);
  apseRoof.position.set(0, 11.4, -11.2);

  // Pitched Nave Roof (extruded triangular gable prism)
  const naveRoofShape = new THREE.Shape();
  naveRoofShape.moveTo(-6.9, 0);
  naveRoofShape.lineTo(6.9, 0);
  naveRoofShape.lineTo(0, 4.2);
  naveRoofShape.closePath();
  const naveRoofGeo = new THREE.ExtrudeGeometry(naveRoofShape, { depth: 22.4, bevelEnabled: false });
  naveRoofGeo.translate(0, 11.2, -11.2);
  const naveRoof = new THREE.Mesh(naveRoofGeo, slateRoofMat);
  naveRoof.castShadow = true;

  // Transverse pitched transept roof
  const transRoofGeo = new THREE.ExtrudeGeometry(
    (() => {
      const s = new THREE.Shape();
      s.moveTo(-4.0, 0);
      s.lineTo(4.0, 0);
      s.lineTo(0, 3.4);
      s.closePath();
      return s;
    })(),
    { depth: 19.0, bevelEnabled: false }
  );
  transRoofGeo.rotateY(Math.PI * 0.5);
  transRoofGeo.translate(-9.5, 10.8, -2.5);
  const transRoof = new THREE.Mesh(transRoofGeo, slateRoofMat);
  transRoof.castShadow = true;

  // Iconic Granite & Brick Arched Front Portico + Rose Window
  const portico = new THREE.Mesh(new THREE.BoxGeometry(6.8, 5.6, 2.2), materials.granite);
  portico.position.set(0, 3.8, 11.8);
  const archDoor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.0, 0.4), materials.royalWood);
  archDoor.position.set(0, 3.0, 12.82);
  const roseRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.24, 10, 24), materials.granite);
  roseRing.position.set(0, 8.6, 11.15);
  const roseGlass = new THREE.Mesh(new THREE.CircleGeometry(1.92, 20), roseGlassMat);
  roseGlass.position.set(0, 8.6, 11.12);

  // Twin Flanking Belfry Towers + Central Octagonal Dome Cupola
  [-4.9, 4.9].forEach((tx) => {
    const towerBase = new THREE.Mesh(new THREE.BoxGeometry(3.4, 15.2, 3.4), materials.jeondongBrick);
    towerBase.position.set(tx, 8.6, 9.8);
    towerBase.castShadow = true;
    const lanternOct = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 3.2, 8), materials.granite);
    lanternOct.position.set(tx, 17.8, 9.8);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.72, 4.2, 8), slateRoofMat);
    spire.position.set(tx, 21.5, 9.8);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 0.14), bronzeMat);
    crossV.position.set(tx, 24.1, 9.8);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.14), bronzeMat);
    crossH.position.set(tx, 24.4, 9.8);
    cathedral.add(towerBase, lanternOct, spire, crossV, crossH);
  });

  // Grand Central Dome Cupola rising over the façade
  const centralDrum = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 6.2, 8), materials.jeondongBrick);
  centralDrum.position.set(0, 16.5, 6.5);
  centralDrum.castShadow = true;
  const centralCrown = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 2.4, 8), materials.granite);
  centralCrown.position.set(0, 20.6, 6.5);
  const centralDome = new THREE.Mesh(
    new THREE.SphereGeometry(2.55, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    slateRoofMat
  );
  centralDome.position.set(0, 21.6, 6.5);
  const centralSpire = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.8, 8), slateRoofMat);
  centralSpire.position.set(0, 24.8, 6.5);
  const mainCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.18), bronzeMat);
  mainCrossV.position.set(0, 26.8, 6.5);
  const mainCrossH = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.18), bronzeMat);
  mainCrossH.position.set(0, 27.1, 6.5);

  // Side Buttresses & Arched Clerestory Windows along Nave
  for (let i = -3; i <= 2; i++) {
    [-6.7, 6.7].forEach((sx) => {
      const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.7, 9.2, 0.9), materials.jeondongBrick);
      buttress.position.set(sx, 5.6, i * 3.3);
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.0, 1.25), roseGlassMat);
      win.position.set(sx + (sx > 0 ? 0.02 : -0.02), 7.2, i * 3.3 + 1.65);
      cathedral.add(buttress, win);
    });
  }

  cathedral.add(
    nave,
    transept,
    apse,
    apseRoof,
    naveRoof,
    transRoof,
    portico,
    archDoor,
    roseRing,
    roseGlass,
    centralDrum,
    centralCrown,
    centralDome,
    centralSpire,
    mainCrossV,
    mainCrossH
  );
  root.add(cathedral);

  // ========================================================
  // 4. Gyeonggijeon Royal Shrine Compound & Bamboo Grove (경기전 & 대나무숲)
  // ========================================================
  const gyeonggijeon = new THREE.Group();
  gyeonggijeon.name = 'gyeonggijeon_shrine';
  gyeonggijeon.position.set(-10, 0.08, -38);

  // Compound stone pavement
  const shrineYard = new THREE.Mesh(new THREE.BoxGeometry(46, 0.14, 42), materials.granite);
  shrineYard.position.set(0, 0.07, 0);
  shrineYard.receiveShadow = true;
  gyeonggijeon.add(shrineYard);

  // Compound Damjang Perimeter Walls with Giwa Cap
  const addShrineWall = (wx: number, wz: number, len: number, rotY = 0) => {
    const wMesh = new THREE.Mesh(new THREE.BoxGeometry(len, 2.2, 0.55), materials.hanokWall);
    wMesh.position.set(wx, 1.1, wz);
    wMesh.rotation.y = rotY;
    wMesh.castShadow = true;
    const cMesh = new THREE.Mesh(new THREE.BoxGeometry(len + 0.2, 0.34, 0.8), materials.giwaRoof);
    cMesh.position.set(wx, 2.32, wz);
    cMesh.rotation.y = rotY;
    gyeonggijeon.add(wMesh, cMesh);
  };
  addShrineWall(-14.5, 21, 17);
  addShrineWall(14.5, 21, 17);
  addShrineWall(0, -21, 46);
  addShrineWall(-23, 0, 42, Math.PI * 0.5);
  addShrineWall(23, 0, 42, Math.PI * 0.5);

  // Crimson Hongsalmun Sacred Gate at approach (홍살문)
  const hongsal = new THREE.Group();
  hongsal.position.set(0, 0.1, 29);
  [-2.8, 2.8].forEach((hx) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 6.4, 10), materials.pillarCrimson);
    post.position.set(hx, 3.2, 0);
    post.castShadow = true;
    hongsal.add(post);
  });
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 0.35), materials.pillarCrimson);
  topBeam.position.set(0, 5.8, 0);
  const midBeam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.26, 0.26), materials.pillarCrimson);
  midBeam.position.set(0, 4.9, 0);
  for (let s = -2.4; s <= 2.4; s += 0.45) {
    const spike = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 0.08), materials.pillarCrimson);
    spike.position.set(s, 5.65, 0);
    hongsal.add(spike);
  }
  const taegeuk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 16), materials.goldLeaf);
  taegeuk.rotation.x = Math.PI * 0.5;
  taegeuk.position.set(0, 5.35, 0.12);
  hongsal.add(topBeam, midBeam, taegeuk);
  gyeonggijeon.add(hongsal);

  // Oesammun / Naesammun 3-Bay Royal Shrine Gate (외삼문)
  const sammun = new THREE.Group();
  sammun.position.set(0, 0.12, 21);
  const sammunBase = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.45, 4.2), materials.granitePlinth);
  sammunBase.position.y = 0.22;
  [-5.2, -1.8, 1.8, 5.2].forEach((gx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 3.4, 10), materials.pillarCrimson);
    col.position.set(gx, 2.1, 0);
    col.castShadow = true;
    sammun.add(col);
  });
  [-3.5, 0, 3.5].forEach((dx) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.18), materials.pillarCrimson);
    door.position.set(dx, 1.85, 0);
    sammun.add(door);
  });
  const sammunRoof = createKoreanRoof(14.8, 6.2, 2.5, materials, {
    isPaljak: false,
    ridgeLengthRatio: 0.72,
    eavesFlare: 0.34,
    showJapsang: false,
  });
  sammunRoof.position.y = 3.8;
  sammun.add(sammunBase, sammunRoof);
  gyeonggijeon.add(sammun);

  // Royal Stone Walkway leading to Jeongjeon Hall (어도)
  const eodo = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 22), materials.granitePlinth);
  eodo.position.set(0, 0.16, 6);
  gyeonggijeon.add(eodo);

  // Jeongjeon Main Portrait Hall (태조 어진 정전)
  const jeongjeon = new THREE.Group();
  jeongjeon.position.set(0, 0.12, -5.5);

  const woldaeLower = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.9, 15.2), materials.granitePlinth);
  woldaeLower.position.y = 0.45;
  woldaeLower.receiveShadow = true;
  const woldaeUpper = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.65, 12.6), materials.granite);
  woldaeUpper.position.y = 1.2;
  woldaeUpper.receiveShadow = true;
  const shrineStairs = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 2.6), materials.granite);
  shrineStairs.position.set(0, 0.55, 7.8);
  jeongjeon.add(woldaeLower, woldaeUpper, shrineStairs);

  const hallWalls = new THREE.Mesh(new THREE.BoxGeometry(14.2, 4.4, 9.4), materials.hanokWall);
  hallWalls.position.y = 3.7;
  hallWalls.castShadow = true;
  hallWalls.receiveShadow = true;
  const hallDoors = new THREE.Mesh(new THREE.BoxGeometry(11.6, 3.2, 9.52), materials.latticeWindow);
  hallDoors.position.y = 3.3;
  jeongjeon.add(hallWalls, hallDoors);

  const hallColXs = [-6.8, -3.4, 0, 3.4, 6.8];
  hallColXs.forEach((cx) => {
    [-4.6, 4.6].forEach((cz) => {
      const plinth = createColumnPlinth(0.3, materials);
      plinth.position.set(cx, 1.52, cz);
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 4.4, 12), materials.pillarCrimson);
      pillar.position.set(cx, 3.85, cz);
      pillar.castShadow = true;
      jeongjeon.add(plinth, pillar);
    });
  });

  const hallDapoRow = createDapoFacadeRow(13.8, 9.2, hallColXs, materials);
  hallDapoRow.position.set(0, 5.95, 0);
  jeongjeon.add(hallDapoRow);

  const hallRoof = createKoreanRoof(18.6, 13.6, 4.0, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.6,
    eavesFlare: 0.46,
    showJapsang: true,
    japsangCount: 5,
  });
  hallRoof.position.y = 6.95;
  jeongjeon.add(hallRoof);
  gyeonggijeon.add(jeongjeon);

  // Side Royal Archive Annexes inside Gyeonggijeon (전주사고 & 부속채)
  const eastAnnex = buildHanokWing(9.4, 2.8, 4.6, materials, true, true);
  eastAnnex.rotation.y = -Math.PI * 0.5;
  eastAnnex.position.set(16.2, 0.1, -1.5);
  const westAnnex = buildHanokWing(9.4, 2.8, 4.6, materials, true, true);
  westAnnex.rotation.y = Math.PI * 0.5;
  westAnnex.position.set(-16.2, 0.1, -1.5);
  gyeonggijeon.add(eastAnnex, westAnnex);

  // Famous Gyeonggijeon Bamboo Grove (경기전 대나무숲) flanking behind & east of shrine
  const broadCrownGeo = createRealisticBroadleafCrownGeometry();
  const bambooCulmGeo = new THREE.CylinderGeometry(0.07, 0.11, 7.6, 6);
  const bambooSpots: [number, number, number][] = [];
  for (let i = 0; i < 68; i++) {
    const bx = -24 + ((i * 7.3) % 48);
    const bz = -15.2 - (i % 5) * 1.1;
    const bs = 0.78 + (i % 4) * 0.14;
    bambooSpots.push([bx, bz, bs]);
  }
  const bCulms = new THREE.InstancedMesh(bambooCulmGeo, bambooMat, bambooSpots.length);
  const bLeaves = new THREE.InstancedMesh(broadCrownGeo, materials.leafCanopy, bambooSpots.length);
  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();
  bambooSpots.forEach(([bx, bz, bs], idx) => {
    dummy.position.set(bx, 3.8 * bs, bz);
    dummy.scale.set(1, bs, 1);
    dummy.rotation.set((idx % 3) * 0.04 - 0.04, idx * 0.9, ((idx + 1) % 3) * 0.04 - 0.04);
    dummy.updateMatrix();
    bCulms.setMatrixAt(idx, dummy.matrix);

    // Feathered airy bamboo leaf spray at top of slender culm
    dummy.position.set(bx, 4.4 * bs, bz);
    dummy.scale.set(0.62 * bs, 0.85 * bs, 0.62 * bs);
    dummy.rotation.set(0, idx * 1.7, 0);
    dummy.updateMatrix();
    bLeaves.setMatrixAt(idx, dummy.matrix);
    cColor.setHex(idx % 3 === 0 ? 0x3b7b38 : idx % 3 === 1 ? 0x4e8d45 : 0x2f6830);
    bLeaves.setColorAt(idx, cColor);
  });
  bCulms.instanceMatrix.needsUpdate = true;
  bLeaves.instanceMatrix.needsUpdate = true;
  if (bLeaves.instanceColor) bLeaves.instanceColor.needsUpdate = true;
  bCulms.computeBoundingSphere();
  bLeaves.computeBoundingSphere();
  gyeonggijeon.add(bCulms, bLeaves);

  // Hero Korean Red Pine inside Gyeonggijeon courtyard
  const shrinePine = createHeroKoreanPine(materials.treeBark, materials.pineNeedles, 1.4, 2.5);
  shrinePine.position.set(13.5, 0.1, 11.5);
  gyeonggijeon.add(shrinePine);

  root.add(gyeonggijeon);

  // ========================================================
  // 5. Dense Clustered Jeonju Hanok Grid (~26 Composite Hanok Compounds)
  // ========================================================
  const hanokPlacements: [number, number, number, 'L' | 'U' | 'I', number][] = [
    // North of Taejo-ro (West & East of Eunhaeng-ro)
    [-50, 4, Math.PI, 'L', 0.95],
    [-22, 4, Math.PI, 'U', 0.92],
    [4, 4, Math.PI, 'L', 0.96],
    [32, 4, Math.PI, 'U', 0.95],
    [48, 3, -Math.PI * 0.5, 'L', 0.9],

    // Mid-North & West Gyeonggijeon flank
    [-52, -16, Math.PI * 0.5, 'U', 0.96],
    [-50, -34, Math.PI * 0.5, 'L', 0.94],
    [32, -14, -Math.PI * 0.5, 'U', 0.96],
    [32, -32, 0, 'L', 0.94],
    [52, -16, -Math.PI * 0.5, 'I', 0.92],
    [52, -34, 0, 'L', 0.92],

    // South of Taejo-ro toward Jeonjucheon (Forming famous sea of tiled roofs)
    [-52, 32, 0, 'U', 0.95],
    [-22, 32, 0, 'L', 0.94],
    [4, 32, 0, 'U', 0.96],
    [32, 32, 0, 'L', 0.95],
    [-52, 49, Math.PI, 'L', 0.92],
    [-22, 49, Math.PI, 'U', 0.94],
    [4, 49, Math.PI, 'L', 0.92],
    [32, 49, Math.PI, 'U', 0.94],
    [50, 49, Math.PI, 'I', 0.88],

    // Far West / Cathedral Quarter Hanoks
    [-98, -6, 0, 'L', 0.92],
    [-98, 42, Math.PI, 'U', 0.94],
    [-74, 46, 0, 'L', 0.92],
    [-74, -14, Math.PI, 'L', 0.9],
  ];

  hanokPlacements.forEach(([hx, hz, rotY, style, sc]) => {
    root.add(buildHanokCompound(hx, hz, rotY, style, sc, materials, onggiGlazeMat));
  });

  // ========================================================
  // 6. Omokdae Wooded Hill, Stone Stairs & Overlook Pavilion (오목대 정자 & 산책로)
  // ========================================================
  const omokdaeGroup = new THREE.Group();
  omokdaeGroup.name = 'omokdae_hill_pavilion';

  // Sculpted green Omokdae hilltop terrain merging smoothly into ground plane
  const hillGeo = new THREE.PlaneGeometry(82, 78, 34, 32);
  hillGeo.rotateX(-Math.PI * 0.5);
  hillGeo.translate(86, 0, 28);
  const hillPos = hillGeo.attributes.position;
  for (let i = 0; i < hillPos.count; i++) {
    const vx = hillPos.getX(i);
    const vz = hillPos.getZ(i);
    const h = getOmokdaeHeight(vx, vz);
    const detail = h > 1.2 && h < 15.2 ? Math.sin(vx * 0.23) * Math.cos(vz * 0.25) * 0.45 : 0;
    hillPos.setY(i, Math.max(0.03, h + detail));
  }
  hillGeo.computeVertexNormals();
  const omokdaeHill = new THREE.Mesh(hillGeo, jeonjuHillMat);
  omokdaeHill.receiveShadow = true;
  omokdaeGroup.add(omokdaeHill);

  // Granite Stairs climbing Omokdae western slope from Taejo-ro (오목대 돌계단)
  const stairSteps = 22;
  for (let s = 0; s < stairSteps; s++) {
    const t = s / (stairSteps - 1);
    const sx = THREE.MathUtils.lerp(56, 77, t);
    const sz = THREE.MathUtils.lerp(18, 26, t);
    const sy = Math.max(0.25, getOmokdaeHeight(sx, sz));
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 3.8), materials.granitePlinth);
    step.position.set(sx, sy - 0.15, sz);
    step.rotation.y = -0.35;
    step.receiveShadow = true;
    omokdaeGroup.add(step);
  }

  // Natural granite crag outcrops around Omokdae hillside
  const rockSpots: [number, number, number][] = [
    [66, 12, 1.4],
    [72, 42, 1.6],
    [104, 18, 1.7],
    [98, 44, 1.5],
  ];
  rockSpots.forEach(([rx, rz, rs], idx) => {
    const ry = getOmokdaeHeight(rx, rz);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1 * rs, 1), materials.coastalRock);
    rock.position.set(rx, ry + 0.35, rz);
    rock.scale.set(1.35, 0.75, 1.1);
    rock.rotation.y = idx * 1.3;
    rock.castShadow = true;
    omokdaeGroup.add(rock);
  });

  // Omokdae Summit Platform & Grand Overlook Pavilion (오목대 정자)
  const summitY = 16.5;
  const pavilion = new THREE.Group();
  pavilion.position.set(86, summitY, 28);
  pavilion.rotation.y = -Math.PI * 0.42; // Faces WSW across the sea of Hanok roofs!

  const pavTerrace = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.9, 12.2), materials.granitePlinth);
  pavTerrace.position.y = 0.45;
  pavTerrace.receiveShadow = true;
  pavTerrace.castShadow = true;
  const pavWoodFloor = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.32, 9.2), materials.woodDeck);
  pavWoodFloor.position.y = 1.05;
  pavWoodFloor.receiveShadow = true;
  pavilion.add(pavTerrace, pavWoodFloor);

  const omokColXs = [-5.2, -1.75, 1.75, 5.2];
  omokColXs.forEach((px) => {
    [-3.8, 3.8].forEach((pz) => {
      const plinth = createColumnPlinth(0.3, materials);
      plinth.position.set(px, 1.2, pz);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 3.5, 12), materials.pillarCrimson);
      col.position.set(px, 3.05, pz);
      col.castShadow = true;
      pavilion.add(plinth, col);
    });
  });

  const oRailFront = createGyejaBalustrade(10.8, materials, 0.85);
  oRailFront.position.set(0, 1.2, 4.1);
  const oRailBack = createGyejaBalustrade(10.8, materials, 0.85);
  oRailBack.position.set(0, 1.2, -4.1);
  pavilion.add(oRailFront, oRailBack);

  const oDapoRow = createDapoFacadeRow(10.6, 7.6, omokColXs, materials);
  oDapoRow.position.set(0, 4.82, 0);
  pavilion.add(oDapoRow);

  const omokdaeRoof = createKoreanRoof(15.6, 11.4, 3.5, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.56,
    eavesFlare: 0.44,
    showJapsang: true,
    japsangCount: 5,
  });
  omokdaeRoof.position.y = 5.78;
  pavilion.add(omokdaeRoof);

  const omokdaePine = createHeroKoreanPine(materials.treeBark, materials.pineNeedles, 1.35, 1.2);
  omokdaePine.position.set(7.8, 0, -5.2);
  pavilion.add(omokdaePine);

  omokdaeGroup.add(pavilion);
  root.add(omokdaeGroup);

  // ========================================================
  // 7. Distant Jeonju Foothills (기린봉 · 남고산 · 완산칠봉 분지 산자락 배경)
  // ========================================================
  const bgHillGeo = new THREE.PlaneGeometry(380, 250, 48, 30);
  bgHillGeo.rotateX(-Math.PI * 0.5);
  bgHillGeo.translate(0, 0, -45);
  const bgPos = bgHillGeo.attributes.position;
  for (let i = 0; i < bgPos.count; i++) {
    const vx = bgPos.getX(i);
    const vz = bgPos.getZ(i);
    const bh = getJeonjuFoothillHeight(vx, vz);
    const wave = bh > 2 ? Math.sin(vx * 0.08) * Math.cos(vz * 0.11) * 2.2 : 0;
    bgPos.setY(i, Math.max(-0.2, bh + wave));
  }
  bgHillGeo.computeVertexNormals();
  const bgFoothills = new THREE.Mesh(bgHillGeo, jeonjuHillMat);
  bgFoothills.receiveShadow = true;
  root.add(bgFoothills);

  // ========================================================
  // 8. Realistic Jeonju Flora: Golden Ginkgo Trees, Maple Reds & Pine Forest
  // ========================================================
  const broadSpecs: { x: number; y: number; z: number; s: number; color: number }[] = [];
  const pineSpecs: { x: number; y: number; z: number; s: number; color: number }[] = [];

  // Golden Ginkgo Avenue along Eunhaeng-ro (은행로 은행나무 가로수)
  [-28, -14, 0, 12, 26, 40, 54].forEach((gz, idx) => {
    broadSpecs.push({ x: 14.2, y: 0.12, z: gz, s: 1.05 + (idx % 3) * 0.08, color: 0xe3b234 });
    broadSpecs.push({ x: 21.8, y: 0.12, z: gz + 4, s: 1.0 + ((idx + 1) % 3) * 0.08, color: 0xd59b28 });
  });

  // Jeondong Cathedral Yard Ginkgo & Broadleaf Trees
  [
    [-64, 4],
    [-64, 32],
    [-92, 6],
    [-92, 30],
  ].forEach(([tx, tz], idx) => {
    broadSpecs.push({ x: tx, y: 0.12, z: tz, s: 1.18, color: idx % 2 === 0 ? 0xe0aa30 : 0x4b8244 });
  });

  // Jeonjucheon Riverside Promenade Trees (전주천 버드나무 · 단풍나무 · 왕벚)
  for (let i = 0; i < 16; i++) {
    const rx = -112 + i * 15;
    if (Math.abs(rx) < 11) continue;
    broadSpecs.push({
      x: rx,
      y: 1.5,
      z: 59.5,
      s: 1.05 + (i % 3) * 0.1,
      color: i % 4 === 0 ? 0xc84a32 : i % 3 === 0 ? 0xdca532 : 0x4a8243,
    });
    broadSpecs.push({
      x: rx + 5,
      y: 1.5,
      z: 88.5,
      s: 1.0 + (i % 4) * 0.08,
      color: i % 3 === 0 ? 0x528b48 : 0x3f733b,
    });
  }

  // Omokdae Hill Forest (Dense Korean Pines + Autumn Crimson Maples + Oaks)
  for (let i = 0; i < 58; i++) {
    const ang = i * 2.39996;
    const rad = 11 + ((i * 19) % 24);
    const tx = 86 + Math.cos(ang) * rad;
    const tz = 28 + Math.sin(ang) * rad;
    // Keep stair corridor open
    if (tx < 80 && Math.abs(tz - (18 + (tx - 56) * 0.38)) < 4.5) continue;
    const ty = getOmokdaeHeight(tx, tz);
    if (ty < 0.8) continue;
    const s = 0.88 + (i % 4) * 0.12;
    if (i % 2 === 0) {
      pineSpecs.push({
        x: tx,
        y: ty - 0.1,
        z: tz,
        s: s * 1.1,
        color: i % 4 === 0 ? 0x2f5c34 : 0x3c6f3d,
      });
    } else {
      broadSpecs.push({
        x: tx,
        y: ty - 0.1,
        z: tz,
        s,
        color: i % 6 === 1 ? 0xbe3e2c : i % 6 === 3 ? 0xdf9e2c : 0x487c41,
      });
    }
  }

  // Backdrop Basin Foothill Forest (North, Northwest & Northeast hills)
  for (let i = 0; i < 88; i++) {
    const ang = i * 2.39996;
    const tx = Math.cos(ang) * (20 + ((i * 23) % 132));
    const tz = -96 + Math.sin(ang) * (8 + ((i * 17) % 36));
    const ty = getJeonjuFoothillHeight(tx, tz);
    if (ty < 3.0) continue;
    pineSpecs.push({
      x: tx,
      y: ty - 0.15,
      z: tz,
      s: 1.1 + (i % 4) * 0.12,
      color: i % 3 === 0 ? 0x315e35 : 0x3d703f,
    });
  }

  const broadTrunkGeo = createRealisticBroadleafTrunkGeometry();
  const pineTrunkGeo = createKoreanPineTrunkGeometry();
  const pineCrownGeo = createKoreanPineCrownGeometry();

  const bTrunks = new THREE.InstancedMesh(broadTrunkGeo, materials.treeBark, broadSpecs.length);
  const bCrowns = new THREE.InstancedMesh(broadCrownGeo, materials.leafCanopy, broadSpecs.length);
  bCrowns.castShadow = true;
  bCrowns.receiveShadow = true;

  broadSpecs.forEach((t, idx) => {
    dummy.position.set(t.x, t.y, t.z);
    dummy.scale.setScalar(t.s);
    dummy.rotation.set(0, idx * 1.4, 0);
    dummy.updateMatrix();
    bTrunks.setMatrixAt(idx, dummy.matrix);
    bCrowns.setMatrixAt(idx, dummy.matrix);
    cColor.setHex(t.color);
    bCrowns.setColorAt(idx, cColor);
  });

  const pTrunks = new THREE.InstancedMesh(pineTrunkGeo, materials.treeBark, pineSpecs.length);
  const pCrowns = new THREE.InstancedMesh(pineCrownGeo, materials.leafCanopy, pineSpecs.length);
  pCrowns.castShadow = true;
  pCrowns.receiveShadow = true;

  pineSpecs.forEach((t, idx) => {
    dummy.position.set(t.x, t.y, t.z);
    dummy.scale.setScalar(t.s);
    dummy.rotation.set(0, idx * 1.9, 0);
    dummy.updateMatrix();
    pTrunks.setMatrixAt(idx, dummy.matrix);
    pCrowns.setMatrixAt(idx, dummy.matrix);
    cColor.setHex(t.color);
    pCrowns.setColorAt(idx, cColor);
  });

  [bTrunks, bCrowns, pTrunks, pCrowns].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  });
  if (bCrowns.instanceColor) bCrowns.instanceColor.needsUpdate = true;
  if (pCrowns.instanceColor) pCrowns.instanceColor.needsUpdate = true;

  root.add(bTrunks, bCrowns, pTrunks, pCrowns);

  return root;
}
