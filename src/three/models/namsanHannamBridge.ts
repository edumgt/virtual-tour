import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createRealisticBroadleafTrunkGeometry,
  createRealisticBroadleafCrownGeometry,
  createKoreanPineTrunkGeometry,
  createKoreanPineCrownGeometry,
} from './realisticTrees';

/**
 * Evaluates exact elevation on the Mt. Namsan foothills & summit slope
 * so trees, city wall segments, cable car pylon, and rock crags sit flush on the terrain.
 */
function getNamsanHeight(x: number, z: number): number {
  if (z > -50) return 0;
  const dx = x / 96;
  const dz = (z + 102) / 56;
  const mainDistSq = dx * dx + dz * dz;
  const mainPeak = Math.max(0, 1 - mainDistSq) * 46.5;

  const westDistSq = ((x + 76) / 68) ** 2 + ((z + 106) / 52) ** 2;
  const westPeak = Math.max(0, 1 - westDistSq) * 30.5;

  const eastDistSq = ((x - 78) / 70) ** 2 + ((z + 104) / 52) ** 2;
  const eastPeak = Math.max(0, 1 - eastDistSq) * 28.5;

  const baseH = Math.max(mainPeak, westPeak, eastPeak);
  if (baseH <= 1.2) return baseH;

  // Flatten summit crown slightly around (0, -102) so plaza sits cleanly
  const summitDist = Math.hypot(x, z + 102);
  const summitFlatten = THREE.MathUtils.smoothstep(summitDist, 14, 28);
  const ridgeNoise =
    (Math.sin(x * 0.11) * Math.cos(z * 0.13) * 1.6 +
      Math.sin(x * 0.24 - z * 0.19) * 0.65) *
    summitFlatten;

  return Math.max(0, baseH + ridgeNoise);
}

/**
 * Builds a graceful concave octagonal Korean pavilion roof (팔각지붕)
 * using LatheGeometry with 8 radial segments and upturned eaves flair.
 */
function createOctagonalKoreanRoof(
  outerRadius: number,
  topRadius: number,
  height: number,
  materials: PalaceMaterials
): THREE.Group {
  const roofGroup = new THREE.Group();

  // Concave eaves profile from apex down to gently upturned eaves tip
  const profile: THREE.Vector2[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = eaves outer tip, 1 = top apex
    const r = THREE.MathUtils.lerp(outerRadius, topRadius, Math.pow(t, 0.92));
    // Concave sagging curve with slight eaves lift at t near 0
    const y = Math.pow(t, 1.55) * height + Math.pow(1 - t, 3.2) * 0.22;
    profile.push(new THREE.Vector2(r, y));
  }
  const roofGeo = new THREE.LatheGeometry(profile, 8);
  roofGeo.computeVertexNormals();
  const roofMesh = new THREE.Mesh(roofGeo, materials.giwaRoof);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofGroup.add(roofMesh);

  // Under-eaves Dancheong soffit apron
  const soffit = new THREE.Mesh(
    new THREE.CylinderGeometry(outerRadius * 0.72, outerRadius * 0.94, 0.22, 8),
    materials.dancheong
  );
  soffit.position.y = 0.08;
  roofGroup.add(soffit);

  // 8 sculpted corner hip ridges (추녀마루) hugging exact apex-to-eaves slope
  const upAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const topPt = new THREE.Vector3(Math.cos(angle) * topRadius, height + 0.04, Math.sin(angle) * topRadius);
    const eavesPt = new THREE.Vector3(Math.cos(angle) * outerRadius, 0.24, Math.sin(angle) * outerRadius);
    const dir = new THREE.Vector3().subVectors(eavesPt, topPt);
    const len = dir.length();
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, len, 0.2),
      materials.giwaRoof
    );
    ridge.position.addVectors(topPt, eavesPt).multiplyScalar(0.5);
    ridge.quaternion.setFromUnitVectors(upAxis, dir.clone().normalize());
    roofGroup.add(ridge);
  }

  return roofGroup;
}

/**
 * Builds a faceted, stratified Korean granite outcrop geometry (화강암 암반)
 * so mountain boulders read as angular natural rock instead of smooth spheres.
 */
