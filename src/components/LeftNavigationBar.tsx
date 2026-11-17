import React, { useState } from 'react';
import {
  Menu,
  Landmark,
  Building2,
  Mountain,
  Home,
  Trees,
  MapPin,
  Navigation,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Snowflake,
  CloudRain,
  Layers,
  Sparkles,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Compass,
  Volume2,
  Bell,
  Glasses,
  Languages,
  X,
} from 'lucide-react';
import { TimePreset, RenderingMode, LandmarkInfo, WeatherEffect, SceneZone } from '../types';
import { soundController } from '../audio/traditionalAudio';

interface LeftNavigationBarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeZone: SceneZone;
  onSelectZone: (zone: SceneZone) => void;
  onResetOverview: () => void;
  landmarks: LandmarkInfo[];
  selectedLandmarkId: string;
  onSelectLandmark: (id: string) => void;
  onOpenInfo: () => void;
  timePreset: TimePreset;
  onSetTimePreset: (preset: TimePreset) => void;
  weather: WeatherEffect;
  onSetWeather: (weather: WeatherEffect) => void;
  renderingMode: RenderingMode;
  onSetRenderingMode: (mode: RenderingMode) => void;
  isBridgeDriving: boolean;
  onToggleBridgeDrive: () => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  onOpenVr: () => void;
  isVrActive: boolean;
  lang: 'ko' | 'en';
  onToggleLang: () => void;
}

