import React from 'react';
import { Menu, Compass, BookOpen, Glasses } from 'lucide-react';
import { SceneZone } from '../types';

interface HeaderBarProps {
  activeZone: SceneZone;
  currentLandmarkName: string;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  onOpenInfo: () => void;
  onOpenVr: () => void;
  isVrActive: boolean;
  onOpenMobileMenu: () => void;
  lang: 'ko' | 'en';
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeZone,
  currentLandmarkName,
  isAutoRotate,
  onToggleAutoRotate,
  onOpenInfo,
  onOpenVr,
  isVrActive,
  onOpenMobileMenu,
  lang,
}) => {
  const isJamsil = activeZone === 'jamsil';
  const isNamsan = activeZone === 'namsan_han';
  const isNamhae = activeZone === 'namhae_german';
  const isJeonju = activeZone === 'jeonju_hanok';

  const zoneTitle = isJamsil
    ? lang === 'ko'
      ? '석촌호수 & 롯데타워'
      : 'Seokchon Lake & Lotte Tower'
    : isNamsan
    ? lang === 'ko'
      ? '남산 & 한남 · 한강대교'
      : 'Namsan & Han River'
    : isNamhae
    ? lang === 'ko'
      ? '남해 독일마을 & 물건항'
      : 'Namhae German Village'
    : isJeonju
    ? lang === 'ko'
      ? '전주 한옥마을 & 경기전'
      : 'Jeonju Hanok Village'
    : lang === 'ko'
    ? '경복궁 & 광화문'
    : 'Gyeongbokgung & Gwanghwamun';

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex items-center justify-between gap-3">
      {/* Left Context Lockup + Mobile LNB Trigger */}
      <div className="pointer-events-auto bg-stone-900/90 text-stone-100 px-3 py-2 rounded-xl border border-stone-700/80 shadow-lg flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={lang === 'ko' ? '탐방 메뉴 열기' : 'Open navigation menu'}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded-lg bg-amber-600/25 border border-amber-500/45 flex items-center justify-center font-serif text-amber-300 font-bold text-xs shrink-0">
          {isJamsil ? '湖' : isNamsan ? '南' : isNamhae ? '海' : isJeonju ? '全' : '景'}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-serif font-bold text-xs sm:text-sm tracking-wide text-amber-100 whitespace-nowrap shrink-0">
            {zoneTitle}
          </h1>
          <span aria-hidden="true" className="text-stone-500 hidden sm:inline">
            ·
          </span>
          <span className="text-xs text-stone-300 truncate hidden sm:inline max-w-[220px]">
            {currentLandmarkName}
          </span>
        </div>
      </div>

      {/* Right Compact Viewport Quick Actions (keeps center sky clear) */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/90 text-stone-200 p-1 rounded-xl border border-stone-700/80 shadow-lg text-xs shrink-0">
        <button
          type="button"
          onClick={onOpenInfo}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors whitespace-nowrap"
          title={lang === 'ko' ? '명소 해설 도슨트' : 'Landmark Docent Info'}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-medium">
            {lang === 'ko' ? '명소 해설' : 'Docent'}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            isAutoRotate
              ? 'bg-amber-600 text-white font-medium'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
          }`}
          title={lang === 'ko' ? '360도 자율 투어' : 'Auto 360 Tour'}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {lang === 'ko' ? (isAutoRotate ? '회전 중' : '자율 투어') : 'Auto Tour'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenVr}
          data-testid="vr-mode-button"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            isVrActive
              ? 'bg-cyan-600 text-white font-medium'
              : 'bg-stone-800 hover:bg-stone-700 text-cyan-300'
          }`}
          title={lang === 'ko' ? 'WebXR & 카드보드 VR 모드' : 'WebXR & Cardboard VR Mode'}
        >
          <Glasses className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-medium">
            {lang === 'ko' ? (isVrActive ? 'VR 종료' : 'VR 모드') : isVrActive ? 'Exit VR' : 'VR Mode'}
          </span>
        </button>
      </div>
    </header>
  );
};
