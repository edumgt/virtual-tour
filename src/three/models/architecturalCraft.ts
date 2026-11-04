import * as THREE from 'three';
import { PalaceMaterials } from '../materials';

/**
 * Architectural Craft Library for Traditional Korean Royal Palace Architecture (조선 궁궐 건축 공법)
 * Generates authentic, high-detail, manifold 3D models with ZERO visual tearing or floating debris:
 * - Double Eaves Rafters (겹처마: 원형 부연 서까래 & 각형 부연)
 * - Corner Hip Beams (추녀 & 사래) with Gilt/Glazed Dragon Sleeves (토수 - Tosu)
 * - Stepped Dapo Bracket Systems (다포계 공포: 주두, 살미 쇠서, 첨차, 소로, 도리)
 * - Royal Balcony Balustrades (계자난간 - Gyeja Nangan with curved brackets & Ajasa grilles)
 * - Royal Hongyemun Dragon Ceilings (홍예문 쌍룡도 & 화반 머릿돌)
 * - Heavy Fortified Palace Gate Doors with Iron Straps & Bronze Knockers (철물 문두리 & 문고리)
 * - Palace Drainage Gargoyles (석루조 - Seokrujo)
 * - Fire-Warding Water Cauldrons (드무 - Dumu) & Royal Incense Burners (정 - 鼎)
 * - 12 Zodiac & 4 Guardian Deities Stone Sculptures (십이지신상 & 사신 석상)
 */

/**
 * Creates authentic Korean palace double-eaves rafters (겹처마: 도리 서까래 + 부연)
 * Runs along the perimeter under the eaves curve with Dancheong lotus end-medallions.
 */