export const LeftNavigationBar: React.FC<LeftNavigationBarProps> = ({
  isExpanded,
  onToggleExpand,
  isMobileOpen,
  onCloseMobile,
  activeZone,
  onSelectZone,
  onResetOverview,
  landmarks,
  selectedLandmarkId,
  onSelectLandmark,
  onOpenInfo,
  timePreset,
  onSetTimePreset,
  weather,
  onSetWeather,
  renderingMode,
  onSetRenderingMode,
  isBridgeDriving,
  onToggleBridgeDrive,
  isAutoRotate,
  onToggleAutoRotate,
  onOpenVr,
  isVrActive,
  lang,
  onToggleLang,
}) => {
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const toggleSound = () => {
    const playing = soundController.toggleAmbientSoundscape();
    setIsAudioPlaying(playing);
    if (playing) {
      soundController.playBell(780);
    }
  };

  const zoneItems: {
    id: SceneZone;
    labelKo: string;
    labelEn: string;
    subKo: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'gwanghwamun',
      labelKo: '광화문 · 경복궁',
      labelEn: 'Gwanghwamun',
      subKo: '사거리 · 정궁',
      icon: <Landmark className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'jamsil',
      labelKo: '석촌호수 · 롯데타워',
      labelEn: 'Seokchon · Lotte',
      subKo: '123층 · 매직아일랜드',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'namsan_han',
      labelKo: '남산 · 한남 · 한강대교',
      labelEn: 'Namsan · Han River',
      subKo: 'N서울타워 · 교량 횡단',
      icon: <Mountain className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'namhae_german',
      labelKo: '남해 · 독일마을',
      labelEn: 'Namhae German Village',
      subKo: '물건항 · 바이에른 언덕',
      icon: <Home className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'jeonju_hanok',
      labelKo: '전주 · 한옥마을',
      labelEn: 'Jeonju Hanok Village',
      subKo: '경기전 · 전동성당 · 오목대',
      icon: <Trees className="w-4 h-4 shrink-0" />,
    },
  ];

  const weatherOptions: { id: WeatherEffect; labelKo: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'clear', labelKo: '맑음', labelEn: 'Clear', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'snow', labelKo: '함박눈', labelEn: 'Snow', icon: <Snowflake className="w-3.5 h-3.5 text-sky-300" /> },
    { id: 'rain', labelKo: '가랑비', labelEn: 'Rain', icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" /> },
  ];

  const timeOptions: { id: TimePreset; labelKo: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'day', labelKo: '대낮', labelEn: 'Day', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'sunset', labelKo: '노을', labelEn: 'Sunset', icon: <Sunset className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'night', labelKo: '야경', labelEn: 'Night', icon: <Moon className="w-3.5 h-3.5 text-blue-300" /> },
    { id: 'dawn', labelKo: '새벽', labelEn: 'Dawn', icon: <CloudSun className="w-3.5 h-3.5 text-rose-300" /> },
  ];

  const renderOptions: { id: RenderingMode; labelKo: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'pbr', labelKo: '실감 PBR', labelEn: 'PBR', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" /> },
    { id: 'architectural', labelKo: '구조선', labelEn: 'Mesh', icon: <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> },
    { id: 'night_lanterns', labelKo: '청사초롱', labelEn: 'Lanterns', icon: <Eye className="w-3.5 h-3.5 text-rose-400 shrink-0" /> },
  ];

  const showFull = isExpanded || isMobileOpen;

  const renderSidebarInner = () => (
    <div className="flex flex-col h-full w-full bg-[#171615] text-stone-100 border-r border-stone-800/90 select-none">
      {/* Top Hamburger Toggle & Brand Row (Gemini Style) */}
      <div className={`flex items-center ${showFull ? 'justify-between px-3.5' : 'justify-center px-2'} h-14 shrink-0`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            data-testid="lnb-toggle-button"
            aria-expanded={isExpanded}
            aria-label={lang === 'ko' ? '메뉴 접기 또는 펼치기' : 'Toggle navigation sidebar'}
            onClick={onToggleExpand}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-stone-300 hover:bg-stone-800 hover:text-white transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {showFull && (
            <span className="font-serif font-bold text-base tracking-tight text-amber-100 whitespace-nowrap truncate">
              {lang === 'ko' ? '한국 명소 3D' : 'Korea 3D Tour'}
            </span>
          )}
        </div>

        {/* Mobile drawer close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label={lang === 'ko' ? '메뉴 닫기' : 'Close menu'}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Pill (Gemini "+ New" slot -> Bridge Drive / Zone Overview) */}
      <div className={`${showFull ? 'px-3.5' : 'px-2'} pb-3 shrink-0 space-y-2`}>
        {activeZone === 'namsan_han' ? (
          <div className={`flex items-center gap-1.5 ${showFull ? '' : 'flex-col'}`}>
            <button
              type="button"
              data-testid="bridge-drive-button"
              onClick={() => {
                onToggleBridgeDrive();
                onCloseMobile();
              }}
              title={lang === 'ko' ? '한강대교 건너기 주행' : 'Cross Han River Bridge'}
              className={`flex items-center ${
                showFull ? 'flex-1 gap-2.5 px-3.5 py-2.5' : 'justify-center w-10 h-10'
              } rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                isBridgeDriving
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-800/95 text-emerald-300 hover:bg-stone-700 border border-stone-700/70'
              }`}
            >
              <Navigation className="w-4 h-4 shrink-0" />
              {showFull && (
                <span>
                  {lang === 'ko'
                    ? isBridgeDriving
                      ? '주행 중지'
                      : '대교 건너기 주행'
                    : isBridgeDriving
                    ? 'Stop Drive'
                    : 'Bridge Drive'}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onResetOverview();
                soundController.playBell(700);
              }}
              title={lang === 'ko' ? '구역 전체 조망' : 'Reset Overview'}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-amber-200 transition-colors shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onResetOverview();
              soundController.playBell(700);
            }}
            title={lang === 'ko' ? '현재 구역 전체 조망으로 복귀' : 'Reset Zone Overview'}
            className={`flex items-center ${
              showFull ? 'w-full gap-2.5 px-4 py-2.5' : 'justify-center w-10 h-10 mx-auto'
            } rounded-full bg-stone-800/95 hover:bg-stone-700 text-stone-200 border border-stone-700/70 text-xs font-medium transition-colors whitespace-nowrap`}
          >
            <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            {showFull && <span>{lang === 'ko' ? '구역 전체 조망' : 'Zone Overview'}</span>}
          </button>
        )}
      </div>

      {/* Section 1: 탐방 구역 (District Switcher - LNB Navigation) */}
      <nav
        aria-label={lang === 'ko' ? '서울 3D 구역 선택' : 'Seoul 3D District Navigation'}
        className={`${showFull ? 'px-3' : 'px-2'} pb-3 border-b border-stone-800/80 shrink-0`}
      >
        {showFull && (
          <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-stone-400">
            {lang === 'ko' ? '탐방 구역' : 'Districts'}
          </div>
        )}
        <div className="space-y-1">
          {zoneItems.map((zone) => {
            const isActive = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                data-zone={zone.id}
                aria-pressed={isActive}
                onClick={() => {
                  onSelectZone(zone.id);
                  onCloseMobile();
                }}
                title={lang === 'ko' ? zone.labelKo : zone.labelEn}
                className={`flex items-center ${
                  showFull ? 'w-full gap-3 px-3.5 py-2.5 justify-start' : 'w-10 h-10 mx-auto justify-center'
                } rounded-full text-left transition-colors ${
                  isActive
                    ? 'bg-amber-600/25 text-amber-200 border border-amber-500/40 font-semibold'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-stone-100 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : 'text-stone-400'}>{zone.icon}</span>
                {showFull && (
                  <span className="text-[13px] whitespace-nowrap truncate">
                    {lang === 'ko' ? zone.labelKo : zone.labelEn}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Section 2: 주요 명소 (Scrollable Landmark List like Gemini Recent Items) */}
      <div className="flex-1 min-h-0 overflow-y-auto lnb-scroll py-2.5">
        {showFull ? (
          <div className="px-3 space-y-0.5">
            <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-stone-400 flex items-center justify-between">
              <span>{lang === 'ko' ? '주요 명소' : 'Landmarks'}</span>
              <span className="text-[11px] font-normal text-stone-500 tabular-nums">
                {landmarks.length}
              </span>
            </div>

            {landmarks.map((landmark) => {
              const isSelected = landmark.id === selectedLandmarkId;
              return (
                <button
                  key={landmark.id}
                  type="button"
                  data-landmark-id={landmark.id}
                  onClick={() => {
                    onSelectLandmark(landmark.id);
                    soundController.playBell(820);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-left transition-colors group ${
                    isSelected
                      ? 'bg-stone-800 text-amber-100 font-medium'
                      : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                  }`}
                >
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                    }`}
                  />
                  <span className="text-[13px] truncate flex-1">
                    {lang === 'ko' ? landmark.nameKo : landmark.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-2">
            {landmarks.slice(0, 6).map((landmark) => {
              const isSelected = landmark.id === selectedLandmarkId;
              return (
                <button
                  key={landmark.id}
                  type="button"
                  data-landmark-id={landmark.id}
                  onClick={() => {
                    onSelectLandmark(landmark.id);
                    soundController.playBell(820);
                  }}
                  title={lang === 'ko' ? landmark.nameKo : landmark.nameEn}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-stone-800 text-amber-300 border border-amber-500/40'
                      : 'text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Bottom Settings & Atmosphere Controls (Gemini Footer Pattern) */}
      <div className="border-t border-stone-800/90 shrink-0 bg-[#151413]">
        <div className={`${showFull ? 'p-2.5 space-y-1' : 'p-2 flex flex-col items-center gap-1'}`}>
          {showFull ? (
            <>
              <button
                type="button"
                data-testid="lnb-environment-toggle"
                onClick={() => setIsEnvOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-full text-xs text-stone-300 hover:bg-stone-800/80 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ko' ? '시간 · 기상 · 렌더링 설정' : 'Atmosphere & Render'}</span>
                </span>
                {isEnvOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </button>

              {isEnvOpen && (
                <div className="p-3 my-1 rounded-2xl border border-stone-800 space-y-3 bg-[#1c1b19]">
                  {/* Weather */}
                  <div>
                    <div className="text-[11px] font-medium text-stone-400 mb-1.5">
                      {lang === 'ko' ? '기상 효과' : 'Weather'}
                    </div>
                    <div className="grid grid-cols-3 gap-1" role="group" aria-label="Weather toggle">
                      {weatherOptions.map((opt) => {
                        const isSelected = weather === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            data-weather-toggle={opt.id}
                            onClick={() => {
                              onSetWeather(opt.id);
                              soundController.playGayageumNote(
                                opt.id === 'snow' ? 523 : opt.id === 'rain' ? 392 : 440
                              );
                            }}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                              isSelected
                                ? 'bg-amber-600 text-white'
                                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                            }`}
                          >
                            {opt.icon}
                            <span>{lang === 'ko' ? opt.labelKo : opt.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time of Day */}
                  <div>
                    <div className="text-[11px] font-medium text-stone-400 mb-1.5">
                      {lang === 'ko' ? '시간대' : 'Time of Day'}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {timeOptions.map((opt) => {
                        const isSelected = timePreset === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              onSetTimePreset(opt.id);
                              soundController.playGayageumNote(330);
                            }}
                            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] transition-colors ${
                              isSelected
                                ? 'bg-amber-600 text-white font-medium'
                                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                            }`}
                          >
                            {opt.icon}
                            <span>{lang === 'ko' ? opt.labelKo : opt.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rendering Mode */}
                  <div>
                    <div className="text-[11px] font-medium text-stone-400 mb-1.5">
                      {lang === 'ko' ? '렌더링 스타일' : 'Render Style'}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {renderOptions.map((opt) => {
                        const isSelected = renderingMode === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              onSetRenderingMode(opt.id);
                              soundController.playGayageumNote(440);
                            }}
                            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] transition-colors whitespace-nowrap ${
                              isSelected
                                ? 'bg-amber-600 text-white font-medium'
                                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                            }`}
                          >
                            {opt.icon}
                            <span>{lang === 'ko' ? opt.labelKo : opt.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onOpenInfo();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs text-stone-300 hover:bg-stone-800/80 hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ko' ? '명소 해설 도슨트' : 'Docent Guide'}</span>
              </button>

              <div className="flex items-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={onToggleAutoRotate}
                  title={lang === 'ko' ? '360도 자율 투어' : 'Auto Tour'}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-[11px] transition-colors ${
                    isAutoRotate
                      ? 'bg-amber-600 text-white font-medium'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{lang === 'ko' ? (isAutoRotate ? '회전 중' : '자율투어') : 'Auto'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  title={lang === 'ko' ? '궁중 풍경음' : 'Ambient Audio'}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    isAudioPlaying
                      ? 'bg-emerald-800/80 text-emerald-200'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => soundController.playBell(740)}
                  title={lang === 'ko' ? '타종음 울리기' : 'Chime Bell'}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-800/80 text-amber-300 hover:bg-stone-700 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onOpenVr}
                  data-testid="lnb-vr-button"
                  title={lang === 'ko' ? 'VR 모드' : 'VR Mode'}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    isVrActive
                      ? 'bg-cyan-600 text-white'
                      : 'bg-stone-800/80 text-cyan-300 hover:bg-stone-700'
                  }`}
                >
                  <Glasses className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onToggleLang}
                  title="한국어 / English"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-800/80 text-stone-200 hover:bg-stone-700 text-[11px] font-semibold transition-colors"
                >
                  {lang === 'ko' ? 'KO' : 'EN'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                data-testid="lnb-environment-toggle"
                onClick={() => {
                  onToggleExpand();
                  setIsEnvOpen(true);
                }}
                title={lang === 'ko' ? '시간 · 기상 · 렌더링 설정' : 'Atmosphere & Render'}
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:bg-stone-800 hover:text-amber-300 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => soundController.playBell(740)}
                title={lang === 'ko' ? '타종음 울리기' : 'Chime Bell'}
                className="w-10 h-10 rounded-full flex items-center justify-center text-amber-300 hover:bg-stone-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenVr}
                data-testid="lnb-vr-button"
                title={lang === 'ko' ? 'VR 모드' : 'VR Mode'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isVrActive ? 'bg-cyan-600 text-white' : 'text-cyan-300 hover:bg-stone-800'
                }`}
              >
                <Glasses className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleLang}
                title="한국어 / English"
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:bg-stone-800 text-[11px] font-semibold transition-colors"
              >
                <Languages className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Gemini-style LNB */}
      <aside
        aria-label={lang === 'ko' ? '탐방 메뉴 사이드바' : 'Navigation Sidebar'}
        className={`hidden md:flex shrink-0 h-full transition-[width] duration-200 ease-out z-20 ${
          isExpanded ? 'w-[280px]' : 'w-[68px]'
        }`}
      >
        {renderSidebarInner()}
      </aside>

      {/* Mobile Slide-Over Gemini LNB Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full shadow-2xl">
            {renderSidebarInner()}
          </aside>
        </div>
      )}
    </>
  );
};
