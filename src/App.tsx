import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from './three/sceneManager';
import { HeaderBar } from './components/HeaderBar';
import { NavigationDock } from './components/NavigationDock';
import { HeritageModal } from './components/HeritageModal';
import { VrModeModal } from './components/VrModeModal';
import { VrActiveOverlay } from './components/VrActiveOverlay';
import { LANDMARKS } from './data/landmarks';
import { TimePreset, RenderingMode, LandmarkInfo, WeatherEffect, VrState } from './types';
import { soundController } from './audio/traditionalAudio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

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

  // Check WebXR device capability on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported) => setIsWebXrSupported(supported))
        .catch(() => setIsWebXrSupported(false));
    }
  }, []);

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

  const currentLandmark = LANDMARKS.find((l) => l.id === selectedLandmarkId) || LANDMARKS[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* 3D WebGL Canvas Host */}
      <div
        ref={mountRef}
        data-testid="three-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Header Bar */}
      {!vrState.isPresenting && (
        <HeaderBar
          currentLandmarkName={lang === 'ko' ? currentLandmark.nameKo : currentLandmark.nameEn}
          isAutoRotate={isAutoRotate}
          onToggleAutoRotate={handleToggleAutoRotate}
          onOpenInfo={() => setIsInfoOpen(true)}
          onOpenVr={handleOpenVr}
          isVrActive={vrState.isPresenting}
          lang={lang}
          onToggleLang={() => setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))}
        />
      )}

      {/* Interaction Floating Banner / Guide Pill */}
      {showQuickGuide && !vrState.isPresenting && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[92vw] max-w-md sm:max-w-xl">
          <div className="bg-stone-900/95 text-amber-200 text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-600/50 shadow-xl flex items-center justify-between gap-2">
            <span className="truncate">
              {lang === 'ko'
                ? '💡 마우스 드래그로 360° 회전 · 휠로 줌인/아웃 · VR 모드로 헤드셋/카드보드 체험'
                : '💡 Drag to rotate 360° · Scroll to zoom · VR mode for headset/cardboard'}
            </span>
            <button
              onClick={() => setShowQuickGuide(false)}
              className="pointer-events-auto text-stone-400 hover:text-white shrink-0 px-1"
              title="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Collapsible Navigation Dock */}
      {!vrState.isPresenting && (
        <NavigationDock
          landmarks={LANDMARKS}
          selectedLandmarkId={selectedLandmarkId}
          onSelectLandmark={handleSelectLandmark}
          timePreset={timePreset}
          onSetTimePreset={handleSetTimePreset}
          renderingMode={renderingMode}
          onSetRenderingMode={handleSetRenderingMode}
          weather={weather}
          onSetWeather={handleSetWeather}
          onOpenVr={handleOpenVr}
          isVrActive={vrState.isPresenting}
          lang={lang}
        />
      )}

      {/* In-VR Active HUD Overlay (Exit VR & Teleport Controls) */}
      <VrActiveOverlay
        vrMode={vrState.mode}
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

      {/* Heritage Educational Docent Modal */}
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
