import React from 'react';
import { X, MapPin, Sparkles, BookOpen, Volume2, ArrowRight } from 'lucide-react';
import { LandmarkInfo } from '../types';
import { soundController } from '../audio/traditionalAudio';

interface HeritageModalProps {
  landmark: LandmarkInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onFlyTo: (landmark: LandmarkInfo) => void;
  lang: 'ko' | 'en';
}

export const HeritageModal: React.FC<HeritageModalProps> = ({
  landmark,
  isOpen,
  onClose,
  onFlyTo,
  lang,
}) => {
  if (!isOpen || !landmark) return null;

  const playChime = () => {
    soundController.playBell(880);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-700/90 rounded-2xl shadow-2xl text-stone-100 p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-700/70">
                {landmark.category}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {landmark.historicalEra}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-serif font-bold text-amber-100">
                {lang === 'ko' ? landmark.nameKo : landmark.nameEn}
              </h2>
              <span className="text-lg font-serif text-amber-400/80">
                {landmark.nameHanja}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-sm text-stone-300">
          {/* Summary Quote */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200/90 font-serif leading-relaxed">
            {lang === 'ko' ? landmark.summaryKo : landmark.summaryEn}
          </div>

          {/* Key Architectural & Cultural Details */}
          <div>
            <h3 className="font-semibold text-stone-100 flex items-center gap-2 mb-2 text-base">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ko' ? '건축미 및 역사적 의의' : 'Architectural & Cultural Highlights'}</span>
            </h3>
            <ul className="space-y-2">
              {(lang === 'ko' ? landmark.detailsKo : landmark.detailsEn).map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-stone-800 pt-4 mt-5">
          <button
            onClick={playChime}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ko' ? '청아한 풍경 타종' : 'Play Bell Chime'}</span>
          </button>

          <button
            onClick={() => {
              onFlyTo(landmark);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs sm:text-sm transition-colors shadow-lg"
          >
            <MapPin className="w-4 h-4" />
            <span>{lang === 'ko' ? '이 장소로 3D 카메라 이동' : 'Fly to Landmark'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
