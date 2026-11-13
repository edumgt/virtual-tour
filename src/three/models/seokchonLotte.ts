import * as THREE from 'three';
import { PalaceMaterials } from '../materials';

/**
 * Builds the Seokchon Lake (East & West Lakes), Lotte World Tower (123F),
 * Lotte World Mall, Lotte World Adventure Dome, Magic Island & Magic Castle,
 * Cherry Blossom Promenade, and Songpa-daero / Olympic-ro Jamsil Intersection.
 */
export function buildSeokchonLotte(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'seokchon_lotte_root';

  // ========================================================
  // 1. Park Turf & Lake Promenade Grounds
  // ========================================================
  const parkMat = new THREE.MeshStandardMaterial({
    color: 0x3b5e3c,
    roughness: 0.92,
    metalness: 0.0,
  });

  // Southern Seokchon Lake Parkland (Continuous lakeside park lawn & sidewalks)
  const lakeParkBase = new THREE.Mesh(new THREE.BoxGeometry(340, 0.12, 130), parkMat);
  lakeParkBase.position.set(0, 0.04, 75);
  lakeParkBase.receiveShadow = true;

  // Urban concrete district plaza north of Olympic-ro (잠실역 롯데단지 도시 보행광장)
  const northUrbanPlaza = new THREE.Mesh(
    new THREE.BoxGeometry(340, 0.12, 130),
    materials.modernConcrete
  );
  northUrbanPlaza.position.set(0, 0.04, -75);
  northUrbanPlaza.receiveShadow = true;

  root.add(lakeParkBase, northUrbanPlaza);

  // ========================================================
  // 2. Jamsil Intersection Roads (올림픽로 & 송파대로 잠실호수교)
  // ========================================================
  // Olympic-ro (East-West Avenue at Z = 0)
  const olympicRoad = new THREE.Mesh(
    new THREE.BoxGeometry(360, 0.1, 20),
    materials.asphaltRoad
  );
  olympicRoad.rotation.y = Math.PI * 0.5;
  // Wait: asphaltRoad texture has lanes running along Z (vertical in texture).
  // Rotating plane or using BoxGeometry(20, 0.1, 360) rotated Y by 90 deg aligns lanes along X!
  olympicRoad.geometry.dispose();
  olympicRoad.geometry = new THREE.BoxGeometry(20, 0.1, 360);
  olympicRoad.position.set(0, 0.05, 0);
  olympicRoad.receiveShadow = true;
  root.add(olympicRoad);

  // Songpa-daero & Jamsil Lake Bridge (North-South Avenue at X = 0)
  const songpaRoad = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.14, 340),
    materials.asphaltRoad
  );
  songpaRoad.position.set(0, 0.07, 10);
  songpaRoad.receiveShadow = true;
  root.add(songpaRoad);

  // Bridge Guardrails along Songpa-daero dividing East & West Lakes (Z = 18..112)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xd0d6de,
    roughness: 0.5,
    metalness: 0.3,
  });
  [-9.3, 9.3].forEach((rx) => {
    const bridgeRail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 96), railMat);
    bridgeRail.position.set(rx, 0.6, 65);
    bridgeRail.castShadow = true;
    root.add(bridgeRail);
  });

  // Jamsil Crossroad Zebra Crosswalks (Z = ±11, X = ±11)
  const crosswalkStripeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f0,
    roughness: 0.6,
    metalness: 0.02,
  });
  const stripeGeo = new THREE.BoxGeometry(1.1, 0.03, 3.6);
  const crosswalkGroup = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    // North & South crosswalks over Songpa-daero
    [-11.5, 11.5].forEach((cz) => {
      const s = new THREE.Mesh(stripeGeo, crosswalkStripeMat);
      s.position.set(i * 2.1, 0.16, cz);
      crosswalkGroup.add(s);
    });
    // West & East crosswalks over Olympic-ro
    [-11.5, 11.5].forEach((cx) => {
      const s = new THREE.Mesh(stripeGeo, crosswalkStripeMat);
      s.rotation.y = Math.PI * 0.5;
      s.position.set(cx, 0.16, i * 2.1);
      crosswalkGroup.add(s);
    });
  }
  root.add(crosswalkGroup);

  // ========================================================
  // 3. Seokchon Lake - West Lake (서호) & East Lake (동호)
  // ========================================================
  const buildLakeBasin = (centerX: number, centerZ: number, rx: number, rz: number) => {
    const lakeGroup = new THREE.Group();
    lakeGroup.position.set(centerX, 0, centerZ);

    // Sculpt organic rounded lake contour using EllipseCurve extruded into granite embankment
    const outerShape = new THREE.Shape();
    outerShape.absellipse(0, 0, rx + 4, rz + 4, 0, Math.PI * 2, false, 0);
    const innerHole = new THREE.Path();
    innerHole.absellipse(0, 0, rx, rz, 0, Math.PI * 2, true, 0);
    outerShape.holes.push(innerHole);

    const rimGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.85,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.25,
      bevelSegments: 2,
      curveSegments: 32,
    });
    const rimMesh = new THREE.Mesh(rimGeo, materials.granite);
    rimMesh.rotation.x = Math.PI * 0.5;
    rimMesh.position.y = 0.9;
    rimMesh.receiveShadow = true;
    lakeGroup.add(rimMesh);

    // Shimmering Water Surface
    const waterShape = new THREE.Shape();
    waterShape.absellipse(0, 0, rx + 0.4, rz + 0.4, 0, Math.PI * 2, false, 0);
    const waterGeo = new THREE.ShapeGeometry(waterShape, 36);
    const waterMesh = new THREE.Mesh(waterGeo, materials.seokchonWater);
    waterMesh.rotation.x = -Math.PI * 0.5;
    waterMesh.position.y = 0.35;
    waterMesh.receiveShadow = true;
    lakeGroup.add(waterMesh);

    // Dark Lakebed beneath translucent water
    const bedGeo = new THREE.ShapeGeometry(waterShape, 24);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x0b2430, roughness: 0.95 });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.rotation.x = -Math.PI * 0.5;
    bedMesh.position.y = 0.2;
    lakeGroup.add(bedMesh);

    return lakeGroup;
  };

  // West Lake (서호) & East Lake (동호)
  const westLake = buildLakeBasin(-68, 65, 52, 42);
  const eastLake = buildLakeBasin(68, 65, 52, 42);
  root.add(westLake, eastLake);

  // East Lake Musical Fountain & Northern Wooden Waterfront Deck (동호 수변무대 & 음악분수)
  const eastFountain = new THREE.Group();
  eastFountain.position.set(68, 0.36, 65);
  const fountainRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.5, 0.35, 8, 28),
    materials.granite
  );
  fountainRing.rotation.x = Math.PI * 0.5;
  eastFountain.add(fountainRing);

  const sprayMat = new THREE.MeshStandardMaterial({
    color: 0xdff6ff,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.72,
    roughness: 0.1,
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const jet = new THREE.Mesh(new THREE.ConeGeometry(0.45, 5.5, 8), sprayMat);
    jet.position.set(Math.cos(angle) * 4.2, 2.7, Math.sin(angle) * 4.2);
    eastFountain.add(jet);
  }
  const centerJet = new THREE.Mesh(new THREE.ConeGeometry(0.75, 9.5, 10), sprayMat);
  centerJet.position.set(0, 4.7, 0);
  eastFountain.add(centerJet);
  root.add(eastFountain);

  // Wooden Waterfront Deck on East Lake North Shore (facing Lotte World Tower)
  const eastDeck = new THREE.Mesh(
    new THREE.BoxGeometry(36, 0.45, 10),
    materials.woodDeck
  );
  eastDeck.position.set(54, 0.68, 22);
  eastDeck.receiveShadow = true;
  root.add(eastDeck);

  // ========================================================
  // 4. Magic Island & Magic Castle inside West Lake (매직아일랜드 & 매직캐슬)
  // ========================================================
  const magicIsland = new THREE.Group();
  magicIsland.name = 'magic_island';
  magicIsland.position.set(-68, 0, 56);

  // Stone circular island platform
  const islandBase = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 20, 1.4, 28),
    materials.granite
  );
  islandBase.position.y = 0.7;
  islandBase.receiveShadow = true;
  islandBase.castShadow = true;
  magicIsland.add(islandBase);

  const islandPlaza = new THREE.Mesh(
    new THREE.CylinderGeometry(17.2, 17.2, 0.2, 28),
    materials.modernConcrete
  );
  islandPlaza.position.y = 1.45;
  islandPlaza.receiveShadow = true;
  magicIsland.add(islandPlaza);

  // Pedestrian Bridge connecting Lotte World (North shore) to Magic Island
  const magicBridge = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.7, 26),
    materials.granite
  );
  magicBridge.position.set(0, 1.35, -24);
  magicBridge.castShadow = true;
  magicBridge.receiveShadow = true;
  magicIsland.add(magicBridge);

  // Magic Castle (매직캐슬 - 8+ part composite European fairy-tale castle)
  const castleGroup = new THREE.Group();
  castleGroup.position.set(0, 1.55, 0);

  // Castle Lower Keep
  const castleKeep = new THREE.Mesh(
    new THREE.BoxGeometry(13, 8.5, 11),
    materials.magicCastleWall
  );
  castleKeep.position.set(0, 4.25, 0);
  castleKeep.castShadow = true;
  castleKeep.receiveShadow = true;
  castleGroup.add(castleKeep);

  // Castle Upper Central Tower
  const castleUpperTower = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.6, 13, 12),
    materials.magicCastleWall
  );
  castleUpperTower.position.set(0, 11.5, 0);
  castleUpperTower.castShadow = true;
  castleGroup.add(castleUpperTower);

  // Central Tall Cobalt-Blue Spire & Gold Finial
  const centralSpire = new THREE.Mesh(
    new THREE.ConeGeometry(3.7, 11, 16),
    materials.castleTurretBlue
  );
  centralSpire.position.set(0, 23.2, 0);
  centralSpire.castShadow = true;
  castleGroup.add(centralSpire);

  const spireFinial = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 2.8, 8),
    materials.goldLeaf
  );
  spireFinial.position.set(0, 29.5, 0);
  castleGroup.add(spireFinial);

  // 4 Corner Turrets with Blue Conical Roofs
  const turretCoords: [number, number, number][] = [
    [-5.8, 7.5, 4.8],
    [5.8, 7.5, 4.8],
    [-5.8, 8.5, -4.8],
    [5.8, 8.5, -4.8],
  ];
  turretCoords.forEach(([tx, th, tz]) => {
    const turretBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.55, th + 3, 12),
      materials.magicCastleWall
    );
    turretBody.position.set(tx, (th + 3) * 0.5, tz);
    turretBody.castShadow = true;

    const turretRoof = new THREE.Mesh(
      new THREE.ConeGeometry(1.85, 4.8, 12),
      materials.castleTurretBlue
    );
    turretRoof.position.set(tx, th + 3 + 2.2, tz);
    turretRoof.castShadow = true;

    const turretTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      materials.goldLeaf
    );
    turretTip.position.set(tx, th + 3 + 4.7, tz);

    castleGroup.add(turretBody, turretRoof, turretTip);
  });

  // Grand Castle Gate Archway facing South Lakefront
  const gateArch = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 4.8, 1.4),
    materials.royalWood
  );
  gateArch.position.set(0, 2.4, 5.4);
  castleGroup.add(gateArch);

  magicIsland.add(castleGroup);

  // Gyro Drop Tower (자이로드롭) on West side of Magic Island
  const gyroTower = new THREE.Group();
  gyroTower.position.set(-11.5, 1.55, -2);
  const gyroMast = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.4, 38, 12),
    materials.modernConcrete
  );
  gyroMast.position.y = 19;
  gyroMast.castShadow = true;

  const gyroTopCap = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 1.5, 3.2, 16),
    materials.pillarCrimson
  );
  gyroTopCap.position.y = 39.2;

  const gyroRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.65, 10, 24),
    materials.goldLeaf
  );
  gyroRing.rotation.x = Math.PI * 0.5;
  gyroRing.position.y = 31;
  gyroTower.add(gyroMast, gyroTopCap, gyroRing);
  magicIsland.add(gyroTower);

  // Rollercoaster Track Curve (아트란티스 아치 트랙) on East edge of Magic Island
  const coasterCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(10, 3, -10),
    new THREE.Vector3(15, 14, -2),
    new THREE.Vector3(12, 9, 8),
    new THREE.Vector3(5, 4, 13),
  ]);
  const coasterGeo = new THREE.TubeGeometry(coasterCurve, 28, 0.35, 8, false);
  const coasterMat = new THREE.MeshStandardMaterial({
    color: 0xe63946,
    roughness: 0.35,
    metalness: 0.5,
  });
  const coasterMesh = new THREE.Mesh(coasterGeo, coasterMat);
  magicIsland.add(coasterMesh);

  root.add(magicIsland);

  // ========================================================
  // 5. Lotte World Adventure Indoor Dome (롯데월드 어드벤처 실내 돔)
  //    North of West Lake: X = -68, Z = -36
  // ========================================================
  const adventureGroup = new THREE.Group();
  adventureGroup.name = 'lotte_world_adventure';
  adventureGroup.position.set(-68, 0, -36);

  // Classical European-inspired grand facade podium
  const advPodium = new THREE.Mesh(
    new THREE.BoxGeometry(66, 17, 42),
    materials.lotteMallFacade
  );
  advPodium.position.set(0, 8.5, 0);
  advPodium.castShadow = true;
  advPodium.receiveShadow = true;
  adventureGroup.add(advPodium);

  // Iconic Giant Ribbed Glass Dome (롯데월드 유리 천장 아치 돔)
  const domeGlassMat = new THREE.MeshStandardMaterial({
    color: 0x99d6ff,
    roughness: 0.12,
    metalness: 0.6,
    transparent: true,
    opacity: 0.78,
    envMapIntensity: 1.4,
  });

  const domeVault = new THREE.Mesh(
    new THREE.CylinderGeometry(19, 19, 54, 24, 1, false, 0, Math.PI),
    domeGlassMat
  );
  // Rotate around Z by 90 deg so cylinder runs along X and half-arch opens upward (+Y)
  domeVault.rotation.z = Math.PI * 0.5;
  // Local X maps to World Y height after 90 deg Z rotation
  domeVault.scale.set(0.72, 1, 1);
  domeVault.position.set(0, 17, 0);
  adventureGroup.add(domeVault);

  // White structural steel ribs spanning the glass vault (aligned identically to domeVault)
  for (let rx = -24; rx <= 24; rx += 6) {
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(19.1, 0.38, 6, 24, Math.PI),
      materials.lotteTowerFin
    );
    rib.position.set(rx, 17, 0);
    rib.rotation.y = Math.PI * 0.5;
    rib.scale.set(1, 0.72, 1);
    adventureGroup.add(rib);
  }

  // Festive Entrance Marquee facing Olympic-ro
  const advMarquee = new THREE.Mesh(
    new THREE.BoxGeometry(22, 5.5, 4),
    materials.castleTurretBlue
  );
  advMarquee.position.set(0, 4.5, 22.5);
  adventureGroup.add(advMarquee);

  const advGoldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(22.6, 0.7, 4.4),
    materials.goldLeaf
  );
  advGoldTrim.position.set(0, 7.3, 22.5);
  adventureGroup.add(advGoldTrim);

  root.add(adventureGroup);

  // ========================================================
  // 6. Lotte World Tower (롯데월드타워 - 123층 / 555m) & Lotte World Mall
  //    North of East Lake: X = 52, Z = -36
  // ========================================================
  const towerGroup = new THREE.Group();
  towerGroup.name = 'lotte_world_tower';
  towerGroup.position.set(52, 0, -36);

  // 6a. Grand Granite & Glass Atrium Podium
  const towerPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(34, 6, 34),
    materials.granite
  );
  towerPlinth.position.y = 3;
  towerPlinth.castShadow = true;
  towerPlinth.receiveShadow = true;
  towerGroup.add(towerPlinth);

  // 6b. Iconic Sleek Tapered Chamfered Shaft (117 floors, Y = 6 to Y = 124)
  // 8-sided tapered prism rotated 22.5 deg gives authentic chamfered square skyscraper profile
  const shaftHeight = 118;
  const shaftGeo = new THREE.CylinderGeometry(7.2, 15.6, shaftHeight, 8, 1);
  const shaftMesh = new THREE.Mesh(shaftGeo, materials.lotteTowerGlass);
  shaftMesh.position.y = 6 + shaftHeight * 0.5;
  shaftMesh.rotation.y = Math.PI / 8;
  shaftMesh.castShadow = true;
  shaftMesh.receiveShadow = true;
  towerGroup.add(shaftMesh);

  // 6c. 8 Tapered Vertical Metallic Exoskeleton Corner Fins
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const finGroup = new THREE.Group();
    finGroup.rotation.y = angle;

    // Slight inward tilt matching shaft taper: atan2(15.6 - 7.2, 118)
    const taperAngle = Math.atan2(15.6 - 7.2, shaftHeight);
    const finMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, shaftHeight + 4, 0.85),
      materials.lotteTowerFin
    );
    const midR = (15.6 + 7.2) * 0.5;
    finMesh.position.set(midR, 6 + shaftHeight * 0.5, 0);
    finMesh.rotation.z = taperAngle;
    finGroup.add(finMesh);
    towerGroup.add(finGroup);
  }

  // 6d. Seoul Sky Observatory Glowing Belt (117F–123F, Y = 114..122)
  const skyDeckMat = new THREE.MeshStandardMaterial({
    color: 0xdff4ff,
    emissive: 0x60a5fa,
    emissiveIntensity: 0.45,
    roughness: 0.1,
    metalness: 0.7,
  });
  const skyDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(8.2, 8.6, 7.5, 8),
    skyDeckMat
  );
  skyDeck.position.y = 116;
  skyDeck.rotation.y = Math.PI / 8;
  towerGroup.add(skyDeck);

  // 6e. Signature Split V-Notch Diagrid Lantern Crown (Y = 122..150)
  // Two sleek opposing pointed half-cones forming the iconic open vertical cleft at the apex
  const buildApexFin = (sideSign: number) => {
    const apexShape = new THREE.Shape();
    apexShape.moveTo(sideSign * 1.1, 0);
    apexShape.lineTo(sideSign * 7.1, 0);
    apexShape.quadraticCurveTo(sideSign * 5.2, 16, sideSign * 1.4, 28);
    apexShape.lineTo(sideSign * 0.85, 28);
    apexShape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(apexShape, {
      depth: 7.4,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.2,
      bevelSegments: 2,
    });
    extrudeGeo.translate(0, 0, -3.7);
    const mesh = new THREE.Mesh(extrudeGeo, materials.lotteTowerFin);
    mesh.position.y = 123.5;
    mesh.castShadow = true;

    // Glowing glass inlay inside the apex cleft
    const innerGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffefc2,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.4,
    });
    const innerPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 23, 5.4),
      innerGlowMat
    );
    innerPanel.position.set(sideSign * 1.1, 123.5 + 12, 0);

    return { mesh, innerPanel };
  };

  const leftApex = buildApexFin(-1);
  const rightApex = buildApexFin(1);
  towerGroup.add(leftApex.mesh, leftApex.innerPanel, rightApex.mesh, rightApex.innerPanel);

  // Aviation Warning Beacon at Apex
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    emissive: 0xff3b30,
    emissiveIntensity: 1.2,
  });
  [-1.1, 1.1].forEach((bx) => {
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), beaconMat);
    beacon.position.set(bx, 152, 0);
    towerGroup.add(beacon);
  });

  root.add(towerGroup);

  // ========================================================
  // 7. Lotte World Mall & Avenuel (롯데월드몰 & 에비뉴엘)
  // ========================================================
  const mallGroup = new THREE.Group();
  mallGroup.name = 'lotte_world_mall';

  // Avenuel Luxury Wing (West of Tower, facing Songpa-daero & Olympic-ro)
  const avenuelMain = new THREE.Mesh(
    new THREE.BoxGeometry(24, 18, 30),
    materials.lotteMallFacade
  );
  avenuelMain.position.set(27, 9, -28);
  avenuelMain.castShadow = true;
  avenuelMain.receiveShadow = true;

  // Shopping Mall & Concert Hall East Wing (East of Tower)
  const mallEastWing = new THREE.Mesh(
    new THREE.BoxGeometry(46, 16, 32),
    materials.lotteMallFacade
  );
  mallEastWing.position.set(88, 8, -29);
  mallEastWing.castShadow = true;
  mallEastWing.receiveShadow = true;

  // Lotte Concert Hall Rooftop Elliptical Acoustic Crown
  const concertCrown = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 13, 7, 24),
    materials.modernConcrete
  );
  concertCrown.position.set(92, 19.5, -32);
  concertCrown.castShadow = true;

  // Connecting Skybridge & Rooftop Terrace Garden
  const mallRoofGarden = new THREE.Mesh(
    new THREE.BoxGeometry(42, 0.4, 24),
    parkMat
  );
  mallRoofGarden.position.set(88, 16.2, -29);

  // Warm Glowing Media Signage Ribbons facing Olympic-ro
  const mediaRibbonMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.2,
  });
  const mediaRibbon = new THREE.Mesh(new THREE.BoxGeometry(74, 1.4, 0.4), mediaRibbonMat);
  mediaRibbon.position.set(60, 12.5, -12.8);

  mallGroup.add(avenuelMain, mallEastWing, concertCrown, mallRoofGarden, mediaRibbon);
  root.add(mallGroup);

  // ========================================================
  // 8. Surrounding Jamsil Skyline Towers (잠실 스카이라인 빌딩군)
  // ========================================================
  const buildJamsilTower = (
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material
  ) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    body.position.y = h * 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.82, 2.5, d * 0.82),
      materials.modernConcrete
    );
    crown.position.y = h + 1.25;
    g.add(body, crown);
    return g;
  };

  // KT Songpa & Sofitel Ambassador Hotel (East of Lotte Mall)
  root.add(buildJamsilTower(128, -30, 22, 54, 24, materials.modernGlass));
  // Samsung SDS & Hyanggun Tower (West of Lotte World)
  root.add(buildJamsilTower(-118, -34, 24, 48, 24, materials.modernGovernment));
  // Jamsil Han River Skyline Backdrop Towers (North of Lotte Complex, Z = -95)
  root.add(buildJamsilTower(-78, -96, 28, 42, 22, materials.modernConcrete));
  root.add(buildJamsilTower(-32, -98, 22, 58, 22, materials.modernGlass));
  root.add(buildJamsilTower(28, -96, 24, 50, 22, materials.modernGovernment));
  root.add(buildJamsilTower(88, -94, 26, 44, 22, materials.modernGlass));
  // Galleria Palace Twin Towers (Southwest of West Lake)
  root.add(buildJamsilTower(-136, 48, 20, 62, 20, materials.modernConcrete));
  root.add(buildJamsilTower(-136, 82, 20, 56, 20, materials.modernGlass));
  // Lake Palace / Jamsil High-Rises South of East Lake
  root.add(buildJamsilTower(136, 62, 22, 46, 26, materials.modernGovernment));

  // ========================================================
  // 9. Seokchon Lake Cherry Blossom & Spring Promenade (석촌호수 벚꽃길 - InstancedMesh)
  // ========================================================
  const treeCoords: [number, number][] = [];
  // Generate elliptical trail of cherry blossom trees around West Lake & East Lake
  const addLakeTreeRing = (cx: number, cz: number, rx: number, rz: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const tx = cx + Math.cos(a) * rx;
      const tz = cz + Math.sin(a) * rz;
      // Skip spots intersecting Songpa-daero bridge (|x| < 14) or Magic Island north bridge
      if (Math.abs(tx) < 14) continue;
      if (cx < 0 && Math.abs(tx - -68) < 6 && tz < 32) continue;
      treeCoords.push([tx, tz]);
    }
  };

  addLakeTreeRing(-68, 65, 58, 48, 36);
  addLakeTreeRing(68, 65, 58, 48, 36);

  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 2.8, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4b382a, roughness: 0.9 });
  const canopyGeo = new THREE.DodecahedronGeometry(2.3, 1);

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCoords.length);
  const blossomInst = new THREE.InstancedMesh(
    canopyGeo,
    materials.cherryBlossomPink,
    treeCoords.length
  );
  blossomInst.castShadow = true;

  const dummy = new THREE.Object3D();
  const tintColor = new THREE.Color();

  treeCoords.forEach(([tx, tz], idx) => {
    const scaleVar = 0.85 + ((idx * 17) % 10) * 0.03;
    dummy.position.set(tx, 1.4, tz);
    dummy.scale.set(scaleVar, scaleVar, scaleVar);
    dummy.rotation.y = idx * 0.7;
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, 3.6 * scaleVar, tz);
    dummy.scale.set(scaleVar * 1.15, scaleVar * 0.9, scaleVar * 1.15);
    dummy.updateMatrix();
    blossomInst.setMatrixAt(idx, dummy.matrix);

    // Subtle alternation between soft sakura pink and pale spring cream-pink
    tintColor.setHex(idx % 3 === 0 ? 0xffd1dc : idx % 3 === 1 ? 0xf7a8c4 : 0xffe0ea);
    blossomInst.setColorAt(idx, tintColor);
  });

  trunkInst.instanceMatrix.needsUpdate = true;
  blossomInst.instanceMatrix.needsUpdate = true;
  if (blossomInst.instanceColor) blossomInst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  blossomInst.computeBoundingSphere();
  root.add(trunkInst, blossomInst);

  // ========================================================
  // 10. Avenue Streetlamps & Urban Vehicles along Olympic-ro & Songpa-daero
  // ========================================================
  const lampSpots: [number, number][] = [];
  for (let z = -90; z <= 130; z += 36) {
    if (Math.abs(z) < 15) continue;
    lampSpots.push([-10.5, z], [10.5, z]);
  }
  for (let x = -120; x <= 120; x += 40) {
    if (Math.abs(x) < 15) continue;
    lampSpots.push([x, -11.5], [x, 11.5]);
  }

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 6.2, 6);
  const poleInst = new THREE.InstancedMesh(poleGeo, materials.modernMullion, lampSpots.length);
  const headGeo = new THREE.BoxGeometry(1.1, 0.25, 0.45);
  const headInst = new THREE.InstancedMesh(headGeo, materials.lanternGlow, lampSpots.length);

  lampSpots.forEach(([lx, lz], idx) => {
    dummy.position.set(lx, 3.1, lz);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    poleInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(lx, 6.2, lz);
    dummy.updateMatrix();
    headInst.setMatrixAt(idx, dummy.matrix);
  });
  poleInst.instanceMatrix.needsUpdate = true;
  headInst.instanceMatrix.needsUpdate = true;
  poleInst.computeBoundingSphere();
  headInst.computeBoundingSphere();
  root.add(poleInst, headInst);

  // Urban Vehicles (Buses & Sedans) on Olympic-ro and Songpa-daero
  const vehicleSpecs: { x: number; z: number; rotY: number; color: number; isBus?: boolean }[] = [
    { x: -4.2, z: 42, rotY: 0, color: 0x2563eb, isBus: true },
    { x: 4.2, z: 82, rotY: Math.PI, color: 0xf8fafc },
    { x: -4.2, z: -48, rotY: 0, color: 0xf59e0b },
    { x: 42, z: 4.2, rotY: Math.PI * 0.5, color: 0x16a34a, isBus: true },
    { x: -48, z: -4.2, rotY: -Math.PI * 0.5, color: 0x334155 },
    { x: 75, z: -4.2, rotY: -Math.PI * 0.5, color: 0xe2e8f0 },
  ];

  vehicleSpecs.forEach((v) => {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: v.color,
      roughness: 0.32,
      metalness: 0.45,
    });
    const w = v.isBus ? 2.5 : 1.9;
    const h = v.isBus ? 2.6 : 1.15;
    const l = v.isBus ? 7.2 : 4.2;

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), bodyMat);
    body.position.y = h * 0.5 + 0.35;
    body.castShadow = true;

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.88, h * 0.55, l * 0.62),
      materials.modernGlass
    );
    cabin.position.y = h + 0.35;

    car.add(body, cabin);
    car.position.set(v.x, 0.14, v.z);
    car.rotation.y = v.rotY;
    root.add(car);
  });

  return root;
}
