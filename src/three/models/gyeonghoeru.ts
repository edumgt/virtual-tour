import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createKoreanRoof,
  createDapoFacadeRow,
  createColumnPlinth,
  createStoneBalustradeLine,
} from './architecturalCraft';

/**
 * Creates Gyeonghoeru Pavilion (경회루 - National Treasure No. 224),
 * The Lotus Pond (방지), 3 Stone Arched Bridges, 48 Stone Pillars
 * (outer 24 square = Earth, inner 24 round = Heaven), and floating lotus pads.
 * Upgraded with curved Paljak hip-and-gable roof, exposed rafters,
 * Gyeja curved balcony balustrade, Dapo bracket outriggers, and stone bridge railings.
 */
export function buildGyeonghoeru(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'gyeonghoeru_root';
  root.position.set(-68, 0, -68);

  // 1. The Lotus Pond (방지 - Bangji: 54m x 46m)
  const pondGroup = new THREE.Group();
  pondGroup.name = 'lotus_pond';

  // Pond stone basin boundary walls (석축) with stone coping
  const wallMat = materials.granite;
  const pondWallFront = new THREE.Mesh(new THREE.BoxGeometry(54, 1.2, 1.2), wallMat);
  pondWallFront.position.set(0, 0.4, 23);
  const pondWallBack = pondWallFront.clone();
  pondWallBack.position.z = -23;
  const pondWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 46), wallMat);
  pondWallLeft.position.set(-27, 0.4, 0);
  const pondWallRight = pondWallLeft.clone();
  pondWallRight.position.x = 27;

  pondGroup.add(pondWallFront, pondWallBack, pondWallLeft, pondWallRight);

  // Water Surface Plane (수면)
  const waterGeo = new THREE.PlaneGeometry(53, 45);
  const water = new THREE.Mesh(waterGeo, materials.waterPond);
  water.rotation.x = -Math.PI * 0.5;
  water.position.set(0, 0.45, 0);
  water.receiveShadow = true;
  pondGroup.add(water);

  // Floating Water Lilies / Lotus Leaves (연잎)
  const lilyMat = new THREE.MeshStandardMaterial({
    color: 0x2b593f,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const lilyGeo = new THREE.CircleGeometry(0.7, 10);
  for (let i = 0; i < 28; i++) {
    const lily = new THREE.Mesh(lilyGeo, lilyMat);
    lily.rotation.x = -Math.PI * 0.5;
    const lx = (Math.random() - 0.5) * 44;
    const lz = (Math.random() - 0.5) * 36;
    if (Math.abs(lx) > 13 || Math.abs(lz) > 11) {
      lily.position.set(lx, 0.47, lz);
      pondGroup.add(lily);
    }
  }

  root.add(pondGroup);

  // 2. Central Island & 3 Stone Arched Bridges (석교)
  const islandGroup = new THREE.Group();
  islandGroup.name = 'pavilion_island';

  // Island Stone Base (24m x 18m, height 1.2m above water)
  const islandBase = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 18), materials.granite);
  islandBase.position.set(0, 0.6, 0);
  islandBase.castShadow = true;
  islandBase.receiveShadow = true;
  islandGroup.add(islandBase);

  // 3 Stone Bridges connecting island to the East courtyard bank (X = 12 to X = 27)
  const bridgeZPositions = [-5.5, 0, 5.5];
  bridgeZPositions.forEach((bz, idx) => {
    const bridgeGroup = new THREE.Group();

    // Bridge Deck (Length 15m along X, Width 2.4m along Z)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 2.4), materials.granite);
    deck.position.set(19.5, 0.8, bz);
    bridgeGroup.add(deck);

    // Arch support beneath
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 16, 1, false, 0, Math.PI), materials.granite);
    arch.rotation.z = Math.PI * 0.5;
    arch.position.set(19.5, 0.3, bz);
    bridgeGroup.add(arch);

    // Stone balustrade with lotus posts along both sides of bridge
    const rail1 = createStoneBalustradeLine(14.8, materials, 2.8);
    rail1.position.set(19.5, 0.95, bz - 1.2);
    const rail2 = createStoneBalustradeLine(14.8, materials, 2.8);
    rail2.position.set(19.5, 0.95, bz + 1.2);
    bridgeGroup.add(rail1, rail2);

    if (idx === 1) {
      // King's central bridge has royal dragon/seosoo finials
      const seosoo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.4), materials.granite);
      seosoo.position.set(26.8, 1.5, bz);
      bridgeGroup.add(seosoo);
    }
    islandGroup.add(bridgeGroup);
  });

  root.add(islandGroup);

  // 3. The 48 Stone Pillars of Gyeonghoeru (48개의 화강암 돌기둥)
  const pavilionGroup = new THREE.Group();
  pavilionGroup.name = 'gyeonghoeru_pavilion';
  pavilionGroup.position.set(0, 1.2, 0);

  // Outer Square Columns (외진주 24개 - 사각형, 땅을 상징)
  const squareColGeo = new THREE.BoxGeometry(0.72, 3.8, 0.72);
  // Inner Round Columns (내진주 24개 - 원형, 하늘을 상징)
  const roundColGeo = new THREE.CylinderGeometry(0.36, 0.38, 3.8, 16);

  // 7 bays along X, 5 bays along Z
  const xCoords = [-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6];
  const zCoords = [-6.4, -3.2, 0, 3.2, 6.4];

  for (let ix = 0; ix < xCoords.length; ix++) {
    for (let iz = 0; iz < zCoords.length; iz++) {
      const px = xCoords[ix];
      const pz = zCoords[iz];
      const isOuter = (ix === 0 || ix === 6 || iz === 0 || iz === 4);

      // Granite Plinth Base
      const plinth = createColumnPlinth(0.42, materials);
      plinth.position.set(px, 0.2, pz);
      pavilionGroup.add(plinth);

      if (isOuter) {
        // Outer Square Column (지 - 땅)
        const col = new THREE.Mesh(squareColGeo, materials.granite);
        col.position.set(px, 2.0, pz);
        col.castShadow = true;
        pavilionGroup.add(col);
      } else {
        // Inner Round Column (천 - 하늘)
        const col = new THREE.Mesh(roundColGeo, materials.granite);
        col.position.set(px, 2.0, pz);
        col.castShadow = true;
        pavilionGroup.add(col);
      }
    }
  }

  // 4. Second Floor Banqueting Hall (2층 누각 마루 & 기둥)
  const floor2 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 15.6), materials.royalWood);
  floor2.position.set(0, 4.0, 0);
  pavilionGroup.add(floor2);

  // 2nd Floor Vermilion Wooden Pillars with Plinths
  const upperPillarGeo = new THREE.CylinderGeometry(0.32, 0.34, 3.2, 14);
  for (let ix = 0; ix < xCoords.length; ix++) {
    for (let iz = 0; iz < zCoords.length; iz++) {
      const px = xCoords[ix] * 0.95;
      const pz = zCoords[iz] * 0.95;

      const plinth = createColumnPlinth(0.32, materials);
      plinth.position.set(px, 4.25, pz);

      const p = new THREE.Mesh(upperPillarGeo, materials.pillarCrimson);
      p.position.set(px, 5.85, pz);
      p.castShadow = true;
      pavilionGroup.add(plinth, p);
    }
  }

  // Traditional Gyeja Balustrade (계자난간 - cantilevered curved wooden balcony railing)
  const gyejaBalustradeFront = new THREE.Mesh(new THREE.BoxGeometry(21.6, 0.82, 0.14), materials.royalWood);
  gyejaBalustradeFront.position.set(0, 4.65, 7.5);
  const gyejaBalustradeBack = gyejaBalustradeFront.clone();
  gyejaBalustradeBack.position.z = -7.5;
  const gyejaBalustradeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 15.0), materials.royalWood);
  gyejaBalustradeL.position.set(-10.8, 4.65, 0);
  const gyejaBalustradeR = gyejaBalustradeL.clone();
  gyejaBalustradeR.position.x = 10.8;
  pavilionGroup.add(gyejaBalustradeFront, gyejaBalustradeBack, gyejaBalustradeL, gyejaBalustradeR);

  // Dapo Bracket Cluster Row under roof
  const dapoRow = createDapoFacadeRow(22, 15.6, xCoords.map((x) => x * 0.95), materials);
  dapoRow.position.set(0, 7.45, 0);
  pavilionGroup.add(dapoRow);

  // Signboard: "慶會樓"
  const sign = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.5, 0.22), materials.gyeonghoeruSign);
  sign.position.set(0, 7.0, 7.6);
  pavilionGroup.add(sign);

  // Grand Paljak Hip-and-Gable Curved Roof (웅장한 팔작지붕 with sweeping concave curves)
  const mainRoof = createKoreanRoof(26, 19.5, 4.2, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.65,
    eavesFlare: 0.5,
    showJapsang: true,
    japsangCount: 7,
  });
  mainRoof.position.set(0, 8.2, 0);
  pavilionGroup.add(mainRoof);

  // Night Lanterns along the pavilion
  [-6, -2, 2, 6].forEach((lx) => {
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.45, 8), materials.lanternGlow);
    l1.position.set(lx, 7.3, 7.4);
    pavilionGroup.add(l1);
  });

  root.add(pavilionGroup);

  return root;
}
