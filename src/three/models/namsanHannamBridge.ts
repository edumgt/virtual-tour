import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createRealisticBroadleafTrunkGeometry,
  createRealisticBroadleafCrownGeometry,
  createKoreanPineTrunkGeometry,
  createKoreanPineCrownGeometry,
} from './realisticTrees';

/**
 * Evaluates approximate elevation on the Mt. Namsan foothills & summit slope
 * so trees, city wall segments, and hillside terraces sit flush on the terrain.
 */
function getNamsanHeight(x: number, z: number): number {
  if (z > -52) return 0;
  const dx = x / 95;
  const dz = (z + 102) / 56;
  const mainDistSq = dx * dx + dz * dz;
  const mainPeak = Math.max(0, 1 - mainDistSq) * 46.5;

  const westDistSq = ((x + 76) / 68) ** 2 + ((z + 106) / 52) ** 2;
  const westPeak = Math.max(0, 1 - westDistSq) * 30;

  const eastDistSq = ((x - 78) / 70) ** 2 + ((z + 104) / 52) ** 2;
  const eastPeak = Math.max(0, 1 - eastDistSq) * 28;

  return Math.max(mainPeak, westPeak, eastPeak);
}

/**
 * Builds the N Seoul Tower, Mt. Namsan & Palgakjeong, Hannam-dong Terraced Hillside,
 * and Han River with Twin-Arch Bridge Crossing Vista.
 */