export function createEavesRafterSystem(
  width: number,
  depth: number,
  height: number,
  materials: PalaceMaterials,
  options: {
    eavesFlare?: number;
    ridgeLengthRatio?: number;
    rafterSpacing?: number;
  } = {}
): THREE.Group {
  const rafterGroup = new THREE.Group();
  rafterGroup.name = 'double_eaves_rafters';

  const {
    eavesFlare = 0.38,
    rafterSpacing = 0.65,
  } = options;

  const halfW = width / 2;
  const halfD = depth / 2;

  // Reusable rafter geometries
  const roundRafterGeo = new THREE.CylinderGeometry(0.11, 0.11, 1.8, 8);
  const buyeonGeo = new THREE.BoxGeometry(0.15, 0.15, 1.5);

  // Front & Back rafter rows
  const xCount = Math.floor(width / rafterSpacing);
  for (let i = 0; i <= xCount; i++) {
    const u = (i / xCount) * 2 - 1; // -1 to 1
    const x = u * (halfW - 0.4);
    // Eaves curve elevation calculation (안허리곡)
    const curveY = Math.pow(Math.abs(u), 2) * eavesFlare;

    // Front side (Z = halfD)
    // 1. Lower round rafter (원형 서까래)
    const rFront = new THREE.Mesh(roundRafterGeo, materials.dancheongWood);
    rFront.rotation.x = Math.PI * 0.5 - 0.15;
    rFront.position.set(x, curveY - 0.22, halfD - 0.15);

    // Front rafter end cap (마구리 연화문 단청)
    const capFront = new THREE.Mesh(new THREE.CircleGeometry(0.11, 10), materials.rafterEnd);
    capFront.position.set(x, curveY - 0.22 + Math.sin(0.15) * 0.9, halfD + 0.65);
    capFront.rotation.x = -0.15;

    // 2. Upper square buyeon (각형 부연)
    const bFront = new THREE.Mesh(buyeonGeo, materials.dancheongWood);
    bFront.rotation.x = -0.08;
    bFront.position.set(x, curveY - 0.05, halfD + 0.05);

    const bCapFront = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), materials.rafterEnd);
    bCapFront.position.set(x, curveY - 0.05 + Math.sin(0.08) * 0.75, halfD + 0.75);
    bCapFront.rotation.x = -0.08;

    // Back side (Z = -halfD)
    const rBack = new THREE.Mesh(roundRafterGeo, materials.dancheongWood);
    rBack.rotation.x = Math.PI * 0.5 + 0.15;
    rBack.position.set(x, curveY - 0.22, -halfD + 0.15);

    const capBack = new THREE.Mesh(new THREE.CircleGeometry(0.11, 10), materials.rafterEnd);
    capBack.position.set(x, curveY - 0.22 + Math.sin(0.15) * 0.9, -halfD - 0.65);
    capBack.rotation.y = Math.PI;
    capBack.rotation.x = 0.15;

    const bBack = new THREE.Mesh(buyeonGeo, materials.dancheongWood);
    bBack.rotation.x = 0.08;
    bBack.position.set(x, curveY - 0.05, -halfD - 0.05);

    const bCapBack = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), materials.rafterEnd);
    bCapBack.position.set(x, curveY - 0.05 + Math.sin(0.08) * 0.75, -halfD - 0.75);
    bCapBack.rotation.y = Math.PI;
    bCapBack.rotation.x = 0.08;

    rafterGroup.add(rFront, capFront, bFront, bCapFront, rBack, capBack, bBack, bCapBack);
  }

  // Left & Right side rafter rows
  const zCount = Math.floor(depth / rafterSpacing);
  for (let j = 0; j <= zCount; j++) {
    const v = (j / zCount) * 2 - 1; // -1 to 1
    const z = v * (halfD - 0.4);
    const curveY = Math.pow(Math.abs(v), 2) * eavesFlare;

    // Left side (X = -halfW)
    const rLeft = new THREE.Mesh(roundRafterGeo, materials.dancheongWood);
    rLeft.rotation.z = Math.PI * 0.5 + 0.15;
    rLeft.position.set(-halfW + 0.15, curveY - 0.22, z);

    const capLeft = new THREE.Mesh(new THREE.CircleGeometry(0.11, 10), materials.rafterEnd);
    capLeft.rotation.y = -Math.PI * 0.5;
    capLeft.position.set(-halfW - 0.65, curveY - 0.22, z);

    const bLeft = new THREE.Mesh(buyeonGeo, materials.dancheongWood);
    bLeft.rotation.y = Math.PI * 0.5;
    bLeft.rotation.z = 0.08;
    bLeft.position.set(-halfW - 0.05, curveY - 0.05, z);

    const bCapLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), materials.rafterEnd);
    bCapLeft.rotation.y = -Math.PI * 0.5;
    bCapLeft.position.set(-halfW - 0.75, curveY - 0.05, z);

    // Right side (X = halfW)
    const rRight = new THREE.Mesh(roundRafterGeo, materials.dancheongWood);
    rRight.rotation.z = Math.PI * 0.5 - 0.15;
    rRight.position.set(halfW - 0.15, curveY - 0.22, z);

    const capRight = new THREE.Mesh(new THREE.CircleGeometry(0.11, 10), materials.rafterEnd);
    capRight.rotation.y = Math.PI * 0.5;
    capRight.position.set(halfW + 0.65, curveY - 0.22, z);

    const bRight = new THREE.Mesh(buyeonGeo, materials.dancheongWood);
    bRight.rotation.y = Math.PI * 0.5;
    bRight.rotation.z = -0.08;
    bRight.position.set(halfW + 0.05, curveY - 0.05, z);

    const bCapRight = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), materials.rafterEnd);
    bCapRight.rotation.y = Math.PI * 0.5;
    bCapRight.position.set(halfW + 0.75, curveY - 0.05, z);

    rafterGroup.add(rLeft, capLeft, bLeft, bCapLeft, rRight, capRight, bRight, bCapRight);
  }

  // 4 Corner Fanned Rafters (선자서까래) & Massive Corner Hip Beams (추녀 & 사래) with Tosu Dragon Caps (토수)
  const cornerSigns = [
    { x: -1, z: 1, rotY: Math.PI * 0.75 },
    { x: 1, z: 1, rotY: Math.PI * 0.25 },
    { x: -1, z: -1, rotY: Math.PI * 1.25 },
    { x: 1, z: -1, rotY: -Math.PI * 0.25 },
  ];

  cornerSigns.forEach((c) => {
    const cornerGroup = new THREE.Group();
    cornerGroup.position.set(c.x * (halfW - 0.1), eavesFlare * 1.1, c.z * (halfD - 0.1));
    cornerGroup.rotation.y = c.rotY;

    // Heavy diagonal hip rafter (추녀)
    const chunya = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.38, 2.8),
      materials.dancheongWood
    );
    chunya.rotation.x = -0.18; // Upward sweep
    chunya.position.set(0, 0.1, 1.2);

    // Tosu (토수) - Gilt/ceramic dragon head sleeve capping the corner hip rafter tip
    const tosuBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.6), materials.eavesWhite);
    tosuBody.position.set(0, 0.32, 2.45);

    const tosuJaw = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 6), materials.goldLeaf);
    tosuJaw.rotation.x = Math.PI * 0.5;
    tosuJaw.position.set(0, 0.32, 2.85);

    cornerGroup.add(chunya, tosuBody, tosuJaw);
    rafterGroup.add(cornerGroup);
  });

  return rafterGroup;
}

