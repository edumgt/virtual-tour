import React from 'react';
import { Glasses, Smartphone, X, ExternalLink, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface VrModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWebXr: () => void;
  onStartCardboard: () => void;
  isWebXrSupported: boolean;
  lang: 'ko' | 'en';
}

export const VrModeModal: React.FC<VrModeModalProps> = ({
  isOpen,
  onClose,
  onStartWebXr,
  onStartCardboard,
  isWebXrSupported,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-600/50 rounded-2xl shadow-2xl text-stone-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                {lang === 'ko' ? '가상현실(VR) 몰입형 탐방' : 'Immersive Virtual Reality (VR)'}
              </h2>
              <p className="text-xs text-stone-400">
                {lang === 'ko'
                  ? 'WebXR 헤드셋 및 구글 카드보드 3D 입체 시야'
                  : 'WebXR Headset & Google Cardboard 3D Stereoscopy'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Option 1: WebXR Dedicated Headset Mode */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isWebXrSupported
                ? 'bg-stone-850/90 border-amber-500/70 shadow-lg ring-1 ring-amber-500/30'
                : 'bg-stone-800/40 border-stone-700/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Glasses className={`w-5 h-5 ${isWebXrSupported ? 'text-amber-400' : 'text-stone-400'}`} />
                <h3 className="font-semibold text-sm sm:text-base text-stone-100">
                  {lang === 'ko' ? '1. WebXR 몰입형 헤드셋 모드' : '1. WebXR Immersive Headset'}
                </h3>
              </div>
              {isWebXrSupported ? (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  {lang === 'ko' ? '기기 연결 감지됨' : 'Supported'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-400">
                  <AlertCircle className="w-3 h-3" />
                  {lang === 'ko' ? '일반 브라우저' : 'Device Standby'}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-300 leading-relaxed mb-3">
              {lang === 'ko'
                ? 'Meta Quest, Apple Vision Pro, Pico 4 등 전용 VR 헤드셋으로 1:1 실물 크기의 조선 궁궐을 6자유도(6DoF) 헤드 트래킹으로 걸으며 탐방합니다.'
                : 'Walk through the 1:1 scale Joseon Royal Palace with 6DoF head tracking on Meta Quest, Apple Vision Pro, or Pico headsets.'}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] text-stone-400">
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">Meta Quest 2/3/Pro</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">Apple Vision Pro</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">Pico 4</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">SteamVR / PCVR</span>
            </div>

            <button
              onClick={() => {
                onStartWebXr();
                onClose();
              }}
              data-testid="start-webxr-button"
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                isWebXrSupported
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg ring-1 ring-amber-400/50'
                  : 'bg-stone-750 hover:bg-stone-700 text-amber-200 border border-stone-600'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isWebXrSupported
                  ? lang === 'ko'
                    ? 'WebXR 몰입형 VR 세션 시작'
                    : 'Launch WebXR VR Session'
                  : lang === 'ko'
                  ? 'WebXR 세션 요청 (헤드셋 연결 시도)'
                  : 'Request WebXR Session'}
              </span>
            </button>
          </div>

          {/* Option 2: Cardboard Stereo 3D View */}
          <div className="p-4 rounded-xl border bg-stone-850/80 border-stone-700/80 hover:border-amber-500/50 transition-all">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <h3 className="font-semibold text-sm sm:text-base text-stone-100">
                  {lang === 'ko' ? '2. 구글 카드보드 & 모바일 VR 3D 뷰' : '2. Google Cardboard & Mobile VR'}
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-600/60 text-sky-300">
                <CheckCircle2 className="w-3 h-3" />
                {lang === 'ko' ? '즉시 체험 가능' : 'Ready to View'}
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed mb-3">
              {lang === 'ko'
                ? '스마트폰을 구글 카드보드(Google Cardboard)나 VR Box에 장착하세요. 화면이 좌우 두 개의 시야로 입체 분할되며, 스마트폰 자이로스코프 센서로 360도 둘러볼 수 있습니다.'
                : 'Insert your smartphone into Google Cardboard or VR Box viewer. The screen splits into dual stereoscopic eyes with 360° gyro head-tracking.'}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] text-stone-400">
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">모든 스마트폰 지원</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">구글 카드보드 뷰어</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">VR BOX</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700">자이로스코프 360°</span>
            </div>

            <button
              onClick={() => {
                onStartCardboard();
                onClose();
              }}
              data-testid="start-cardboard-button"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'ko' ? '카드보드 3D 분할 모드 시작' : 'Start Cardboard 3D Split-Screen'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Tips */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/70 text-[11px] text-stone-400 flex items-center justify-between">
          <span>
            {lang === 'ko'
              ? '💡 카드보드 사용 시 스마트폰 화면을 가로 모드로 회전해 주세요.'
              : '💡 For Cardboard, rotate your phone into landscape mode.'}
          </span>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white px-2 py-1 rounded bg-stone-800/80 transition-colors"
          >
            {lang === 'ko' ? '닫기' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
