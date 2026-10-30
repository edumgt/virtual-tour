import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TimePreset, RenderingMode, LandmarkInfo } from '../types';
import { getLightingPreset, dampVector3 } from '../utils/rules';
import { initPalaceMaterials, PalaceMaterials } from './materials';
import { buildGwanghwamun } from './models/gwanghwamun';
import { buildGeunjeongjeon } from './models/geunjeongjeon';
import { buildGyeonghoeru } from './models/gyeonghoeru';
import { buildGwanghwamunSquare } from './models/gwanghwamunSquare';
import { buildSurroundings } from './models/surroundings';

export interface SceneManagerOptions {
  container: HTMLDivElement;
  onLandmarkSelect: (landmarkId: string) => void;
}

export class SceneManager {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private materials: PalaceMaterials;
  private isSoftwareGl: boolean;

  // Lighting elements
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private lanternLights: THREE.PointLight[] = [];

  // Animation & Transition state
  private isDestroyed = false;
  private frameId: number = 0;
  private lastTime: number = 0;
  private targetCamPos: [number, number, number] | null = null;
  private targetLookAt: [number, number, number] | null = null;
  private isTransitioning = false;

  // Landmarks & Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private clickableMarkers: { mesh: THREE.Mesh; landmarkId: string }[] = [];
  private onLandmarkSelect: (landmarkId: string) => void;

  // Auto-tour
  private isAutoRotating = false;

