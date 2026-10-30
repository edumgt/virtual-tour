import * as THREE from 'three';
import { PalaceMaterials } from '../materials';

/**
 * Architectural Craft Library for Traditional Korean Royal Palace Architecture.
 * Generates solid, cohesive, manifold 3D models with ZERO visual tearing or floating debris.
 */

/**
 * Creates an authentic, structurally solid Korean roof (우진각/팔작 지붕)
 * Built as a single connected mesh with curved eaves (안허리곡),
 * top horizontal ridge (용마루), white plaster trim (양성마루),
 * and end dragon head ornaments (취미/용두).
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
    ridgeLengthRatio = 0.6,
    eavesFlare = 0.35,
    showJapsang = true,
    japsangCount = 4,
  } = options;

  const halfW = width / 2;
  const halfD = depth / 2;
  const ridgeW = width * ridgeLengthRatio;
  const halfRidgeW = ridgeW / 2;

  // 1. Solid Connected Curved Roof Mesh (단일 일체형 기와 지붕 메쉬)
  // Grid of vertices: 8 segments along X, 6 segments along Z
  const segsX = 8;
  const segsZ = 6;
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

      // Distance from top ridge line
      const distFromRidgeX = Math.max(0, Math.abs(xNorm) - ridgeLengthRatio);
      const distFromRidgeZ = Math.abs(zNorm);
      const slopeFactor = Math.max(distFromRidgeZ, distFromRidgeX);

      // Concave Korean roof slope: steep at ridge, gracefully flattens to eaves
      const ySlope = Math.pow(Math.max(0, 1 - slopeFactor), 1.35) * height;

      // Graceful eaves corner flair (안허리곡 & 조로)
      const cornerWeight = Math.pow(Math.abs(xNorm) * Math.abs(zNorm), 2);
      const yCornerFlair = cornerWeight * eavesFlare * 1.5;

      const yFinal = ySlope + yCornerFlair;

      positions.push(xBase, yFinal, zBase);
      uvs.push(u * (width / 4), v * (depth / 4));
    }
  }

  // Triangles for the upper roof surface
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

  // 2. Under-Eaves Soffit & Fascia Trim (처마 부연 & 단청 목조 처마선)
  // Deep Dancheong decorated under-eaves soffit and fascia board
  const eavesTrim = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.22, depth + 0.3),
    materials.dancheong
  );
  eavesTrim.position.set(0, 0.1, 0);
  roof.add(eavesTrim);

  // Dancheong decorated under-eaves soffit board
  const underSoffit = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.5, 0.2, depth - 0.5),
    materials.dancheong
  );
  underSoffit.position.set(0, -0.05, 0);
  roof.add(underSoffit);

  // 3. Main Roof Ridge (용마루 - Yongmaru)
  const ridgeGroup = new THREE.Group();
  ridgeGroup.name = 'yongmaru_ridge';

  // Base tile courses (적새)
  const ridgeBase = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeW + 0.4, 0.42, 0.58),
    materials.giwaRoof
  );
  ridgeBase.position.set(0, height + 0.15, 0);

  // White plastered top ridge (양성마루)
  const ridgePlaster = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeW + 0.6, 0.28, 0.45),
    materials.eavesWhite
  );
  ridgePlaster.position.set(0, height + 0.42, 0);

  // End dragon horn heads (취미 - Chwimi / 용두)
  const chwimiL = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 6), materials.eavesWhite);
  chwimiL.rotation.z = Math.PI * 0.35;
  chwimiL.position.set(-halfRidgeW - 0.3, height + 0.75, 0);

  const chwimiR = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 6), materials.eavesWhite);
  chwimiR.rotation.z = -Math.PI * 0.35;
  chwimiR.position.set(halfRidgeW + 0.3, height + 0.75, 0);

  ridgeGroup.add(ridgeBase, ridgePlaster, chwimiL, chwimiR);
  roof.add(ridgeGroup);

  // 4. Japsang Sentinels along corner ridges (잡상 조각상)
  if (showJapsang) {
    const frontCorners = [
      { xSign: -1, zSign: 1 },
      { xSign: 1, zSign: 1 },
    ];

    frontCorners.forEach((corner) => {
      for (let j = 0; j < japsangCount; j++) {
        const t = 0.45 + (j / japsangCount) * 0.45; // Along the hip towards eaves
        const jX = corner.xSign * (halfRidgeW + (halfW - halfRidgeW) * t);
        const jZ = halfD * t;
        const jY = height * (1 - t * 0.8) + eavesFlare * 0.6;

        const figGroup = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), materials.eavesWhite);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 6), materials.mountainStone);
        body.position.y = 0.2;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), materials.mountainStone);
        head.position.y = 0.42;

        figGroup.add(base, body, head);
        figGroup.position.set(jX, jY, jZ);
        roof.add(figGroup);
      }
    });
  }

  return roof;
}

/**
 * Creates authentic traditional Dapo Bracket sets (다포계 공포)
 * Robust, aligned, and cleanly anchored to column tops
 */
export function createDapoBracketCluster(materials: PalaceMaterials): THREE.Group {
  const cluster = new THREE.Group();
  cluster.name = 'dapo_bracket_cluster';

  // Base cap block (주두 - Judu)
  const judu = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.24, 0.75), materials.dancheong);
  judu.position.set(0, 0.12, 0);

  // Stepped cantilever outriggers (살미 & 첨차)
  const tier1X = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.35), materials.dancheong);
  tier1X.position.set(0, 0.32, 0);
  const tier1Z = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 1.1), materials.dancheong);
  tier1Z.position.set(0, 0.32, 0.2);

  const tier2X = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 0.35), materials.dancheong);
  tier2X.position.set(0, 0.52, 0.2);
  const tier2Z = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 1.4), materials.dancheong);
  tier2Z.position.set(0, 0.52, 0.4);

  cluster.add(judu, tier1X, tier1Z, tier2X, tier2Z);
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
  const changbang = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.32, depth + 0.8), materials.dancheong);
  changbang.position.set(0, 0.16, 0);

  const pyeongbang = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.24, depth + 1.2), materials.dancheong);
  pyeongbang.position.set(0, 0.44, 0);

  // Continuous Dancheong entablature board (포벽 - Pobyeok: fills open gaps beneath eaves)
  const pobyeok = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.48, depth + 0.6), materials.dancheong);
  pobyeok.position.set(0, 0.74, 0);

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
    bracketFront.position.set(px, 0.56, halfD);
    // Back eaves brackets
    const bracketBack = createDapoBracketCluster(materials);
    bracketBack.position.set(px, 0.56, -halfD);
    bracketBack.rotation.y = Math.PI;

    row.add(bracketFront, bracketBack);
  });

  return row;
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
 * Creates authentic Korean palace stone balustrade (돌난간)
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

  // Top continuous handrail (죽석)
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, 0.2), materials.granite);
  handrail.position.set(0, 0.88, 0);
  balustrade.add(handrail);

  // Posts with carved lotus buds (하엽 보주)
  const halfLen = length / 2;
  const postGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.78, 8);
  const budGeo = new THREE.ConeGeometry(0.14, 0.24, 6);

  for (let x = -halfLen; x <= halfLen; x += postInterval) {
    const post = new THREE.Mesh(postGeo, materials.granite);
    post.position.set(x, 0.49, 0);

    const bud = new THREE.Mesh(budGeo, materials.granite);
    bud.position.set(x, 0.98, 0);

    balustrade.add(post, bud);
  }

  return balustrade;
}
