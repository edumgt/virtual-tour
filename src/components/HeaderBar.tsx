import React from 'react';
import { Volume2, VolumeX, Compass, BookOpen, SunMedium, Moon, Languages } from 'lucide-react';
import { soundController } from '../audio/traditionalAudio';

interface HeaderBarProps {
  currentLandmarkName: string;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  onOpenInfo: () => void;
  lang: 'ko' | 'en';
  onToggleLang: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentLandmarkName,
  isAutoRotate,
  onToggleAutoRotate,
  onOpenInfo,
  lang,
  onToggleLang,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleSound = () => {
    const playing = soundController.toggleAmbientSoundscape();
    setIsAudioPlaying(playing);
    if (playing) {
      soundController.playBell(780);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundController.setMuted(nextMute);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2.5 sm:p-4 flex flex-wrap items-center justify-between gap-2">
      {/* Title & Joseon Royal Heritage Seal */}
      <div className="pointer-events-auto bg-stone-900/95 text-stone-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-stone-700/80 shadow-xl flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-600/30 border border-amber-500/50 flex items-center justify-center font-serif text-amber-300 font-bold text-xs sm:text-sm shrink-0">
          景
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-serif font-bold text-xs sm:text-base tracking-wide text-amber-100 whitespace-nowrap">
              {lang === 'ko' ? '경복궁 & 광화문' : 'Gyeongbokgung'}
            </h1>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono hidden xs:inline">
              3D
            </span>
          </div>
          <p className="text-[10px] text-stone-400 hidden sm:block">
            {lang === 'ko' ? '디지털 문화유산 3D 탐방' : 'Joseon Dynasty 3D Heritage'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 bg-stone-900/95 text-stone-200 p-1 sm:p-1.5 rounded-xl border border-stone-700/80 shadow-xl text-xs">
        {/* Heritage Guide Modal Trigger */}
        <button
          onClick={onOpenInfo}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          title={lang === 'ko' ? '문화유산 해설 도슨트' : 'Heritage Docent Info'}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline font-medium">
            {lang === 'ko' ? '문화유산 해설' : 'Heritage Guide'}
          </span>
        </button>

        {/* Auto Orbit Tour */}
        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
            isAutoRotate
              ? 'bg-amber-600 text-white font-medium'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
          }`}
          title={lang === 'ko' ? '360도 자동 회전 투어' : 'Auto 360 Tour'}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {lang === 'ko' ? (isAutoRotate ? '회전 중' : '자율 투어') : 'Auto Tour'}
          </span>
        </button>

        {/* Traditional Korean Court Soundscape */}
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
            isAudioPlaying
              ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600/50'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
          }`}
          title={lang === 'ko' ? '가야금·풍경소리 국악 사운드스케이프' : 'Traditional Court Music'}
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">
            {lang === 'ko' ? (isAudioPlaying ? '궁중 음향' : '풍경음') : 'Audio'}
          </span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs"
          title="한국어 / English"
        >
          <Languages className="w-3 h-3 text-amber-400" />
          <span>{lang === 'ko' ? 'KO' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
