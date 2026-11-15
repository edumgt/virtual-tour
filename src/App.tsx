import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from './three/sceneManager';
import { HeaderBar } from './components/HeaderBar';
import { LeftNavigationBar } from './components/LeftNavigationBar';
import { HeritageModal } from './components/HeritageModal';
import { VrModeModal } from './components/VrModeModal';
import { VrActiveOverlay } from './components/VrActiveOverlay';
import { LANDMARKS } from './data/landmarks';
import { TimePreset, RenderingMode, LandmarkInfo, WeatherEffect, VrState, SceneZone } from './types';
import { filterLandmarksByZone, getZoneOverviewCamera } from './utils/rules';
import { soundController } from './audio/traditionalAudio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const [activeZone, setActiveZone] = useState<SceneZone>('gwanghwamun');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('gwanghwamun');
  const [timePreset, setTimePreset] = useState<TimePreset>('day');
  const [renderingMode, setRenderingMode] = useState<RenderingMode>('pbr');
  const [weather, setWeather] = useState<WeatherEffect>('clear');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isVrModalOpen, setIsVrModalOpen] = useState<boolean>(false);
  const [vrState, setVrState] = useState<VrState>({ isPresenting: false, mode: 'none' });
  const [isWebXrSupported, setIsWebXrSupported] = useState<boolean>(false);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(true);
  const [isBridgeDriving, setIsBridgeDriving] = useState<boolean>(false);
  const [isLnbExpanded, setIsLnbExpanded] = useState<boolean>(true);
  const [isMobileLnbOpen, setIsMobileLnbOpen] = useState<boolean>(false);

  // Check WebXR device capability on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported) => setIsWebXrSupported(supported))
        .catch(() => setIsWebXrSupported(false));
    }
  }, []);

  // Expose active zone on body for deterministic state inspection
  useEffect(() => {
    document.body.dataset.zone = activeZone;
  }, [activeZone]);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new SceneManager({
      container: mountRef.current,
      onLandmarkSelect: (id: string) => {
        setSelectedLandmarkId(id);
        setIsInfoOpen(true);
        soundController.playBell(840);
      },
      onVrStateChange: (state: VrState) => {
        setVrState(state);
      },
      onBridgeDriveStateChange: (driving: boolean) => {
        setIsBridgeDriving(driving);
      },
    });

    sceneManagerRef.current = manager;

    // Auto-dismiss guide after 6 seconds
    const timer = setTimeout(() => {
      setShowQuickGuide(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  // Handle LNB Zone Switch
  const handleSelectZone = (zone: SceneZone) => {
    if (zone === activeZone) return;
    setActiveZone(zone);
    setIsInfoOpen(false);

    const overview = getZoneOverviewCamera(zone);
    setSelectedLandmarkId(overview.defaultLandmarkId);

    if (sceneManagerRef.current) {
      sceneManagerRef.current.setZone(zone);
    }
    soundController.playGayageumNote(
      zone === 'jamsil' ? 587 : zone === 'namsan_han' ? 659 : zone === 'namhae_german' ? 784 : 440
    );
  };

  // Reset camera to active zone overview
  const handleResetOverview = () => {
    const overview = getZoneOverviewCamera(activeZone);
    setSelectedLandmarkId(overview.defaultLandmarkId);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resetZoneOverview();
    }
  };

  // Handle Han River Bridge Crossing Scenic Drive
  const handleToggleBridgeDrive = () => {
    if (!sceneManagerRef.current) return;
    if (isBridgeDriving) {
      sceneManagerRef.current.stopBridgeDrive();
    } else {
      setSelectedLandmarkId('hangang_bridge_crossing');
      sceneManagerRef.current.startBridgeDrive();
      soundController.playGayageumNote(523);
    }
  };

  // Handle Landmark Navigation
  const handleSelectLandmark = (id: string) => {
    setSelectedLandmarkId(id);
    const landmark = LANDMARKS.find((l) => l.id === id);
    if (landmark && sceneManagerRef.current) {
      sceneManagerRef.current.flyTo(landmark.cameraPosition, landmark.cameraTarget);
    }
  };

  const handleFlyTo = (landmark: LandmarkInfo) => {
    setSelectedLandmarkId(landmark.id);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.flyTo(landmark.cameraPosition, landmark.cameraTarget);
    }
  };

  // Handle Time Preset Change
  const handleSetTimePreset = (preset: TimePreset) => {
    setTimePreset(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setTimePreset(preset);
    }
  };

  // Handle Weather Preset Change
  const handleSetWeather = (newWeather: WeatherEffect) => {
    setWeather(newWeather);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setWeather(newWeather);
    }
  };

  // Handle Rendering Mode Change
  const handleSetRenderingMode = (mode: RenderingMode) => {
    setRenderingMode(mode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setRenderingMode(mode);
    }
  };

  // Handle VR Mode Triggers
  const handleOpenVr = () => {
    if (vrState.isPresenting) {
      handleExitVr();
    } else {
      setIsVrModalOpen(true);
      soundController.playGayageumNote(520);
    }
  };

  const handleStartWebXr = async () => {
    try {
      if (sceneManagerRef.current) {
        await sceneManagerRef.current.startWebXr();
      }
    } catch (err) {
      console.warn('WebXR start attempt failed, falling back to Cardboard mode:', err);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.startCardboard();
      }
    }
  };

  const handleStartCardboard = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.startCardboard();
      soundController.playBell(740);
    }
  };

  const handleExitVr = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.exitVr();
    }
  };

  const handleTeleportInVr = (position: [number, number, number], target: [number, number, number]) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.teleportVr(position, target);
      soundController.playGayageumNote(440);
    }
  };

  // Handle Auto Rotation
  const handleToggleAutoRotate = () => {
    const nextVal = !isAutoRotate;
    setIsAutoRotate(nextVal);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setAutoRotate(nextVal);
    }
  };

  const zoneLandmarks = filterLandmarksByZone(LANDMARKS, activeZone);
  const currentLandmark =
    LANDMARKS.find((l) => l.id === selectedLandmarkId) || zoneLandmarks[0] || LANDMARKS[0];

  return (
    <div className="relative flex w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* Gemini-Style Collapsible Left Navigation Bar (LNB) */}
      {!vrState.isPresenting && (
        <LeftNavigationBar
          isExpanded={isLnbExpanded}
          onToggleExpand={() => setIsLnbExpanded((prev) => !prev)}
          isMobileOpen={isMobileLnbOpen}
          onCloseMobile={() => setIsMobileLnbOpen(false)}
          activeZone={activeZone}
          onSelectZone={handleSelectZone}
          onResetOverview={handleResetOverview}
          landmarks={zoneLandmarks}
          selectedLandmarkId={selectedLandmarkId}
          onSelectLandmark={handleSelectLandmark}
          onOpenInfo={() => setIsInfoOpen(true)}
          timePreset={timePreset}
          onSetTimePreset={handleSetTimePreset}
          weather={weather}
          onSetWeather={handleSetWeather}
          renderingMode={renderingMode}
          onSetRenderingMode={handleSetRenderingMode}
          isBridgeDriving={isBridgeDriving}
          onToggleBridgeDrive={handleToggleBridgeDrive}
          isAutoRotate={isAutoRotate}
          onToggleAutoRotate={handleToggleAutoRotate}
          onOpenVr={handleOpenVr}
          isVrActive={vrState.isPresenting}
          lang={lang}
          onToggleLang={() => setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))}
        />
      )}

      {/* Main 3D Viewport Stage */}
      <div className="relative flex-1 min-w-0 h-full overflow-hidden">
        {/* 3D WebGL Canvas Host */}
        <div
          ref={mountRef}
          data-testid="three-canvas-container"
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Minimal Top Viewport Context & Quick Action Bar */}
        {!vrState.isPresenting && (
          <HeaderBar
            activeZone={activeZone}
            currentLandmarkName={lang === 'ko' ? currentLandmark.nameKo : currentLandmark.nameEn}
            isAutoRotate={isAutoRotate}
            onToggleAutoRotate={handleToggleAutoRotate}
            onOpenInfo={() => setIsInfoOpen(true)}
            onOpenVr={handleOpenVr}
            isVrActive={vrState.isPresenting}
            onOpenMobileMenu={() => setIsMobileLnbOpen(true)}
            lang={lang}
          />
        )}

        {/* Brief Interaction Hint */}
        {showQuickGuide && !vrState.isPresenting && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[90%] max-w-md">
            <div className="bg-stone-900/90 text-amber-200 text-xs px-4 py-2 rounded-full border border-amber-600/40 shadow-xl flex items-center justify-between gap-2">
              <span className="truncate">
                {lang === 'ko'
                  ? '좌측 메뉴에서 서울 구역·명소·날씨를 선택하세요 · 드래그 회전 · 휠 줌'
                  : 'Select districts, landmarks & weather from the left menu · Drag to rotate'}
              </span>
              <button
                onClick={() => setShowQuickGuide(false)}
                className="pointer-events-auto text-stone-400 hover:text-white shrink-0 px-1"
                title={lang === 'ko' ? '닫기' : 'Dismiss'}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-VR Active HUD Overlay (Exit VR & Teleport Controls) */}
      <VrActiveOverlay
        vrMode={vrState.mode}
        activeZone={activeZone}
        onExitVr={handleExitVr}
        onTeleport={handleTeleportInVr}
        lang={lang}
      />

      {/* VR Mode Selection & Guidance Modal */}
      <VrModeModal
        isOpen={isVrModalOpen}
        onClose={() => setIsVrModalOpen(false)}
        onStartWebXr={handleStartWebXr}
        onStartCardboard={handleStartCardboard}
        isWebXrSupported={isWebXrSupported}
        lang={lang}
      />

      {/* Heritage / Landmark Educational Docent Modal */}
      <HeritageModal
        landmark={currentLandmark}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        onFlyTo={handleFlyTo}
        lang={lang}
      />
    </div>
  );
}
