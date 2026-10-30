import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Eye,
  Layers,
  Sparkles,
  Bell,
  Camera,
} from 'lucide-react';
import { TimePreset, RenderingMode, LandmarkInfo } from '../types';
import { soundController } from '../audio/traditionalAudio';

interface NavigationDockProps {
  landmarks: LandmarkInfo[];
  selectedLandmarkId: string;
  onSelectLandmark: (id: string) => void;
  timePreset: TimePreset;
  onSetTimePreset: (preset: TimePreset) => void;
  renderingMode: RenderingMode;
  onSetRenderingMode: (mode: RenderingMode) => void;
  lang: 'ko' | 'en';
}

export const NavigationDock: React.FC<NavigationDockProps> = ({
  landmarks,
  selectedLandmarkId,
  onSelectLandmark,
  timePreset,
  onSetTimePreset,
  renderingMode,
  onSetRenderingMode,
  lang,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'landmarks' | 'atmosphere' | 'rendering'>('landmarks');

  const timeOptions: { id: TimePreset; labelKo: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'day', labelKo: '맑은 대낮', labelEn: 'Daylight', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'sunset', labelKo: '고즈넉한 노을', labelEn: 'Sunset', icon: <Sunset className="w-4 h-4 text-orange-400" /> },
    { id: 'night', labelKo: '달빛 야경', labelEn: 'Night', icon: <Moon className="w-4 h-4 text-blue-300" /> },
    { id: 'dawn', labelKo: '여명의 새벽', labelEn: 'Dawn', icon: <CloudSun className="w-4 h-4 text-rose-300" /> },
  ];

  const renderOptions: { id: RenderingMode; labelKo: string; labelEn: string; descKo: string; descEn: string; icon: React.ReactNode }[] = [
    {
      id: 'pbr',
      labelKo: '실감형 PBR',
      labelEn: 'Realistic PBR',
      descKo: '화강암·단청·기와 정밀 렌더링',
      descEn: 'Full physical materials',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'architectural',
      labelKo: '구조 분석 와이어프레임',
      labelEn: 'Architectural Mesh',
      descKo: '다포계 공포와 목구조 골격 검사',
      descEn: 'Structural wireframe',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'night_lanterns',
      labelKo: '궁궐 청사초롱 점등',
      labelEn: 'Royal Lanterns',
      descKo: '처마 밑 은은한 청사초롱 야경',
      descEn: 'Evening lantern glow',
      icon: <Eye className="w-4 h-4 text-rose-400" />,
    },
  ];

  const handleLandmarkClick = (id: string) => {
    onSelectLandmark(id);
    soundController.playBell(820);
  };

  const handleChimeBell = () => {
    soundController.playBell(740);
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 w-[95vw] max-w-[940px] pointer-events-auto">
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1 rounded-t-lg bg-stone-900 text-stone-300 border-t border-x border-stone-700/80 text-xs hover:text-amber-300 transition-colors shadow-lg"
          title={isCollapsed ? '컨트롤 열기' : '화면 전체보기 (컨트롤 숨기기)'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? '컨트롤 펼치기' : 'Expand Controls'}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? '컨트롤 숨기기' : 'Hide Controls'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Bottom Dock Container (using solid/rgba surfaces without backdrop-filter) */}
      {!isCollapsed && (
        <div className="bg-stone-900 rounded-2xl border border-stone-700/90 shadow-2xl p-3 sm:p-4 text-stone-100">
          {/* Navigation Category Tabs */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-3">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('landmarks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  activeTab === 'landmarks'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-750'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '주요 랜드마크' : 'Landmarks'}</span>
              </button>

              <button
                onClick={() => setActiveTab('atmosphere')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  activeTab === 'atmosphere'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-750'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '시간 & 조명' : 'Atmosphere'}</span>
              </button>

              <button
                onClick={() => setActiveTab('rendering')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  activeTab === 'rendering'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-750'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '렌더링 모드' : 'Render Style'}</span>
              </button>
            </div>

            {/* Quick Interactive Bell */}
            <button
              onClick={handleChimeBell}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-900/60 text-amber-300 border border-stone-700/60 text-xs transition-colors shrink-0"
              title={lang === 'ko' ? '궁궐 풍경 타종음 울리기' : 'Chime Palace Bell'}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ko' ? '타종음' : 'Chime'}</span>
            </button>
          </div>

          {/* Tab 1: Landmarks Carousel */}
          {activeTab === 'landmarks' && (
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-stone-700">
              {landmarks.map((landmark) => {
                const isSelected = landmark.id === selectedLandmarkId;
                return (
                  <button
                    key={landmark.id}
                    data-landmark-id={landmark.id}
                    onClick={() => handleLandmarkClick(landmark.id)}
                    className={`flex flex-col items-start px-3 py-2 rounded-xl border text-left shrink-0 transition-all min-w-[130px] sm:min-w-[150px] ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-stone-800/90 border-stone-700/80 text-stone-300 hover:bg-stone-750 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-700/80 text-stone-300 font-mono">
                        {landmark.category}
                      </span>
                      <Camera className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                    </div>
                    <span className="font-serif font-bold text-xs sm:text-sm truncate w-full text-stone-100">
                      {lang === 'ko' ? landmark.nameKo : landmark.nameEn}
                    </span>
                    <span className="text-[11px] text-stone-400 font-serif">
                      {landmark.nameHanja}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Atmosphere & Time of Day */}
          {activeTab === 'atmosphere' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => {
                const isSelected = timePreset === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSetTimePreset(opt.id);
                      soundController.playGayageumNote(330);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-100 ring-1 ring-amber-500/50'
                        : 'bg-stone-800/90 border-stone-700/80 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-700/60">
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-xs sm:text-sm">
                        {lang === 'ko' ? opt.labelKo : opt.labelEn}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {lang === 'ko' ? '태양·하늘 색온도' : 'Solar Color'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 3: Rendering & Inspection Mode */}
          {activeTab === 'rendering' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {renderOptions.map((opt) => {
                const isSelected = renderingMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSetRenderingMode(opt.id);
                      soundController.playGayageumNote(440);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-500 text-amber-100 ring-1 ring-amber-500/50'
                        : 'bg-stone-800/90 border-stone-700/80 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-700/60">
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-xs sm:text-sm">
                        {lang === 'ko' ? opt.labelKo : opt.labelEn}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {lang === 'ko' ? opt.descKo : opt.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