export function buildNamsanHannamBridge(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'namsan_hannam_bridge_root';

  const darkZincMat = new THREE.MeshStandardMaterial({
    color: 0x272d38,
    roughness: 0.42,
    metalness: 0.55,
  });

  // ========================================================
  // 1. Han River Basin & Waterfront Expressways (한강 & 강변북로·올림픽대로)
  // ========================================================
  // Dark riverbed beneath shimmering water (Z = 8..116)
  const riverBed = new THREE.Mesh(
    new THREE.BoxGeometry(380, 0.08, 108),
    new THREE.MeshStandardMaterial({ color: 0x09202c, roughness: 0.96 })
  );
  riverBed.position.set(0, 0.04, 62);
  root.add(riverBed);

  // Shimmering subdivided Han River water surface for live current & ripple displacement
  const riverWater = new THREE.Mesh(
    new THREE.PlaneGeometry(380, 108, 60, 22),
    materials.hanRiverWater
  );
  riverWater.rotation.x = -Math.PI * 0.5;
  riverWater.position.set(0, 0.36, 62);
  riverWater.receiveShadow = true;
  root.add(riverWater);

  // South Hangang Parkland (Z = 116..186) & North Bank Ichon/Hannam Apron (Z = -18..8)
  const southBankLawn = new THREE.Mesh(
    new THREE.BoxGeometry(380, 0.14, 70),
    materials.namhaeLawn
  );
  southBankLawn.position.set(0, 0.07, 151);
  southBankLawn.receiveShadow = true;

  const northBankApron = new THREE.Mesh(new THREE.BoxGeometry(380, 0.16, 26), materials.modernConcrete);
  northBankApron.position.set(0, 0.08, -5);
  northBankApron.receiveShadow = true;

  // Granite river embankment retaining walls
  const northEmbankment = new THREE.Mesh(new THREE.BoxGeometry(380, 1.8, 2.2), materials.granite);
  northEmbankment.position.set(0, 0.9, 8);
  northEmbankment.receiveShadow = true;

  const southEmbankment = new THREE.Mesh(new THREE.BoxGeometry(380, 1.8, 2.2), materials.granite);
  southEmbankment.position.set(0, 0.9, 116);
  southEmbankment.receiveShadow = true;

  root.add(southBankLawn, northBankApron, northEmbankment, southEmbankment);

  // Gangbyeonbuk-ro (North shore Z = 0) & Olympic-daero (South shore Z = 128)
  // BoxGeometry(16, 0.14, 380) rotated Y=90deg aligns road lanes along East-West (X axis)
  const gangbyeonRoad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.14, 380), materials.asphaltRoad);
  gangbyeonRoad.rotation.y = Math.PI * 0.5;
  gangbyeonRoad.position.set(0, 0.18, 0);
  gangbyeonRoad.receiveShadow = true;

  const olympicHighway = new THREE.Mesh(new THREE.BoxGeometry(16, 0.14, 380), materials.asphaltRoad);
  olympicHighway.rotation.y = Math.PI * 0.5;
  olympicHighway.position.set(0, 0.18, 128);
  olympicHighway.receiveShadow = true;

  root.add(gangbyeonRoad, olympicHighway);

  // ========================================================
  // 2. Grand Han River Twin-Arch Bridge & Crossing Roadway (한강·한남 대교)
  // ========================================================
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'hangang_bridge';

  // Bridge main elevated deck (Z = 6..118, Y = 5.75, top roadway Y = 6.25)
  const bridgeDeck = new THREE.Mesh(
    new THREE.BoxGeometry(20.4, 1.0, 112),
    materials.modernConcrete
  );
  bridgeDeck.position.set(0, 5.75, 62);
  bridgeDeck.castShadow = true;
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);

  const bridgeAsphalt = new THREE.Mesh(
    new THREE.BoxGeometry(16.4, 0.08, 112.2),
    materials.asphaltRoad
  );
  bridgeAsphalt.position.set(0, 6.29, 62);
  bridgeAsphalt.receiveShadow = true;
  bridgeGroup.add(bridgeAsphalt);

  // Pedestrian sidewalks & railings along both bridge edges
  [-9.1, 9.1].forEach((sx) => {
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 112), materials.granite);
    sidewalk.position.set(sx, 6.34, 62);
    bridgeGroup.add(sidewalk);

    const railBeam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 112), materials.bridgeSteel);
    railBeam.position.set(sx + (sx > 0 ? 0.85 : -0.85), 6.85, 62);
    bridgeGroup.add(railBeam);
  });

  // South & North sloped approach ramps connecting bridge deck (Y=6.25) down to ground (Y=0.2)
  const rampLength = 30;
  const rampSlopeAngle = Math.atan2(6.05, rampLength);
  const rampHyp = Math.hypot(6.05, rampLength);

  // South Approach Ramp (Z = 118..148)
  const southRamp = new THREE.Mesh(
    new THREE.BoxGeometry(20.0, 0.9, rampHyp),
    materials.modernConcrete
  );
  southRamp.position.set(0, 3.0, 132.5);
  southRamp.rotation.x = rampSlopeAngle;
  southRamp.receiveShadow = true;
  bridgeGroup.add(southRamp);

  const southRampRoad = new THREE.Mesh(
    new THREE.BoxGeometry(16.4, 0.08, rampHyp),
    materials.asphaltRoad
  );
  southRampRoad.position.set(0, 3.49, 132.5);
  southRampRoad.rotation.x = rampSlopeAngle;
  bridgeGroup.add(southRampRoad);

  // North Approach Ramp (Z = -22..6)
  const northRamp = new THREE.Mesh(
    new THREE.BoxGeometry(20.0, 0.9, rampHyp),
    materials.modernConcrete
  );
  northRamp.position.set(0, 3.0, -8.5);
  northRamp.rotation.x = -rampSlopeAngle;
  northRamp.receiveShadow = true;
  bridgeGroup.add(northRamp);

  const northRampRoad = new THREE.Mesh(
    new THREE.BoxGeometry(16.4, 0.08, rampHyp),
    materials.asphaltRoad
  );
  northRampRoad.position.set(0, 3.49, -8.5);
  northRampRoad.rotation.x = -rampSlopeAngle;
  bridgeGroup.add(northRampRoad);

  // River Piers anchored in Han Riverbed (Z = 14, 38, 62, 86, 110) with Granite Cutwaters
  const pierZCoords = [14, 38, 62, 86, 110];
  pierZCoords.forEach((pz) => {
    [-6.5, 6.5].forEach((px) => {
      const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2.2, 5.7, 12),
        materials.granitePlinth
      );
      pier.position.set(px, 2.85, pz);
      pier.castShadow = true;
      pier.receiveShadow = true;
      bridgeGroup.add(pier);

      // Hydrodynamic granite V-cutwater prows facing upstream/downstream river current
      const cutwater = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 2.4, 2.6, 4),
        materials.coastalRock
      );
      cutwater.rotation.y = Math.PI * 0.25;
      cutwater.scale.set(1.65, 1, 0.92);
      cutwater.position.set(px, 1.3, pz);
      cutwater.castShadow = true;
      cutwater.receiveShadow = true;
      bridgeGroup.add(cutwater);
    });
    // Cross pier cap beam & abutment corbel
    const cap = new THREE.Mesh(new THREE.BoxGeometry(18.5, 0.9, 3.2), materials.modernConcrete);
    cap.position.set(0, 5.1, pz);
    bridgeGroup.add(cap);
  });

  // Twin Soaring Parabolic Steel Arch Spans (South Arch Z=62..110, North Arch Z=14..62)
  const addArchSpan = (zStart: number, zEnd: number) => {
    const zMid = (zStart + zEnd) * 0.5;
    const archPeakY = 23.5;

    [-9.6, 9.6].forEach((ax) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(ax, 6.2, zStart),
        new THREE.Vector3(ax, archPeakY * 1.72, zMid),
        new THREE.Vector3(ax, 6.2, zEnd)
      );
      const archGeo = new THREE.TubeGeometry(curve, 28, 0.62, 8, false);
      const archMesh = new THREE.Mesh(archGeo, materials.bridgeSteel);
      archMesh.castShadow = true;
      bridgeGroup.add(archMesh);

      // Secondary lower tie chord & vertical/diagonal suspender truss web
      const cableCount = 8;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= cableCount; i++) {
        pts.push(curve.getPoint(i / cableCount));
      }
      for (let i = 1; i < cableCount; i++) {
        const pt = pts[i];
        const cableLen = Math.max(0.5, pt.y - 6.2);
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, cableLen, 6),
          materials.bridgeSteel
        );
        cable.position.set(pt.x, 6.2 + cableLen * 0.5, pt.z);
        bridgeGroup.add(cable);

        // Diagonal steel truss brace connecting deck node to adjacent arch node
        const prevPt = pts[i - 1];
        const deckNode = new THREE.Vector3(pt.x, 6.2, pt.z);
        const diagVec = new THREE.Vector3().subVectors(prevPt, deckNode);
        const diagLen = diagVec.length();
        if (diagLen > 1.2) {
          const diag = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, diagLen, 5),
            materials.bridgeSteel
          );
          diag.position.addVectors(deckNode, prevPt).multiplyScalar(0.5);
          diag.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            diagVec.clone().normalize()
          );
          bridgeGroup.add(diag);
        }
      }
    });

    // Overhead K-brace lateral struts connecting West & East arch ribs
    [0.24, 0.37, 0.5, 0.63, 0.76].forEach((t) => {
      const yPos = 6.2 + 4 * t * (1 - t) * (archPeakY * 0.86 - 6.2);
      const zPos = zStart + (zEnd - zStart) * t;
      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(19.6, 0.5, 0.65),
        materials.bridgeSteel
      );
      strut.position.set(0, yPos, zPos);
      bridgeGroup.add(strut);
    });
  };

  addArchSpan(14, 62);
  addArchSpan(62, 110);

  // Bridge Streetlamps along West & East railings (InstancedMesh)
  const dummy = new THREE.Object3D();
  const bridgeLampZ: number[] = [];
  for (let z = 12; z <= 112; z += 14) {
    bridgeLampZ.push(z);
  }
  const lampPoleGeo = new THREE.CylinderGeometry(0.1, 0.14, 4.5, 6);
  const lampHeadGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
  const bridgePoles = new THREE.InstancedMesh(
    lampPoleGeo,
    materials.modernMullion,
    bridgeLampZ.length * 2
  );
  const bridgeHeads = new THREE.InstancedMesh(
    lampHeadGeo,
    materials.lanternGlow,
    bridgeLampZ.length * 2
  );

  let lIdx = 0;
  bridgeLampZ.forEach((lz) => {
    [-8.9, 8.9].forEach((lx) => {
      dummy.position.set(lx, 8.5, lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bridgePoles.setMatrixAt(lIdx, dummy.matrix);

      dummy.position.set(lx > 0 ? lx - 0.35 : lx + 0.35, 10.75, lz);
      dummy.updateMatrix();
      bridgeHeads.setMatrixAt(lIdx, dummy.matrix);
      lIdx++;
    });
  });
  bridgePoles.instanceMatrix.needsUpdate = true;
  bridgeHeads.instanceMatrix.needsUpdate = true;
  bridgePoles.computeBoundingSphere();
  bridgeHeads.computeBoundingSphere();
  bridgeGroup.add(bridgePoles, bridgeHeads);

  // Vehicles crossing the Han River Bridge (composite 3-part Seoul buses & sedans)
  const bridgeTraffic: { x: number; z: number; rotY: number; color: number; isBus?: boolean }[] = [
    { x: -3.2, z: 76, rotY: 0, color: 0x2563eb, isBus: true },
    { x: -5.8, z: 58, rotY: 0, color: 0xf8fafc },
    { x: -2.8, z: 36, rotY: 0, color: 0x0f172a },
    { x: 3.0, z: 30, rotY: Math.PI, color: 0x16a34a, isBus: true },
    { x: 5.5, z: 68, rotY: Math.PI, color: 0xe2e8f0 },
  ];

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x16191f, roughness: 0.85 });
  bridgeTraffic.forEach((v) => {
    const car = new THREE.Group();
    const w = v.isBus ? 2.4 : 1.85;
    const h = v.isBus ? 2.5 : 1.05;
    const l = v.isBus ? 7.0 : 4.2;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, l),
      new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.34, metalness: 0.45 })
    );
    body.position.y = h * 0.5 + 0.34;
    body.castShadow = true;

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.88, h * 0.5, l * 0.6),
      materials.modernGlass
    );
    cabin.position.y = h + 0.32;

    const headlightBar = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, 0.2, 0.1),
      materials.lanternGlow
    );
    headlightBar.position.set(0, 0.72, -l * 0.5 - 0.04);

    // 4 rubber tires seated cleanly on roadway
    const wheelR = v.isBus ? 0.42 : 0.32;
    [-w * 0.46, w * 0.46].forEach((wx) => {
      [-l * 0.32, l * 0.32].forEach((wz) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelR, wheelR, 0.24, 10),
          wheelMat
        );
        wheel.rotation.z = Math.PI * 0.5;
        wheel.position.set(wx, wheelR, wz);
        car.add(wheel);
      });
    });

    car.add(body, cabin, headlightBar);
    car.position.set(v.x, 6.33, v.z);
    car.rotation.y = v.rotY;
    bridgeGroup.add(car);
  });

  // Banpo Moonlight Rainbow Fountain arcs on west side of bridge (달빛무지개분수)
  const rainbowMat = new THREE.MeshStandardMaterial({
    color: 0xbef2ff,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.42,
    transparent: true,
    opacity: 0.68,
    roughness: 0.15,
  });
  for (let z = 22; z <= 102; z += 8) {
    const arcCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-10.1, 6.1, z),
      new THREE.Vector3(-14.5, 5.2, z),
      new THREE.Vector3(-17.8, 0.3, z)
    );
    const arcMesh = new THREE.Mesh(
      new THREE.TubeGeometry(arcCurve, 10, 0.16, 6, false),
      rainbowMat
    );
    bridgeGroup.add(arcMesh);
  }

  root.add(bridgeGroup);

  // ========================================================
  // 3. Some Sevit Floating Pavilions & Han River Cruise Ferry (세빛섬 & 유람선)
  // ========================================================
  const sevitGroup = new THREE.Group();
  sevitGroup.position.set(66, 0.25, 72);

  const islandOffsets: [number, number, number][] = [
    [0, 0, 11],
    [-19, 10, 8.5],
    [18, 12, 7.5],
  ];
  islandOffsets.forEach(([ix, iz, rad]) => {
    const pontoon = new THREE.Mesh(
      new THREE.CylinderGeometry(rad, rad * 1.05, 0.9, 8),
      materials.modernConcrete
    );
    pontoon.position.set(ix, 0.45, iz);
    const pavilion = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 0.65, rad * 0.85, 4.6, 8),
      materials.lotteTowerGlass
    );
    pavilion.position.set(ix, 3.1, iz);
    pavilion.castShadow = true;
    const crownRing = new THREE.Mesh(
      new THREE.TorusGeometry(rad * 0.68, 0.22, 6, 8),
      materials.lanternGlow
    );
    crownRing.rotation.x = Math.PI * 0.5;
    crownRing.position.set(ix, 5.4, iz);
    sevitGroup.add(pontoon, pavilion, crownRing);
  });
  root.add(sevitGroup);

  // Han River Cruise Ferry (한강 유람선) gliding East-West with upper railings & funnel
  const ferryGroup = new THREE.Group();
  ferryGroup.position.set(-56, 0.38, 56);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(20, 2.0, 6.2), materials.modernConcrete);
  hull.position.y = 1.0;
  const bow = new THREE.Mesh(new THREE.ConeGeometry(3.2, 5.5, 4), materials.modernConcrete);
  bow.rotation.z = -Math.PI * 0.5;
  bow.rotation.x = Math.PI * 0.25;
  bow.position.set(12.2, 1.1, 0);
  const cabinDeck = new THREE.Mesh(new THREE.BoxGeometry(15, 2.2, 5.2), materials.modernGlass);
  cabinDeck.position.set(-0.5, 3.1, 0);
  const sunDeck = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.25, 5.6), materials.woodDeck);
  sunDeck.position.set(-0.5, 4.28, 0);
  const bridgeHouse = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.5, 3.8), materials.modernConcrete);
  bridgeHouse.position.set(4.5, 5.05, 0);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.6, 8), materials.namsanSpireRed);
  funnel.position.set(-4.8, 5.1, 0);
  const ferryWake = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 5.6),
    new THREE.MeshBasicMaterial({ color: 0xe0f7ff, transparent: true, opacity: 0.45 })
  );
  ferryWake.rotation.x = -Math.PI * 0.5;
  ferryWake.position.set(-16, 0.05, 0);
  ferryGroup.add(hull, bow, cabinDeck, sunDeck, bridgeHouse, funnel, ferryWake);
  root.add(ferryGroup);

  // ========================================================
  // 4. Hannam-dong Terraced Hillside District (한남동 언덕길 · 한남더힐 · 유엔빌리지 · 리움)
  // ========================================================
  const hannamGroup = new THREE.Group();
  hannamGroup.name = 'hannam_dong';

  // Three stepped granite-and-garden terraces rising from Z=-16 toward Mt. Namsan (Z=-60)
  const terraceSpecs = [
    { z: -23, depth: 16, height: 3.0 },
    { z: -37, depth: 16, height: 6.4 },
    { z: -51, depth: 16, height: 10.6 },
  ];

  terraceSpecs.forEach((t) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(290, t.height, t.depth), materials.granite);
    wall.position.set(0, t.height * 0.5, t.z);
    wall.receiveShadow = true;

    const topLawn = new THREE.Mesh(
      new THREE.BoxGeometry(290, 0.16, t.depth),
      materials.namhaeLawn
    );
    topLawn.position.set(0, t.height + 0.08, t.z);
    topLawn.receiveShadow = true;
    hannamGroup.add(wall, topLawn);
  });

  // Central Hannam-daero Sloping Boulevard cutting cleanly north toward Namsan tunnel/Sowol-ro
  const hannamSlopeAngle = Math.atan2(10.6, 48);
  const hannamRoad = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.25, 50),
    materials.asphaltRoad
  );
  hannamRoad.position.set(0, 5.4, -34);
  hannamRoad.rotation.x = -hannamSlopeAngle;
  hannamRoad.receiveShadow = true;
  hannamGroup.add(hannamRoad);

  // Composite Hannam-dong Hillside Villas & Terraced Residences
  const buildHannamResidence = (
    x: number,
    baseY: number,
    z: number,
    w: number,
    h: number,
    d: number,
    variant: number
  ) => {
    const g = new THREE.Group();
    g.position.set(x, baseY, z);

    // Granite podium base
    const podium = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 1.4, d + 1.2), materials.granitePlinth);
    podium.position.y = 0.7;
    podium.receiveShadow = true;

    const style = variant % 3;
    const facadeMat =
      style === 1 ? materials.lotteMallFacade : materials.hannamVilla;

    // Main residential tower volume
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), facadeMat);
    body.position.y = 1.4 + h * 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(podium, body);

    if (style === 1) {
      // Modern cantilevered glass penthouse & dark zinc visor
      const glassPenthouse = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.86, 2.6, d * 0.84),
        materials.modernGlass
      );
      glassPenthouse.position.y = 1.4 + h + 1.3;
      glassPenthouse.castShadow = true;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.65, d * 0.94), darkZincMat);
      roof.position.y = 1.4 + h + 2.9;
      g.add(glassPenthouse, roof);
    } else if (style === 2) {
      // Stepped setback travertine terrace + glass conservatory
      const upperBlock = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.68, 3.0, d * 0.72),
        materials.hannamVilla
      );
      upperBlock.position.set(w * 0.08, 1.4 + h + 1.5, 0);
      upperBlock.castShadow = true;
      const lowerRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 1.1, 0.6, d + 1.1), darkZincMat);
      lowerRoof.position.y = 1.4 + h + 0.3;
      const topRoof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.55, d * 0.76), darkZincMat);
      topRoof.position.set(w * 0.08, 1.4 + h + 3.2, 0);
      g.add(lowerRoof, upperBlock, topRoof);
    } else {
      // Classic Hannam travertine residence + dark zinc cornice + rooftop pergola
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1.4, 0.8, d + 1.4), darkZincMat);
      roof.position.y = 1.4 + h + 0.4;
      roof.castShadow = true;

      const pergola = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 1.2, d * 0.55), materials.woodDeck);
      pergola.position.y = 1.4 + h + 1.4;
      g.add(roof, pergola);
    }

    return g;
  };

  // West Hannam Hillside (Hannam The Hill & Embassy Row)
  const westVillas: [number, number, number, number, number, number][] = [
    [-26, 3.16, -23, 14, 7.5, 10],
    [-48, 3.16, -23, 16, 9.0, 10],
    [-74, 3.16, -23, 18, 11.0, 11],
    [-104, 3.16, -24, 20, 13.0, 12],
    [-64, 6.56, -37, 16, 10.5, 10],
    [-92, 6.56, -37, 18, 12.5, 11],
    [-42, 10.76, -51, 15, 8.5, 10],
    [-72, 10.76, -51, 17, 11.0, 10],
  ];
  westVillas.forEach(([x, y, z, w, h, d], idx) => {
    hannamGroup.add(buildHannamResidence(x, y, z, w, h, d, idx));
  });

  // East Hannam Hillside (UN Village & Luxury Terraced Villas overlooking Han River)
  const eastVillas: [number, number, number, number, number, number][] = [
    [24, 3.16, -23, 14, 8.0, 10],
    [48, 3.16, -23, 16, 9.5, 10],
    [76, 3.16, -23, 18, 11.5, 11],
    [106, 3.16, -24, 20, 14.0, 12],
    [32, 6.56, -37, 15, 9.5, 10],
    [60, 6.56, -37, 18, 12.0, 11],
    [90, 6.56, -37, 17, 13.0, 11],
    [40, 10.76, -51, 16, 9.0, 10],
    [74, 10.76, -51, 18, 11.5, 10],
  ];
  eastVillas.forEach(([x, y, z, w, h, d], idx) => {
    hannamGroup.add(buildHannamResidence(x, y, z, w, h, d, idx + 1));
  });

  // Hannam-dong Terrace Street Trees lining each stepped granite retaining edge (Realistic Broadleaf)
  const streetTreePositions: [number, number, number][] = [];
  const treeLanes = [
    { z: -16.2, y: 3.16 },
    { z: -30.2, y: 6.56 },
    { z: -44.2, y: 10.76 },
  ];
  treeLanes.forEach((lane) => {
    for (let tx = -114; tx <= 114; tx += 15) {
      if (Math.abs(tx) < 12) continue; // Keep Hannam-daero road corridor open
      streetTreePositions.push([tx, lane.y, lane.z]);
    }
  });
  const hTrunkGeo = createRealisticBroadleafTrunkGeometry();
  const hCrownGeo = createRealisticBroadleafCrownGeometry();
  const hTrunks = new THREE.InstancedMesh(hTrunkGeo, materials.treeBark, streetTreePositions.length);
  const hCrowns = new THREE.InstancedMesh(hCrownGeo, materials.leafCanopy, streetTreePositions.length);
  hTrunks.castShadow = true;
  hCrowns.castShadow = true;
  hCrowns.receiveShadow = true;
  const hTreeColor = new THREE.Color();
  streetTreePositions.forEach(([tx, ty, tz], idx) => {
    const s = 0.85 + (idx % 4) * 0.11;
    dummy.position.set(tx, ty - 0.05, tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 1.17, 0);
    dummy.updateMatrix();
    hTrunks.setMatrixAt(idx, dummy.matrix);
    hCrowns.setMatrixAt(idx, dummy.matrix);
    hTreeColor.setHex(idx % 5 === 0 ? 0xe59fb2 : idx % 2 === 0 ? 0x3b7644 : 0x4b874d);
    hCrowns.setColorAt(idx, hTreeColor);
  });
  hTrunks.instanceMatrix.needsUpdate = true;
  hCrowns.instanceMatrix.needsUpdate = true;
  if (hCrowns.instanceColor) hCrowns.instanceColor.needsUpdate = true;
  hTrunks.computeBoundingSphere();
  hCrowns.computeBoundingSphere();
  hannamGroup.add(hTrunks, hCrowns);

  // Leeum-inspired Contemporary Cultural Museum Complex on Terrace B (X = -34, Z = -37)
  const museumGroup = new THREE.Group();
  museumGroup.position.set(-34, 6.56, -37);
  const museumDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 6.4, 11.5, 20),
    materials.leeumTerracotta
  );
  museumDrum.position.set(0, 5.75, 0);
  museumDrum.castShadow = true;
  const museumCube = new THREE.Mesh(new THREE.BoxGeometry(11, 8.5, 9), darkZincMat);
  museumCube.position.set(8.5, 4.25, -1);
  museumCube.castShadow = true;
  const museumSkylight = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 2.2, 16),
    materials.modernGlass
  );
  museumSkylight.position.set(0, 12.4, 0);
  museumGroup.add(museumDrum, museumCube, museumSkylight);
  hannamGroup.add(museumGroup);

  root.add(hannamGroup);

  // ========================================================
  // 5. Mt. Namsan Mountain Terrain, City Wall & Cable Car (남산 · 한양도성 · 케이블카)
  // ========================================================
  const namsanGroup = new THREE.Group();
  namsanGroup.name = 'namsan_mountain';

  // Sculpted broad mountain terrain mesh over Z = -175..-50, X = -185..185
  const mountainGeo = new THREE.PlaneGeometry(370, 128, 46, 24);
  mountainGeo.rotateX(-Math.PI * 0.5);
  mountainGeo.translate(0, 0, -114);
  const posAttr = mountainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const baseH = getNamsanHeight(vx, vz);
    const ridgeNoise = baseH > 2 ? Math.sin(vx * 0.14) * Math.cos(vz * 0.16) * 1.8 : 0;
    posAttr.setY(i, Math.max(0, baseH + ridgeNoise));
  }
  mountainGeo.computeVertexNormals();

  const namsanTerrain = new THREE.Mesh(mountainGeo, materials.namhaeLawn);
  namsanTerrain.receiveShadow = true;
  namsanTerrain.castShadow = true;
  namsanGroup.add(namsanTerrain);

  // Natural granite ridge outcrops on Mt. Namsan shoulders
  const cragGeo = new THREE.IcosahedronGeometry(3.4, 1);
  const cragCoords: [number, number, number][] = [
    [-36, -92, 1.5],
    [34, -95, 1.4],
    [-68, -104, 1.6],
    [66, -102, 1.5],
    [18, -82, 1.2],
    [-22, -78, 1.2],
  ];
  cragCoords.forEach(([cx, cz, sc], idx) => {
    const cy = getNamsanHeight(cx, cz);
    const crag = new THREE.Mesh(cragGeo, materials.coastalRock);
    crag.position.set(cx, cy - 0.6, cz);
    crag.scale.set(sc * 1.6, sc * 0.85, sc * 1.3);
    crag.rotation.set(0.2 * idx, idx * 0.9, 0.15);
    crag.castShadow = true;
    crag.receiveShadow = true;
    namsanGroup.add(crag);
  });

  // Dense Mt. Namsan Realistic Korean Pine & Broadleaf Canopy (InstancedMesh seated flush on getNamsanHeight)
  const pinePositions: [number, number, number][] = [];
  const broadleafPositions: [number, number, number][] = [];
  for (let i = 0; i < 185; i++) {
    const angle = i * 2.39996;
    const radX = 16 + ((i * 37) % 140);
    const radZ = 8 + ((i * 23) % 46);
    const tx = Math.cos(angle) * radX;
    const tz = -102 + Math.sin(angle) * radZ;
    if (tz > -56 || tz < -165) continue;
    if (Math.hypot(tx, tz + 102) < 20) continue;
    const ty = getNamsanHeight(tx, tz);
    if (ty < 3) continue;
    if (i % 3 === 0) {
      broadleafPositions.push([tx, ty, tz]);
    } else {
      pinePositions.push([tx, ty, tz]);
    }
  }

  const pineTrunkGeo = createKoreanPineTrunkGeometry();
  const pineCrownGeo = createKoreanPineCrownGeometry();

  const pineTrunks = new THREE.InstancedMesh(pineTrunkGeo, materials.treeBark, pinePositions.length);
  const pineCrowns = new THREE.InstancedMesh(
    pineCrownGeo,
    materials.leafCanopy,
    pinePositions.length
  );
  pineTrunks.castShadow = true;
  pineCrowns.castShadow = true;
  pineCrowns.receiveShadow = true;

  const treeColor = new THREE.Color();
  const pinePalette = [0x2a5a34, 0x32663c, 0x244e2d, 0x3b6f40];
  pinePositions.forEach(([tx, ty, tz], idx) => {
    const s = 0.85 + ((idx * 13) % 10) * 0.045;
    dummy.position.set(tx, ty - 0.25, tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 1.35, 0);
    dummy.updateMatrix();
    pineTrunks.setMatrixAt(idx, dummy.matrix);
    pineCrowns.setMatrixAt(idx, dummy.matrix);

    treeColor.setHex(pinePalette[idx % pinePalette.length]);
    pineCrowns.setColorAt(idx, treeColor);
  });
  pineTrunks.instanceMatrix.needsUpdate = true;
  pineCrowns.instanceMatrix.needsUpdate = true;
  if (pineCrowns.instanceColor) pineCrowns.instanceColor.needsUpdate = true;
  pineTrunks.computeBoundingSphere();
  pineCrowns.computeBoundingSphere();
  namsanGroup.add(pineTrunks, pineCrowns);

  const nLeafTrunks = new THREE.InstancedMesh(hTrunkGeo, materials.treeBark, broadleafPositions.length);
  const nLeafCrowns = new THREE.InstancedMesh(hCrownGeo, materials.leafCanopy, broadleafPositions.length);
  nLeafTrunks.castShadow = true;
  nLeafCrowns.castShadow = true;
  nLeafCrowns.receiveShadow = true;
  const leafPalette = [0x457b3d, 0x548b45, 0x3a6c39, 0x708b3b];
  broadleafPositions.forEach(([tx, ty, tz], idx) => {
    const s = 0.85 + ((idx * 17) % 10) * 0.04;
    dummy.position.set(tx, ty - 0.2, tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 1.75, 0);
    dummy.updateMatrix();
    nLeafTrunks.setMatrixAt(idx, dummy.matrix);
    nLeafCrowns.setMatrixAt(idx, dummy.matrix);
    treeColor.setHex(leafPalette[idx % leafPalette.length]);
    nLeafCrowns.setColorAt(idx, treeColor);
  });
  nLeafTrunks.instanceMatrix.needsUpdate = true;
  nLeafCrowns.instanceMatrix.needsUpdate = true;
  if (nLeafCrowns.instanceColor) nLeafCrowns.instanceColor.needsUpdate = true;
  nLeafTrunks.computeBoundingSphere();
  nLeafCrowns.computeBoundingSphere();
  namsanGroup.add(nLeafTrunks, nLeafCrowns);

  // Seoul City Wall (한양도성 남산 성곽길) climbing up the southwest slope with crenellated 여장 merlons
  const wallWaypoints = 9;
  for (let i = 0; i < wallWaypoints; i++) {
    const t = i / (wallWaypoints - 1);
    const wx = -64 + t * 45;
    const wz = -66 - t * 30;
    const wy = getNamsanHeight(wx, wz);
    const segGroup = new THREE.Group();
    segGroup.position.set(wx, wy, wz);
    segGroup.rotation.y = Math.atan2(30, 45);

    const seg = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 1.4), materials.granite);
    seg.position.y = 1.5;
    seg.castShadow = true;
    seg.receiveShadow = true;
    segGroup.add(seg);

    // Stone coping ledge + 3 crenellated merlons (여장) atop each wall section
    const coping = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 1.6), materials.granitePlinth);
    coping.position.y = 3.4;
    segGroup.add(coping);

    [-2.0, 0, 2.0].forEach((mx) => {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.95, 0.75), materials.granite);
      merlon.position.set(mx, 3.95, 0);
      merlon.castShadow = true;
      segGroup.add(merlon);
    });
    namsanGroup.add(segGroup);
  }

  // Namsan Cable Car (남산 케이블카 - twin cables + 2 crimson gondolas)
  const cableStart = new THREE.Vector3(-28, 12.2, -52);
  const cableEnd = new THREE.Vector3(-15, 45.2, -96);
  const cableDir = new THREE.Vector3().subVectors(cableEnd, cableStart);
  const cableLen = cableDir.length();
  const cableMid = new THREE.Vector3().addVectors(cableStart, cableEnd).multiplyScalar(0.5);

  const lowerStation = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 6), materials.modernConcrete);
  lowerStation.position.copy(cableStart).setY(10.8);
  namsanGroup.add(lowerStation);

  [-0.9, 0.9].forEach((offsetX, idx) => {
    const cableCurve = new THREE.LineCurve3(
      cableStart.clone().add(new THREE.Vector3(offsetX, 0, 0)),
      cableEnd.clone().add(new THREE.Vector3(offsetX, 0, 0))
    );
    const cableMesh = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 4, 0.09, 6, false),
      materials.modernMullion
    );
    namsanGroup.add(cableMesh);

    // Suspended Cable Car Gondola
    const tGondola = idx === 0 ? 0.38 : 0.68;
    const gPos = new THREE.Vector3().lerpVectors(cableStart, cableEnd, tGondola);
    gPos.x += offsetX;
    const gondola = new THREE.Group();
    gondola.position.copy(gPos);
    const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), materials.modernMullion);
    hanger.position.y = -0.7;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 2.8), materials.namsanSpireRed);
    cabin.position.y = -2.1;
    const glassBand = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.7, 2.4), materials.modernGlass);
    glassBand.position.y = -1.95;
    gondola.add(hanger, cabin, glassBand);
    namsanGroup.add(gondola);
  });
  // Preserve unused calc suppression cleanly
  void cableLen;
  void cableMid;

  // ========================================================
  // 6. Namsan Summit Plaza, Palgakjeong Pavilion & N Seoul Tower (남산서울타워 & 팔각정)
  // ========================================================
  const summitGroup = new THREE.Group();
  summitGroup.position.set(0, 45.8, -102);

  // Summit Granite Observation Deck
  const summitPlaza = new THREE.Mesh(
    new THREE.CylinderGeometry(18.5, 21.5, 2.4, 8),
    materials.granite
  );
  summitPlaza.position.y = 0;
  summitPlaza.receiveShadow = true;
  summitGroup.add(summitPlaza);

  // Traditional Palgakjeong Octagonal Pavilion (남산 팔각정)
  const palgakGroup = new THREE.Group();
  palgakGroup.position.set(-10.5, 1.2, 6.0);
  const pPlinth = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.9, 8), materials.granite);
  pPlinth.position.y = 0.45;
  palgakGroup.add(pPlinth);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.0, 8), materials.pillarCrimson);
    col.position.set(Math.cos(a) * 3.2, 2.4, Math.sin(a) * 3.2);
    palgakGroup.add(col);
  }
  const pRoofLower = new THREE.Mesh(new THREE.ConeGeometry(5.6, 1.8, 8), materials.giwaRoof);
  pRoofLower.position.y = 4.6;
  const pRoofUpper = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.5, 8), materials.giwaRoof);
  pRoofUpper.position.y = 6.0;
  const pFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 0.9, 8), materials.goldLeaf);
  pFinial.position.y = 7.1;
  palgakGroup.add(pRoofLower, pRoofUpper, pFinial);
  summitGroup.add(palgakGroup);

  // N Seoul Tower (남산서울타워 - Composite 10-part Icon)
  const tower = new THREE.Group();
  tower.name = 'n_seoul_tower';
  tower.position.set(3.0, 1.2, 0);

  // 1) Multi-story Octagonal Plaza Base Building
  const baseBuilding = new THREE.Mesh(
    new THREE.CylinderGeometry(8.6, 9.2, 5.5, 8),
    materials.modernConcrete
  );
  baseBuilding.position.y = 2.75;
  baseBuilding.castShadow = true;
  baseBuilding.receiveShadow = true;

  const baseGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(8.8, 8.8, 2.4, 8),
    materials.modernGlass
  );
  baseGlass.position.y = 3.2;

  // 2) Slender Concrete Tower Shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(2.05, 2.55, 40, 20),
    materials.modernConcrete
  );
  shaft.position.y = 25.5;
  shaft.castShadow = true;

  // 3) Flared Structural Collar supporting the Observation Pod
  const podCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 2.1, 4.2, 24),
    materials.bridgeSteel
  );
  podCollar.position.y = 47.0;
  podCollar.castShadow = true;

  // 4) Iconic 360-degree Revolving Restaurant & Observatory Pod
  const podBody = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 6.2, 9.8, 24),
    materials.namsanTowerPod
  );
  podBody.position.y = 53.8;
  podBody.castShadow = true;

  // 5) Glowing Cyan/Amber Seoul Beacon Accent Rings
  const podLowerRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.3, 0.28, 8, 32),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.1,
    })
  );
  podLowerRing.rotation.x = Math.PI * 0.5;
  podLowerRing.position.y = 49.2;

  const podUpperRing = new THREE.Mesh(
    new THREE.TorusGeometry(7.25, 0.28, 8, 32),
    materials.lanternGlow
  );
  podUpperRing.rotation.x = Math.PI * 0.5;
  podUpperRing.position.y = 58.6;

  // 6) Upper Observation Terrace Cap & Broadcast Housing
  const podRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 7.2, 2.2, 24),
    materials.bridgeSteel
  );
  podRoof.position.y = 59.8;

  const broadcastDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 3.6, 5.2, 16),
    materials.modernConcrete
  );
  broadcastDrum.position.y = 63.4;

  // 7) Segmented Red & White Steel Antenna Spire Mast (rising to local Y=85 -> world Y=132)
  const mastSegments = [
    { y: 69, h: 6.5, rBot: 1.15, rTop: 0.9, mat: materials.namsanSpireRed },
    { y: 75, h: 5.8, rBot: 0.9, rTop: 0.65, mat: materials.modernConcrete },
    { y: 80.5, h: 5.5, rBot: 0.65, rTop: 0.4, mat: materials.namsanSpireRed },
    { y: 85.5, h: 4.8, rBot: 0.35, rTop: 0.14, mat: materials.modernConcrete },
  ];
  mastSegments.forEach((seg) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(seg.rTop, seg.rBot, seg.h, 12), seg.mat);
    m.position.y = seg.y;
    m.castShadow = true;
    tower.add(m);
  });

  // Aviation Warning Beacon at Spire Apex
  const apexBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0xff3b30,
      emissiveIntensity: 1.5,
    })
  );
  apexBeacon.position.y = 88.2;

  tower.add(
    baseBuilding,
    baseGlass,
    shaft,
    podCollar,
    podBody,
    podLowerRing,
    podUpperRing,
    podRoof,
    broadcastDrum,
    apexBeacon
  );
  summitGroup.add(tower);
  namsanGroup.add(summitGroup);

  root.add(namsanGroup);

  return root;
}
