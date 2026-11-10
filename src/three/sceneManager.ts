import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect.js';
import { TimePreset, RenderingMode, LandmarkInfo, WeatherEffect, VrMode, VrState } from '../types';
import { getLightingPreset, dampVector3 } from '../utils/rules';
import { initPalaceMaterials, PalaceMaterials } from './materials';
import { createSnowParticleTexture, createRainParticleTexture } from './textures';
import { buildGwanghwamun } from './models/gwanghwamun';
import { buildGeunjeongjeon } from './models/geunjeongjeon';
import { buildGyeonghoeru } from './models/gyeonghoeru';
import { buildGwanghwamunSquare } from './models/gwanghwamunSquare';
import { buildSurroundings } from './models/surroundings';

export interface SceneManagerOptions {
  container: HTMLDivElement;
  onLandmarkSelect: (landmarkId: string) => void;
  onVrStateChange?: (state: VrState) => void;
}

export class SceneManager {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraDolly: THREE.Group;
  private controls: OrbitControls;
  private materials: PalaceMaterials;
  private isSoftwareGl: boolean;

  // VR & WebXR state
  private stereoEffect: StereoEffect | null = null;
  private currentVrMode: VrMode = 'none';
  private xrSession: XRSession | null = null;
  private onVrStateChange?: (state: VrState) => void;
  private deviceOrientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;
  private deviceEuler = new THREE.Euler(0, 0, 0, 'YXZ');

  // Lighting elements
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private lanternLights: THREE.PointLight[] = [];

  // Weather & Particle Systems
  private currentWeather: WeatherEffect = 'clear';
  private currentTimePreset: TimePreset = 'day';
  private snowParticles: THREE.Points | null = null;
  private snowGeometry: THREE.BufferGeometry | null = null;
  private snowPositions: Float32Array | null = null;
  private snowVelocities: Float32Array | null = null;
  private snowTexture: THREE.CanvasTexture | null = null;

  private rainParticles: THREE.Points | null = null;
  private rainGeometry: THREE.BufferGeometry | null = null;
  private rainPositions: Float32Array | null = null;
  private rainVelocities: Float32Array | null = null;
  private rainTexture: THREE.CanvasTexture | null = null;

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
    this.onVrStateChange = options.onVrStateChange;

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

    // Enable WebXR support
    this.renderer.xr.enabled = true;
    this.stereoEffect = new StereoEffect(this.renderer);
    this.stereoEffect.setEyeSeparation(0.064);

    // Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd8e8f8);
    this.scene.fog = new THREE.Fog(0xd8e8f8, 60, 360);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera & WebXR Dolly Rig
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.5, 900);
    this.camera.position.set(0, 12, 48);

    this.cameraDolly = new THREE.Group();
    this.cameraDolly.name = 'CameraDolly';
    this.scene.add(this.cameraDolly);
    this.cameraDolly.add(this.camera);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.49; // Keep above ground plane
    this.controls.minDistance = 3;
    this.controls.maxDistance = 240;
    this.controls.target.set(0, 5, 0);

    // WebXR Session lifecycle listeners
    this.renderer.xr.addEventListener('sessionstart', () => {
      this.currentVrMode = 'webxr';
      this.controls.enabled = false;
      this.onVrStateChange?.({ isPresenting: true, mode: 'webxr' });
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.currentVrMode = 'none';
      this.xrSession = null;
      this.controls.enabled = true;
      this.cameraDolly.position.set(0, 0, 0);
      this.renderer.setAnimationLoop(null);
      this.onVrStateChange?.({ isPresenting: false, mode: 'none' });
      this.lastTime = performance.now();
      if (!this.isSoftwareGl && !this.frameId) {
        this.tick();
      }
    });

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

    // Weather & Environmental Particle Systems
    this.initWeatherParticleSystems();

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
      { id: 'cheoma_craft', pos: [6, 12.0, 4] },
      { id: 'hongyemun_vault', pos: [0, 4.0, 0] },
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

  private initWeatherParticleSystems() {
    // 1. Snow Particle System (함박눈)
    const snowCount = 2800;
    this.snowPositions = new Float32Array(snowCount * 3);
    this.snowVelocities = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      const i3 = i * 3;
      this.snowPositions[i3] = (Math.random() - 0.5) * 260; // X
      this.snowPositions[i3 + 1] = Math.random() * 68 + 1; // Y
      this.snowPositions[i3 + 2] = (Math.random() - 0.5) * 300; // Z

      // [fallSpeed, swaySpeed, phase]
      this.snowVelocities[i3] = 2.5 + Math.random() * 3.0;
      this.snowVelocities[i3 + 1] = 0.8 + Math.random() * 1.5;
      this.snowVelocities[i3 + 2] = Math.random() * Math.PI * 2;
    }

    this.snowGeometry = new THREE.BufferGeometry();
    this.snowGeometry.setAttribute('position', new THREE.BufferAttribute(this.snowPositions, 3));

    this.snowTexture = createSnowParticleTexture();
    const snowMaterial = new THREE.PointsMaterial({
      size: 1.8,
      map: this.snowTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.snowParticles = new THREE.Points(this.snowGeometry, snowMaterial);
    this.snowParticles.visible = false;
    this.scene.add(this.snowParticles);

    // 2. Light Rain Particle System (가랑비)
    const rainCount = 4200;
    this.rainPositions = new Float32Array(rainCount * 3);
    this.rainVelocities = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      const i3 = i * 3;
      this.rainPositions[i3] = (Math.random() - 0.5) * 240;
      this.rainPositions[i3 + 1] = Math.random() * 68 + 1;
      this.rainPositions[i3 + 2] = (Math.random() - 0.5) * 280;

      // [fallSpeed, driftX, driftZ]
      this.rainVelocities[i3] = 45.0 + Math.random() * 15.0;
      this.rainVelocities[i3 + 1] = -4.0 - Math.random() * 3.0;
      this.rainVelocities[i3 + 2] = -2.0 - Math.random() * 2.0;
    }

    this.rainGeometry = new THREE.BufferGeometry();
    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    this.rainTexture = createRainParticleTexture();
    const rainMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: this.rainTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(this.rainGeometry, rainMaterial);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  private updateWeather(dt: number, timeSec: number) {
    if (this.currentWeather === 'clear') return;

    if (this.currentWeather === 'snow' && this.snowPositions && this.snowVelocities && this.snowGeometry) {
      const count = this.snowPositions.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const fallSpeed = this.snowVelocities[i3];
        const swayFreq = this.snowVelocities[i3 + 1];
        const phase = this.snowVelocities[i3 + 2];

        this.snowPositions[i3 + 1] -= fallSpeed * dt;
        this.snowPositions[i3] += Math.sin(timeSec * swayFreq + phase) * 0.9 * dt;
        this.snowPositions[i3 + 2] += Math.cos(timeSec * swayFreq * 0.8 + phase) * 0.6 * dt;

        if (this.snowPositions[i3 + 1] < 0.2) {
          this.snowPositions[i3 + 1] = 68.0;
          this.snowPositions[i3] = (Math.random() - 0.5) * 260;
          this.snowPositions[i3 + 2] = (Math.random() - 0.5) * 300;
        }
      }
      this.snowGeometry.attributes.position.needsUpdate = true;
    } else if (this.currentWeather === 'rain' && this.rainPositions && this.rainVelocities && this.rainGeometry) {
      const count = this.rainPositions.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const fallSpeed = this.rainVelocities[i3];
        const driftX = this.rainVelocities[i3 + 1];
        const driftZ = this.rainVelocities[i3 + 2];

        this.rainPositions[i3 + 1] -= fallSpeed * dt;
        this.rainPositions[i3] += driftX * dt;
        this.rainPositions[i3 + 2] += driftZ * dt;

        if (this.rainPositions[i3 + 1] < 0.2) {
          this.rainPositions[i3 + 1] = 68.0;
          this.rainPositions[i3] = (Math.random() - 0.5) * 240;
          this.rainPositions[i3 + 2] = (Math.random() - 0.5) * 280;
        }
      }
      this.rainGeometry.attributes.position.needsUpdate = true;
    }
  }

  public setWeather(weather: WeatherEffect) {
    this.currentWeather = weather;

    if (this.snowParticles) {
      this.snowParticles.visible = weather === 'snow';
    }
    if (this.rainParticles) {
      this.rainParticles.visible = weather === 'rain';
    }

    this.applyAtmosphere();
  }

  private applyAtmosphere() {
    const config = getLightingPreset(this.currentTimePreset);

    if (this.currentWeather === 'snow') {
      this.scene.background = new THREE.Color(0xdce7f2);
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color.setHex(0xdce7f2);
        this.scene.fog.near = 40;
        this.scene.fog.far = 280;
      }
      this.sunLight.intensity = config.sunIntensity * 0.75;
      this.ambientLight.intensity = Math.max(config.ambientIntensity, 0.45);
      this.renderer.toneMappingExposure = Math.min(config.exposure * 1.05, 1.25);
    } else if (this.currentWeather === 'rain') {
      this.scene.background = new THREE.Color(0x9aa8b5);
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color.setHex(0x9aa8b5);
        this.scene.fog.near = 35;
        this.scene.fog.far = 220;
      }
      this.sunLight.intensity = config.sunIntensity * 0.5;
      this.ambientLight.intensity = Math.max(config.ambientIntensity, 0.4);
      this.renderer.toneMappingExposure = config.exposure * 0.9;
    } else {
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
    }

    this.lanternLights.forEach((light) => {
      light.intensity = this.currentWeather !== 'clear'
        ? Math.max(config.lanternIntensity, 1.2)
        : config.lanternIntensity;
    });
  }

  private handlePointerDown = (event: MouseEvent) => {
    if (this.currentVrMode !== 'none') return;

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
    if (this.stereoEffect) {
      this.stereoEffect.setSize(width, height);
    }
  };

  public setTimePreset(preset: TimePreset) {
    this.currentTimePreset = preset;
    this.applyAtmosphere();
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

  // ==========================================
  // WebXR & Cardboard VR Methods
  // ==========================================

  public async isWebXrSupported(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('xr' in navigator) || !navigator.xr) {
      return false;
    }
    try {
      return await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  }

  public async startWebXr(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('xr' in navigator) || !navigator.xr) {
      throw new Error('이 브라우저는 WebXR API를 지원하지 않습니다.');
    }

    const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
    if (!isSupported) {
      throw new Error('연결된 WebXR VR 헤드셋 장치를 찾을 수 없습니다.');
    }

    const sessionInit: XRSessionInit = {
      optionalFeatures: ['local-floor', 'bounded-floor', 'layers'],
    };

    const session = await navigator.xr.requestSession('immersive-vr', sessionInit);
    this.xrSession = session;

    session.addEventListener('end', () => {
      this.currentVrMode = 'none';
      this.xrSession = null;
      this.controls.enabled = true;
      this.cameraDolly.position.set(0, 0, 0);
      this.renderer.setAnimationLoop(null);
      this.onVrStateChange?.({ isPresenting: false, mode: 'none' });
      this.lastTime = performance.now();
      if (!this.isSoftwareGl) {
        this.frameId = requestAnimationFrame(this.tick);
      }
    });

    try {
      await this.renderer.xr.setReferenceSpaceType('local-floor');
    } catch {
      await this.renderer.xr.setReferenceSpaceType('local').catch(() => {});
    }

    await this.renderer.xr.setSession(session);

    // Place camera dolly at human eye level standing on Gwanghwamun Woldae
    this.cameraDolly.position.set(0, 0, 24);
    this.camera.position.set(0, 1.6, 0);

    this.currentVrMode = 'webxr';
    this.controls.enabled = false;
    this.onVrStateChange?.({ isPresenting: true, mode: 'webxr' });

    // WebXR frames are driven via setAnimationLoop
    this.renderer.setAnimationLoop(this.tick);
    return true;
  }

  public startCardboard(): void {
    if (this.currentVrMode === 'cardboard') return;

    this.currentVrMode = 'cardboard';
    this.controls.enabled = true;

    // Position camera at human eye height on Gwanghwamun Woldae facing the gatehouse
    this.cameraDolly.position.set(0, 0, 0);
    this.camera.position.set(0, 1.65, 24);
    this.controls.target.set(0, 4.5, 0);
    this.controls.update();

    if (this.stereoEffect) {
      this.stereoEffect.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    // Attach device orientation for mobile Cardboard head-tracking
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as any;
      if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
        DeviceOrientationEventAny.requestPermission().catch(() => {});
      }

      this.deviceOrientationHandler = (event: DeviceOrientationEvent) => {
        if (this.currentVrMode !== 'cardboard') return;
        if (event.alpha === null || event.beta === null || event.gamma === null) return;

        const alpha = THREE.MathUtils.degToRad(event.alpha);
        const beta = THREE.MathUtils.degToRad(event.beta);
        const gamma = THREE.MathUtils.degToRad(event.gamma);
        const orient = typeof window.orientation !== 'undefined'
          ? THREE.MathUtils.degToRad(Number(window.orientation))
          : 0;

        this.deviceEuler.set(beta, alpha, -gamma, 'YXZ');
        this.camera.quaternion.setFromEuler(this.deviceEuler);
        const qScreen = new THREE.Quaternion();
        qScreen.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient);
        this.camera.quaternion.multiply(qScreen);
      };

      window.addEventListener('deviceorientation', this.deviceOrientationHandler, true);
    }

    // Attempt fullscreen for immersive mobile viewing
    if (this.container.requestFullscreen) {
      this.container.requestFullscreen().catch(() => {});
    }

    this.onVrStateChange?.({ isPresenting: true, mode: 'cardboard' });
  }

  public exitVr(): void {
    if (this.currentVrMode === 'webxr' && this.xrSession) {
      this.xrSession.end().catch(() => {});
      return;
    }

    if (this.currentVrMode === 'cardboard') {
      this.currentVrMode = 'none';
      if (this.deviceOrientationHandler) {
        window.removeEventListener('deviceorientation', this.deviceOrientationHandler, true);
        this.deviceOrientationHandler = null;
      }
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Reset renderer viewport and scissor
      this.renderer.setScissorTest(false);
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

      // Restore camera to panoramic overview
      this.camera.position.set(0, 12, 48);
      this.controls.target.set(0, 5, 0);
      this.controls.update();

      this.onVrStateChange?.({ isPresenting: false, mode: 'none' });
    }
  }

  public teleportVr(position: [number, number, number], target: [number, number, number]): void {
    if (this.currentVrMode === 'webxr') {
      // Move dolly in world space so headset maintains relative 6DoF
      this.cameraDolly.position.set(position[0], position[1], position[2]);
    } else {
      this.camera.position.set(position[0], position[1] + 1.65, position[2]);
      this.controls.target.set(target[0], target[1], target[2]);
      this.controls.update();
    }
  }

  public getVrMode(): VrMode {
    return this.currentVrMode;
  }

  // ==========================================
  // Render Loop
  // ==========================================

  private tick = (_timestamp?: number, _frame?: XRFrame) => {
    if (this.isDestroyed) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Smooth exponential damped camera transition (when not in WebXR presenting)
    if (!this.renderer.xr.isPresenting && this.isTransitioning && this.targetCamPos && this.targetLookAt) {
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

    // Update environmental weather particles (snow or rain)
    this.updateWeather(dt, now * 0.001);

    if (this.renderer.xr.isPresenting) {
      // In WebXR presenting mode, Three.js internal XRManager renders stereoscopic views
      this.renderer.render(this.scene, this.camera);
      return;
    } else if (this.currentVrMode === 'cardboard' && this.stereoEffect) {
      if (!this.deviceOrientationHandler) {
        this.controls.update();
      }
      this.stereoEffect.render(this.scene, this.camera);
    } else {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }

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
    this.renderer.setAnimationLoop(null);

    if (this.xrSession) {
      this.xrSession.end().catch(() => {});
      this.xrSession = null;
    }

    if (this.deviceOrientationHandler) {
      window.removeEventListener('deviceorientation', this.deviceOrientationHandler, true);
      this.deviceOrientationHandler = null;
    }

    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);

    // Dispose Weather Particle Systems
    if (this.snowGeometry) this.snowGeometry.dispose();
    if (this.snowParticles) {
      (this.snowParticles.material as THREE.Material).dispose();
      this.scene.remove(this.snowParticles);
    }
    if (this.snowTexture) this.snowTexture.dispose();

    if (this.rainGeometry) this.rainGeometry.dispose();
    if (this.rainParticles) {
      (this.rainParticles.material as THREE.Material).dispose();
      this.scene.remove(this.rainParticles);
    }
    if (this.rainTexture) this.rainTexture.dispose();

    this.controls.dispose();
    this.materials.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
