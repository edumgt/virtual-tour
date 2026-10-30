import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from './three/sceneManager';
import { HeaderBar } from './components/HeaderBar';
import { NavigationDock } from './components/NavigationDock';
import { HeritageModal } from './components/HeritageModal';
import { LANDMARKS } from './data/landmarks';
import { TimePreset, RenderingMode, LandmarkInfo } from './types';
import { soundController } from './audio/traditionalAudio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('gwanghwamun');
  const [timePreset, setTimePreset] = useState<TimePreset>('day');
  const [renderingMode, setRenderingMode] = useState<RenderingMode>('pbr');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(true);

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

  // Handle Rendering Mode Change
  const handleSetRenderingMode = (mode: RenderingMode) => {
    setRenderingMode(mode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setRenderingMode(mode);
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
      <HeaderBar
        currentLandmarkName={lang === 'ko' ? currentLandmark.nameKo : currentLandmark.nameEn}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={handleToggleAutoRotate}
        onOpenInfo={() => setIsInfoOpen(true)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))}
      />

      {/* Interaction Floating Banner / Guide Pill */}
      {showQuickGuide && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[92vw] max-w-md sm:max-w-xl">
          <div className="bg-stone-900/95 text-amber-200 text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-600/50 shadow-xl flex items-center justify-between gap-2">
            <span className="truncate">
              {lang === 'ko'
                ? '💡 마우스 드래그로 360° 회전 · 휠로 줌인/아웃 · 황금빛 링 마커 클릭'
                : '💡 Drag to rotate 360° · Scroll to zoom · Click golden ring markers'}
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
      <NavigationDock
        landmarks={LANDMARKS}
        selectedLandmarkId={selectedLandmarkId}
        onSelectLandmark={handleSelectLandmark}
        timePreset={timePreset}
        onSetTimePreset={handleSetTimePreset}
        renderingMode={renderingMode}
        onSetRenderingMode={handleSetRenderingMode}
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