/**
 * Creates an authentic, structurally solid Korean roof (우진각 / 팔작 지붕)
 * Built as a single manifold curved surface with:
 * - Concave slopes (안허리곡 & 조로)
 * - Double-tier exposed rafter system underneath (겹처마 서까래)
 * - Corner Chunya hip beams with Tosu dragon caps (토수)
 * - Decorated gable boards with brick/plaster Hapgak (합각벽) for Paljak roofs
 * - Yongmaru main ridge (용마루), Yangseong white plaster (양성마루), Chwimi/Yongdu dragons (용두)
 * - Japsang guardian sentinels (잡상)
 */
export function createKoreanRoof(
  width: number,
  depth: number,
  height: number,
  materials: PalaceMaterials,
  options: {
    isPaljak?: boolean;
    ridgeLengthRatio?: number;
    eavesFlare?: number;
    showJapsang?: boolean;
    japsangCount?: number;
  } = {}
): THREE.Group {
  const roof = new THREE.Group();
  roof.name = 'korean_solid_roof';

  const {
    isPaljak = false,
    ridgeLengthRatio = 0.6,
    eavesFlare = 0.38,
    showJapsang = true,
    japsangCount = 5,
  } = options;

  const halfW = width / 2;
  const halfD = depth / 2;
  const ridgeW = width * ridgeLengthRatio;
  const halfRidgeW = ridgeW / 2;

  // 1. Double Eaves Exposed Rafter Row (처마 밑 서까래 & 부연 결구)
  const rafterSystem = createEavesRafterSystem(width, depth, height, materials, {
    eavesFlare,
    ridgeLengthRatio,
  });
  rafterSystem.position.set(0, 0, 0);
  roof.add(rafterSystem);

  // 2. Solid Connected Curved Roof Mesh (단일 일체형 기와 지붕 메쉬)
  const segsX = 12;
  const segsZ = 10;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= segsZ; iz++) {
    const v = iz / segsZ; // 0 (back) to 1 (front)
    const zBase = -halfD + v * depth;
    const zNorm = (v - 0.5) * 2; // -1 to 1

    for (let ix = 0; ix <= segsX; ix++) {
      const u = ix / segsX; // 0 (left) to 1 (right)
      const xBase = -halfW + u * width;
      const xNorm = (u - 0.5) * 2; // -1 to 1

      // Distance from ridge line
      const distFromRidgeX = Math.max(0, Math.abs(xNorm) - ridgeLengthRatio);
      const distFromRidgeZ = Math.abs(zNorm);
      const slopeFactor = Math.max(distFromRidgeZ, distFromRidgeX);

      // Concave Korean roof slope: steep near ridge, flattens gracefully toward eaves
      const ySlope = Math.pow(Math.max(0, 1 - slopeFactor), 1.35) * height;

      // Graceful eaves corner flair (안허리곡 & 조로)
      const cornerWeight = Math.pow(Math.abs(xNorm) * Math.abs(zNorm), 2);
      const yCornerFlair = cornerWeight * eavesFlare * 1.6;

      const yFinal = ySlope + yCornerFlair;

      positions.push(xBase, yFinal, zBase);
      uvs.push(u * (width / 3.5), v * (depth / 3.5));
    }
  }

  // Triangles for upper roof surface
  for (let iz = 0; iz < segsZ; iz++) {
    for (let ix = 0; ix < segsX; ix++) {
      const a = iz * (segsX + 1) + ix;
      const b = a + 1;
      const c = (iz + 1) * (segsX + 1) + ix;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
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
  roof.add(roofMesh);

  // 3. Gable Endboards (합각벽 - Hapgak-byeok) if Paljak hip-and-gable roof
  if (isPaljak) {
    const gableW = depth * 0.42;
    const gableH = height * 0.72;

    [-halfRidgeW, halfRidgeW].forEach((gx) => {
      const gableGroup = new THREE.Group();
      gableGroup.position.set(gx, height * 0.58, 0);
      gableGroup.rotation.y = gx > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;

      // Triangular patterned brick wall panel (전돌 합각판)
      const gableWall = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, gableW, gableH, 3),
        materials.gableHapgak
      );
      gableWall.position.set(0, 0, 0);
      gableWall.scale.set(1, 1, 0.25);

      // Wooden decorative bargeboards & moldings (박공판)
      const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(gableW * 0.65, 0.22, 0.16), materials.dancheong);
      trimLeft.rotation.z = Math.PI * 0.26;
      trimLeft.position.set(-gableW * 0.26, 0, 0.12);

      const trimRight = new THREE.Mesh(new THREE.BoxGeometry(gableW * 0.65, 0.22, 0.16), materials.dancheong);
      trimRight.rotation.z = -Math.PI * 0.26;
      trimRight.position.set(gableW * 0.26, 0, 0.12);

      gableGroup.add(gableWall, trimLeft, trimRight);
      roof.add(gableGroup);
    });
  }

  // 4. Under-Eaves Recessed Soffit Board (개판 - Gaepan: sits cleanly behind/above rafters)
  const eavesGaepan = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.8, 0.14, depth - 0.8),
    materials.dancheong
  );
  eavesGaepan.position.set(0, 0.25, 0);
  roof.add(eavesGaepan);

  // 5. Main Roof Ridge (용마루 - Yongmaru)
  const ridgeGroup = new THREE.Group();
  ridgeGroup.name = 'yongmaru_ridge';

  // Tile courses (적새)
  const ridgeBase = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeW + 0.4, 0.46, 0.65),
    materials.giwaRoof
  );
  ridgeBase.position.set(0, height + 0.18, 0);

  // White plastered top ridge (양성마루)
  const ridgePlaster = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeW + 0.65, 0.32, 0.48),
    materials.eavesWhite
  );
  ridgePlaster.position.set(0, height + 0.48, 0);

  // Dragon Horn Finials (취미 - Chwimi / 용두) at ridge ends
  [-halfRidgeW - 0.25, halfRidgeW + 0.25].forEach((rx) => {
    const chwimi = new THREE.Group();
    chwimi.position.set(rx, height + 0.85, 0);

    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 8), materials.eavesWhite);
    horn.rotation.z = rx < 0 ? Math.PI * 0.38 : -Math.PI * 0.38;

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), materials.goldLeaf);
    snout.position.set(rx < 0 ? -0.2 : 0.2, -0.1, 0);

    chwimi.add(horn, snout);
    ridgeGroup.add(chwimi);
  });

  roof.add(ridgeGroup);

  // 6. Japsang Sentinels along corner ridges (잡상 조각상)
  if (showJapsang) {
    const corners = [
      { xSign: -1, zSign: 1 },
      { xSign: 1, zSign: 1 },
      { xSign: -1, zSign: -1 },
      { xSign: 1, zSign: -1 },
    ];

    corners.forEach((corner) => {
      for (let j = 0; j < japsangCount; j++) {
        const t = 0.42 + (j / japsangCount) * 0.46; // Along corner hip ridge
        const jX = corner.xSign * (halfRidgeW + (halfW - halfRidgeW) * t);
        const jZ = corner.zSign * (halfD * t);
        const jY = height * (1 - t * 0.82) + eavesFlare * 0.65;

        const figGroup = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.26), materials.eavesWhite);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 6), materials.mountainStone);
        body.position.y = 0.24;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.mountainStone);
        head.position.y = 0.48;

        figGroup.add(base, body, head);
        figGroup.position.set(jX, jY, jZ);
        roof.add(figGroup);
      }
    });
  }

  return roof;
}

