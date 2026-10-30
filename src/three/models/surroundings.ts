import * as THREE from 'three';
import { PalaceMaterials } from '../materials';

/**
 * Creates scenic palace surroundings:
 * 1. Mt. Bugaksan (북악산 / 백악산) dramatic granite peaks in the north backdrop
 * 2. Palace Perimeter Walls (궁궐 담장) & Corner Watchtower (동십자각)
 * 3. Traditional Korean Red Pines (적송)
 * 4. Sumunjang Royal Guards & Ceremonial Banners (수문장 및 의장기)
 */
export function buildSurroundings(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'palace_surroundings';

  // 1. Mt. Bugaksan (북악산 - 웅장한 화강암 암봉과 능선)
  // Positioned directly north behind Geunjeongjeon (Z = -190 to -240)
  const mountainGroup = new THREE.Group();
  mountainGroup.name = 'mt_bugaksan';

  // Main central peak (백악산 주봉 - Baegak peak)
  const mainPeakGeo = new THREE.ConeGeometry(55, 68, 7);
  const mainPeak = new THREE.Mesh(mainPeakGeo, materials.mountainStone);
  mainPeak.position.set(0, 34, -200);
  mainPeak.scale.set(1.4, 1.0, 0.9);
  mainPeak.rotation.y = 0.4;
  mountainGroup.add(mainPeak);

  // Western shoulder ridge (서측 능선 / 창의문 방면)
  const westRidge = new THREE.Mesh(new THREE.ConeGeometry(46, 52, 6), materials.mountainStone);
  westRidge.position.set(-68, 26, -185);
  westRidge.scale.set(1.3, 1.0, 1.1);
  mountainGroup.add(westRidge);

  // Eastern shoulder ridge (동측 능선 / 숙정문 방면)
  const eastRidge = new THREE.Mesh(new THREE.ConeGeometry(48, 54, 6), materials.mountainStone);
  eastRidge.position.set(65, 27, -190);
  eastRidge.scale.set(1.2, 1.0, 1.0);
  mountainGroup.add(eastRidge);

  // Inwangsan silhouette in distance West
  const inwang = new THREE.Mesh(new THREE.ConeGeometry(60, 60, 6), materials.mountainStone);
  inwang.position.set(-150, 30, -140);
  mountainGroup.add(inwang);

  root.add(mountainGroup);

  // 2. Palace Outer Walls (궁궐 담장) with tiled roof caps
  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'palace_walls';

  // East Wall
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 160), materials.granite);
  eastWall.position.set(48, 2.1, -40);
  const eastWallCap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 160.4), materials.giwaRoof);
  eastWallCap.position.set(48, 4.4, -40);
  wallsGroup.add(eastWall, eastWallCap);

  // West Wall
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 160), materials.granite);
  westWall.position.set(-48, 2.1, -40);
  const westWallCap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 160.4), materials.giwaRoof);
  westWallCap.position.set(-48, 4.4, -40);
  wallsGroup.add(westWall, westWallCap);

  // North Back Wall
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(98, 4.2, 1.6), materials.granite);
  northWall.position.set(0, 2.1, -120);
  const northWallCap = new THREE.Mesh(new THREE.BoxGeometry(98.4, 0.4, 2.4), materials.giwaRoof);
  northWallCap.position.set(0, 4.4, -120);
  wallsGroup.add(northWall, northWallCap);

  // Watchtower: Dongsipjagak (동십자각 - Corner Watchtower)
  const watchtower = new THREE.Group();
  watchtower.name = 'dongsipjagak';
  watchtower.position.set(48, 0, 12);

  const wtBase = new THREE.Mesh(new THREE.BoxGeometry(8, 4.8, 8), materials.granite);
  wtBase.position.set(0, 2.4, 0);
  const wtPavilion = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 6), materials.dancheong);
  wtPavilion.position.set(0, 6.1, 0);
  const wtRoof = new THREE.Mesh(new THREE.ConeGeometry(5.4, 2.4, 4), materials.giwaRoof);
  wtRoof.rotation.y = Math.PI * 0.25;
  wtRoof.position.set(0, 8.4, 0);
  watchtower.add(wtBase, wtPavilion, wtRoof);
  wallsGroup.add(watchtower);

  root.add(wallsGroup);

  // 3. Korean Red Pine Trees (한국 전통 조경수 소나무 / 적송)
  function createPineTree(scale = 1.0): THREE.Group {
    const tree = new THREE.Group();
    // Twisted bent trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 4.8 * scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, materials.royalWood);
    trunk.rotation.z = (Math.random() - 0.5) * 0.35;
    trunk.rotation.x = (Math.random() - 0.5) * 0.25;
    trunk.position.set(0, 2.4 * scale, 0);
    tree.add(trunk);

    // Layered umbrella canopy needles
    for (let l = 0; l < 3; l++) {
      const needleGeo = new THREE.ConeGeometry((2.4 - l * 0.4) * scale, 1.2 * scale, 8);
      const needles = new THREE.Mesh(needleGeo, materials.pineNeedles);
      needles.position.set(
        (Math.random() - 0.5) * 0.4 * scale,
        (4.2 + l * 1.0) * scale,
        (Math.random() - 0.5) * 0.4 * scale
      );
      tree.add(needles);
    }
    return tree;
  }

  // Plant pine clusters in courtyard gardens and flanks
  const treePositions = [
    [-22, 0, 8],
    [-28, 0, -15],
    [22, 0, 8],
    [28, 0, -15],
    [-42, 0, -45],
    [42, 0, -45],
    [-34, 0, -90],
    [34, 0, -90],
    [-18, 0, 52],
    [18, 0, 52],
  ];

  treePositions.forEach(([tx, ty, tz]) => {
    const tree = createPineTree(1.0 + (Math.random() - 0.5) * 0.4);
    tree.position.set(tx, ty, tz);
    root.add(tree);
  });

  // 4. Sumunjang Royal Guards (수문장 교대의식 호위군)
  function createGuardFigure(colorHex: number): THREE.Group {
    const guard = new THREE.Group();
    const robeMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });

    // Lower robe
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.3, 8), robeMat);
    robe.position.set(0, 0.65, 0);

    // Torso & head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.mountainStone);
    head.position.set(0, 1.5, 0);

    // Traditional Joseon Gat hat with wide brim (갓 / 주립)
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 12), hatMat);
    hatBrim.position.set(0, 1.62, 0);
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.28, 10), hatMat);
    hatTop.position.set(0, 1.76, 0);

    // Ceremonial Spear (월도 / 창)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), materials.royalWood);
    shaft.position.set(0.35, 1.3, 0.2);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 4), materials.goldLeaf);
    spearTip.position.set(0.35, 2.7, 0.2);

    guard.add(robe, head, hatBrim, hatTop, shaft, spearTip);
    return guard;
  }

  // Guard positions in front of Gwanghwamun gate flanking the Woldae terrace ramp
  const guardCoords = [
    [-6.2, 0.8, 18, 0x1d3a78], // Blue robe (청호위)
    [6.2, 0.8, 18, 0x9b2424],  // Red robe (적호위)
    [-11.5, 0, 14, 0xd49b29], // Yellow robe (수문장)
    [11.5, 0, 14, 0x1c4a3b],  // Green robe
  ];

  guardCoords.forEach(([gx, gy, gz, color]) => {
    const guard = createGuardFigure(color);
    guard.position.set(gx, gy, gz);
    guard.castShadow = true;
    root.add(guard);
  });

  // Royal Joseon Banners (의장기 - 용기, 초요기, 순라기) placed proudly along terrace flanks
  const bannerMat = new THREE.MeshStandardMaterial({
    color: 0x9e2a2b,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  [-9.2, 9.2].forEach((bx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 8), materials.goldLeaf);
    pole.position.set(bx, 3.1, 26);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), bannerMat);
    flag.position.set(bx + (bx > 0 ? 0.8 : -0.8), 4.8, 26);
    root.add(pole, flag);
  });

  return root;
}
