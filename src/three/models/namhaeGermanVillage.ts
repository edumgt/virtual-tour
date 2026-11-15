import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createRealisticBroadleafTrunkGeometry,
  createRealisticBroadleafCrownGeometry,
  createKoreanPineTrunkGeometry,
  createKoreanPineCrownGeometry,
  createCoastalTetrapodGeometry,
} from './realisticTrees';

/**
 * Evaluates approximate elevation on the Namhae Mulgeon coastal mountain slope
 * behind the village terraces so backdrop pines sit flush on the ridge.
 */
function getNamhaeHillHeight(x: number, z: number): number {
  if (z > -42) return 0;
  const dx = x / 138;
  const dz = (z + 98) / 62;
  const mainPeak = Math.max(0, 1 - dx * dx - dz * dz) * 44;

  const westShoulder = Math.max(0, 1 - ((x + 92) / 76) ** 2 - ((z + 98) / 56) ** 2) * 32;
  const eastShoulder = Math.max(0, 1 - ((x - 94) / 78) ** 2 - ((z + 96) / 56) ** 2) * 30;
  return Math.max(mainPeak, westShoulder, eastShoulder);
}

/**
 * Builds a smooth stone-retained sloped road from a list of 3D waypoints so
 * every incline sits on a solid masonry ramp causeway with zero clipping or gaps.
 */
function addStoneRetainedRoad(
  parent: THREE.Group,
  waypoints: THREE.Vector3[],
  samples: number,
  width: number,
  roadMat: THREE.Material,
  wallMat: THREE.Material,
  curbMat: THREE.Material,
  withEmbankment: boolean
) {
  const curve = new THREE.CatmullRomCurve3(waypoints);
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < samples; i++) {
    const p1 = curve.getPoint(i / samples);
    const p2 = curve.getPoint((i + 1) / samples);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const segLen = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.22, segLen + 0.45),
      roadMat
    );
    seg.position.copy(mid);
    seg.lookAt(p2);
    seg.receiveShadow = true;
    parent.add(seg);

    if (withEmbankment && mid.y > 0.4) {
      const support = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.5, mid.y, segLen + 0.4),
        wallMat
      );
      support.position.set(mid.x, mid.y * 0.5 - 0.08, mid.z);
      const flatTarget = new THREE.Vector3(p2.x, support.position.y, p2.z);
      support.lookAt(flatTarget);
      support.receiveShadow = true;
      support.castShadow = true;
      parent.add(support);

      const forward = dir.clone().setY(0).normalize();
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();
      const curb = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.48, segLen + 0.45),
        curbMat
      );
      curb.position.copy(mid).addScaledVector(right, (width + 0.1) * 0.5);
      curb.position.y += 0.24;
      curb.lookAt(new THREE.Vector3(p2.x, curb.position.y, p2.z).addScaledVector(right, (width + 0.1) * 0.5));
      parent.add(curb);
    }
  }
}

/**
 * Builds the photorealistic Namhae German Village (경남 남해 독일마을),
 * featuring terraced Bavarian homes with recessed 3D frames & bargeboards,
 * undulating South Sea waves with surf foam, tetrapod-armored breakwater & lighthouse,
 * and multi-layered organic windbreak & hillside forests.
 */