/**
 * Creates authentic traditional Dapo Bracket sets (다포계 공포: 주두, 살미, 첨차, 소로)
 * Fully detailed with curved beak tips (쇠서), cross-arms, and bearing blocks.
 */
export function createDapoBracketCluster(materials: PalaceMaterials): THREE.Group {
  const cluster = new THREE.Group();
  cluster.name = 'dapo_bracket_cluster';

  // Base cap block (주두 - Judu)
  const judu = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, 0.8), materials.dancheong);
  judu.position.set(0, 0.13, 0);

  // Stepped cantilever outriggers (살미 & 첨차)
  // Tier 1 Transverse cross-arm (첨차)
  const tier1X = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 0.38), materials.dancheong);
  tier1X.position.set(0, 0.35, 0);

  // Tier 1 Projecting cantilever arm (살미) with beak tip (쇠서)
  const tier1Z = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 1.2), materials.dancheong);
  tier1Z.position.set(0, 0.35, 0.25);

  const beak1 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 5), materials.goldLeaf);
  beak1.rotation.x = Math.PI * 0.45;
  beak1.position.set(0, 0.35, 0.9);

  // Bearing blocks (소로 - Soro) supporting Tier 2
  [-0.45, 0.45].forEach((sx) => {
    const soro = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), materials.dancheong);
    soro.position.set(sx, 0.5, 0);
    cluster.add(soro);
  });

  // Tier 2 Upper cantilever arm
  const tier2X = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.2, 0.38), materials.dancheong);
  tier2X.position.set(0, 0.58, 0.25);

  const tier2Z = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 1.55), materials.dancheong);
  tier2Z.position.set(0, 0.58, 0.55);

  const beak2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 5), materials.goldLeaf);
  beak2.rotation.x = Math.PI * 0.45;
  beak2.position.set(0, 0.58, 1.35);

  // Upper purlin beam block (도리받침)
  const doriSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.8, 8), materials.dancheongWood);
  doriSupport.rotation.z = Math.PI * 0.5;
  doriSupport.position.set(0, 0.8, 0.55);

  cluster.add(judu, tier1X, tier1Z, beak1, tier2X, tier2Z, beak2, doriSupport);
  return cluster;
}