  constructor(options: SceneManagerOptions) {
    this.container = options.container;
    this.onLandmarkSelect = options.onLandmarkSelect;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd8e8f8);
    this.scene.fog = new THREE.Fog(0xd8e8f8, 60, 360);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.5, 900);
    this.camera.position.set(0, 12, 48);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.49; // Keep above ground plane
    this.controls.minDistance = 3;
    this.controls.maxDistance = 240;
    this.controls.target.set(0, 5, 0);

    // Cancel camera transitions on manual user drag
    this.controls.addEventListener('start', () => {
      this.isTransitioning = false;
      this.targetCamPos = null;
      this.targetLookAt = null;
    });

    // Initialize Materials & Lighting
    this.materials = initPalaceMaterials();

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    this.sunLight.position.set(40, 65, 35);
    this.sunLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.camera.left = -60;
      this.sunLight.shadow.camera.right = 60;
      this.sunLight.shadow.camera.top = 60;
      this.sunLight.shadow.camera.bottom = -60;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 180;
    }
    this.scene.add(this.sunLight);

    this.hemiLight = new THREE.HemisphereLight(0x90c2ff, 0x5a5040, 1.1);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);

    // Build Entire Joseon Palace Realm
    this.buildWorld();

    // Event Listeners
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);

    // Start Animation Loop
    this.lastTime = performance.now();
    this.tick();
  }

  private buildWorld() {
    // 1. Broad Terraced Palace Ground (대지 평면)
    const groundGeo = new THREE.PlaneGeometry(360, 420);
    const ground = new THREE.Mesh(groundGeo, this.materials.granite);
    ground.rotation.x = -Math.PI * 0.5;
    ground.position.set(0, 0, -30);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Sejong-daero & Gwanghwamun Square Boulevard paving (광장 보도)
    const squareGeo = new THREE.BoxGeometry(36, 0.08, 140);
    const squarePavement = new THREE.Mesh(squareGeo, this.materials.granite);
    squarePavement.position.set(0, 0.04, 85);
    squarePavement.receiveShadow = true;
    this.scene.add(squarePavement);

    // 3. Landmark Models
    const gwanghwamun = buildGwanghwamun(this.materials);
    const geunjeongjeon = buildGeunjeongjeon(this.materials);
    const gyeonghoeru = buildGyeonghoeru(this.materials);
    const gwanghwamunSquare = buildGwanghwamunSquare(this.materials);
    const surroundings = buildSurroundings(this.materials);

    this.scene.add(gwanghwamun, geunjeongjeon, gyeonghoeru, gwanghwamunSquare, surroundings);

    // 4. Palace Night Lanterns
    const lanternSpots = [
      [0, 8.5, 3.2], // Gwanghwamun Munru
      [0, 5.0, -64], // Geunjeongjeon Court
      [-68, 6.0, -68], // Gyeonghoeru
    ];
    lanternSpots.forEach(([lx, ly, lz]) => {
      const pl = new THREE.PointLight(0xffaa44, 0.0, 35, 1.8);
      pl.position.set(lx, ly, lz);
      this.scene.add(pl);
      this.lanternLights.push(pl);
    });

    // 5. Interactive Floating Landmark Discovery Badges (클릭 가능한 문화유산 마커)
    this.createDiscoveryMarkers();
  }

  private createDiscoveryMarkers() {
    const markerData = [
      { id: 'gwanghwamun', pos: [0, 15, 0] },
      { id: 'woldae', pos: [0, 2.5, 24] },
      { id: 'haechi', pos: [-9.2, 4.0, 28] },
      { id: 'geunjeongjeon', pos: [0, 20, -68] },
      { id: 'eojwa', pos: [0, 6.0, -70] },
      { id: 'pumgyeseok', pos: [5.2, 1.8, -42] },
      { id: 'gyeonghoeru', pos: [-68, 14, -68] },
      { id: 'pillars_48', pos: [-68, 3.5, -60] },
      { id: 'sejong', pos: [0, 8.5, 68] },
      { id: 'yisunsin', pos: [0, 13.5, 120] },
      { id: 'bugaksan', pos: [0, 48, -190] },
    ];

    const beaconGeo = new THREE.SphereGeometry(0.7, 12, 10);
    const ringGeo = new THREE.RingGeometry(0.9, 1.3, 16);

    markerData.forEach((item) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.set(item.pos[0], item.pos[1], item.pos[2]);

      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        wireframe: true,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffe066,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI * 0.5;

      markerGroup.add(beacon, ring);
      this.scene.add(markerGroup);

      // Invisible hit proxy sphere for easy clicking
      const hitGeo = new THREE.SphereGeometry(2.5, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(item.pos[0], item.pos[1], item.pos[2]);
      this.scene.add(hitMesh);

      this.clickableMarkers.push({ mesh: hitMesh, landmarkId: item.id });
    });
  }

  private handlePointerDown = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.clickableMarkers.map((m) => m.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = this.clickableMarkers.find((m) => m.mesh === intersects[0].object);
      if (hit) {
        this.onLandmarkSelect(hit.landmarkId);
      }
    }
  };

  private handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setTimePreset(preset: TimePreset) {
    const config = getLightingPreset(preset);

    this.sunLight.color.setHex(config.sunColor);
    this.sunLight.intensity = config.sunIntensity;
    this.sunLight.position.set(...config.sunPosition);

    this.hemiLight.color.setHex(config.hemiSkyColor);
    this.hemiLight.groundColor.setHex(config.hemiGroundColor);
    this.hemiLight.intensity = config.hemiIntensity;

    this.ambientLight.intensity = config.ambientIntensity;

    this.scene.background = new THREE.Color(config.fogColor);
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.setHex(config.fogColor);
      this.scene.fog.near = config.fogNear;
      this.scene.fog.far = config.fogFar;
    }

    this.renderer.toneMappingExposure = config.exposure;

    // Toggle warm royal lanterns for night/evening
    this.lanternLights.forEach((light) => {
      light.intensity = config.lanternIntensity;
    });
  }

  public setRenderingMode(mode: RenderingMode) {
    const isWireframe = mode === 'architectural';
    this.materials.giwaRoof.wireframe = isWireframe;
    this.materials.dancheong.wireframe = isWireframe;
    this.materials.granite.wireframe = isWireframe;
    this.materials.royalWood.wireframe = isWireframe;

    if (mode === 'night_lanterns') {
      this.setTimePreset('night');
    }
  }

  public flyTo(position: [number, number, number], target: [number, number, number]) {
    this.targetCamPos = [...position];
    this.targetLookAt = [...target];
    this.isTransitioning = true;
  }

  public setAutoRotate(enabled: boolean) {
    this.isAutoRotating = enabled;
    this.controls.autoRotate = enabled;
    this.controls.autoRotateSpeed = 1.0;
  }

  private tick = () => {
    if (this.isDestroyed) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Smooth exponential damped camera transition
    if (this.isTransitioning && this.targetCamPos && this.targetLookAt) {
      const currentPos: [number, number, number] = [
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z,
      ];
      const currentTarget: [number, number, number] = [
        this.controls.target.x,
        this.controls.target.y,
        this.controls.target.z,
      ];

      const newPos = dampVector3(currentPos, this.targetCamPos, 4.0, dt);
      const newTarget = dampVector3(currentTarget, this.targetLookAt, 4.0, dt);

      this.camera.position.set(...newPos);
      this.controls.target.set(...newTarget);

      const posDist = Math.hypot(
        newPos[0] - this.targetCamPos[0],
        newPos[1] - this.targetCamPos[1],
        newPos[2] - this.targetCamPos[2]
      );
      if (posDist < 0.15) {
        this.camera.position.set(...this.targetCamPos);
        this.controls.target.set(...this.targetLookAt);
        this.isTransitioning = false;
        this.targetCamPos = null;
        this.targetLookAt = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(callback: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(callback, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);

    this.controls.dispose();
    this.materials.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
