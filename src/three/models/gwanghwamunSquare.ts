import * as THREE from 'three';
import { PalaceMaterials } from '../materials';

/**
 * Creates Gwanghwamun Square landmarks:
 * 1. King Sejong the Great Statue (세종대왕 동상) with Hunminjeongeum, Cheugugi, Honcheonui
 * 2. Admiral Yi Sun-sin Statue (이순신 장군 동상) with Turtle Ship (거북선) and Victory Fountains
 */
export function buildGwanghwamunSquare(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'gwanghwamun_square_root';

  // 1. King Sejong the Great (세종대왕 동상) - Located along Z = 60, X = 0
  const sejongGroup = new THREE.Group();
  sejongGroup.name = 'sejong_statue';
  sejongGroup.position.set(0, 0, 68);

  // Large Granite Pedestal (기단석)
  const sejongBase1 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.6, 8.2), materials.granite);
  sejongBase1.position.set(0, 0.3, 0);
  const sejongBase2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.2, 6.8), materials.granite);
  sejongBase2.position.set(0, 1.7, 0);
  sejongGroup.add(sejongBase1, sejongBase2);

  // Royal Dragon Throne Chair (청동 어좌)
  const throne = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 2.2), materials.bronzeStatue);
  throne.position.set(0, 3.8, -0.4);
  sejongGroup.add(throne);

  // King Sejong Seated Figure
  // Lower body & royal robe (Gonryongpo / 익선관 & 곤룡포)
  const robeBottom = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), materials.bronzeStatue);
  robeBottom.position.set(0, 3.5, 0.1);
  // Upper torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 2.0, 10), materials.bronzeStatue);
  torso.position.set(0, 4.9, 0);
  // Head with royal Ikseongwan winged crown (익선관)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 10), materials.bronzeStatue);
  head.position.set(0, 6.1, 0.1);
  const crownWings = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.15), materials.bronzeStatue);
  crownWings.position.set(0, 6.4, -0.2);

  // Right Arm raised benevolently
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.2, 8), materials.bronzeStatue);
  rightArm.rotation.z = -Math.PI * 0.28;
  rightArm.rotation.x = -Math.PI * 0.2;
  rightArm.position.set(0.9, 5.0, 0.6);

  // Left Hand holding the Hunminjeongeum book (훈민정음 책)
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.0, 8), materials.bronzeStatue);
  leftArm.rotation.z = Math.PI * 0.25;
  leftArm.position.set(-0.8, 4.8, 0.4);

  const hunminBook = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.8), materials.goldLeaf);
  hunminBook.rotation.x = Math.PI * 0.2;
  hunminBook.position.set(-0.7, 4.6, 0.8);

  sejongGroup.add(robeBottom, torso, head, crownWings, rightArm, leftArm, hunminBook);

  // Scientific Inventions displayed in front of pedestal:
  // (1) Cheugugi (측우기 - World's first standardized rain gauge)
  const rainGaugePedestal = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), materials.granite);
  rainGaugePedestal.position.set(-2.2, 0.45, 5.2);
  const rainGaugeCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.8, 12), materials.bronzeStatue);
  rainGaugeCylinder.position.set(-2.2, 1.3, 5.2);
  sejongGroup.add(rainGaugePedestal, rainGaugeCylinder);

  // (2) Honcheonui (혼천의 - Armillary Sphere astronomical instrument)
  const honcheonuiBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.2), materials.granite);
  honcheonuiBase.position.set(0, 0.35, 5.2);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 16), materials.bronzeStatue);
  ring1.position.set(0, 1.2, 5.2);
  const ring2 = ring1.clone();
  ring2.rotation.x = Math.PI * 0.5;
  const ring3 = ring1.clone();
  ring3.rotation.y = Math.PI * 0.5;
  sejongGroup.add(honcheonuiBase, ring1, ring2, ring3);

  // (3) Angbuilgu (앙부일구 - Hemispherical concave sundial)
  const sundialBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), materials.granite);
  sundialBase.position.set(2.2, 0.4, 5.2);
  const sundialBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    materials.bronzeStatue
  );
  sundialBowl.rotation.x = Math.PI;
  sundialBowl.position.set(2.2, 0.95, 5.2);
  sejongGroup.add(sundialBase, sundialBowl);

  root.add(sejongGroup);

  // 2. Admiral Yi Sun-sin (충무공 이순신 장군 동상) - Located further south at Z = 118, X = 0
  const yisunsinGroup = new THREE.Group();
  yisunsinGroup.name = 'yisunsin_statue';
  yisunsinGroup.position.set(0, 0, 120);

  // Tall Stately Granite Pedestal (Height 10.5m)
  const yiPedestalLower = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.0, 5.8), materials.granite);
  yiPedestalLower.position.set(0, 0.5, 0);
  const yiPedestalShaft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7.8, 4.2), materials.granite);
  yiPedestalShaft.position.set(0, 4.9, 0);
  yisunsinGroup.add(yiPedestalLower, yiPedestalShaft);

  // Standing Statue of Admiral Yi (청동 입상)
  const yiArmorTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 2.4, 10), materials.bronzeStatue);
  yiArmorTorso.position.set(0, 10.0, 0);

  // Helmet with dragon crest (두정갑 투구)
  const yiHelmet = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 8), materials.bronzeStatue);
  yiHelmet.position.set(0, 11.6, 0);

  // Long Commander's Sword (환도 - firmly resting on ground)
  const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.2), materials.bronzeStatue);
  swordBlade.position.set(0.6, 9.4, 0.4);

  // Regal cape draping down the back
  const cape = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.5, 0.15), materials.bronzeStatue);
  cape.position.set(0, 9.8, -0.6);

  yisunsinGroup.add(yiArmorTorso, yiHelmet, swordBlade, cape);

  // Turtle Ship (거북선 - Geobukseon) Model at base of statue
  const turtleGroup = new THREE.Group();
  turtleGroup.name = 'turtle_ship';
  turtleGroup.position.set(0, 0.9, 4.2);

  // Ship wooden hull (선체)
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 4.4), materials.royalWood);
  hull.position.set(0, 0.35, 0);

  // Iron spiked roof turtle shell (철갑 덮개)
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 3.8, 8), materials.bronzeStatue);
  shell.rotation.x = Math.PI * 0.5;
  shell.scale.set(1.0, 0.45, 1.0);
  shell.position.set(0, 0.9, 0);

  // Dragon Head Prow (용두 - breathing smoke/cannon fire)
  const dragonNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.9, 6), materials.bronzeStatue);
  dragonNeck.rotation.x = Math.PI * 0.25;
  dragonNeck.position.set(0, 1.1, 2.3);
  const dragonHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.5), materials.bronzeStatue);
  dragonHead.position.set(0, 1.5, 2.6);

  turtleGroup.add(hull, shell, dragonNeck, dragonHead);
  yisunsinGroup.add(turtleGroup);

  // 12.23 Fountains Basin (분수대)
  const fountainBase = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 16), materials.granite);
  fountainBase.position.set(0, 0.1, 14);
  const fountainWater = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 15.6), materials.waterPond);
  fountainWater.rotation.x = -Math.PI * 0.5;
  fountainWater.position.set(0, 0.22, 14);
  yisunsinGroup.add(fountainBase, fountainWater);

  root.add(yisunsinGroup);

  return root;
}