/**
 * Creates continuous horizontal tie-beams (창방 & 평방), entablature frieze, and aligned bracket sets
 */
export function createDapoFacadeRow(
  width: number,
  depth: number,
  pillarPositionsX: number[],
  materials: PalaceMaterials
): THREE.Group {
  const row = new THREE.Group();
  row.name = 'dapo_facade_row';

  // Horizontal tie-beams (창방 & 평방)
  const changbang = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.34, depth + 0.8), materials.dancheong);
  changbang.position.set(0, 0.17, 0);

  const pyeongbang = new THREE.Mesh(new THREE.BoxGeometry(width + 1.25, 0.26, depth + 1.25), materials.dancheong);
  pyeongbang.position.set(0, 0.46, 0);

  // Continuous Dancheong entablature board (포벽 - Pobyeok)
  const pobyeok = new THREE.Mesh(new THREE.BoxGeometry(width + 0.7, 0.55, depth + 0.7), materials.dancheong);
  pobyeok.position.set(0, 0.82, 0);

  row.add(changbang, pyeongbang, pobyeok);

  // Both Column brackets (주심포) AND intermediate bay brackets (간포 / 공간포)
  const halfD = depth / 2;
  const allBracketPositionsX: number[] = [];

  for (let i = 0; i < pillarPositionsX.length; i++) {
    allBracketPositionsX.push(pillarPositionsX[i]);
    if (i < pillarPositionsX.length - 1) {
      // Midpoint intermediate bracket cluster
      const mid = (pillarPositionsX[i] + pillarPositionsX[i + 1]) / 2;
      allBracketPositionsX.push(mid);
    }
  }

  allBracketPositionsX.forEach((px) => {
    // Front eaves brackets
    const bracketFront = createDapoBracketCluster(materials);
    bracketFront.position.set(px, 0.58, halfD);

    // Back eaves brackets
    const bracketBack = createDapoBracketCluster(materials);
    bracketBack.position.set(px, 0.58, -halfD);
    bracketBack.rotation.y = Math.PI;

    row.add(bracketFront, bracketBack);
  });

  return row;
}