export function buildNamhaeGermanVillage(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'namhae_german_village_root';

  const pebbleBeachMat = new THREE.MeshStandardMaterial({
    map: materials.coastalRock.map,
    bumpMap: materials.coastalRock.bumpMap,
    bumpScale: 0.05,
    color: 0xd8ccb0,
    roughness: 0.94,
    metalness: 0.0,
  });

  const chimneyBrickMat = new THREE.MeshStandardMaterial({
    color: 0x7a382b,
    roughness: 0.86,
  });

  const whiteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf4f0e8,
    roughness: 0.68,
  });

  const darkTimberMat = new THREE.MeshStandardMaterial({
    map: materials.royalWood.map,
    color: 0x452b1a,
    roughness: 0.8,
  });

  const terracottaAccentMat = new THREE.MeshStandardMaterial({
    map: materials.germanRoofTile.map,
    bumpMap: materials.germanRoofTile.bumpMap,
    bumpScale: 0.07,
    color: 0xf08c62,
    roughness: 0.62,
  });

  const bronzeMetalMat = new THREE.MeshStandardMaterial({
    color: 0x262626,
    roughness: 0.36,
    metalness: 0.82,
  });

  const windowGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x24425c,
    roughness: 0.08,
    metalness: 0.35,
    clearcoat: 1.0,
    envMapIntensity: 1.5,
  });

  // ========================================================
  // 1. Subdivided Undulating Emerald South Sea, Shoreline & Dadohae Islands
  // ========================================================
  const seaBed = new THREE.Mesh(
    new THREE.BoxGeometry(420, 0.1, 185),
    new THREE.MeshStandardMaterial({ color: 0x052530, roughness: 0.96 })
  );
  seaBed.position.set(0, 0.04, 118);
  root.add(seaBed);

  // High-segment water plane raised cleanly above seaBed so wave troughs never clip through
  const seaWater = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 185, 72, 36),
    materials.namhaeSeaWater
  );
  seaWater.rotation.x = -Math.PI * 0.5;
  seaWater.position.set(0, 0.56, 118);
  seaWater.receiveShadow = true;
  root.add(seaWater);

  // Coastal apron & pebble cove shore (Z = 8..35)
  const coastalGround = new THREE.Mesh(new THREE.BoxGeometry(420, 0.55, 42), materials.namhaeLawn);
  coastalGround.position.set(0, 0.34, 12);
  coastalGround.receiveShadow = true;

  const shoreBeach = new THREE.Mesh(new THREE.BoxGeometry(420, 0.42, 13), pebbleBeachMat);
  shoreBeach.position.set(0, 0.42, 31.2);
  shoreBeach.receiveShadow = true;

  // Coastal highway Namhae-daero running along shore behind windbreak forest (Z = 18.5)
  const coastalRoad = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.16, 400), materials.asphaltRoad);
  coastalRoad.rotation.y = Math.PI * 0.5;
  coastalRoad.position.set(0, 0.62, 18.5);
  coastalRoad.receiveShadow = true;

  root.add(coastalGround, shoreBeach, coastalRoad);

  // Sculpted Realistic Dadohae Archipelago Islands on the sea horizon with rocky bases & pine caps
  const islandSpecs: [number, number, number, number][] = [
    [-128, 154, 34, 17],
    [122, 160, 38, 20],
    [-20, 180, 28, 13],
  ];
  islandSpecs.forEach(([ix, iz, rad, h]) => {
    const island = new THREE.Group();
    island.position.set(ix, 0.2, iz);
    const cliff = new THREE.Mesh(new THREE.ConeGeometry(rad, h * 0.45, 11), materials.coastalRock);
    cliff.position.y = h * 0.2;
    cliff.scale.set(1.32, 1, 0.88);
    const peak = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.86, h * 0.85, 10), materials.mountainStone);
    peak.position.y = h * 0.48;
    peak.scale.set(1.28, 1, 0.84);
    const forestCap = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.72, h * 0.55, 10), materials.pineNeedles);
    forestCap.position.y = h * 0.65;
    forestCap.scale.set(1.2, 1, 0.8);
    island.add(cliff, peak, forestCap);
    root.add(island);
  });

  // ========================================================
  // 2. Mulgeon Breakwater Pier, Tetrapod Armor, Lighthouse & Detailed Vessels
  // ========================================================
  const harborGroup = new THREE.Group();
  harborGroup.name = 'mulgeon_harbor';

  const pierStart = new THREE.Vector3(-74, 0.82, 32);
  const pierEnd = new THREE.Vector3(-48, 0.82, 70);
  const pierDir = new THREE.Vector3().subVectors(pierEnd, pierStart);
  const pierLen = pierDir.length();
  const pierMid = new THREE.Vector3().addVectors(pierStart, pierEnd).multiplyScalar(0.5);

  const pierMesh = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 1.65, pierLen),
    materials.namhaeStoneWall
  );
  pierMesh.position.copy(pierMid);
  pierMesh.lookAt(pierEnd);
  pierMesh.receiveShadow = true;
  pierMesh.castShadow = true;
  harborGroup.add(pierMesh);

  // Pier Cap & Seaward Wave Parapet Wall along breakwater
  const pierParapet = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.85, pierLen),
    materials.modernConcrete
  );
  pierParapet.position.copy(pierMid).add(new THREE.Vector3(-2.6, 1.05, 1.6));
  pierParapet.lookAt(pierEnd.clone().add(new THREE.Vector3(-2.6, 1.05, 1.6)));
  harborGroup.add(pierParapet);

  // Instanced Concrete Tetrapods (테트라포드) & Armor Boulders lining the breakwater sea wall
  const tetrapodGeo = createCoastalTetrapodGeometry();
  const tetraCoords: [number, number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const tx = THREE.MathUtils.lerp(-74, -48, t) - 4.2;
    const tz = THREE.MathUtils.lerp(32, 70, t) + 1.8;
    tetraCoords.push([tx, 0.72, tz]);
    tetraCoords.push([tx - 1.5, 0.52, tz - 0.8]);
  }
  // Ring around pier head
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 1.4 + 0.6;
    tetraCoords.push([-48 + Math.cos(ang) * 6.8, 0.65, 70 + Math.sin(ang) * 6.8]);
  }
  const tetraInst = new THREE.InstancedMesh(tetrapodGeo, materials.coastalRock, tetraCoords.length);
  const dummy = new THREE.Object3D();
  tetraCoords.forEach(([x, y, z], idx) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4);
    dummy.scale.setScalar(1.0 + (idx % 3) * 0.14);
    dummy.updateMatrix();
    tetraInst.setMatrixAt(idx, dummy.matrix);
  });
  tetraInst.instanceMatrix.needsUpdate = true;
  tetraInst.computeBoundingSphere();
  harborGroup.add(tetraInst);

  // Breakwater Pier Head & Detailed Red Coastal Lighthouse (물건항 등대)
  const pierHead = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.4, 1.8, 14), materials.namhaeStoneWall);
  pierHead.position.set(-48, 0.9, 70);
  pierHead.receiveShadow = true;
  harborGroup.add(pierHead);

  const lighthouseGroup = new THREE.Group();
  lighthouseGroup.position.set(-48, 1.8, 70);

  const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 3.05, 1.6, 12), materials.granitePlinth);
  lhBase.position.y = 0.8;
  const lhShaft = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.28, 11.8, 16), materials.lighthouseRed);
  lhShaft.position.y = 7.4;
  lhShaft.castShadow = true;
  const lhWhiteBand = new THREE.Mesh(new THREE.CylinderGeometry(1.78, 1.94, 2.6, 16), whiteTrimMat);
  lhWhiteBand.position.y = 6.2;
  const lhGallery = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.55, 0.85, 16), whiteTrimMat);
  lhGallery.position.y = 13.6;

  // Steel Watch Gallery Railing Ring & Posts
  const lhRailRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.06, 6, 20), bronzeMetalMat);
  lhRailRing.rotation.x = Math.PI * 0.5;
  lhRailRing.position.y = 14.6;
  for (let p = 0; p < 8; p++) {
    const a = (p / 8) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 6), bronzeMetalMat);
    post.position.set(Math.cos(a) * 2.15, 14.3, Math.sin(a) * 2.15);
    lighthouseGroup.add(post);
  }

  const lhLanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.85, 12), windowGlassMat);
  lhLanternGlass.position.y = 14.8;
  const lhFresnelCore = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.4, 10), materials.lanternGlow);
  lhFresnelCore.position.y = 14.8;
  const lhCupola = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.65, 14), materials.lighthouseRed);
  lhCupola.position.y = 16.5;
  const lhFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.2, 6), bronzeMetalMat);
  lhFinial.position.y = 17.8;

  lighthouseGroup.add(
    lhBase,
    lhShaft,
    lhWhiteBand,
    lhGallery,
    lhRailRing,
    lhLanternGlass,
    lhFresnelCore,
    lhCupola,
    lhFinial
  );
  harborGroup.add(lighthouseGroup);

  // Detailed Coastal Sailboats & Fishing Boats
  const addBoat = (bx: number, bz: number, rotY: number, isSailboat: boolean) => {
    const boat = new THREE.Group();
    boat.position.set(bx, 0.56, bz);
    boat.rotation.y = rotY;

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 8.8), whiteTrimMat);
    hull.position.y = 0.55;
    hull.castShadow = true;
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.65, 3.0, 4), whiteTrimMat);
    bow.rotation.x = Math.PI * 0.5;
    bow.rotation.z = Math.PI * 0.25;
    bow.position.set(0, 0.62, 5.7);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 8.2), materials.woodDeck);
    deck.position.y = 1.18;

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(3.32, 0.3, 8.4),
      isSailboat ? materials.lighthouseRed : materials.seokchonWater
    );
    stripe.position.y = 0.85;
    boat.add(hull, bow, deck, stripe);

    if (isSailboat) {
      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 3.4), whiteTrimMat);
      cockpit.position.set(0, 1.5, -0.8);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 9.6, 8), materials.modernConcrete);
      mast.position.set(0, 5.6, 0.4);
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 6), materials.modernConcrete);
      boom.rotation.x = Math.PI * 0.5;
      boom.position.set(0, 2.5, -1.7);
      const mainSail = new THREE.Mesh(
        new THREE.ConeGeometry(2.7, 7.2, 3),
        new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.7, side: THREE.DoubleSide })
      );
      mainSail.position.set(0, 5.9, -0.9);
      mainSail.scale.set(0.14, 1, 1.2);
      const jibSail = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 5.8, 3),
        new THREE.MeshStandardMaterial({ color: 0xf7f4eb, roughness: 0.72, side: THREE.DoubleSide })
      );
      jibSail.position.set(0, 4.9, 2.2);
      jibSail.scale.set(0.12, 1, 0.9);
      boat.add(cockpit, mast, boom, mainSail, jibSail);
    } else {
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.7, 3.2), whiteTrimMat);
      cabin.position.set(0, 1.95, -0.5);
      const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.7, 2.6), windowGlassMat);
      cabinGlass.position.set(0, 2.2, -0.35);
      const wheelRoof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 3.5), materials.lighthouseRed);
      wheelRoof.position.set(0, 2.86, -0.5);
      boat.add(cabin, cabinGlass, wheelRoof);
    }
    harborGroup.add(boat);
  };

  addBoat(-14, 66, 0.42, true);
  addBoat(24, 60, -0.45, false);
  addBoat(52, 74, 0.78, true);

  root.add(harborGroup);

  // ========================================================
  // 3. Realistic Multi-Species Mulgeon Bangjo Eoburim Windbreak Forest (물건방조어부림)
  // ========================================================
  const forestGroup = new THREE.Group();
  forestGroup.name = 'mulgeon_windbreak_forest';

  const wallBase = new THREE.Mesh(new THREE.BoxGeometry(244, 1.15, 4.4), materials.namhaeStoneWall);
  wallBase.position.set(0, 0.58, 27);
  wallBase.receiveShadow = true;
  forestGroup.add(wallBase);

  const broadForest: [number, number, number][] = [];
  const pineForest: [number, number, number][] = [];
  for (let i = 0; i < 108; i++) {
    const t = i / 107;
    const fx = -116 + t * 232;
    const curveOffset = Math.pow(fx / 118, 2) * 5.2;
    const rowJitter = ((i * 7) % 5) * 1.15 - 2.3;
    const fz = 27.2 + curveOffset + rowJitter;
    const scale = 0.85 + ((i * 13) % 9) * 0.065;
    if (i % 4 === 1) {
      pineForest.push([fx, fz, scale]);
    } else {
      broadForest.push([fx, fz, scale]);
    }
  }

  const broadTrunkGeo = createRealisticBroadleafTrunkGeometry();
  const broadCrownGeo = createRealisticBroadleafCrownGeometry();
  const pineTrunkGeo = createKoreanPineTrunkGeometry();
  const pineCrownGeo = createKoreanPineCrownGeometry();

  const bTrunks = new THREE.InstancedMesh(broadTrunkGeo, materials.treeBark, broadForest.length);
  const bCrowns = new THREE.InstancedMesh(broadCrownGeo, materials.leafCanopy, broadForest.length);
  bCrowns.castShadow = true;
  bCrowns.receiveShadow = true;

  const pTrunks = new THREE.InstancedMesh(pineTrunkGeo, materials.treeBark, pineForest.length);
  const pCrowns = new THREE.InstancedMesh(pineCrownGeo, materials.leafCanopy, pineForest.length);
  pCrowns.castShadow = true;
  pCrowns.receiveShadow = true;

  const fColor = new THREE.Color();
  broadForest.forEach(([fx, fz, s], idx) => {
    dummy.position.set(fx, 0.4, fz);
    dummy.scale.set(s * 1.05, s * 1.05, s * 1.05);
    dummy.rotation.set(0, idx * 1.37, 0);
    dummy.updateMatrix();
    bTrunks.setMatrixAt(idx, dummy.matrix);
    bCrowns.setMatrixAt(idx, dummy.matrix);

    const palette = [0x467a3f, 0x568d4a, 0x3b6c39, 0x679850];
    fColor.setHex(palette[idx % palette.length]);
    bCrowns.setColorAt(idx, fColor);
  });

  pineForest.forEach(([fx, fz, s], idx) => {
    dummy.position.set(fx, 0.4, fz);
    dummy.scale.set(s * 1.15, s * 1.15, s * 1.15);
    dummy.rotation.set(0, idx * 1.9, 0);
    dummy.updateMatrix();
    pTrunks.setMatrixAt(idx, dummy.matrix);
    pCrowns.setMatrixAt(idx, dummy.matrix);

    fColor.setHex(idx % 2 === 0 ? 0x356436 : 0x427440);
    pCrowns.setColorAt(idx, fColor);
  });

  bTrunks.instanceMatrix.needsUpdate = true;
  bCrowns.instanceMatrix.needsUpdate = true;
  pTrunks.instanceMatrix.needsUpdate = true;
  pCrowns.instanceMatrix.needsUpdate = true;
  if (bCrowns.instanceColor) bCrowns.instanceColor.needsUpdate = true;
  if (pCrowns.instanceColor) pCrowns.instanceColor.needsUpdate = true;
  bTrunks.computeBoundingSphere();
  bCrowns.computeBoundingSphere();
  pTrunks.computeBoundingSphere();
  pCrowns.computeBoundingSphere();
  forestGroup.add(bTrunks, bCrowns, pTrunks, pCrowns);
  root.add(forestGroup);

  // ========================================================
  // 4. Terraced Coastal Amphitheater Hillside & Clean Cobblestone German-ro
  // ========================================================
  const villageGroup = new THREE.Group();
  villageGroup.name = 'german_village_terraces';

  const terraceTiers = [
    { z: -3, depth: 18, height: 5.5, width: 252 },
    { z: -22.5, depth: 21, height: 12.2, width: 242 },
    { z: -45.5, depth: 25, height: 19.8, width: 228 },
  ];

  terraceTiers.forEach((tier) => {
    const retaining = new THREE.Mesh(
      new THREE.BoxGeometry(tier.width, tier.height, tier.depth),
      materials.namhaeStoneWall
    );
    retaining.position.set(0, tier.height * 0.5, tier.z);
    retaining.receiveShadow = true;

    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(tier.width + 0.3, 0.32, 0.65),
      materials.granite
    );
    coping.position.set(0, tier.height + 0.16, tier.z + tier.depth * 0.5 - 0.15);

    const lawnTop = new THREE.Mesh(
      new THREE.BoxGeometry(tier.width, 0.24, tier.depth),
      materials.namhaeLawn
    );
    lawnTop.position.set(0, tier.height + 0.12, tier.z);
    lawnTop.receiveShadow = true;
    villageGroup.add(retaining, coping, lawnTop);
  });

  addStoneRetainedRoad(
    villageGroup,
    [
      new THREE.Vector3(-56, 0.68, 16.5),
      new THREE.Vector3(-24, 3.2, 11.8),
      new THREE.Vector3(6, 5.78, 8.2),
      new THREE.Vector3(16, 5.88, 3.2),
    ],
    14,
    5.2,
    materials.namhaeCobbleRoad,
    materials.namhaeStoneWall,
    materials.granite,
    true
  );

  const tier1Street = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.18, 166),
    materials.namhaeCobbleRoad
  );
  tier1Street.rotation.y = Math.PI * 0.5;
  tier1Street.position.set(-10, 5.84, 3.2);
  tier1Street.receiveShadow = true;
  villageGroup.add(tier1Street);

  addStoneRetainedRoad(
    villageGroup,
    [
      new THREE.Vector3(70, 5.86, 3.2),
      new THREE.Vector3(84, 9.0, -4.5),
      new THREE.Vector3(66, 12.48, -12.6),
      new THREE.Vector3(54, 12.56, -15.2),
    ],
    14,
    4.8,
    materials.namhaeCobbleRoad,
    materials.namhaeStoneWall,
    materials.granite,
    true
  );

  const tier2Street = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.18, 152),
    materials.namhaeCobbleRoad
  );
  tier2Street.rotation.y = Math.PI * 0.5;
  tier2Street.position.set(-16, 12.54, -15.2);
  tier2Street.receiveShadow = true;
  villageGroup.add(tier2Street);

  addStoneRetainedRoad(
    villageGroup,
    [
      new THREE.Vector3(-34, 12.56, -15.2),
      new THREE.Vector3(-24, 16.2, -23.5),
      new THREE.Vector3(-12, 20.12, -34.2),
    ],
    12,
    4.8,
    materials.namhaeCobbleRoad,
    materials.namhaeStoneWall,
    materials.granite,
    true
  );

  // Ornamental village streetlamps along German-ro
  const addStreetLamp = (lx: number, ly: number, lz: number) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 2.8, 6), bronzeMetalMat);
    pole.position.set(lx, ly + 1.4, lz);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), materials.lanternGlow);
    bulb.position.set(lx, ly + 2.95, lz);
    villageGroup.add(pole, bulb);
  };
  [-72, -38, -4, 30, 62].forEach((lx) => addStreetLamp(lx, 5.74, 5.2));
  [-68, -36, 4, 38].forEach((lx) => addStreetLamp(lx, 12.44, -13.0));

  // Textured Coastal Mountain Backdrop behind upper village (남해 삼동면 산자락)
  const hillGeo = new THREE.PlaneGeometry(360, 110, 48, 24);
  hillGeo.rotateX(-Math.PI * 0.5);
  hillGeo.translate(0, 0, -98);
  const posAttr = hillGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const baseH = getNamhaeHillHeight(vx, vz);
    const ridge =
      baseH > 2
        ? Math.sin(vx * 0.11) * Math.cos(vz * 0.14) * 1.9 +
          Math.sin(vx * 0.27 + vz * 0.22) * 0.65
        : 0;
    posAttr.setY(i, Math.max(0, baseH + ridge));
  }
  hillGeo.computeVertexNormals();
  const hillTerrain = new THREE.Mesh(hillGeo, materials.namhaeLawn);
  hillTerrain.receiveShadow = true;
  villageGroup.add(hillTerrain);

  // Granite Ridge Crags seated on upper hill shoulders
  const cragSpots: [number, number, number][] = [
    [-46, -104, 1.3],
    [42, -102, 1.5],
    [8, -112, 1.8],
    [-86, -98, 1.2],
  ];
  cragSpots.forEach(([cx, cz, cs], i) => {
    const cy = getNamhaeHillHeight(cx, cz);
    const crag = new THREE.Mesh(new THREE.DodecahedronGeometry(3.8 * cs, 1), materials.coastalRock);
    crag.position.set(cx, cy + 0.6, cz);
    crag.scale.set(1.5, 0.72, 1.1);
    crag.rotation.y = i * 1.1;
    crag.castShadow = true;
    villageGroup.add(crag);
  });

  // Realistic Korean Pine & Broadleaf Backdrop Forest on Mountain Ridges
  const hillBroad: [number, number, number][] = [];
  const hillPines: [number, number, number][] = [];
  for (let i = 0; i < 140; i++) {
    const angle = i * 2.39996;
    const tx = Math.cos(angle) * (16 + ((i * 29) % 126));
    const tz = -98 + Math.sin(angle) * (8 + ((i * 19) % 40));
    if (tz > -58 || tz < -145) continue;
    const ty = getNamhaeHillHeight(tx, tz);
    if (ty < 3.5) continue;
    if (i % 3 === 0) hillBroad.push([tx, ty, tz]);
    else hillPines.push([tx, ty, tz]);
  }

  const hPineTrunks = new THREE.InstancedMesh(pineTrunkGeo, materials.treeBark, hillPines.length);
  const hPineCrowns = new THREE.InstancedMesh(pineCrownGeo, materials.leafCanopy, hillPines.length);
  hPineCrowns.castShadow = true;
  hillPines.forEach(([tx, ty, tz], idx) => {
    const s = 1.0 + (idx % 5) * 0.1;
    dummy.position.set(tx, ty - 0.1, tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 0.8, 0);
    dummy.updateMatrix();
    hPineTrunks.setMatrixAt(idx, dummy.matrix);
    hPineCrowns.setMatrixAt(idx, dummy.matrix);

    const pal = [0x336236, 0x3f713e, 0x2c5630];
    fColor.setHex(pal[idx % pal.length]);
    hPineCrowns.setColorAt(idx, fColor);
  });

  const hBroadTrunks = new THREE.InstancedMesh(broadTrunkGeo, materials.treeBark, hillBroad.length);
  const hBroadCrowns = new THREE.InstancedMesh(broadCrownGeo, materials.leafCanopy, hillBroad.length);
  hBroadCrowns.castShadow = true;
  hillBroad.forEach(([tx, ty, tz], idx) => {
    const s = 0.95 + (idx % 4) * 0.12;
    dummy.position.set(tx, ty - 0.1, tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 1.1, 0);
    dummy.updateMatrix();
    hBroadTrunks.setMatrixAt(idx, dummy.matrix);
    hBroadCrowns.setMatrixAt(idx, dummy.matrix);

    const pal = [0x4c7e42, 0x5e8e48, 0x748f48];
    fColor.setHex(pal[idx % pal.length]);
    hBroadCrowns.setColorAt(idx, fColor);
  });

  [hPineTrunks, hPineCrowns, hBroadTrunks, hBroadCrowns].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  });
  if (hPineCrowns.instanceColor) hPineCrowns.instanceColor.needsUpdate = true;
  if (hBroadCrowns.instanceColor) hBroadCrowns.instanceColor.needsUpdate = true;
  villageGroup.add(hPineTrunks, hPineCrowns, hBroadTrunks, hBroadCrowns);

  // ========================================================
  // 5. Realistic Composite Bavarian German Houses (독일마을 주택 17채)
  // ========================================================
  const buildGermanHouse = (
    x: number,
    baseY: number,
    z: number,
    w: number,
    h: number,
    d: number,
    rotY: number,
    hasDormer = true,
    warmRoofVariant = false
  ) => {
    const house = new THREE.Group();
    house.position.set(x, baseY, z);
    house.rotation.y = rotY;

    // 1) Stone garden retaining plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(w + 1.5, 1.08, d + 1.7),
      materials.granitePlinth
    );
    plinth.position.y = 0.54;
    plinth.receiveShadow = true;
    house.add(plinth);

    // 2) Sunlit white stucco & Fachwerk walls
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials.germanHouseWall);
    wall.position.y = 1.08 + h * 0.5;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    // 3) 3D Recessed Front Window Frames & Flower Planter Sills (adding real architectural depth)
    [-0.25, 0.25].forEach((wxRatio) => {
      [0.3, 0.72].forEach((wyRatio) => {
        const winFrame = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.22, h * 0.26, 0.16),
          whiteTrimMat
        );
        winFrame.position.set(w * wxRatio, 1.08 + h * wyRatio, d * 0.5 + 0.04);

        const winPane = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.17, h * 0.21, 0.18),
          windowGlassMat
        );
        winPane.position.set(w * wxRatio, 1.08 + h * wyRatio, d * 0.5 + 0.05);

        const flowerBox = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.24, 0.22, 0.28),
          darkTimberMat
        );
        flowerBox.position.set(w * wxRatio, 1.08 + h * wyRatio - h * 0.13, d * 0.5 + 0.14);
        house.add(winFrame, winPane, flowerBox);
      });
    });

    // 4) Pitched Gable Wall Triangles + horizontal Fachwerk timber collar beam + bargeboard trim
    const roofH = Math.max(2.7, w * 0.35);
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-w * 0.5, 0);
    gableShape.lineTo(w * 0.5, 0);
    gableShape.lineTo(0, roofH);
    gableShape.closePath();

    const gableBodyGeo = new THREE.ExtrudeGeometry(gableShape, {
      depth: d,
      bevelEnabled: false,
    });
    gableBodyGeo.translate(0, 1.08 + h, -d * 0.5);
    const gableWall = new THREE.Mesh(gableBodyGeo, whiteTrimMat);
    gableWall.castShadow = true;
    house.add(gableWall);

    const collarBeam = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.98, 0.24, d + 0.14),
      darkTimberMat
    );
    collarBeam.position.set(0, 1.08 + h + 0.12, 0);
    house.add(collarBeam);

    // 5) Terracotta Clay Roof Slopes with Overhanging Eaves & Timber Bargeboards
    const roofMat = warmRoofVariant ? terracottaAccentMat : materials.germanRoofTile;
    const slopeLen = Math.hypot(w * 0.5 + 0.95, roofH);
    const slopeAngle = Math.atan2(roofH, w * 0.5 + 0.95);
    [-1, 1].forEach((side) => {
      const slope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.32, d + 1.65), roofMat);
      slope.position.set(side * (w * 0.25 + 0.22), 1.08 + h + roofH * 0.5 - 0.1, 0);
      slope.rotation.z = -side * slopeAngle;
      slope.castShadow = true;
      slope.receiveShadow = true;

      const barge = new THREE.Mesh(new THREE.BoxGeometry(slopeLen + 0.1, 0.36, 0.14), darkTimberMat);
      barge.position.set(side * (w * 0.25 + 0.22), 1.08 + h + roofH * 0.5 - 0.14, d * 0.5 + 0.84);
      barge.rotation.z = -side * slopeAngle;
      house.add(slope, barge);
    });

    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.38, d + 1.75), roofMat);
    ridgeCap.position.set(0, 1.08 + h + roofH + 0.05, 0);
    house.add(ridgeCap);

    // 6) Brick Chimney with Cap & Ceramic Flue + Optional Roof Dormer
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.3, 0.85), chimneyBrickMat);
    chimney.position.set(-w * 0.22, 1.08 + h + roofH * 0.72, -d * 0.22);
    chimney.castShadow = true;
    const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 1.05), materials.granite);
    chimneyCap.position.set(-w * 0.22, 1.08 + h + roofH * 0.72 + 1.2, -d * 0.22);
    house.add(chimney, chimneyCap);

    if (hasDormer) {
      const dormerWall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 1.8), whiteTrimMat);
      dormerWall.position.set(w * 0.2, 1.08 + h + roofH * 0.45, 0);
      const dormerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.1, 4), roofMat);
      dormerRoof.rotation.y = Math.PI * 0.25;
      dormerRoof.position.set(w * 0.2, 1.08 + h + roofH * 0.45 + 1.1, 0);
      house.add(dormerWall, dormerRoof);
    }

    // 7) Wooden South-facing Ocean-View Deck + Timber Balustrade Rail + Stone Entry Steps
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.25, 2.9), materials.woodDeck);
    deck.position.set(0, 1.12, d * 0.5 + 1.45);
    deck.receiveShadow = true;
    const deckRail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.12, 0.14), darkTimberMat);
    deckRail.position.set(0, 1.78, d * 0.5 + 2.8);
    [-0.4, -0.14, 0.14, 0.4].forEach((px) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.14), darkTimberMat);
      post.position.set(w * px, 1.46, d * 0.5 + 2.8);
      house.add(post);
    });
    const frontSteps = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.0), materials.granite);
    frontSteps.position.set(0, 0.45, d * 0.5 + 3.15);
    house.add(deck, deckRail, frontSteps);

    // Organic Garden Hedge Shrub beside house
    const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), materials.pineNeedles);
    shrub.position.set(w * 0.5 + 1.5, 0.95, d * 0.35);
    shrub.scale.set(0.85, 1.55, 0.85);
    shrub.castShadow = true;
    house.add(shrub);

    return house;
  };

  // Tier 1 Houses
  const tier1Specs: [number, number, number, number, number, boolean, boolean][] = [
    [-92, -6.0, 9.2, 5.2, 7.2, true, false],
    [-64, -5.5, 8.6, 4.8, 6.8, false, true],
    [-36, -6.5, 9.8, 5.4, 7.6, true, false],
    [-6, -5.5, 8.8, 5.0, 6.8, false, false],
    [24, -6.0, 9.4, 5.2, 7.2, true, true],
    [52, -6.2, 8.6, 4.8, 6.8, true, false],
    [98, -5.5, 9.2, 5.0, 7.0, true, false],
  ];
  tier1Specs.forEach(([x, z, w, h, d, dormer, warm]) => {
    villageGroup.add(buildGermanHouse(x, 5.74, z, w, h, d, -x * 0.0022, dormer, warm));
  });

  // Tier 2 Houses
  const tier2Specs: [number, number, number, number, number, boolean, boolean][] = [
    [-92, -25.5, 9.6, 5.4, 7.4, true, false],
    [-60, -24.5, 9.0, 5.0, 7.0, false, true],
    [10, -24.8, 9.2, 5.1, 7.0, true, false],
    [38, -25.5, 9.6, 5.4, 7.4, true, true],
    [68, -24.8, 9.2, 5.2, 7.0, true, false],
    [96, -25.5, 8.8, 4.8, 6.8, false, false],
  ];
  tier2Specs.forEach(([x, z, w, h, d, dormer, warm]) => {
    villageGroup.add(buildGermanHouse(x, 12.44, z, w, h, d, -x * 0.0024, dormer, warm));
  });

  // Tier 3 Houses flanking Deutscher Platz
  const tier3Specs: [number, number, number, number, number, boolean, boolean][] = [
    [-76, -46.5, 9.8, 5.6, 7.6, true, false],
    [-46, -46.0, 9.2, 5.2, 7.2, false, true],
    [46, -46.0, 9.4, 5.4, 7.2, true, false],
    [78, -46.5, 9.6, 5.4, 7.4, false, true],
  ];
  tier3Specs.forEach(([x, z, w, h, d, dormer, warm]) => {
    villageGroup.add(buildGermanHouse(x, 20.04, z, w, h, d, -x * 0.002, dormer, warm));
  });

  // ========================================================
  // 6. Padoch Exhibition Hall & Deutscher Platz Observatory (파독전시관 · 도이처플라츠)
  // ========================================================
  const plazaGroup = new THREE.Group();
  plazaGroup.position.set(0, 20.04, -46);

  const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(36, 0.35, 20), materials.namhaeStoneWall);
  plazaFloor.position.y = 0.18;
  plazaFloor.receiveShadow = true;

  const lookoutDeck = new THREE.Mesh(new THREE.BoxGeometry(22, 0.35, 6.5), materials.woodDeck);
  lookoutDeck.position.set(0, 0.25, 11.5);
  lookoutDeck.castShadow = true;
  const deckRailFront = new THREE.Mesh(new THREE.BoxGeometry(21.6, 0.12, 0.14), darkTimberMat);
  deckRailFront.position.set(0, 1.05, 14.6);
  for (let rx = -10; rx <= 10; rx += 4) {
    const rPost = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.14), darkTimberMat);
    rPost.position.set(rx, 0.68, 14.6);
    plazaGroup.add(rPost);
  }
  plazaGroup.add(plazaFloor, lookoutDeck, deckRailFront);

  const hallBody = new THREE.Mesh(new THREE.BoxGeometry(18, 6.5, 10), materials.germanHouseWall);
  hallBody.position.set(-4, 3.5, -2.5);
  hallBody.castShadow = true;

  const hallRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 4.5, 4), materials.germanRoofTile);
  hallRoof.rotation.y = Math.PI * 0.25;
  hallRoof.position.set(-4, 9.0, -2.5);
  hallRoof.scale.set(1.1, 1, 0.72);
  hallRoof.castShadow = true;

  const entryPorch = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.26, 2.8), materials.germanRoofTile);
  entryPorch.position.set(-4, 3.1, 3.6);
  [-6.2, -1.8].forEach((px) => {
    const porchPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8), darkTimberMat);
    porchPost.position.set(px, 1.65, 4.7);
    plazaGroup.add(porchPost);
  });
  plazaGroup.add(entryPorch);

  // Civic Clock Tower with bezel & clock hands
  const clockTower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 12.5, 4.2), whiteTrimMat);
  clockTower.position.set(7.5, 6.4, -2.5);
  clockTower.castShadow = true;
  const clockSpire = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4.5, 4), materials.germanRoofTile);
  clockSpire.rotation.y = Math.PI * 0.25;
  clockSpire.position.set(7.5, 14.8, -2.5);

  const clockBezel = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.18, 20), bronzeMetalMat);
  clockBezel.rotation.x = Math.PI * 0.5;
  clockBezel.position.set(7.5, 10.6, -0.34);

  const clockDial = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.2, 20), materials.lanternGlow);
  clockDial.rotation.x = Math.PI * 0.5;
  clockDial.position.set(7.5, 10.6, -0.32);

  const clockHourHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.08), bronzeMetalMat);
  clockHourHand.position.set(7.5, 10.82, -0.2);
  const clockMinHand = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.08), bronzeMetalMat);
  clockMinHand.position.set(7.82, 10.6, -0.18);

  const addFlagPole = (fx: number, fz: number, stripes: number[]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 7.6, 8), materials.modernConcrete);
    pole.position.set(fx, 4.0, fz);
    plazaGroup.add(pole);
    stripes.forEach((colHex, idx) => {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.42, 0.08),
        new THREE.MeshStandardMaterial({ color: colHex, roughness: 0.6 })
      );
      band.position.set(fx + 1.0, 7.3 - idx * 0.42, fz);
      plazaGroup.add(band);
    });
  };
  addFlagPole(-13.5, 6.0, [0x1a1a1a, 0xd62828, 0xffcc00]);
  addFlagPole(-9.5, 6.0, [0xffffff, 0xc62828, 0x0047a0]);

  const gazeboBase = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.5, 8), materials.woodDeck);
  gazeboBase.position.set(12.5, 0.5, 4.5);
  const gazeboRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.2, 8), materials.germanRoofTile);
  gazeboRoof.position.set(12.5, 4.4, 4.5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.0, 6), materials.woodDeck);
    post.position.set(12.5 + Math.cos(a) * 3.4, 2.1, 4.5 + Math.sin(a) * 3.4);
    plazaGroup.add(post);
  }

  [
    [-1.5, 6.8],
    [3.5, 7.2],
  ].forEach(([px, pz]) => {
    const uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), darkTimberMat);
    uPole.position.set(px, 1.3, pz);
    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.65, 8), terracottaAccentMat);
    umbrella.position.set(px, 2.4, pz);
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 8), materials.woodDeck);
    table.position.set(px, 1.05, pz);
    plazaGroup.add(uPole, umbrella, table);
  });

  plazaGroup.add(
    hallBody,
    hallRoof,
    clockTower,
    clockSpire,
    clockBezel,
    clockDial,
    clockHourHand,
    clockMinHand,
    gazeboBase,
    gazeboRoof
  );
  villageGroup.add(plazaGroup);

  root.add(villageGroup);
  return root;
}
