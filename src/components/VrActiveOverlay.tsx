import React from 'react';
import { X, MapPin, Compass } from 'lucide-react';
import { VrMode } from '../types';

interface VrActiveOverlayProps {
  vrMode: VrMode;
  onExitVr: () => void;
  onTeleport: (position: [number, number, number], target: [number, number, number]) => void;
  lang: 'ko' | 'en';
}

export const VrActiveOverlay: React.FC<VrActiveOverlayProps> = ({
  vrMode,
  onExitVr,
  onTeleport,
  lang,
}) => {
  if (vrMode === 'none') return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Google Cardboard Center Split Alignment Line */}
      {vrMode === 'cardboard' && (
        <>
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-stone-700/80 pointer-events-none shadow-sm" />
          {/* Cardboard alignment notch circle at center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-stone-500/80 bg-stone-900 pointer-events-none" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-stone-500/80 bg-stone-900 pointer-events-none" />
        </>
      )}

      {/* Top Bar with Exit Button and Status */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Status Pill */}
        <div className="px-3 py-1 rounded-full bg-stone-900/90 border border-amber-600/60 shadow-lg text-amber-200 text-xs font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {vrMode === 'webxr'
              ? lang === 'ko'
                ? 'WebXR 몰입 세션 실행 중'
                : 'WebXR Session Active'
              : lang === 'ko'
              ? '카드보드 3D 뷰어 모드'
              : 'Cardboard 3D Stereo Mode'}
          </span>
        </div>

        {/* Exit VR Mode Button */}
        <button
          onClick={onExitVr}
          data-testid="exit-vr-button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-700/80 shadow-xl text-xs font-medium transition-colors"
          title={lang === 'ko' ? 'VR 모드 종료' : 'Exit VR Mode'}
        >
          <X className="w-4 h-4" />
          <span>{lang === 'ko' ? 'VR 종료' : 'Exit VR'}</span>
        </button>
      </div>

      {/* Bottom Teleport Hotspots in Cardboard/VR View */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[95vw] overflow-x-auto p-1 bg-stone-900/90 rounded-2xl border border-stone-700/80 shadow-2xl">
        <div className="text-[10px] text-stone-400 px-2 font-mono flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">{lang === 'ko' ? '순간이동' : 'Teleport'}:</span>
        </div>

        <button
          onClick={() => onTeleport([0, 0, 24], [0, 4.5, 0])}
          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-900/60 text-stone-200 hover:text-amber-100 border border-stone-700/70 text-xs whitespace-nowrap transition-colors"
        >
          {lang === 'ko' ? '광화문 월대' : 'Gwanghwamun Woldae'}
        </button>

        <button
          onClick={() => onTeleport([0, 0, -48], [0, 6, -70])}
          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-900/60 text-stone-200 hover:text-amber-100 border border-stone-700/70 text-xs whitespace-nowrap transition-colors"
        >
          {lang === 'ko' ? '근정전 조정' : 'Geunjeongjeon Court'}
        </button>

        <button
          onClick={() => onTeleport([-68, 0, -50], [-68, 5, -68])}
          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-900/60 text-stone-200 hover:text-amber-100 border border-stone-700/70 text-xs whitespace-nowrap transition-colors"
        >
          {lang === 'ko' ? '경회루 연못' : 'Gyeonghoeru Lake'}
        </button>

        <button
          onClick={() => onTeleport([0, 0, 145], [0, 8, 120])}
          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-900/60 text-stone-200 hover:text-amber-100 border border-stone-700/70 text-xs whitespace-nowrap transition-colors"
        >
          {lang === 'ko' ? '광화문 사거리' : 'Crossroad'}
        </button>

        <button
          onClick={() => onTeleport([52, 0, 155], [70, 22, 160])}
          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-900/60 text-stone-200 hover:text-amber-100 border border-stone-700/70 text-xs whitespace-nowrap transition-colors"
        >
          {lang === 'ko' ? '교보생명 빌딩' : 'Kyobo Building'}
        </button>
      </div>
    </div>
  );
};