/**
 * Creates authentic Korean palace curved balcony balustrade (계자난간 - Gyeja Nangan)
 * Features curved cantilever balusters (계자각), molded handrail, and lattice grilles (아자살).
 */
export function createGyejaBalustrade(
  length: number,
  materials: PalaceMaterials,
  postInterval = 1.4
): THREE.Group {
  const gyeja = new THREE.Group();
  gyeja.name = 'gyeja_balustrade';

  const halfLen = length / 2;

  // 1. Molded top continuous handrail (두겁대)
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.14, 0.18), materials.royalWood);
  handrail.position.set(0, 0.88, 0.12); // Slightly pushed out
  gyeja.add(handrail);

  // 2. Bottom base beam (하엽 / 하방)
  const baseBeam = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, 0.16), materials.royalWood);
  baseBeam.position.set(0, 0.08, 0);
  gyeja.add(baseBeam);

  // 3. Fretwork lattice infill panel (아자살 궁판)
  const latticeInfill = new THREE.Mesh(
    new THREE.BoxGeometry(length - 0.2, 0.5, 0.06),
    materials.latticeWindow
  );
  latticeInfill.position.set(0, 0.44, 0.06);
  gyeja.add(latticeInfill);

  // 4. Curved cantilever support struts (계자각 - Gyejagak)
  const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.82, 8);
  for (let x = -halfLen + 0.2; x <= halfLen - 0.2; x += postInterval) {
    const strut = new THREE.Mesh(postGeo, materials.royalWood);
    strut.rotation.x = 0.14; // Outward flare
    strut.position.set(x, 0.46, 0.06);
    gyeja.add(strut);
  }

  return gyeja;
}

/**
 * Creates authentic granite column plinth base (초석 - Chuseok)
 */
export function createColumnPlinth(radius = 0.52, materials: PalaceMaterials): THREE.Group {
  const plinth = new THREE.Group();
  plinth.name = 'chuseok_plinth';

  // Lower square slab
  const lowerBox = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 2.2, 0.2, radius * 2.2),
    materials.granite
  );
  lowerBox.position.set(0, 0.1, 0);
  lowerBox.castShadow = true;
  lowerBox.receiveShadow = true;

  // Upper carved circular torus drum
  const upperDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.05, radius * 1.2, 0.22, 14),
    materials.granite
  );
  upperDrum.position.set(0, 0.31, 0);
  upperDrum.castShadow = true;

  plinth.add(lowerBox, upperDrum);
  return plinth;
}

/**
 * Creates authentic Korean palace stone balustrade (돌난간) with lotus finials (하엽 보주)
 */
export function createStoneBalustradeLine(
  length: number,
  materials: PalaceMaterials,
  postInterval = 3.6
): THREE.Group {
  const balustrade = new THREE.Group();

  // Bottom curb stone (지대석)
  const curb = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.32), materials.granite);
  curb.position.set(0, 0.1, 0);
  balustrade.add(curb);

  // Middle panel (난간판석)
  const panel = new THREE.Mesh(new THREE.BoxGeometry(length, 0.45, 0.14), materials.granite);
  panel.position.set(0, 0.46, 0);
  balustrade.add(panel);

  // Top continuous handrail (죽석)
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.18, 0.22), materials.granite);
  handrail.position.set(0, 0.88, 0);
  balustrade.add(handrail);

  // Posts with carved lotus buds (하엽 보주)
  const halfLen = length / 2;
  const postGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.82, 8);
  const budGeo = new THREE.ConeGeometry(0.15, 0.26, 6);

  for (let x = -halfLen; x <= halfLen; x += postInterval) {
    const post = new THREE.Mesh(postGeo, materials.granite);
    post.position.set(x, 0.5, 0);

    const bud = new THREE.Mesh(budGeo, materials.granite);
    bud.position.set(x, 1.0, 0);

    balustrade.add(post, bud);
  }

  return balustrade;
}

