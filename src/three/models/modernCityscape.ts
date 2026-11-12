import * as THREE from 'three';
import { PalaceMaterials } from '../materials';

/**
 * Creates modern Gwanghwamun Crossroad & Sejong-daero skyscrapers and streetscape:
 * 1. Government Complex Seoul (정부서울청사)
 * 2. Sejong Center for the Performing Arts (세종문화회관)
 * 3. National Museum of Korean Contemporary History (대한민국역사박물관)
 * 4. KT Gwanghwamun High-Rise Tower (KT 광화문빌딩)
 * 5. Kyobo Life Insurance Building (교보생명 빌딩 - César Pelli design)
 * 6. Ilmin Museum / Dong-A Media Center (일민미술관 & 동아미디어센터)
 * 7. Gwanghwamun Crossroad Avenue (광화문 사거리 도로망, 횡단보도, 가로등, 도심 차량)
 */
export function buildModernCityscape(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'modern_cityscape_root';

  // ========================================================
  // 1. Government Complex Seoul (정부서울청사) - West (X = -72, Z = 60)
  // ========================================================
  const govGroup = new THREE.Group();
  govGroup.name = 'gov_complex_seoul';
  govGroup.position.set(-74, 0, 60);

  // Main 19-storey monolithic bureaucratic tower
  const govMainTower = new THREE.Mesh(
    new THREE.BoxGeometry(44, 52, 24),
    materials.modernGovernment
  );
  govMainTower.position.set(0, 26, 0);
  govMainTower.castShadow = true;
  govMainTower.receiveShadow = true;

  // Annex wings (North and South setbacks)
  const govNorthWing = new THREE.Mesh(
    new THREE.BoxGeometry(16, 34, 18),
    materials.modernGovernment
  );
  govNorthWing.position.set(0, 17, -20);

  const govSouthWing = new THREE.Mesh(
    new THREE.BoxGeometry(16, 34, 18),
    materials.modernGovernment
  );
  govSouthWing.position.set(0, 17, 20);

  // Rooftop mechanical penthouse & communications mast
  const govPenthouse = new THREE.Mesh(
    new THREE.BoxGeometry(22, 5, 14),
    materials.modernConcrete
  );
  govPenthouse.position.set(0, 54.5, 0);

  const antennaPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.4, 14, 8),
    materials.modernMullion
  );
  antennaPole.position.set(0, 63, 0);

  // Entrance podium & National Flagpole (국기게양대 태극기)
  const govPodium = new THREE.Mesh(
    new THREE.BoxGeometry(48, 1.2, 32),
    materials.granite
  );
  govPodium.position.set(2, 0.6, 0);

  const flagpole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 10, 8),
    materials.goldLeaf
  );
  flagpole.position.set(20, 5, 0);

  const flagMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    roughness: 0.6,
  });
  const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), flagMat);
  flagMesh.position.set(21.3, 8.8, 0);

  govGroup.add(
    govMainTower,
    govNorthWing,
    govSouthWing,
    govPenthouse,
    antennaPole,
    govPodium,
    flagpole,
    flagMesh
  );
  root.add(govGroup);

  // ========================================================
  // 2. Sejong Center for the Performing Arts (세종문화회관) - West (X = -72, Z = 115)
  // ========================================================
  const sejongCenterGroup = new THREE.Group();
  sejongCenterGroup.name = 'sejong_center';
  sejongCenterGroup.position.set(-72, 0, 115);

  // Grand monumental terrace base with steps facing Sejong-daero
  const centerPlaza = new THREE.Mesh(
    new THREE.BoxGeometry(42, 2.4, 46),
    materials.granite
  );
  centerPlaza.position.set(0, 1.2, 0);

  // Grand front stairs cascade down toward the boulevard
  for (let s = 0; s < 6; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.4, 38),
      materials.granite
    );
    step.position.set(21 + s * 1.4, 2.0 - s * 0.35, 0);
    sejongCenterGroup.add(step);
  }

  // Main Auditorium Hall Box (Massive granite block)
  const hallMain = new THREE.Mesh(
    new THREE.BoxGeometry(34, 28, 38),
    materials.modernConcrete
  );
  hallMain.position.set(-3, 16.4, 0);
  hallMain.castShadow = true;

  // Front Glass Atrium Foyer
  const glassFoyer = new THREE.Mesh(
    new THREE.BoxGeometry(4, 22, 34),
    materials.modernGlass
  );
  glassFoyer.position.set(13.5, 13.4, 0);

  // Iconic Monumental Colonnade (거대한 한국형 현대 석조 열주 - 8개 기둥)
  const pillarCount = 8;
  const pillarSpacing = 32 / (pillarCount - 1);
  for (let p = 0; p < pillarCount; p++) {
    const pz = -16 + p * pillarSpacing;
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 22, 2.0),
      materials.granitePlinth
    );
    col.position.set(16.5, 13.4, pz);
    col.castShadow = true;
    sejongCenterGroup.add(col);
  }

  // Monumental Korean cantilevered roof cornice (처마 모티프 대형 처마보)
  const cornice = new THREE.Mesh(
    new THREE.BoxGeometry(38, 3.6, 42),
    materials.granite
  );
  cornice.position.set(-1, 29, 0);

  const roofCrest = new THREE.Mesh(
    new THREE.BoxGeometry(32, 1.8, 36),
    materials.modernConcrete
  );
  roofCrest.position.set(-1, 31.6, 0);

  sejongCenterGroup.add(centerPlaza, hallMain, glassFoyer, cornice, roofCrest);
  root.add(sejongCenterGroup);

  // ========================================================
  // 3. National Museum of Korean Contemporary History (대한민국역사박물관) - East (X = +68, Z = 45)
  // ========================================================
  const museumGroup = new THREE.Group();
  museumGroup.name = 'history_museum';
  museumGroup.position.set(68, 0, 45);

  // Lower Stone Plinth
  const museumBase = new THREE.Mesh(
    new THREE.BoxGeometry(34, 6, 32),
    materials.modernConcrete
  );
  museumBase.position.set(0, 3, 0);

  // Upper Glass Box with modern vertical louvers
  const museumGlassTower = new THREE.Mesh(
    new THREE.BoxGeometry(32, 24, 30),
    materials.modernGlass
  );
  museumGlassTower.position.set(0, 18, 0);
  museumGlassTower.castShadow = true;

  // Famous Rooftop Observation Deck facing Gwanghwamun (옥상 전망대 정원)
  const roofDeck = new THREE.Mesh(
    new THREE.BoxGeometry(30, 1.2, 28),
    materials.royalWood
  );
  roofDeck.position.set(0, 30.6, 0);

  const glassRailing = new THREE.Mesh(
    new THREE.BoxGeometry(30.4, 1.2, 28.4),
    materials.modernGlass
  );
  glassRailing.position.set(0, 31.8, 0);

  museumGroup.add(museumBase, museumGlassTower, roofDeck, glassRailing);
  root.add(museumGroup);

  // ========================================================
  // 4. KT Gwanghwamun High-Rise Tower (KT 광화문빌딩) - East (X = +72, Z = 98)
  // ========================================================
  const ktGroup = new THREE.Group();
  ktGroup.name = 'kt_building';
  ktGroup.position.set(72, 0, 98);

  // Sleek 24-storey glass curtain wall tower
  const ktMainTower = new THREE.Mesh(
    new THREE.BoxGeometry(32, 64, 28),
    materials.modernGlass
  );
  ktMainTower.position.set(0, 32, 0);
  ktMainTower.castShadow = true;

  // Metallic structural core band & rooftop telecommunications mast
  const ktCore = new THREE.Mesh(
    new THREE.BoxGeometry(8, 68, 30),
    materials.modernMullion
  );
  ktCore.position.set(13, 34, 0);

  const ktCrown = new THREE.Mesh(
    new THREE.BoxGeometry(30, 4, 26),
    materials.modernMullion
  );
  ktCrown.position.set(0, 66, 0);

  const ktAntenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.35, 16, 8),
    materials.modernMullion
  );
  ktAntenna.position.set(0, 75, 0);

  ktGroup.add(ktMainTower, ktCore, ktCrown, ktAntenna);
  root.add(ktGroup);

  // ========================================================
  // 5. Kyobo Life Building (교보생명 빌딩 - César Pelli) - Southeast Intersection (X = +70, Z = 160)
  // ========================================================
  const kyoboGroup = new THREE.Group();
  kyoboGroup.name = 'kyobo_building';
  kyoboGroup.position.set(70, 0, 160);

  // Lower stepped base
  const kyoboBase = new THREE.Mesh(
    new THREE.BoxGeometry(46, 12, 38),
    materials.kyoboFacade
  );
  kyoboBase.position.set(0, 6, 0);

  // 24-Storey Main Tower with signature stepped setbacks
  const kyoboMidTower = new THREE.Mesh(
    new THREE.BoxGeometry(40, 50, 34),
    materials.kyoboFacade
  );
  kyoboMidTower.position.set(0, 37, 0);
  kyoboMidTower.castShadow = true;

  // Upper setback crown (César Pelli signature tiered crown)
  const kyoboCrown1 = new THREE.Mesh(
    new THREE.BoxGeometry(34, 10, 28),
    materials.kyoboFacade
  );
  kyoboCrown1.position.set(0, 67, 0);

  const kyoboCrown2 = new THREE.Mesh(
    new THREE.BoxGeometry(26, 6, 20),
    materials.modernMullion
  );
  kyoboCrown2.position.set(0, 75, 0);

  // Famous Gwanghwamun Kyobo Plaque (광화문 글판 - 시의 구절을 담은 대형 현판)
  const plaqueBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 5.5, 20),
    materials.goldLeaf
  );
  plaqueBoard.position.set(-20.5, 18, 0);

  const plaqueBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 6.0, 21),
    materials.royalWood
  );
  plaqueBack.position.set(-20.2, 18, 0);

  kyoboGroup.add(kyoboBase, kyoboMidTower, kyoboCrown1, kyoboCrown2, plaqueBoard, plaqueBack);
  root.add(kyoboGroup);

  // ========================================================
  // 6. Ilmin Museum / Dong-A Media Center (일민미술관 & 동아미디어센터) - Southwest Intersection (X = -70, Z = 165)
  // ========================================================
  const dongaGroup = new THREE.Group();
  dongaGroup.name = 'donga_ilmin';
  dongaGroup.position.set(-70, 0, 165);

  // Historic 1920s Stone Building (옛 동아일보 사옥 / 일민미술관)
  const historicStone = new THREE.Mesh(
    new THREE.BoxGeometry(28, 16, 24),
    materials.granite
  );
  historicStone.position.set(8, 8, -6);
  historicStone.castShadow = true;

  // Historic Clock Tower on roof
  const clockTower = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 6),
    materials.granitePlinth
  );
  clockTower.position.set(8, 19, -6);

  // Modern 21-storey Glass Tower rising behind it
  const dongaModernTower = new THREE.Mesh(
    new THREE.BoxGeometry(34, 60, 26),
    materials.modernGlass
  );
  dongaModernTower.position.set(-8, 30, 6);
  dongaModernTower.castShadow = true;

  dongaGroup.add(historicStone, clockTower, dongaModernTower);
  root.add(dongaGroup);

  // ========================================================
  // 7. Gwanghwamun Crossroad & Sejong-daero Modern Avenue Network (도로망)
  // ========================================================
  const streetGroup = new THREE.Group();
  streetGroup.name = 'street_network';

  // (1) West Sejong-daero Roadway (Southbound, 5 lanes)
  const westRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 175),
    materials.asphaltRoad
  );
  westRoad.rotation.x = -Math.PI * 0.5;
  westRoad.position.set(-26, 0.05, 105);
  westRoad.receiveShadow = true;

  // (2) East Sejong-daero Roadway (Northbound, 5 lanes)
  const eastRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 175),
    materials.asphaltRoad
  );
  eastRoad.rotation.x = -Math.PI * 0.5;
  eastRoad.position.set(26, 0.05, 105);
  eastRoad.receiveShadow = true;

  // (3) Gwanghwamun Crossroad East-West Avenue (Jong-ro / Saemunan-ro at Z = 150)
  const crossRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 22),
    materials.asphaltRoad
  );
  crossRoad.rotation.x = -Math.PI * 0.5;
  crossRoad.position.set(0, 0.06, 150);
  crossRoad.receiveShadow = true;

  streetGroup.add(westRoad, eastRoad, crossRoad);

  // (4) Crosswalks (횡단보도 White Zebra Stripes)
  const crosswalkMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
  });

  function createCrosswalk(centerX: number, centerZ: number, width: number, length: number, isVertical = false) {
    const cwGroup = new THREE.Group();
    const stripeCount = Math.floor((isVertical ? length : width) / 1.6);
    for (let i = 0; i < stripeCount; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(isVertical ? 4.5 : 0.9, isVertical ? 0.9 : 4.5),
        crosswalkMat
      );
      stripe.rotation.x = -Math.PI * 0.5;
      if (isVertical) {
        stripe.position.set(centerX, 0.07, centerZ - length * 0.5 + i * 1.6);
      } else {
        stripe.position.set(centerX - width * 0.5 + i * 1.6, 0.07, centerZ);
      }
      cwGroup.add(stripe);
    }
    return cwGroup;
  }

  // Crossroad zebra crossings:
  // North crosswalk across Sejong-daero (Z = 138)
  streetGroup.add(createCrosswalk(0, 137, 72, 4.5, false));
  // South crosswalk across Sejong-daero (Z = 163)
  streetGroup.add(createCrosswalk(0, 163, 72, 4.5, false));
  // West crosswalk across Jong-ro/Saemunan-ro (X = -36)
  streetGroup.add(createCrosswalk(-36, 150, 4.5, 22, true));
  // East crosswalk across Jong-ro/Saemunan-ro (X = +36)
  streetGroup.add(createCrosswalk(36, 150, 4.5, 22, true));

  // (5) Modern Street Furniture: LED Streetlamps (스마트 가로등)
  const lampPoleMat = new THREE.MeshStandardMaterial({
    color: 0x3a424e,
    metalness: 0.8,
    roughness: 0.25,
  });
  const lampLightMat = new THREE.MeshStandardMaterial({
    color: 0xfffaed,
    emissive: 0xffecc4,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const lampPositions = [
    [-18, 55], [-18, 85], [-18, 115], [-18, 145], [-18, 175],
    [18, 55], [18, 85], [18, 115], [18, 145], [18, 175],
    [-42, 60], [-42, 100], [-42, 140],
    [42, 60], [42, 100], [42, 140],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, 0, lz);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), lampPoleMat);
    pole.position.set(0, 3.75, 0);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.15), lampPoleMat);
    arm.position.set(lx < 0 ? -0.8 : 0.8, 7.2, 0);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.35), lampLightMat);
    head.position.set(lx < 0 ? -1.5 : 1.5, 7.1, 0);

    lamp.add(pole, arm, head);
    streetGroup.add(lamp);
  });

  // (6) Modern City Vehicles (서울 택시, 버스, 승용차 3D 모델)
  const vehicleMatBlue = new THREE.MeshStandardMaterial({ color: 0x1d55a8, roughness: 0.3 }); // 간선버스 (Blue)
  const vehicleMatOrange = new THREE.MeshStandardMaterial({ color: 0xe86315, roughness: 0.25 }); // 서울 주황색 택시
  const vehicleMatSilver = new THREE.MeshStandardMaterial({ color: 0xc8cdd5, metalness: 0.6, roughness: 0.2 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  function createCar(colorMat: THREE.Material): THREE.Group {
    const car = new THREE.Group();
    // Chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 4.4), colorMat);
    body.position.set(0, 0.65, 0);
    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.4), materials.modernGlass);
    cabin.position.set(0, 1.35, -0.2);
    // Wheels
    [-0.95, 0.95].forEach((wx) => {
      [-1.3, 1.3].forEach((wz) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 8), wheelMat);
        wheel.rotation.z = Math.PI * 0.5;
        wheel.position.set(wx, 0.32, wz);
        car.add(wheel);
      });
    });
    car.add(body, cabin);
    return car;
  }

  function createBus(): THREE.Group {
    const bus = new THREE.Group();
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 10.5), vehicleMatBlue);
    busBody.position.set(0, 1.6, 0);
    const busGlass = new THREE.Mesh(new THREE.BoxGeometry(2.65, 1.2, 9.2), materials.modernGlass);
    busGlass.position.set(0, 1.9, 0.4);
    [-1.25, 1.25].forEach((wx) => {
      [-3.4, 3.4].forEach((wz) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 10), wheelMat);
        wheel.rotation.z = Math.PI * 0.5;
        wheel.position.set(wx, 0.45, wz);
        bus.add(wheel);
      });
    });
    bus.add(busBody, busGlass);
    return bus;
  }

  // Vehicles moving along Sejong-daero
  // Southbound lanes (X = -22 to -30)
  const taxi1 = createCar(vehicleMatOrange);
  taxi1.position.set(-23, 0, 75);
  taxi1.rotation.y = Math.PI;

  const car1 = createCar(vehicleMatSilver);
  car1.position.set(-27, 0, 110);
  car1.rotation.y = Math.PI;

  const bus1 = createBus();
  bus1.position.set(-30, 0, 48);
  bus1.rotation.y = Math.PI;

  // Northbound lanes (X = +22 to +30)
  const taxi2 = createCar(vehicleMatOrange);
  taxi2.position.set(24, 0, 125);

  const car2 = createCar(vehicleMatSilver);
  car2.position.set(28, 0, 85);

  const bus2 = createBus();
  bus2.position.set(30, 0, 155);

  // Crossroad East-West traffic
  const car3 = createCar(vehicleMatSilver);
  car3.position.set(-50, 0, 147);
  car3.rotation.y = Math.PI * 0.5;

  const taxi3 = createCar(vehicleMatOrange);
  taxi3.position.set(55, 0, 153);
  taxi3.rotation.y = -Math.PI * 0.5;

  streetGroup.add(taxi1, car1, bus1, taxi2, car2, bus2, car3, taxi3);
  root.add(streetGroup);

  return root;
}