function createGraniteCragGeometry(seed: number): THREE.BufferGeometry {
  const base = new THREE.DodecahedronGeometry(3.0, 1);
  const geo = base.toNonIndexed();
  base.dispose();
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const strata = Math.sin(vy * 1.45 + seed) * 0.22;
    const facet = Math.cos(angle * 3.0 + seed * 1.7) * 0.28 + Math.sin(vx * 0.9 - vz * 0.8 + seed) * 0.24;
    const scaleXZ = 1.0 + facet + strata * 0.5;
    // Flatten underside slightly so crag embeds naturally into slope
    const newY = vy < 0 ? vy * 0.65 : vy * (0.85 + Math.abs(facet) * 0.25);
    pos.setXYZ(i, vx * scaleXZ, newY, vz * scaleXZ);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the highly detailed N Seoul Tower, Mt. Namsan (Palgakjeong, Bongsudae,
 * Hanyangdoseong, Cable Car), Hannam-dong (Leeum Museum, Hannam The Hill, UN Village),
 * and Han River with Twin-Arch Truss Bridge, Nodeul Island, Some Sevit, and Cruise Ferry.
 */
export function buildNamsanHannamBridge(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'namsan_hannam_bridge_root';

  const darkZincMat = new THREE.MeshStandardMaterial({
    color: 0x262c36,
    roughness: 0.4,
    metalness: 0.58,
  });
  const warmTimberMat = new THREE.MeshStandardMaterial({
    color: 0x9c6b43,
    roughness: 0.68,
    metalness: 0.05,
  });
  const wetStoneMat = new THREE.MeshStandardMaterial({
    color: 0x3b4248,
    roughness: 0.35,
    metalness: 0.12,
  });
  const glassRailMat = new THREE.MeshPhysicalMaterial({
    color: 0xcbe4f5,
    roughness: 0.12,
    metalness: 0.1,
    transparent: true,
    opacity: 0.48,
  });
  const highwaySignGreenMat = new THREE.MeshStandardMaterial({
    color: 0x0e6b47,
    roughness: 0.45,
    metalness: 0.15,
  });
  const highwaySignBlueMat = new THREE.MeshStandardMaterial({
    color: 0x15549a,
    roughness: 0.45,
    metalness: 0.15,
  });
  const bikeLaneMat = new THREE.MeshStandardMaterial({
    color: 0x9f4b3e,
    roughness: 0.85,
  });
  const brakeLightMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.9,
  });
  const whiteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.45,
    metalness: 0.1,
  });
  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    roughness: 0.38,
    metalness: 0.72,
  });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.86 });
  const cyanBeaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.1,
  });
  const redBeaconMat = new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    emissive: 0xff3b30,
    emissiveIntensity: 1.5,
  });

  const dummy = new THREE.Object3D();

  // ========================================================
  // 1. Han River Basin, Embankments, Expressways & Hangang Park
  // ========================================================
  const riverBed = new THREE.Mesh(
    new THREE.BoxGeometry(380, 0.08, 108),
    new THREE.MeshStandardMaterial({ color: 0x081e2a, roughness: 0.96 })
  );
  riverBed.position.set(0, 0.04, 62);
  root.add(riverBed);

  // Shimmering subdivided Han River surface (animated waves & sunlit specular glint)
  const riverWater = new THREE.Mesh(
    new THREE.PlaneGeometry(380, 108, 72, 26),
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

  const northBankApron = new THREE.Mesh(
    new THREE.BoxGeometry(380, 0.16, 26),
    materials.modernConcrete
  );
  northBankApron.position.set(0, 0.08, -5);
  northBankApron.receiveShadow = true;

  // Stepped granite embankments with wet waterline band & promenade coping
  [8, 116].forEach((ez) => {
    const isNorth = ez < 50;
    const wetBand = new THREE.Mesh(new THREE.BoxGeometry(380, 0.72, 2.6), wetStoneMat);
    wetBand.position.set(0, 0.36, ez + (isNorth ? 0.2 : -0.2));

    const embWall = new THREE.Mesh(new THREE.BoxGeometry(380, 1.45, 2.2), materials.granite);
    embWall.position.set(0, 1.15, ez);
    embWall.receiveShadow = true;

    const embCap = new THREE.Mesh(new THREE.BoxGeometry(380, 0.24, 2.7), materials.granitePlinth);
    embCap.position.set(0, 1.95, ez);
    root.add(wetBand, embWall, embCap);
  });

  root.add(southBankLawn, northBankApron);

  // Hangang Park Red-Ochre Cycling Lane & Riverside Promenade (South Bank Z = 118.6)
  const bikeLane = new THREE.Mesh(new THREE.BoxGeometry(360, 0.08, 3.2), bikeLaneMat);
  bikeLane.position.set(0, 0.2, 118.6);
  bikeLane.receiveShadow = true;
  const bikeStripe = new THREE.Mesh(new THREE.BoxGeometry(360, 0.09, 0.16), whiteTrimMat);
  bikeStripe.position.set(0, 0.21, 118.6);
  root.add(bikeLane, bikeStripe);

  // South Hangang Park Timber Viewing Decks, Shade Pergolas & Picnic Tents
  [-46, 38].forEach((dx) => {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 6.5), materials.woodDeck);
    deck.position.set(dx, 2.1, 115.6);
    deck.castShadow = true;
    deck.receiveShadow = true;
    root.add(deck);

    // Timber shade pergola behind deck
    const pergGroup = new THREE.Group();
    pergGroup.position.set(dx, 0.14, 140);
    [-3.2, 3.2].forEach((px) => {
      [-1.8, 1.8].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.2, 0.24), warmTimberMat);
        post.position.set(px, 1.6, pz);
        pergGroup.add(post);
      });
    });
    for (let s = -3.4; s <= 3.4; s += 0.85) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 4.4), warmTimberMat);
      slat.position.set(s, 3.28, 0);
      pergGroup.add(slat);
    }
    root.add(pergGroup);
  });

  // Colorful Hangang Park Picnic Shade Tents along the green lawn
  const tentColors = [0xf59e0b, 0x38bdf8, 0xf472b6, 0x34d399, 0xfef08a, 0xa78bfa];
  const tentCoords: [number, number][] = [
    [-72, 146], [-64, 152], [-56, 145], [-34, 154],
    [28, 148], [46, 155], [58, 146], [76, 150],
  ];
  tentCoords.forEach(([tx, tz], i) => {
    const tentMat = new THREE.MeshStandardMaterial({
      color: tentColors[i % tentColors.length],
      roughness: 0.72,
    });
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.5, 4), tentMat);
    tent.rotation.y = Math.PI * 0.25 + i * 0.4;
    tent.position.set(tx, 0.88, tz);
    tent.castShadow = true;
    root.add(tent);
  });

  // Gangbyeonbuk-ro (North Z = 0) & Olympic-daero (South Z = 128) with Concrete Jersey Medians
  [0, 128].forEach((rz) => {
    const highway = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.14, 380), materials.asphaltRoad);
    highway.rotation.y = Math.PI * 0.5;
    highway.position.set(0, 0.18, rz);
    highway.receiveShadow = true;

    // Concrete Jersey median barrier (split cleanly at X = -14..14 under bridge ramps)
    [-98, 98].forEach((mx) => {
      const median = new THREE.Mesh(new THREE.BoxGeometry(168, 0.85, 0.65), materials.modernConcrete);
      median.position.set(mx, 0.62, rz);
      root.add(median);
    });
    root.add(highway);
  });

  // Korean Highway Overhead Steel-Truss Gantry Signs on Gangbyeonbuk-ro & Olympic-daero
  const buildHighwayGantry = (gx: number, gz: number, isBlue: boolean) => {
    const gantry = new THREE.Group();
    gantry.position.set(gx, 0.18, gz);
    [-9.2, 9.2].forEach((pz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 7.6, 8), materials.bridgeSteel);
      leg.position.set(0, 3.8, pz);
      gantry.add(leg);
    });
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 18.8), materials.bridgeSteel);
    topBeam.position.set(0, 7.5, 0);
    const botBeam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 18.8), materials.bridgeSteel);
    botBeam.position.set(0, 6.4, 0);
    gantry.add(topBeam, botBeam);

    // Two overhead directional signboards with crisp white border frames
    [-4.2, 4.2].forEach((sz) => {
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 2.1, 5.4),
        isBlue ? highwaySignBlueMat : highwaySignGreenMat
      );
      board.position.set(0.32, 6.95, sz);
      const borderTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 5.5), whiteTrimMat);
      borderTop.position.set(0.34, 7.95, sz);
      const borderBot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 5.5), whiteTrimMat);
      borderBot.position.set(0.34, 5.95, sz);
      const textStrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 3.4), whiteTrimMat);
      textStrip.position.set(0.35, 7.1, sz);
      const subStrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 2.2), whiteTrimMat);
      subStrip.position.set(0.35, 6.55, sz);
      gantry.add(board, borderTop, borderBot, textStrip, subStrip);
    });
    return gantry;
  };
  root.add(
    buildHighwayGantry(-44, 0, false),
    buildHighwayGantry(46, 0, true),
    buildHighwayGantry(-44, 128, true),
    buildHighwayGantry(46, 128, false)
  );

  // ========================================================
  // 2. Grand Han River Twin-Arch Truss Bridge (한강대교 정밀 모델링)
  // ========================================================
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'hangang_bridge';

  // Composite bridge deck (Z = 6..118, roadway top Y = 6.29)
  const bridgeDeck = new THREE.Mesh(
    new THREE.BoxGeometry(20.6, 0.92, 112),
    materials.modernConcrete
  );
  bridgeDeck.position.set(0, 5.8, 62);
  bridgeDeck.castShadow = true;
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);

  // Underside steel box-girder longitudinal I-beams & cantilevered deck fascia
  [-7.2, -2.4, 2.4, 7.2].forEach((gx) => {
    const girder = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.05, 111.5),
      materials.bridgeSteel
    );
    girder.position.set(gx, 4.95, 62);
    bridgeGroup.add(girder);
  });

  // Main asphalt roadway & center concrete safety median
  const bridgeAsphalt = new THREE.Mesh(
    new THREE.BoxGeometry(16.4, 0.08, 112.2),
    materials.asphaltRoad
  );
  bridgeAsphalt.position.set(0, 6.29, 62);
  bridgeAsphalt.receiveShadow = true;
  bridgeGroup.add(bridgeAsphalt);

  const bridgeCenterMedian = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.56, 111.8),
    materials.modernConcrete
  );
  bridgeCenterMedian.position.set(0, 6.56, 62);
  bridgeGroup.add(bridgeCenterMedian);

  // Bridge expansion joints at pier lines
  [14, 38, 62, 86, 110].forEach((ez) => {
    const joint = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.1, 0.35), darkIronMat);
    joint.position.set(0, 6.3, ez);
    bridgeGroup.add(joint);
  });

  // Pedestrian sidewalks & OPEN-SLAT architectural steel balustrades along West & East edges
  [-9.15, 9.15].forEach((sx) => {
    const edgeSign = sx > 0 ? 1 : -1;
    const railX = sx + edgeSign * 0.85;

    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 112), materials.granite);
    sidewalk.position.set(sx, 6.35, 62);
    sidewalk.receiveShadow = true;
    bridgeGroup.add(sidewalk);

    // Low granite edge curb
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 112), materials.granitePlinth);
    curb.position.set(railX, 6.52, 62);
    bridgeGroup.add(curb);

    // Top brushed-steel handrail & middle horizontal safety bar (leaves open vista to river!)
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 112), materials.bridgeSteel);
    topRail.position.set(railX, 7.45, 62);
    const midRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 112), materials.bridgeSteel);
    midRail.position.set(railX, 7.0, 62);
    bridgeGroup.add(topRail, midRail);
  });

  // Instanced bridge balustrade vertical stanchion posts (both sides)
  const postZList: number[] = [];
  for (let z = 7; z <= 117; z += 2.75) {
    postZList.push(z);
  }
  const railPostGeo = new THREE.BoxGeometry(0.09, 0.92, 0.09);
  const railPostInst = new THREE.InstancedMesh(
    railPostGeo,
    materials.bridgeSteel,
    postZList.length * 2
  );
  let rpIdx = 0;
  postZList.forEach((pz) => {
    [-10.0, 10.0].forEach((px) => {
      dummy.position.set(px, 6.98, pz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      railPostInst.setMatrixAt(rpIdx++, dummy.matrix);
    });
  });
  railPostInst.instanceMatrix.needsUpdate = true;
  railPostInst.computeBoundingSphere();
  bridgeGroup.add(railPostInst);

  // South & North sloped approach ramps connecting bridge deck (Y=6.29) cleanly to ground
  const rampLength = 30;
  const rampSlopeAngle = Math.atan2(6.05, rampLength);
  const rampHyp = Math.hypot(6.05, rampLength);

  const addApproachRamp = (zCenter: number, slopeRotX: number) => {
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(20.2, 0.9, rampHyp),
      materials.modernConcrete
    );
    ramp.position.set(0, 3.0, zCenter);
    ramp.rotation.x = slopeRotX;
    ramp.receiveShadow = true;

    const rampRoad = new THREE.Mesh(
      new THREE.BoxGeometry(16.4, 0.08, rampHyp),
      materials.asphaltRoad
    );
    rampRoad.position.set(0, 3.49, zCenter);
    rampRoad.rotation.x = slopeRotX;

    bridgeGroup.add(ramp, rampRoad);

    // Ramp edge low concrete parapet barriers
    [-9.6, 9.6].forEach((rx) => {
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.85, rampHyp),
        materials.modernConcrete
      );
      barrier.position.set(rx, 3.88, zCenter);
      barrier.rotation.x = slopeRotX;
      bridgeGroup.add(barrier);
    });
  };
  addApproachRamp(132.5, rampSlopeAngle);
  addApproachRamp(-8.5, -rampSlopeAngle);

  // 5 Stepped Granite River Piers with Wet Waterline Band, V-Cutwaters & Bearing Pads
  const pierZCoords = [14, 38, 62, 86, 110];
  pierZCoords.forEach((pz) => {
    [-6.6, 6.6].forEach((px) => {
      // Wet waterline granite footing collar
      const footing = new THREE.Mesh(
        new THREE.CylinderGeometry(2.35, 2.65, 1.3, 12),
        wetStoneMat
      );
      footing.position.set(px, 0.65, pz);
      bridgeGroup.add(footing);

      // Hydrodynamic granite V-cutwater prow aligned East-West with river flow
      const cutwater = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 2.55, 2.5, 4),
        materials.coastalRock
      );
      cutwater.rotation.y = Math.PI * 0.25;
      cutwater.scale.set(1.85, 1, 0.92);
      cutwater.position.set(px, 1.45, pz);
      cutwater.castShadow = true;
      cutwater.receiveShadow = true;
      bridgeGroup.add(cutwater);

      // Tapered granite pier shaft
      const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(1.45, 1.95, 3.8, 12),
        materials.granitePlinth
      );
      pier.position.set(px, 3.2, pz);
      pier.castShadow = true;
      pier.receiveShadow = true;
      bridgeGroup.add(pier);

      // Steel elastomeric bearing shoes supporting box girders
      const bearing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.36, 1.6), darkIronMat);
      bearing.position.set(px, 5.26, pz);
      bridgeGroup.add(bearing);
    });

    // Sculpted cross pier cap beam
    const cap = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.85, 3.2), materials.modernConcrete);
    cap.position.set(0, 4.72, pz);
    cap.castShadow = true;
    bridgeGroup.add(cap);
  });

  // Double-Chord Parabolic Steel Truss Arch Spans (South Arch Z=62..110, North Arch Z=14..62)
  const addDoubleChordArchSpan = (zStart: number, zEnd: number) => {
    const zMid = (zStart + zEnd) * 0.5;
    const upperPeakY = 24.4;
    const lowerPeakY = 21.3;
    const segCount = 12;

    [-9.75, 9.75].forEach((ax) => {
      // Upper parabolic box chord
      const upperCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(ax, 6.9, zStart),
        new THREE.Vector3(ax, upperPeakY * 1.72, zMid),
        new THREE.Vector3(ax, 6.9, zEnd)
      );
      const upperChord = new THREE.Mesh(
        new THREE.TubeGeometry(upperCurve, 32, 0.46, 8, false),
        materials.bridgeSteel
      );
      upperChord.castShadow = true;
      bridgeGroup.add(upperChord);

      // Lower parabolic box chord
      const lowerCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(ax, 6.2, zStart),
        new THREE.Vector3(ax, lowerPeakY * 1.68, zMid),
        new THREE.Vector3(ax, 6.2, zEnd)
      );
      const lowerChord = new THREE.Mesh(
        new THREE.TubeGeometry(lowerCurve, 32, 0.42, 8, false),
        materials.bridgeSteel
      );
      lowerChord.castShadow = true;
      bridgeGroup.add(lowerChord);

      // Heavy pin-bearing steel gusset shoes at both arch feet
      [zStart, zEnd].forEach((az) => {
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.45, 2.2), darkIronMat);
        shoe.position.set(ax, 6.55, az);
        bridgeGroup.add(shoe);
      });

      const uPts: THREE.Vector3[] = [];
      const lPts: THREE.Vector3[] = [];
      for (let i = 0; i <= segCount; i++) {
        const t = i / segCount;
        uPts.push(upperCurve.getPoint(t));
        lPts.push(lowerCurve.getPoint(t));
      }

      const upVec = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < segCount; i++) {
        // Warren diagonal truss web between upper & lower chords
        const aPt = i % 2 === 0 ? lPts[i] : uPts[i];
        const bPt = i % 2 === 0 ? uPts[i + 1] : lPts[i + 1];
        const webVec = new THREE.Vector3().subVectors(bPt, aPt);
        const webLen = webVec.length();
        if (webLen > 0.3) {
          const strut = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, webLen, 6),
            materials.bridgeSteel
          );
          strut.position.addVectors(aPt, bPt).multiplyScalar(0.5);
          strut.quaternion.setFromUnitVectors(upVec, webVec.clone().normalize());
          bridgeGroup.add(strut);
        }

        // Vertical post between lower & upper chord at each node
        if (i > 0) {
          const postVec = new THREE.Vector3().subVectors(uPts[i], lPts[i]);
          const postLen = postVec.length();
          if (postLen > 0.25) {
            const vPost = new THREE.Mesh(
              new THREE.CylinderGeometry(0.1, 0.1, postLen, 6),
              materials.bridgeSteel
            );
            vPost.position.addVectors(uPts[i], lPts[i]).multiplyScalar(0.5);
            vPost.quaternion.setFromUnitVectors(upVec, postVec.clone().normalize());
            bridgeGroup.add(vPost);
          }

          // Twin tension hanger cables dropping from lower arch chord down to bridge deck
          const cableLen = Math.max(0.5, lPts[i].y - 6.2);
          [-0.22, 0.22].forEach((zOff) => {
            const cable = new THREE.Mesh(
              new THREE.CylinderGeometry(0.065, 0.065, cableLen, 6),
              materials.bridgeSteel
            );
            cable.position.set(lPts[i].x, 6.2 + cableLen * 0.5, lPts[i].z + zOff);
            bridgeGroup.add(cable);
          });

          // Steel cable anchor collar on bridge edge
          const collar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.85), darkIronMat);
          collar.position.set(lPts[i].x, 6.32, lPts[i].z);
          bridgeGroup.add(collar);
        }
      }
    });

    // Overhead X-braced lateral portal frames connecting West & East arches (clear height > Y=15.5)
    const portalTs = [0.24, 0.37, 0.5, 0.63, 0.76];
    const upAxis = new THREE.Vector3(0, 1, 0);
    portalTs.forEach((t, idx) => {
      const yUpper = 6.9 + 4 * t * (1 - t) * (upperPeakY * 0.86 - 6.9);
      const yLower = 6.2 + 4 * t * (1 - t) * (lowerPeakY * 0.84 - 6.2);
      const zPos = zStart + (zEnd - zStart) * t;

      const topCross = new THREE.Mesh(
        new THREE.BoxGeometry(19.8, 0.44, 0.55),
        materials.bridgeSteel
      );
      topCross.position.set(0, yUpper, zPos);
      bridgeGroup.add(topCross);

      const botCross = new THREE.Mesh(
        new THREE.BoxGeometry(19.8, 0.32, 0.42),
        materials.bridgeSteel
      );
      botCross.position.set(0, yLower, zPos);
      bridgeGroup.add(botCross);

      // Wind-bracing X-diagonals between consecutive overhead portal beams
      if (idx < portalTs.length - 1) {
        const tNext = portalTs[idx + 1];
        const yNext = 6.9 + 4 * tNext * (1 - tNext) * (upperPeakY * 0.86 - 6.9);
        const zNext = zStart + (zEnd - zStart) * tNext;
        const p1 = new THREE.Vector3(-9.5, yUpper, zPos);
        const p2 = new THREE.Vector3(9.5, yNext, zNext);
        const p3 = new THREE.Vector3(9.5, yUpper, zPos);
        const p4 = new THREE.Vector3(-9.5, yNext, zNext);

        [
          [p1, p2],
          [p3, p4],
        ].forEach(([a, b]) => {
          const v = new THREE.Vector3().subVectors(b, a);
          const diag = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, v.length(), 5),
            materials.bridgeSteel
          );
          diag.position.addVectors(a, b).multiplyScalar(0.5);
          diag.quaternion.setFromUnitVectors(upAxis, v.clone().normalize());
          bridgeGroup.add(diag);
        });
      }
    });
  };

  addDoubleChordArchSpan(14, 62);
  addDoubleChordArchSpan(62, 110);

  // Curved Bridge Streetlamps along West & East sidewalks (InstancedMesh)
  const bridgeLampZ: number[] = [];
  for (let z = 12; z <= 112; z += 14) {
    bridgeLampZ.push(z);
  }
  const lampPoleGeo = new THREE.CylinderGeometry(0.09, 0.14, 4.7, 6);
  const lampArmGeo = new THREE.BoxGeometry(1.1, 0.1, 0.1);
  const lampHeadGeo = new THREE.BoxGeometry(0.75, 0.16, 0.34);
  const bridgePoles = new THREE.InstancedMesh(
    lampPoleGeo,
    materials.modernMullion,
    bridgeLampZ.length * 2
  );
  const bridgeArms = new THREE.InstancedMesh(
    lampArmGeo,
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
    [-8.85, 8.85].forEach((lx) => {
      const inward = lx > 0 ? -1 : 1;
      dummy.position.set(lx, 8.7, lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bridgePoles.setMatrixAt(lIdx, dummy.matrix);

      dummy.position.set(lx + inward * 0.52, 11.0, lz);
      dummy.rotation.set(0, 0, inward * 0.14);
      dummy.updateMatrix();
      bridgeArms.setMatrixAt(lIdx, dummy.matrix);

      dummy.position.set(lx + inward * 0.96, 11.06, lz);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bridgeHeads.setMatrixAt(lIdx, dummy.matrix);
      lIdx++;
    });
  });
  bridgePoles.instanceMatrix.needsUpdate = true;
  bridgeArms.instanceMatrix.needsUpdate = true;
  bridgeHeads.instanceMatrix.needsUpdate = true;
  bridgePoles.computeBoundingSphere();
  bridgeArms.computeBoundingSphere();
  bridgeHeads.computeBoundingSphere();
  bridgeGroup.add(bridgePoles, bridgeArms, bridgeHeads);

  // Detailed Seoul Vehicles crossing the Han River Bridge (Buses & Sedans with lights & roof pods)
  const bridgeTraffic: { x: number; z: number; rotY: number; color: number; isBus?: boolean }[] = [
    { x: -3.2, z: 78, rotY: 0, color: 0x2563eb, isBus: true }, // Seoul Blue Trunk Bus
    { x: -6.0, z: 58, rotY: 0, color: 0xf8fafc },
    { x: -2.8, z: 36, rotY: 0, color: 0x1e293b },
    { x: 3.1, z: 28, rotY: Math.PI, color: 0x16a34a, isBus: true }, // Seoul Green Branch Bus
    { x: 5.8, z: 66, rotY: Math.PI, color: 0xe2e8f0 },
    { x: 3.0, z: 96, rotY: Math.PI, color: 0x991b1b },
  ];

  bridgeTraffic.forEach((v) => {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: v.color,
      roughness: 0.3,
      metalness: 0.45,
    });
    const w = v.isBus ? 2.45 : 1.88;
    const h = v.isBus ? 2.45 : 0.85;
    const l = v.isBus ? 7.6 : 4.4;

    if (v.isBus) {
      const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, 1.15, l), bodyMat);
      lowerBody.position.y = 0.95;
      lowerBody.castShadow = true;

      const windowBand = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.98, 1.05, l * 0.94),
        materials.modernGlass
      );
      windowBand.position.y = 2.02;

      const roofCap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.34, l * 0.98), whiteTrimMat);
      roofCap.position.y = 2.7;

      const acPod = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, 0.32, 2.2), whiteTrimMat);
      acPod.position.set(0, 3.02, -0.4);

      const ledSign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.08), materials.lanternGlow);
      ledSign.position.set(0, 2.52, -l * 0.5 - 0.02);

      car.add(lowerBody, windowBand, roofCap, acPod, ledSign);
    } else {
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), bodyMat);
      chassis.position.y = h * 0.5 + 0.32;
      chassis.castShadow = true;

      const greenhouse = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.84, 0.62, l * 0.54),
        materials.modernGlass
      );
      greenhouse.position.set(0, h + 0.56, 0.15);

      const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.08, l * 0.44), bodyMat);
      roofPanel.position.set(0, h + 0.88, 0.15);

      car.add(chassis, greenhouse, roofPanel);
    }

    // Headlights & red brake taillights
    [-w * 0.34, w * 0.34].forEach((lx) => {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.08), materials.lanternGlow);
      head.position.set(lx, 0.72, -l * 0.5 - 0.03);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.08), brakeLightMat);
      tail.position.set(lx, 0.76, l * 0.5 + 0.03);
      car.add(head, tail);
    });

    // 4 rubber tires with silver wheel hubs seated cleanly on asphalt
    const wheelR = v.isBus ? 0.42 : 0.32;
    [-w * 0.47, w * 0.47].forEach((wx) => {
      [-l * 0.31, l * 0.31].forEach((wz) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelR, wheelR, 0.24, 10),
          wheelMat
        );
        wheel.rotation.z = Math.PI * 0.5;
        wheel.position.set(wx, wheelR, wz);
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelR * 0.52, wheelR * 0.52, 0.26, 8),
          materials.bridgeSteel
        );
        hub.rotation.z = Math.PI * 0.5;
        hub.position.set(wx, wheelR, wz);
        car.add(wheel, hub);
      });
    });

    car.position.set(v.x, 6.33, v.z);
    car.rotation.y = v.rotY;
    bridgeGroup.add(car);
  });

  // Banpo Moonlight Rainbow Fountain (달빛무지개분수 - Dual Luminous Arcs + River Splash Foam)
  const rainbowMat = new THREE.MeshStandardMaterial({
    color: 0xcffafe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.48,
    transparent: true,
    opacity: 0.7,
    roughness: 0.15,
  });
  const splashMat = new THREE.MeshBasicMaterial({
    color: 0xe0f7ff,
    transparent: true,
    opacity: 0.46,
  });
  for (let z = 20; z <= 104; z += 7) {
    const outerArc = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-10.1, 6.0, z),
      new THREE.Vector3(-14.6, 5.4, z),
      new THREE.Vector3(-18.2, 0.35, z)
    );
    const innerArc = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-10.1, 5.8, z + 1.4),
      new THREE.Vector3(-13.2, 4.4, z + 1.4),
      new THREE.Vector3(-15.6, 0.35, z + 1.4)
    );
    bridgeGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(outerArc, 10, 0.14, 6, false), rainbowMat),
      new THREE.Mesh(new THREE.TubeGeometry(innerArc, 8, 0.1, 5, false), rainbowMat)
    );
    const splash = new THREE.Mesh(new THREE.CircleGeometry(1.15, 10), splashMat);
    splash.rotation.x = -Math.PI * 0.5;
    splash.position.set(-18.0, 0.39, z);
    bridgeGroup.add(splash);
  }

  root.add(bridgeGroup);

  // ========================================================
  // 2B. Nodeul Island Cultural Park (노들섬 복합문화공간, X = -44, Z = 62)
  // ========================================================
  const nodeulGroup = new THREE.Group();
  nodeulGroup.name = 'nodeul_island';
  nodeulGroup.position.set(-44, 0.25, 62);

  // Sculpted elliptical river island plinth with wet stone waterline & grassy park lawn
  const islandWetBase = new THREE.Mesh(new THREE.CylinderGeometry(18, 19.2, 1.0, 16), wetStoneMat);
  islandWetBase.scale.set(1.35, 1, 0.68);
  islandWetBase.position.y = 0.5;

  const islandWall = new THREE.Mesh(new THREE.CylinderGeometry(17.4, 18.0, 1.4, 16), materials.granite);
  islandWall.scale.set(1.35, 1, 0.68);
  islandWall.position.y = 1.6;
  islandWall.receiveShadow = true;

  const islandLawn = new THREE.Mesh(
    new THREE.CylinderGeometry(16.8, 17.0, 0.26, 16),
    materials.namhaeLawn
  );
  islandLawn.scale.set(1.34, 1, 0.66);
  islandLawn.position.y = 2.42;
  islandLawn.receiveShadow = true;

  // Riverside timber promenade deck facing the Han River Bridge
  const nodeulDeck = new THREE.Mesh(new THREE.BoxGeometry(16, 0.28, 5.2), materials.woodDeck);
  nodeulDeck.position.set(11, 2.55, 0);

  // Nodeul Live House Contemporary Pavilion (Cantilevered Zinc/Timber Roof over Glass Hall)
  const liveHallGlass = new THREE.Mesh(new THREE.BoxGeometry(14, 4.4, 7.6), materials.modernGlass);
  liveHallGlass.position.set(-4.5, 4.7, -0.5);
  liveHallGlass.castShadow = true;
  const liveHallWing = new THREE.Mesh(new THREE.BoxGeometry(9, 3.2, 6.2), materials.hannamVilla);
  liveHallWing.position.set(6.5, 4.1, -1.0);
  liveHallWing.castShadow = true;
  const liveHallRoof = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.55, 10.2), darkZincMat);
  liveHallRoof.position.set(-4.0, 7.15, -0.5);
  liveHallRoof.rotation.z = -0.05;
  liveHallRoof.castShadow = true;
  const liveHallSoffit = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.18, 9.8), warmTimberMat);
  liveHallSoffit.position.set(-4.0, 6.84, -0.5);
  liveHallSoffit.rotation.z = -0.05;

  nodeulGroup.add(
    islandWetBase,
    islandWall,
    islandLawn,
    nodeulDeck,
    liveHallGlass,
    liveHallWing,
    liveHallRoof,
    liveHallSoffit
  );
  root.add(nodeulGroup);

  // ========================================================
  // 3. Some Sevit Floating Lotus Pavilions & Marina (세빛섬) + Cruise Ferry
  // ========================================================
  const sevitGroup = new THREE.Group();
  sevitGroup.position.set(66, 0.25, 72);

  const sevitAccentColors = [0x38bdf8, 0xfbbf24, 0xf472b6];
  const islandOffsets: [number, number, number][] = [
    [0, 0, 11.4],   // Gavit
    [-19, 10, 8.8], // Chavit
    [18, 12, 7.8],  // Solvit
  ];
  islandOffsets.forEach(([ix, iz, rad], idx) => {
    const island = new THREE.Group();
    island.position.set(ix, 0, iz);

    // Wide tiered floating pontoon with teak boardwalk rim
    const pontoon = new THREE.Mesh(
      new THREE.CylinderGeometry(rad, rad * 1.06, 0.85, 12),
      materials.modernConcrete
    );
    pontoon.position.y = 0.42;
    const teakRim = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 0.98, rad * 0.98, 0.12, 12),
      materials.woodDeck
    );
    teakRim.position.y = 0.9;

    // Lower glazed lotus drum & upper tapered sculptural glass petal pavilion
    const lowerGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 0.78, rad * 0.7, 2.5, 12),
      materials.lotteTowerGlass
    );
    lowerGlass.position.y = 2.15;
    lowerGlass.castShadow = true;

    const upperGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(rad * 0.56, rad * 0.82, 2.7, 12),
      materials.lotteTowerGlass
    );
    upperGlass.position.y = 4.65;
    upperGlass.castShadow = true;

    // Angled white steel lotus-petal diagrid fins around the exterior
    for (let f = 0; f < 10; f++) {
      const a = (f / 10) * Math.PI * 2;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.2, 0.55), whiteTrimMat);
      fin.position.set(Math.cos(a) * rad * 0.77, 3.4, Math.sin(a) * rad * 0.77);
      fin.rotation.y = -a;
      fin.rotation.z = 0.14;
      island.add(fin);
    }

    // Glowing architectural contour LED rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: sevitAccentColors[idx],
      emissive: sevitAccentColors[idx],
      emissiveIntensity: 0.95,
    });
    const midRing = new THREE.Mesh(new THREE.TorusGeometry(rad * 0.82, 0.16, 6, 24), ringMat);
    midRing.rotation.x = Math.PI * 0.5;
    midRing.position.y = 3.38;

    const crownRing = new THREE.Mesh(
      new THREE.TorusGeometry(rad * 0.58, 0.2, 6, 24),
      materials.lanternGlow
    );
    crownRing.rotation.x = Math.PI * 0.5;
    crownRing.position.y = 6.0;

    island.add(pontoon, teakRim, lowerGlass, upperGlass, midRing, crownRing);
    sevitGroup.add(island);
  });

  // Floating timber pedestrian bridges linking the 3 Some Sevit islands & South Embankment
  const addFloatingBridge = (x1: number, z1: number, x2: number, z2: number) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);
    const bridge = new THREE.Group();
    bridge.position.set((x1 + x2) * 0.5, 0.98, (z1 + z2) * 0.5);
    bridge.rotation.y = angle;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, len), materials.woodDeck);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, len), whiteTrimMat);
    railL.position.set(-1.25, 0.45, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, len), whiteTrimMat);
    railR.position.set(1.25, 0.45, 0);
    bridge.add(deck, railL, railR);
    sevitGroup.add(bridge);
  };
  addFloatingBridge(-11, 6, -4, 2);
  addFloatingBridge(8, 5, 13, 9);
  addFloatingBridge(-19, 18, -19, 43); // Connect Chavit to South Bank (Z=115)
  addFloatingBridge(0, 11, 0, 43);     // Connect Gavit to South Bank

  // 3 Moored White Leisure Yachts beside Some Sevit Marina
  [
    [10, 22, 0.2],
    [16, 24, 0.1],
    [22, 22, -0.15],
  ].forEach(([yx, yz, rot]) => {
    const yacht = new THREE.Group();
    yacht.position.set(yx, 0.3, yz);
    yacht.rotation.y = rot;
    const yHull = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 5.4), whiteTrimMat);
    yHull.position.y = 0.35;
    const yCabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.75, 2.6), materials.modernGlass);
    yCabin.position.set(0, 0.95, -0.4);
    const yMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 4.6, 6), whiteTrimMat);
    yMast.position.set(0, 2.8, 0.3);
    yacht.add(yHull, yCabin, yMast);
    sevitGroup.add(yacht);
  });
  root.add(sevitGroup);

  // Han River Cruise Ferry (한강 유람선 - Multi-Deck Panoramic River Cruiser)
  const ferryGroup = new THREE.Group();
  ferryGroup.position.set(-56, 0.38, 42);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(21, 1.9, 6.4), whiteTrimMat);
  hull.position.y = 1.0;
  hull.castShadow = true;
  const waterlineStripe = new THREE.Mesh(new THREE.BoxGeometry(21.2, 0.45, 6.5), highwaySignBlueMat);
  waterlineStripe.position.y = 0.35;
  const bow = new THREE.Mesh(new THREE.ConeGeometry(3.35, 6.2, 4), whiteTrimMat);
  bow.rotation.z = -Math.PI * 0.5;
  bow.rotation.x = Math.PI * 0.25;
  bow.position.set(13.4, 1.05, 0);
  const deck1Glass = new THREE.Mesh(new THREE.BoxGeometry(16.2, 1.9, 5.6), materials.modernGlass);
  deck1Glass.position.set(-0.5, 2.85, 0);
  const deck2Floor = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.24, 6.0), materials.woodDeck);
  deck2Floor.position.set(-0.4, 3.92, 0);
  const deck2Glass = new THREE.Mesh(new THREE.BoxGeometry(11.6, 1.5, 4.6), materials.modernGlass);
  deck2Glass.position.set(-1.0, 4.78, 0);
  const sunDeck = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.2, 4.9), materials.woodDeck);
  sunDeck.position.set(-1.0, 5.62, 0);
  const wheelhouse = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.45, 3.8), whiteTrimMat);
  wheelhouse.position.set(5.4, 4.72, 0);
  const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.4, 6), whiteTrimMat);
  radarMast.position.set(5.6, 6.5, 0);
  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.68, 1.8, 10),
    materials.namsanSpireRed
  );
  funnel.position.set(-5.8, 6.5, 0);
  // Open safety railings along upper deck
  [-2.85, 2.85].forEach((rz) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.1, 0.08), whiteTrimMat);
    rail.position.set(-0.4, 4.65, rz);
    ferryGroup.add(rail);
  });
  // Layered V-wake foam behind stern
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xe0f7ff,
    transparent: true,
    opacity: 0.44,
  });
  const ferryWake = new THREE.Mesh(new THREE.PlaneGeometry(18, 5.4), wakeMat);
  ferryWake.rotation.x = -Math.PI * 0.5;
  ferryWake.position.set(-18.5, 0.05, 0);
  const wakeInner = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.8), wakeMat);
  wakeInner.rotation.x = -Math.PI * 0.5;
  wakeInner.position.set(-15.0, 0.07, 0);
  ferryGroup.add(
    hull,
    waterlineStripe,
    bow,
    deck1Glass,
    deck2Floor,
    deck2Glass,
    sunDeck,
    wheelhouse,
    radarMast,
    funnel,
    ferryWake,
    wakeInner
  );
  root.add(ferryGroup);

  // ========================================================
  // 4. Hannam-dong Terraced Hillside District (한남동 · 리움미술관 · 한남더힐 · 유엔빌리지)
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

    // Stone coping cornice along the southern retaining wall edge
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(290, 0.34, 0.85),
      materials.granitePlinth
    );
    coping.position.set(0, t.height + 0.06, t.z + t.depth * 0.5 - 0.15);

    const topLawn = new THREE.Mesh(
      new THREE.BoxGeometry(290, 0.16, t.depth - 0.5),
      materials.namhaeLawn
    );
    topLawn.position.set(0, t.height + 0.08, t.z - 0.25);
    topLawn.receiveShadow = true;

    // Low horizontal stone garden planter wall along terrace front
    const railBar = new THREE.Mesh(new THREE.BoxGeometry(290, 0.5, 0.14), darkZincMat);
    railBar.position.set(0, t.height + 0.48, t.z + t.depth * 0.5 - 0.35);

    hannamGroup.add(wall, coping, topLawn, railBar);
  });

  // Central Hannam-daero Sloping Boulevard with landscaped median & warm avenue lamps
  const hannamSlopeAngle = Math.atan2(10.6, 48);
  const hannamRoad = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.25, 50),
    materials.asphaltRoad
  );
  hannamRoad.position.set(0, 5.4, -34);
  hannamRoad.rotation.x = -hannamSlopeAngle;
  hannamRoad.receiveShadow = true;
  hannamGroup.add(hannamRoad);

  // Sloped median planter & avenue streetlamps flanking Hannam-daero
  const medianStrip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 48), materials.granitePlinth);
  medianStrip.position.set(0, 5.65, -34);
  medianStrip.rotation.x = -hannamSlopeAngle;
  hannamGroup.add(medianStrip);

  for (let s = 0; s < 4; s++) {
    const tz = -18 - s * 11;
    const ty = 2.0 + s * 2.55;
    [-8.6, 8.6].forEach((lx) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 6), darkZincMat);
      pole.position.set(lx, ty + 2.1, tz);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.3), materials.lanternGlow);
      glow.position.set(lx + (lx > 0 ? -0.25 : 0.25), ty + 4.2, tz);
      hannamGroup.add(pole, glow);
    });
  }

  // Granite Pedestrian Connecting Staircases linking Terrace A -> B -> C on both flanks
  [-15.5, 15.5].forEach((sx) => {
    const stairA = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 6.2), materials.granitePlinth);
    stairA.position.set(sx, 4.85, -30);
    stairA.rotation.x = -0.52;
    const stairB = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 6.8), materials.granitePlinth);
    stairB.position.set(sx, 8.65, -44);
    stairB.rotation.x = -0.56;
    hannamGroup.add(stairA, stairB);
  });

  // Articulated Hannam-dong Luxury Terraced Villas (Recessed Balconies, Glass Railings, Timber Louvers)
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

    // Dressed granite plinth podium + recessed warm glazed lobby entrance
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(w + 1.4, 1.5, d + 1.4),
      materials.granitePlinth
    );
    podium.position.y = 0.75;
    podium.receiveShadow = true;

    const lobbyGlass = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.42, 1.25, 0.2),
      materials.lanternGlow
    );
    lobbyGlass.position.set(0, 0.78, d * 0.5 + 0.68);
    g.add(podium, lobbyGlass);

    const style = variant % 3;
    const facadeMat = style === 1 ? materials.lotteMallFacade : materials.hannamVilla;

    // Main residential mass
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), facadeMat);
    body.position.y = 1.5 + h * 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // 3D Cantilevered South Balcony Slabs + Frameless Glass Railings facing the Han River
    const floors = Math.max(2, Math.round(h / 3.1));
    for (let f = 1; f < floors; f++) {
      const fy = 1.5 + (f / floors) * h;
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.88, 0.24, 1.35),
        materials.modernConcrete
      );
      slab.position.set(0, fy, d * 0.5 + 0.55);
      slab.castShadow = true;

      const glassBalustrade = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.86, 0.82, 0.08),
        glassRailMat
      );
      glassBalustrade.position.set(0, fy + 0.52, d * 0.5 + 1.18);

      const handrail = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.87, 0.08, 0.1),
        darkZincMat
      );
      handrail.position.set(0, fy + 0.94, d * 0.5 + 1.18);

      g.add(slab, glassBalustrade, handrail);
    }

    // Vertical Cedar Timber Privacy Louvers framing the corners
    [-w * 0.46, -w * 0.42, w * 0.42, w * 0.46].forEach((lx) => {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.16, h * 0.94, 0.45), warmTimberMat);
      louver.position.set(lx, 1.5 + h * 0.5, d * 0.5 + 0.18);
      g.add(louver);
    });

    if (style === 1) {
      // Cantilevered panoramic glass penthouse + deep dark zinc floating canopy
      const glassPenthouse = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.82, 2.7, d * 0.8),
        materials.modernGlass
      );
      glassPenthouse.position.y = 1.5 + h + 1.35;
      glassPenthouse.castShadow = true;
      const roofVisor = new THREE.Mesh(
        new THREE.BoxGeometry(w * 1.04, 0.55, d * 1.04),
        darkZincMat
      );
      roofVisor.position.y = 1.5 + h + 2.95;
      const soffit = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.98, 0.14, d * 0.98),
        warmTimberMat
      );
      soffit.position.y = 1.5 + h + 2.62;
      g.add(glassPenthouse, roofVisor, soffit);
    } else if (style === 2) {
      // Stepped setback travertine terrace + rooftop green garden
      const lowerRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.52, d + 1.2), darkZincMat);
      lowerRoof.position.y = 1.5 + h + 0.26;
      const gardenBed = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.92, 0.2, d * 0.92),
        materials.namhaeLawn
      );
      gardenBed.position.y = 1.5 + h + 0.62;
      const upperBlock = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.64, 3.1, d * 0.68),
        materials.hannamVilla
      );
      upperBlock.position.set(w * 0.1, 1.5 + h + 2.05, -d * 0.08);
      upperBlock.castShadow = true;
      const topRoof = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.72, 0.48, d * 0.76),
        darkZincMat
      );
      topRoof.position.set(w * 0.1, 1.5 + h + 3.82, -d * 0.08);
      g.add(lowerRoof, gardenBed, upperBlock, topRoof);
    } else {
      // Classic Hannam travertine residence + deep zinc cornice + timber slatted pergola
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1.5, 0.68, d + 1.5), darkZincMat);
      roof.position.y = 1.5 + h + 0.34;
      roof.castShadow = true;
      const roofGarden = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.85, 0.18, d * 0.85),
        materials.namhaeLawn
      );
      roofGarden.position.y = 1.5 + h + 0.76;

      // Open timber pergola posts & crossbeams
      const pw = w * 0.5;
      const pd = d * 0.48;
      [-pw * 0.5, pw * 0.5].forEach((px) => {
        [-pd * 0.5, pd * 0.5].forEach((pz) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.9, 0.22), darkZincMat);
          post.position.set(px, 1.5 + h + 1.65, pz);
          g.add(post);
        });
      });
      const pergolaTop = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.6, 0.2, pd + 0.6), warmTimberMat);
      pergolaTop.position.y = 1.5 + h + 2.65;
      g.add(roof, roofGarden, pergolaTop);
    }

    return g;
  };

  // West Hannam Hillside (Hannam The Hill & Embassy Row)
  const westVillas: [number, number, number, number, number, number][] = [
    [-26, 3.16, -23, 14, 7.6, 10],
    [-48, 3.16, -23, 16, 9.2, 10],
    [-74, 3.16, -23, 18, 11.0, 11],
    [-104, 3.16, -24, 20, 13.0, 12],
    [-64, 6.56, -37, 16, 10.6, 10],
    [-92, 6.56, -37, 18, 12.6, 11],
    [-42, 10.76, -51, 15, 8.8, 10],
    [-72, 10.76, -51, 17, 11.2, 10],
  ];
  westVillas.forEach(([x, y, z, w, h, d], idx) => {
    hannamGroup.add(buildHannamResidence(x, y, z, w, h, d, idx));
  });

  // East Hannam Hillside (UN Village & Luxury Terraced Villas overlooking Han River)
  const eastVillas: [number, number, number, number, number, number][] = [
    [24, 3.16, -23, 14, 8.2, 10],
    [48, 3.16, -23, 16, 9.8, 10],
    [76, 3.16, -23, 18, 11.6, 11],
    [106, 3.16, -24, 20, 14.0, 12],
    [32, 6.56, -37, 15, 9.6, 10],
    [60, 6.56, -37, 18, 12.2, 11],
    [90, 6.56, -37, 17, 13.2, 11],
    [40, 10.76, -51, 16, 9.2, 10],
    [74, 10.76, -51, 18, 11.8, 10],
  ];
  eastVillas.forEach(([x, y, z, w, h, d], idx) => {
    hannamGroup.add(buildHannamResidence(x, y, z, w, h, d, idx + 1));
  });

  // Leeum Museum of Art — 3-Architect Contemporary Ensemble (리움미술관, X = -34, Z = -37)
  const museumGroup = new THREE.Group();
  museumGroup.name = 'leeum_museum';
  museumGroup.position.set(-34, 6.56, -37);

  // Raised granite sculpture plaza connecting all 3 museum pavilions
  const mPlaza = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 14), materials.granitePlinth);
  mPlaza.position.set(3.5, 0.3, 0);
  mPlaza.receiveShadow = true;
  museumGroup.add(mPlaza);

  // Museum 1 (Mario Botta): Iconic inverted truncated terracotta cone with horizontal brick courses
  const bottaCone = new THREE.Mesh(
    new THREE.CylinderGeometry(7.6, 5.8, 12.2, 24),
    materials.leeumTerracotta
  );
  bottaCone.position.set(-1.5, 6.6, 0);
  bottaCone.castShadow = true;
  bottaCone.receiveShadow = true;
  museumGroup.add(bottaCone);

  // Horizontal sculptural terracotta banding rings around Mario Botta rotunda
  [2.5, 5.2, 7.9, 10.6].forEach((ry) => {
    const rBand = THREE.MathUtils.lerp(5.8, 7.6, (ry - 0.5) / 12.2) + 0.14;
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(rBand, 0.14, 6, 24),
      materials.leeumTerracotta
    );
    band.rotation.x = Math.PI * 0.5;
    band.position.set(-1.5, ry, 0);
    museumGroup.add(band);
  });

  // Angled glass skylight wedge crowning Museum 1
  const bottaSkylight = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 4.4, 2.5, 16),
    materials.modernGlass
  );
  bottaSkylight.position.set(-1.5, 13.4, 0);
  bottaSkylight.rotation.z = -0.18;
  const bottaCap = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.3, 16), darkZincMat);
  bottaCap.position.set(-1.7, 14.6, 0);
  bottaCap.rotation.z = -0.18;
  museumGroup.add(bottaSkylight, bottaCap);

  // Museum 2 (Jean Nouvel): Cantilevered oxidized dark steel & glass exhibition boxes
  const nouvelBase = new THREE.Mesh(new THREE.BoxGeometry(10.5, 5.4, 8.8), darkZincMat);
  nouvelBase.position.set(8.6, 3.3, -1.2);
  nouvelBase.castShadow = true;
  const nouvelCantilever = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.8, 9.6), darkZincMat);
  nouvelCantilever.position.set(9.8, 7.8, 0.2);
  nouvelCantilever.castShadow = true;
  const nouvelGlass = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.25), materials.modernGlass);
  nouvelGlass.position.set(9.8, 7.8, 5.05);
  museumGroup.add(nouvelBase, nouvelCantilever, nouvelGlass);

  // Rem Koolhaas Black-Box Floating Cultural Pavilion & Outdoor Sculpture Plinth
  const koolhaasBox = new THREE.Mesh(new THREE.BoxGeometry(8.2, 4.2, 5.8), darkIronMat);
  koolhaasBox.position.set(16.2, 5.8, -1.0);
  koolhaasBox.castShadow = true;
  [-2.6, 2.6].forEach((kx) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 4.0, 8), darkZincMat);
    strut.position.set(16.2 + kx, 2.2, -1.0);
    strut.rotation.z = kx > 0 ? 0.22 : -0.22;
    museumGroup.add(strut);
  });
  // Metallic outdoor contemporary sculpture (inspired by Louise Bourgeois / Anish Kapoor court)
  const scPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 12), materials.granite);
  scPlinth.position.set(12.2, 0.85, 4.4);
  const scSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.1 })
  );
  scSphere.position.set(12.2, 2.35, 4.4);
  museumGroup.add(koolhaasBox, scPlinth, scSphere);
  hannamGroup.add(museumGroup);

  // Hannam-dong Terrace & Hangang Park Broadleaf Trees (InstancedMesh)
  const streetTreePositions: [number, number, number][] = [];
  const treeLanes = [
    { z: -16.2, y: 3.16 },
    { z: -30.2, y: 6.56 },
    { z: -44.2, y: 10.76 },
  ];
  treeLanes.forEach((lane) => {
    for (let tx = -114; tx <= 114; tx += 14) {
      if (Math.abs(tx) < 12) continue;
      streetTreePositions.push([tx, lane.y, lane.z]);
    }
  });
  // Add South Hangang Park & Nodeul Island riverside trees into same instanced batch!
  for (let tx = -115; tx <= 115; tx += 18) {
    if (Math.abs(tx) < 16) continue;
    streetTreePositions.push([tx, 0.14, 122.4]);
    streetTreePositions.push([tx + 7, 0.14, 144]);
  }
  // Nodeul Island trees
  [
    [-58, 2.52, 62],
    [-53, 2.52, 69],
    [-34, 2.52, 69],
    [-28, 2.52, 57],
    [-47, 2.52, 54],
  ].forEach(([nx, ny, nz]) => streetTreePositions.push([nx, ny, nz]));

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
    hTreeColor.setHex(
      idx % 6 === 0 ? 0xe59fb2 : idx % 3 === 0 ? 0x3b7644 : idx % 2 === 0 ? 0x4b874d : 0x5c9149
    );
    hCrowns.setColorAt(idx, hTreeColor);
  });
  hTrunks.instanceMatrix.needsUpdate = true;
  hCrowns.instanceMatrix.needsUpdate = true;
  if (hCrowns.instanceColor) hCrowns.instanceColor.needsUpdate = true;
  hTrunks.computeBoundingSphere();
  hCrowns.computeBoundingSphere();
  hannamGroup.add(hTrunks, hCrowns);

  root.add(hannamGroup);

  // ========================================================
  // 5. Mt. Namsan Vertex-Colored Terrain, Sowol-ro, City Wall & Cable Car
  // ========================================================
  const namsanGroup = new THREE.Group();
  namsanGroup.name = 'namsan_mountain';

  // High-resolution sculpted mountain terrain (72x36) with slope & elevation vertex colors
  const mountainGeo = new THREE.PlaneGeometry(374, 132, 72, 36);
  mountainGeo.rotateX(-Math.PI * 0.5);
  mountainGeo.translate(0, 0, -114);
  const posAttr = mountainGeo.attributes.position;
  const vertColors = new Float32Array(posAttr.count * 3);

  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const h = getNamsanHeight(vx, vz);
    posAttr.setY(i, h);
  }
  mountainGeo.computeVertexNormals();

  const normAttr = mountainGeo.attributes.normal;
  const col = new THREE.Color();
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const ny = normAttr.getY(i); // 1 = flat, < 0.85 = steeper rocky slope
    const elev = THREE.MathUtils.clamp(vy / 46, 0, 1);
    const gully = Math.sin(vx * 0.08 + vz * 0.09) * 0.06;

    if (ny < 0.84 && vy > 12) {
      // Exposed Namsan granite rock shoulder
      col.setRGB(0.56 + gully, 0.55 + gully, 0.51 + gully);
    } else {
      // Lush layered pine-moss hillside gradient from valley to summit
      col.setRGB(
        0.58 - elev * 0.1 + gully,
        0.74 - elev * 0.08 + gully,
        0.52 - elev * 0.08 + gully
      );
    }
    vertColors[i * 3] = THREE.MathUtils.clamp(col.r, 0.25, 0.95);
    vertColors[i * 3 + 1] = THREE.MathUtils.clamp(col.g, 0.3, 0.95);
    vertColors[i * 3 + 2] = THREE.MathUtils.clamp(col.b, 0.22, 0.95);
  }
  mountainGeo.setAttribute('color', new THREE.BufferAttribute(vertColors, 3));

  const namsanTerrainMat = materials.namhaeLawn.clone();
  namsanTerrainMat.vertexColors = true;
  const namsanTerrain = new THREE.Mesh(mountainGeo, namsanTerrainMat);
  namsanTerrain.receiveShadow = true;
  namsanTerrain.castShadow = true;
  namsanGroup.add(namsanTerrain);

  // Winding Sowol-ro / Namsan Sunhwan-ro Scenic Loop Road hugging the southern slope
  const sowolPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const angle = THREE.MathUtils.lerp(-Math.PI * 0.18, Math.PI * 1.18, t);
    const rx = Math.cos(angle) * 62;
    const rz = -92 + Math.sin(angle) * 28;
    const ry = getNamsanHeight(rx, rz) + 0.32;
    if (rz < -54 && ry > 4) {
      sowolPoints.push(new THREE.Vector3(rx, ry, rz));
    }
  }
  if (sowolPoints.length >= 4) {
    const sowolCurve = new THREE.CatmullRomCurve3(sowolPoints);
    const sowolMesh = new THREE.Mesh(
      new THREE.TubeGeometry(sowolCurve, 44, 1.35, 6, false),
      materials.asphaltRoad
    );
    sowolMesh.scale.set(1, 0.18, 1);
    sowolMesh.position.y = 0.08;
    namsanGroup.add(sowolMesh);
  }

  // Natural faceted granite ridge outcrops on Mt. Namsan shoulders (화강암 암반)
  const cragCoords: [number, number, number][] = [
    [-38, -92, 1.35],
    [35, -95, 1.3],
    [-68, -104, 1.45],
    [66, -102, 1.4],
    [20, -82, 1.15],
    [-35, -80, 1.1],
    [-48, -110, 1.35],
    [46, -112, 1.25],
  ];
  cragCoords.forEach(([cx, cz, sc], idx) => {
    const cy = getNamsanHeight(cx, cz);
    const crag = new THREE.Mesh(createGraniteCragGeometry(idx * 1.37 + 0.5), materials.coastalRock);
    crag.position.set(cx, cy - 1.15, cz);
    crag.scale.set(sc * 1.75, sc * 0.68, sc * 1.38);
    crag.rotation.set(0.14 * (idx % 3), idx * 0.9, 0.08);
    crag.castShadow = true;
    crag.receiveShadow = true;
    namsanGroup.add(crag);
  });

  // Dense Mt. Namsan Realistic Korean Pine & Broadleaf Forest (230 trees seated flush on terrain)
  const pinePositions: [number, number, number][] = [];
  const broadleafPositions: [number, number, number][] = [];
  for (let i = 0; i < 240; i++) {
    const angle = i * 2.39996;
    const radX = 18 + ((i * 37) % 142);
    const radZ = 10 + ((i * 23) % 48);
    const tx = Math.cos(angle) * radX;
    const tz = -102 + Math.sin(angle) * radZ;
    if (tz > -55 || tz < -166) continue;
    if (Math.hypot(tx, tz + 102) < 23) continue; // Keep summit plaza clear
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
  const pineCrowns = new THREE.InstancedMesh(pineCrownGeo, materials.leafCanopy, pinePositions.length);
  pineTrunks.castShadow = true;
  pineCrowns.castShadow = true;
  pineCrowns.receiveShadow = true;

  const treeColor = new THREE.Color();
  const pinePalette = [0x2a5a34, 0x32663c, 0x244e2d, 0x3b6f40];
  pinePositions.forEach(([tx, ty, tz], idx) => {
    const s = 0.88 + ((idx * 13) % 10) * 0.048;
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
  const leafPalette = [0x457b3d, 0x548b45, 0x3a6c39, 0x708b3b, 0x9b6b37];
  broadleafPositions.forEach(([tx, ty, tz], idx) => {
    const s = 0.85 + ((idx * 17) % 10) * 0.042;
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

  // Hanyangdoseong Seoul City Wall (한양도성 남산 성곽길) climbing smoothly with sloped merlons & loopholes
  const wallSteps = 12;
  for (let i = 0; i < wallSteps; i++) {
    const t0 = i / wallSteps;
    const t1 = (i + 1) / wallSteps;
    const x0 = -66 + t0 * 48;
    const z0 = -65 - t0 * 31;
    const x1 = -66 + t1 * 48;
    const z1 = -65 - t1 * 31;
    const y0 = getNamsanHeight(x0, z0);
    const y1 = getNamsanHeight(x1, z1);

    const mx = (x0 + x1) * 0.5;
    const my = (y0 + y1) * 0.5;
    const mz = (z0 + z1) * 0.5;
    const segHoriz = Math.hypot(x1 - x0, z1 - z0);
    const yaw = Math.atan2(-(z1 - z0), x1 - x0);
    const pitch = Math.atan2(y1 - y0, segHoriz);

    const segGroup = new THREE.Group();
    segGroup.position.set(mx, my, mz);
    segGroup.rotation.y = yaw;

    const wallBody = new THREE.Mesh(
      new THREE.BoxGeometry(segHoriz + 0.55, 4.4, 1.55),
      materials.granite
    );
    wallBody.position.y = 1.4;
    wallBody.rotation.z = pitch * 0.45;
    wallBody.castShadow = true;
    wallBody.receiveShadow = true;

    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(segHoriz + 0.65, 0.28, 1.85),
      materials.granitePlinth
    );
    coping.position.y = 3.65;
    coping.rotation.z = pitch * 0.45;

    segGroup.add(wallBody, coping);

    // 3 crenellated 여장 merlons with dark recessed embrasure loopholes (총안)
    [-segHoriz * 0.32, 0, segHoriz * 0.32].forEach((ox) => {
      const myOff = ox * Math.tan(pitch * 0.45);
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.0, 0.8), materials.granite);
      merlon.position.set(ox, 4.25 + myOff, 0);
      merlon.castShadow = true;
      const loophole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.86), darkIronMat);
      loophole.position.set(ox, 4.2 + myOff, 0);
      segGroup.add(merlon, loophole);
    });

    // Subtle warm wall-wash uplight fixture at base
    if (i % 2 === 0) {
      const uplight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.3), materials.lanternGlow);
      uplight.position.set(0, 0.4, 0.92);
      segGroup.add(uplight);
    }

    namsanGroup.add(segGroup);
  }

  // Namsan Cable Car (남산 케이블카 — Elevated 2-Span Aerial Line over Steel Lattice Pylon, Clear of Slope)
  const cableStart = new THREE.Vector3(-25.5, 18.2, -50);
  const pylonX = -20.5;
  const pylonZ = -72.5;
  const pylonGroundY = getNamsanHeight(pylonX, pylonZ);
  const pylonTopY = pylonGroundY + 13.5;
  const cableMidPylon = new THREE.Vector3(pylonX, pylonTopY, pylonZ);
  const cableEnd = new THREE.Vector3(-15.5, 48.2, -94.0);

  // Lower Boarding Terminal (elevated two-story glazed station)
  const lowerStation = new THREE.Group();
  lowerStation.position.set(cableStart.x, 10.6, cableStart.z);
  const lsBody = new THREE.Mesh(new THREE.BoxGeometry(8.6, 8.2, 7.2), materials.modernConcrete);
  lsBody.position.y = 4.1;
  lsBody.castShadow = true;
  const lsGlass = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.0, 7.4), materials.modernGlass);
  lsGlass.position.y = 5.6;
  const lsRoof = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.6, 8.6), darkZincMat);
  lsRoof.position.y = 8.4;
  lowerStation.add(lsBody, lsGlass, lsRoof);
  namsanGroup.add(lowerStation);

  // Upper Summit Cable Car Station perched cleanly at SW plaza rim
  const upperStation = new THREE.Group();
  upperStation.position.set(cableEnd.x, 44.5, cableEnd.z);
  const usBody = new THREE.Mesh(new THREE.BoxGeometry(7.6, 5.2, 6.6), materials.modernConcrete);
  usBody.position.y = 2.4;
  usBody.castShadow = true;
  const usGlass = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.2, 6.8), materials.modernGlass);
  usGlass.position.y = 3.0;
  const usRoof = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.55, 7.8), darkZincMat);
  usRoof.position.y = 5.2;
  upperStation.add(usBody, usGlass, usRoof);
  namsanGroup.add(upperStation);

  // Tall Steel Lattice-Truss Support Pylon standing cleanly on open mountain slope
  const pylonH = pylonTopY - pylonGroundY + 1.2;
  const pylonGroup = new THREE.Group();
  pylonGroup.position.set(pylonX, pylonGroundY - 0.6, pylonZ);
  [
    [-1.1, -1.1],
    [1.1, -1.1],
    [-1.1, 1.1],
    [1.1, 1.1],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, pylonH, 6), materials.bridgeSteel);
    leg.position.set(lx * 0.72, pylonH * 0.5, lz * 0.72);
    leg.rotation.z = lx > 0 ? 0.05 : -0.05;
    leg.rotation.x = lz > 0 ? -0.05 : 0.05;
    pylonGroup.add(leg);
  });
  // Horizontal lattice tie frames along pylon height
  [0.3, 0.6, 0.88].forEach((f) => {
    const tie = new THREE.Mesh(new THREE.BoxGeometry(1.9 * (1.15 - f * 0.35), 0.2, 1.9 * (1.15 - f * 0.35)), materials.bridgeSteel);
    tie.position.y = pylonH * f;
    pylonGroup.add(tie);
  });
  const pylonCross = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.55, 0.65), materials.bridgeSteel);
  pylonCross.position.y = pylonH - 0.5;
  pylonGroup.add(pylonCross);
  namsanGroup.add(pylonGroup);

  // Twin Elevated 2-Span Aerial Cables & 2 Detailed Crimson Panoramic Gondolas hanging cleanly in mid-air
  [-1.25, 1.25].forEach((offsetX, idx) => {
    const pA = cableStart.clone().add(new THREE.Vector3(offsetX, 0.3, 0));
    const pB = cableMidPylon.clone().add(new THREE.Vector3(offsetX, 0.2, 0));
    const pC = cableEnd.clone().add(new THREE.Vector3(offsetX, 0.3, 0));

    const span1 = new THREE.LineCurve3(pA, pB);
    const span2 = new THREE.LineCurve3(pB, pC);
    namsanGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(span1, 6, 0.09, 6, false), materials.modernMullion),
      new THREE.Mesh(new THREE.TubeGeometry(span2, 6, 0.09, 6, false), materials.modernMullion)
    );

    // Gondola 0 on lower span (t=0.55), Gondola 1 on upper span (t=0.48) — generous ground clearance!
    const gPos =
      idx === 0
        ? new THREE.Vector3().lerpVectors(pA, pB, 0.55)
        : new THREE.Vector3().lerpVectors(pB, pC, 0.48);

    const gondola = new THREE.Group();
    gondola.position.copy(gPos);

    const bogie = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 1.5), darkIronMat);
    const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.85, 6), darkIronMat);
    hanger.position.y = -0.95;
    const cabinLower = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 3.2), materials.namsanSpireRed);
    cabinLower.position.y = -2.85;
    cabinLower.castShadow = true;
    const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(2.14, 1.0, 3.05), materials.modernGlass);
    cabinGlass.position.y = -2.0;
    const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.25, 3.24), whiteTrimMat);
    cabinRoof.position.y = -1.42;
    const cabinInteriorGlow = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.48, 2.2),
      materials.lanternGlow
    );
    cabinInteriorGlow.position.y = -2.0;

    gondola.add(bogie, hanger, cabinLower, cabinGlass, cabinRoof, cabinInteriorGlow);
    namsanGroup.add(gondola);
  });

  // ========================================================
  // 6. Namsan Summit Plaza, Palgakjeong, Bongsudae & Detailed N Seoul Tower
  // ========================================================
  const summitGroup = new THREE.Group();
  summitGroup.position.set(0, 45.8, -102);

  // Broad multi-stepped granite observation plaza accommodating Tower, Palgakjeong & Bongsudae
  const summitLowerDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(23.5, 26.5, 2.4, 8),
    materials.granite
  );
  summitLowerDeck.position.y = 0;
  summitLowerDeck.receiveShadow = true;

  const summitUpperTrim = new THREE.Mesh(
    new THREE.CylinderGeometry(22.8, 23.2, 0.28, 8),
    materials.granitePlinth
  );
  summitUpperTrim.position.y = 1.24;
  summitGroup.add(summitLowerDeck, summitUpperTrim);

  // Perimeter Love-Lock Observation Deck Railings & Colorful Instanced Padlock Clusters!
  const lockCoords: [number, number, number][] = [];
  const deckR = 22.1;
  for (let i = 0; i < 8; i++) {
    const a1 = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const a2 = ((i + 1) / 8) * Math.PI * 2 + Math.PI / 8;
    const x1 = Math.cos(a1) * deckR;
    const z1 = Math.sin(a1) * deckR;
    const x2 = Math.cos(a2) * deckR;
    const z2 = Math.sin(a2) * deckR;
    const segLen = Math.hypot(x2 - x1, z2 - z1);
    const segAngle = Math.atan2(x2 - x1, z2 - z1);

    const fence = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, segLen), materials.bridgeSteel);
    fence.position.set((x1 + x2) * 0.5, 1.9, (z1 + z2) * 0.5);
    fence.rotation.y = segAngle;
    summitGroup.add(fence);

    // Populate dense colorful love-lock clusters along the southern Seoul-facing sides
    if (z1 > 0 || z2 > 0) {
      for (let k = 1; k < 12; k++) {
        const t = k / 12;
        lockCoords.push([
          THREE.MathUtils.lerp(x1, x2, t),
          1.72 + ((k * 7) % 5) * 0.12,
          THREE.MathUtils.lerp(z1, z2, t),
        ]);
      }
    }
  }
  const lockGeo = new THREE.BoxGeometry(0.24, 0.28, 0.24);
  const lockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.45 });
  const lockInst = new THREE.InstancedMesh(lockGeo, lockMat, lockCoords.length);
  const lockPalette = [0xef4444, 0xf59e0b, 0xf472b6, 0x38bdf8, 0x34d399, 0xa855f7, 0xfacc15];
  const lockCol = new THREE.Color();
  lockCoords.forEach(([lx, ly, lz], idx) => {
    dummy.position.set(lx, ly, lz);
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lockInst.setMatrixAt(idx, dummy.matrix);
    lockCol.setHex(lockPalette[idx % lockPalette.length]);
    lockInst.setColorAt(idx, lockCol);
  });
  lockInst.instanceMatrix.needsUpdate = true;
  if (lockInst.instanceColor) lockInst.instanceColor.needsUpdate = true;
  lockInst.computeBoundingSphere();
  summitGroup.add(lockInst);

  // ---------------------------------------------------------
  // 6A. Authentic 2-Tier Namsan Palgakjeong Pavilion (남산 팔각정)
  // ---------------------------------------------------------
  const palgakGroup = new THREE.Group();
  palgakGroup.name = 'namsan_palgakjeong';
  palgakGroup.position.set(-10.5, 1.38, 6.2);

  // 2-step granite plinth + front approach stairs
  const pPlinth1 = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.55, 8), materials.granite);
  pPlinth1.position.y = 0.275;
  const pPlinth2 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.55, 8), materials.granitePlinth);
  pPlinth2.position.y = 0.82;
  const pStairs = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.6), materials.granitePlinth);
  pStairs.position.set(0, 0.42, 4.8);
  palgakGroup.add(pPlinth1, pPlinth2, pStairs);

  // Wooden maru floor & crimson Gyeja wooden balustrade railings
  const pFloor = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.16, 8), materials.woodDeck);
  pFloor.position.y = 1.15;
  palgakGroup.add(pFloor);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cx = Math.cos(a) * 3.25;
    const cz = Math.sin(a) * 3.25;

    // Carved granite pillar stone (초석) & crimson column
    const baseStone = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.24, 8), materials.granite);
    baseStone.position.set(cx, 1.32, cz);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 3.05, 8), materials.pillarCrimson);
    col.position.set(cx, 2.95, cz);
    col.castShadow = true;
    palgakGroup.add(baseStone, col);

    // Balustrade rail between adjacent columns (leave front south bay open for stairs)
    if (i !== 2) {
      const nextA = ((i + 1) / 8) * Math.PI * 2;
      const nx = Math.cos(nextA) * 3.25;
      const nz = Math.sin(nextA) * 3.25;
      const rLen = Math.hypot(nx - cx, nz - cz);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(rLen, 0.62, 0.14), materials.pillarCrimson);
      rail.position.set((cx + nx) * 0.5, 1.65, (cz + nz) * 0.5);
      rail.rotation.y = -Math.atan2(nz - cz, nx - cx);
      palgakGroup.add(rail);
    }
  }

  // Dancheong bracket frieze & upper inner pavilion drum
  const lowerFrieze = new THREE.Mesh(
    new THREE.CylinderGeometry(3.45, 3.35, 0.68, 8),
    materials.dancheong
  );
  lowerFrieze.position.y = 4.45;
  const upperDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(2.15, 2.2, 1.35, 8),
    materials.dancheong
  );
  upperDrum.position.y = 5.95;

  // Concave curved 2-tier octagonal giwa roofs + golden lotus finial (절병통)
  const lowerOctRoof = createOctagonalKoreanRoof(5.65, 2.35, 1.85, materials);
  lowerOctRoof.position.y = 4.65;
  const upperOctRoof = createOctagonalKoreanRoof(3.75, 0.22, 1.75, materials);
  upperOctRoof.position.y = 6.45;
  const pFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.26, 1.05, 8), materials.goldLeaf);
  pFinial.position.y = 8.65;

  palgakGroup.add(lowerFrieze, upperDrum, lowerOctRoof, upperOctRoof, pFinial);
  summitGroup.add(palgakGroup);

  // ---------------------------------------------------------
  // 6B. Mongmyeoksan Bongsudae Beacon Mounds (남산 봉수대, local X = +14.2, Z = +5.2)
  // ---------------------------------------------------------
  const bongsudaeGroup = new THREE.Group();
  bongsudaeGroup.name = 'namsan_bongsudae';
  bongsudaeGroup.position.set(14.2, 1.38, 5.2);
  bongsudaeGroup.rotation.y = -0.38;

  const bPlatform = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.25, 4.4), materials.granite);
  bPlatform.position.y = 0.62;
  bPlatform.castShadow = true;
  bPlatform.receiveShadow = true;
  const bWallBack = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.9, 0.45), materials.granitePlinth);
  bWallBack.position.set(0, 1.65, -2.0);
  const bStairs = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.2), materials.granitePlinth);
  bStairs.position.set(0, 0.45, 2.6);
  bongsudaeGroup.add(bPlatform, bWallBack, bStairs);

  // 5 historic stone fire-beacon chimneys (연조) with glowing embers
  for (let b = 0; b < 5; b++) {
    const bx = -4.0 + b * 2.0;
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.72, 1.55, 10),
      materials.coastalRock
    );
    chimney.position.set(bx, 2.02, -0.35);
    chimney.castShadow = true;
    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 8, 6),
      materials.lanternGlow
    );
    ember.scale.set(1, 0.45, 1);
    ember.position.set(bx, 2.78, -0.35);
    bongsudaeGroup.add(chimney, ember);
  }
  summitGroup.add(bongsudaeGroup);

  // ---------------------------------------------------------
  // 6C. High-Detail N Seoul Tower (남산서울타워 — Fluted Shaft, Strut Collar, Mullioned Pod, Broadcast Spire)
  // ---------------------------------------------------------
  const tower = new THREE.Group();
  tower.name = 'n_seoul_tower';
  tower.position.set(2.5, 1.38, -2.0);

  // 1) 3-Tier Octagonal Plaza Base Building (T1-T3) with Cantilevered Wood Terrace
  const baseT1 = new THREE.Mesh(
    new THREE.CylinderGeometry(9.6, 10.2, 2.6, 8),
    materials.modernConcrete
  );
  baseT1.position.y = 1.3;
  baseT1.castShadow = true;
  baseT1.receiveShadow = true;

  const baseGlassBand = new THREE.Mesh(
    new THREE.CylinderGeometry(9.4, 9.4, 2.3, 8),
    materials.modernGlass
  );
  baseGlassBand.position.y = 3.65;

  const baseTerraceDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(10.6, 10.6, 0.32, 8),
    materials.woodDeck
  );
  baseTerraceDeck.position.y = 4.95;

  const baseT3 = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 7.8, 2.2, 8),
    materials.modernConcrete
  );
  baseT3.position.y = 6.15;
  baseT3.castShadow = true;

  const baseGlowRing = new THREE.Mesh(
    new THREE.TorusGeometry(9.7, 0.16, 6, 8),
    materials.lanternGlow
  );
  baseGlowRing.rotation.x = Math.PI * 0.5;
  baseGlowRing.position.y = 4.82;

  tower.add(baseT1, baseGlassBand, baseTerraceDeck, baseT3, baseGlowRing);

  // 2) Fluted Concrete Tower Shaft with 8 Vertical Structural Ribs & Service Rings
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(2.08, 2.62, 39.2, 24),
    materials.modernConcrete
  );
  shaft.position.y = 26.8;
  shaft.castShadow = true;
  tower.add(shaft);

  for (let r = 0; r < 8; r++) {
    const a = (r / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.24, 38.6, 0.34), materials.granitePlinth);
    rib.position.set(Math.cos(a) * 2.32, 26.8, Math.sin(a) * 2.32);
    rib.rotation.y = -a;
    tower.add(rib);
  }
  [14, 24, 34, 43].forEach((ry) => {
    const ringR = THREE.MathUtils.lerp(2.58, 2.12, (ry - 8) / 38);
    const sRing = new THREE.Mesh(new THREE.TorusGeometry(ringR + 0.12, 0.12, 6, 24), darkZincMat);
    sRing.rotation.x = Math.PI * 0.5;
    sRing.position.y = ry;
    tower.add(sRing);
  });

  // 3) Flared Structural Collar + 12 Radial Diagonal Steel Support Struts
  const podCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(5.9, 2.15, 4.3, 24),
    materials.bridgeSteel
  );
  podCollar.position.y = 47.6;
  podCollar.castShadow = true;
  tower.add(podCollar);

  const upVec3 = new THREE.Vector3(0, 1, 0);
  for (let s = 0; s < 12; s++) {
    const a = (s / 12) * Math.PI * 2;
    const pBot = new THREE.Vector3(Math.cos(a) * 2.25, 44.2, Math.sin(a) * 2.25);
    const pTop = new THREE.Vector3(Math.cos(a) * 6.05, 49.5, Math.sin(a) * 6.05);
    const v = new THREE.Vector3().subVectors(pTop, pBot);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, v.length(), 6), darkZincMat);
    strut.position.addVectors(pBot, pTop).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(upVec3, v.clone().normalize());
    tower.add(strut);
  }

  // 4) Iconic 3-Tier 360° Observatory & n.Grill Pod with 24 3D Vertical Window Mullions
  const podLowerDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(6.55, 6.05, 3.2, 24),
    materials.namsanTowerPod
  );
  podLowerDeck.position.y = 51.3;
  podLowerDeck.castShadow = true;

  const podMidObservatory = new THREE.Mesh(
    new THREE.CylinderGeometry(7.35, 6.75, 4.4, 24),
    materials.namsanTowerPod
  );
  podMidObservatory.position.y = 55.1;
  podMidObservatory.castShadow = true;

  const podUpperGrill = new THREE.Mesh(
    new THREE.CylinderGeometry(7.1, 7.35, 2.4, 24),
    materials.modernGlass
  );
  podUpperGrill.position.y = 58.4;

  // 24 crisp 3D dark steel mullions wrapping the observatory pod facade
  for (let m = 0; m < 24; m++) {
    const a = (m / 24) * Math.PI * 2;
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 9.6, 0.28), darkZincMat);
    mullion.position.set(Math.cos(a) * 7.05, 54.8, Math.sin(a) * 7.05);
    mullion.rotation.y = -a;
    mullion.rotation.z = -0.07;
    tower.add(mullion);
  }

  // 5) Glowing Cyan & Warm Amber Seoul Beacon LED Halo Rings
  const podLowerRing = new THREE.Mesh(new THREE.TorusGeometry(6.52, 0.24, 8, 32), cyanBeaconMat);
  podLowerRing.rotation.x = Math.PI * 0.5;
  podLowerRing.position.y = 49.75;

  const podMidRing = new THREE.Mesh(new THREE.TorusGeometry(7.36, 0.16, 6, 32), cyanBeaconMat);
  podMidRing.rotation.x = Math.PI * 0.5;
  podMidRing.position.y = 57.15;

  const podUpperRing = new THREE.Mesh(
    new THREE.TorusGeometry(7.18, 0.25, 8, 32),
    materials.lanternGlow
  );
  podUpperRing.rotation.x = Math.PI * 0.5;
  podUpperRing.position.y = 59.65;

  // 6) Stepped Mechanical Crown, Equipment Gallery & 6 Parabolic Microwave Dish Antennas
  const podRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(5.1, 7.15, 2.2, 24),
    materials.bridgeSteel
  );
  podRoof.position.y = 60.8;

  const broadcastDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(2.75, 3.65, 5.0, 16),
    materials.modernConcrete
  );
  broadcastDrum.position.y = 64.3;

  const equipRail = new THREE.Mesh(new THREE.TorusGeometry(4.85, 0.1, 6, 24), darkZincMat);
  equipRail.rotation.x = Math.PI * 0.5;
  equipRail.position.y = 62.6;

  for (let d = 0; d < 6; d++) {
    const a = (d / 6) * Math.PI * 2;
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.2, 0.45, 12), whiteTrimMat);
    dish.position.set(Math.cos(a) * 3.6, 64.2, Math.sin(a) * 3.6);
    dish.rotation.z = Math.PI * 0.5;
    dish.rotation.y = -a;
    tower.add(dish);
  }

  // 7) 4-Tier Red & White Steel Broadcast Mast + Horizontal Dipole Antenna Arrays
  const mastSegments = [
    { y: 70.0, h: 6.4, rBot: 1.18, rTop: 0.9, mat: materials.namsanSpireRed },
    { y: 75.8, h: 5.8, rBot: 0.9, rTop: 0.64, mat: whiteTrimMat },
    { y: 81.2, h: 5.4, rBot: 0.64, rTop: 0.38, mat: materials.namsanSpireRed },
    { y: 86.0, h: 4.8, rBot: 0.34, rTop: 0.12, mat: whiteTrimMat },
  ];
  mastSegments.forEach((seg) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(seg.rTop, seg.rBot, seg.h, 12), seg.mat);
    m.position.y = seg.y;
    m.castShadow = true;
    tower.add(m);

    // Cross-dipole broadcast antenna rods at each mast band
    const dipoleW = seg.rBot * 3.2;
    const d1 = new THREE.Mesh(new THREE.BoxGeometry(dipoleW, 0.12, 0.12), darkZincMat);
    d1.position.y = seg.y + seg.h * 0.15;
    const d2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, dipoleW), darkZincMat);
    d2.position.y = seg.y + seg.h * 0.15;
    tower.add(d1, d2);
  });

  // Aviation Warning Beacons at Spire Apex & Mid-Mast
  const apexBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), redBeaconMat);
  apexBeacon.position.y = 88.8;
  const midBeacon = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.14, 6, 16), redBeaconMat);
  midBeacon.rotation.x = Math.PI * 0.5;
  midBeacon.position.y = 73.1;

  tower.add(
    podLowerDeck,
    podMidObservatory,
    podUpperGrill,
    podLowerRing,
    podMidRing,
    podUpperRing,
    podRoof,
    broadcastDrum,
    equipRail,
    apexBeacon,
    midBeacon
  );
  summitGroup.add(tower);
  namsanGroup.add(summitGroup);

  root.add(namsanGroup);

  return root;
}