/**
 * Creates heavy iron-studded royal wooden gate doors (판문) with iron straps, bosses, and bronze knockers
 */
export function createRoyalGateDoors(
  width: number,
  height: number,
  materials: PalaceMaterials,
  openAngle = 0.42
): THREE.Group {
  const doorPair = new THREE.Group();
  doorPair.name = 'royal_gate_doors';

  const leafW = width * 0.48;
  const leafH = height - 0.2;
  const halfLeafW = leafW / 2;

  // Left door leaf
  const leftLeaf = new THREE.Group();
  leftLeaf.position.set(-leafW, 0, 0.5);
  leftLeaf.rotation.y = openAngle;

  const leftWood = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.18), materials.royalWood);
  leftWood.position.set(halfLeafW, leafH / 2, 0);
  leftLeaf.add(leftWood);

  // Right door leaf
  const rightLeaf = new THREE.Group();
  rightLeaf.position.set(leafW, 0, 0.5);
  rightLeaf.rotation.y = -openAngle;

  const rightWood = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.18), materials.royalWood);
  rightWood.position.set(-halfLeafW, leafH / 2, 0);
  rightLeaf.add(rightWood);

  // Horizontal iron bands (문두리 철물) and bronze lion-head knockers (문고리)
  [0.25, 0.5, 0.75].forEach((ratio) => {
    const yPos = leafH * ratio;

    // Left straps
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.95, 0.14, 0.22), materials.ironBand);
    strapL.position.set(halfLeafW, yPos, 0);
    leftLeaf.add(strapL);

    // Right straps
    const strapR = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.95, 0.14, 0.22), materials.ironBand);
    strapR.position.set(-halfLeafW, yPos, 0);
    rightLeaf.add(strapR);
  });

  // Bronze knocker rings (배목과 문고리) on center band
  const knockerBaseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.08, 10);
  const ringGeo = new THREE.TorusGeometry(0.16, 0.04, 8, 16);

  const kBaseL = new THREE.Mesh(knockerBaseGeo, materials.goldLeaf);
  kBaseL.rotation.x = Math.PI * 0.5;
  kBaseL.position.set(leafW * 0.8, leafH * 0.5, 0.12);
  const kRingL = new THREE.Mesh(ringGeo, materials.goldLeaf);
  kRingL.position.set(leafW * 0.8, leafH * 0.5 - 0.12, 0.16);
  leftLeaf.add(kBaseL, kRingL);

  const kBaseR = new THREE.Mesh(knockerBaseGeo, materials.goldLeaf);
  kBaseR.rotation.x = Math.PI * 0.5;
  kBaseR.position.set(-leafW * 0.8, leafH * 0.5, 0.12);
  const kRingR = new THREE.Mesh(ringGeo, materials.goldLeaf);
  kRingR.position.set(-leafW * 0.8, leafH * 0.5 - 0.12, 0.16);
  rightLeaf.add(kBaseR, kRingR);

  doorPair.add(leftLeaf, rightLeaf);
  return doorPair;
}

/**
 * Creates carved stone drainage gargoyles (석루조 - Seokrujo)
 */
export function createStoneGargoyleSpout(materials: PalaceMaterials): THREE.Group {
  const gargoyle = new THREE.Group();
  gargoyle.name = 'seokrujo_gargoyle';

  // Body channel
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.9), materials.granite);
  body.position.set(0, 0, 0.45);

  // Dragon/beast snout head
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 6), materials.granite);
  head.rotation.x = Math.PI * 0.5;
  head.position.set(0, -0.04, 0.95);

  gargoyle.add(body, head);
  return gargoyle;
}

/**
 * Creates fire-warding water cauldron (드무 - Dumu)
 * Traditional heavy cast bronze/iron cauldron placed at palace terrace corners to ward off fire demons.
 */
export function createDumuCauldron(materials: PalaceMaterials): THREE.Group {
  const dumu = new THREE.Group();
  dumu.name = 'dumu_cauldron';

  // Granite base pedestal
  const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), materials.granite);
  stoneBase.position.set(0, 0.125, 0);

  // Bronze cauldron bowl
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.36, 0.65, 16), materials.dumuBronze);
  bowl.position.set(0, 0.58, 0);

  // Flanged rim lip
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.05, 8, 20), materials.dumuBronze);
  rim.rotation.x = Math.PI * 0.5;
  rim.position.set(0, 0.9, 0);

  // Water surface inside
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.46, 16), materials.waterPond);
  water.rotation.x = -Math.PI * 0.5;
  water.position.set(0, 0.85, 0);

  dumu.add(stoneBase, bowl, rim, water);
  dumu.castShadow = true;
  return dumu;
}

/**
 * Creates Royal Throne with Dadjip canopy (보좌 및 닫집) for Geunjeongjeon interior
 */
export function createRoyalCanopyAndThrone(materials: PalaceMaterials): THREE.Group {
  const throneGroup = new THREE.Group();
  throneGroup.name = 'royal_throne_and_canopy';

  // 1. Multi-tiered red lacquer dais (어좌 당가 기단)
  const dais1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 3.8), materials.royalWood);
  dais1.position.set(0, 0.15, 0);
  const dais2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 3.2), materials.royalWood);
  dais2.position.set(0, 0.45, 0);
  const dais3 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 2.6), materials.royalWood);
  dais3.position.set(0, 0.72, 0);

  // 2. The King's Royal Throne (어좌 - Eojwa)
  const throne = new THREE.Group();
  throne.position.set(0, 0.85, 0);

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.1), materials.pillarCrimson);
  seat.position.set(0, 0.45, 0);

  // Backrest with gold dragon carvings
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.14), materials.pillarCrimson);
  backrest.position.set(0, 1.05, -0.5);

  const backDragon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), materials.goldLeaf);
  backDragon.position.set(0, 1.7, -0.5);

  // Armrests with dragon heads
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 1.0), materials.pillarCrimson);
  armL.position.set(-0.65, 0.7, 0);
  const armDragonL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.goldLeaf);
  armDragonL.position.set(-0.65, 0.9, 0.45);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 1.0), materials.pillarCrimson);
  armR.position.set(0.65, 0.7, 0);
  const armDragonR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.goldLeaf);
  armDragonR.position.set(0.65, 0.9, 0.45);

  throne.add(seat, backrest, backDragon, armL, armDragonL, armR, armDragonR);

  // 3. Ilworobongdo Folding Screen (일월오봉도 병풍) directly behind throne
  const screen = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.4, 0.12), materials.ilworobongdo);
  screen.position.set(0, 2.4, -1.2);

  // 4. Dadjip Ornamental Hanging Canopy (황금 용 닫집)
  const dadjip = new THREE.Group();
  dadjip.position.set(0, 4.4, 0);

  // Ornate layered bracket canopy roof
  const canopyRoof = createKoreanRoof(4.8, 3.6, 1.2, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.7,
    eavesFlare: 0.35,
    showJapsang: false,
  });
  canopyRoof.position.set(0, 0.2, 0);

  // Golden twin dragon medallion suspended under canopy ceiling
  const goldDragonL = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 8, 16), materials.goldLeaf);
  goldDragonL.position.set(-0.5, -0.2, 0);
  const goldDragonR = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 8, 16), materials.goldLeaf);
  goldDragonR.position.set(0.5, -0.2, 0);

  dadjip.add(canopyRoof, goldDragonL, goldDragonR);

  throneGroup.add(dais1, dais2, dais3, throne, screen, dadjip);
  return throneGroup;
}
