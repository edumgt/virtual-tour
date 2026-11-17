import React, { useMemo, useState } from 'react';
import { Compass, Map as MapIcon, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import { CameraTelemetry, LandmarkInfo, SceneZone } from '../types';
import {
  ZONE_MAP_CONFIGS,
  MAP_VIEW_WIDTH,
  MAP_VIEW_HEIGHT,
  projectWorldToMap,
  mapNormToWorldXZ,
  computeCameraYawDeg,
  panCameraToWorldXZ,
} from '../utils/minimap';

interface ZoneMinimapOverlayProps {
  activeZone: SceneZone;
  landmarks: LandmarkInfo[];
  selectedLandmarkId: string;
  cameraTelemetry: CameraTelemetry;
  onSelectLandmark: (id: string) => void;
  onPanToWorld: (position: [number, number, number], target: [number, number, number]) => void;
  onResetOverview: () => void;
  lang: 'ko' | 'en';
}

export const ZoneMinimapOverlay: React.FC<ZoneMinimapOverlayProps> = ({
  activeZone,
  landmarks,
  selectedLandmarkId,
  cameraTelemetry,
  onSelectLandmark,
  onPanToWorld,
  onResetOverview,
  lang,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 640 : true
  );
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  const mapConfig = ZONE_MAP_CONFIGS[activeZone];
  const { minX, maxX, minZ, maxZ, viewWidth, viewHeight } = mapConfig.bounds;

  const scaleX = viewWidth / (maxX - minX);
  const scaleY = viewHeight / (maxZ - minZ);

  const camPoint = useMemo(
    () => projectWorldToMap(cameraTelemetry.position[0], cameraTelemetry.position[2], activeZone),
    [cameraTelemetry.position, activeZone]
  );

  const targetPoint = useMemo(
    () => projectWorldToMap(cameraTelemetry.target[0], cameraTelemetry.target[2], activeZone),
    [cameraTelemetry.target, activeZone]
  );

  const yawDeg = useMemo(
    () => computeCameraYawDeg(cameraTelemetry.position, cameraTelemetry.target),
    [cameraTelemetry.position, cameraTelemetry.target]
  );

  // Build SVG directional FOV cone polygon (56 deg spread)
  const conePath = useMemo(() => {
    const spreadRad = (28 * Math.PI) / 180;
    const yawRad = (yawDeg * Math.PI) / 180;
    const coneLength = 32;

    const x1 = camPoint.x + Math.sin(yawRad - spreadRad) * coneLength;
    const y1 = camPoint.y - Math.cos(yawRad - spreadRad) * coneLength;
    const x2 = camPoint.x + Math.sin(yawRad + spreadRad) * coneLength;
    const y2 = camPoint.y - Math.cos(yawRad + spreadRad) * coneLength;

    return `M ${camPoint.x.toFixed(1)} ${camPoint.y.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${coneLength} ${coneLength} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  }, [camPoint.x, camPoint.y, yawDeg]);

  const projectedLandmarks = useMemo(
    () =>
      landmarks.map((lm) => ({
        landmark: lm,
        point: projectWorldToMap(lm.highlightCoordinates[0], lm.highlightCoordinates[2], activeZone),
      })),
    [landmarks, activeZone]
  );

  const activeHoverLandmark = useMemo(() => {
    const targetId = hoveredLandmarkId || selectedLandmarkId;
    return landmarks.find((l) => l.id === targetId) || null;
  }, [hoveredLandmarkId, selectedLandmarkId, landmarks]);

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const normX = (event.clientX - rect.left) / rect.width;
    const normY = (event.clientY - rect.top) / rect.height;
    const [wx, wz] = mapNormToWorldXZ(normX, normY, activeZone);
    const nextPose = panCameraToWorldXZ(
      cameraTelemetry.position,
      cameraTelemetry.target,
      wx,
      wz
    );
    onPanToWorld(nextPose.position, nextPose.target);
  };

  if (!isExpanded) {
    return (
      <div className="absolute bottom-4 right-4 z-20">
        <button
          type="button"
          data-testid="minimap-toggle-button"
          aria-expanded={false}
          aria-label={lang === 'ko' ? '2D 구역 지도 열기' : 'Open 2D Zone Map'}
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/92 hover:bg-stone-800 text-stone-100 border border-stone-700/80 shadow-xl text-xs font-medium transition-colors"
        >
          <MapIcon className="w-4 h-4 text-amber-400" />
          <span>{lang === 'ko' ? '2D 지도' : '2D Map'}</span>
          <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>
    );
  }

  return (
    <section
      data-testid="zone-minimap"
      data-zone={activeZone}
      aria-label={lang === 'ko' ? '현재 구역 2D 지도 및 카메라 위치' : '2D Zone Map & Camera Position'}
      className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 w-[232px] sm:w-[264px] bg-stone-900/94 text-stone-100 rounded-xl border border-stone-700/85 shadow-2xl overflow-hidden select-none"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-stone-800 bg-stone-950/70">
        <div className="flex items-center gap-2 min-w-0">
          <MapIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-amber-100 truncate">
            {lang === 'ko' ? mapConfig.titleKo : mapConfig.titleEn}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onResetOverview}
            aria-label={lang === 'ko' ? '구역 전체 조망으로 초기화' : 'Reset zone overview'}
            title={lang === 'ko' ? '구역 전체 조망' : 'Reset Overview'}
            className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-testid="minimap-toggle-button"
            aria-expanded={true}
            aria-label={lang === 'ko' ? '2D 구역 지도 접기' : 'Collapse 2D Zone Map'}
            title={lang === 'ko' ? '지도 접기' : 'Collapse Map'}
            onClick={() => setIsExpanded(false)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive 2D Cartographic Map Canvas */}
      <div className="relative w-full aspect-[4/3] bg-[#161514]">
        <svg
          viewBox={`0 0 ${MAP_VIEW_WIDTH} ${MAP_VIEW_HEIGHT}`}
          className="w-full h-full block cursor-crosshair"
          role="img"
          aria-label={
            lang === 'ko'
              ? `${mapConfig.titleKo} 2D 평면도 (클릭하여 시점 이동)`
              : `${mapConfig.titleEn} 2D schematic map (click to move camera)`
          }
          onClick={handleSvgClick}
        >
          <defs>
            <radialGradient
              id="minimapCamConeGrad"
              gradientUnits="userSpaceOnUse"
              cx={camPoint.x}
              cy={camPoint.y}
              r="34"
            >
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.03" />
            </radialGradient>
            <pattern id="minimapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ffffff" strokeOpacity="0.045" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Subtle Survey Grid */}
          <rect x="0" y="0" width={MAP_VIEW_WIDTH} height={MAP_VIEW_HEIGHT} fill="url(#minimapGrid)" />

          {/* World-to-SVG Schematic Geometry */}
          <g transform={`scale(${scaleX.toFixed(5)} ${scaleY.toFixed(5)}) translate(${-minX} ${-minZ})`}>
            {mapConfig.shapes.map((shape, idx) => {
              const fill =
                shape.layer === 'water'
                  ? '#1a4259'
                  : shape.layer === 'foliage'
                  ? '#213a28'
                  : shape.layer === 'terrain'
                  ? '#272d25'
                  : shape.layer === 'road'
                  ? '#393632'
                  : '#665b4c';

              const stroke =
                shape.layer === 'water'
                  ? '#2c698a'
                  : shape.layer === 'building'
                  ? '#8c7e6a'
                  : shape.layer === 'road'
                  ? '#4f4a43'
                  : 'none';

              if (shape.kind === 'rect') {
                return (
                  <rect
                    key={idx}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    rx={shape.rx || 0}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={stroke === 'none' ? 0 : 0.9}
                  />
                );
              }

              if (shape.kind === 'ellipse') {
                return (
                  <ellipse
                    key={idx}
                    cx={shape.cx}
                    cy={shape.cy}
                    rx={shape.rx}
                    ry={shape.ry}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={stroke === 'none' ? 0 : 0.9}
                  />
                );
              }

              return (
                <path
                  key={idx}
                  d={shape.d}
                  fill="none"
                  stroke={shape.layer === 'foliage' ? '#25452e' : '#4a453f'}
                  strokeWidth={shape.strokeWidth || 4}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Camera Look-at Sightline */}
          <line
            x1={camPoint.x}
            y1={camPoint.y}
            x2={targetPoint.x}
            y2={targetPoint.y}
            stroke="#fbbf24"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Camera Viewing Cone */}
          <path d={conePath} fill="url(#minimapCamConeGrad)" pointerEvents="none" />

          {/* Look-at Target Anchor */}
          <circle
            cx={targetPoint.x}
            cy={targetPoint.y}
            r="2.4"
            fill="none"
            stroke="#fcd34d"
            strokeOpacity="0.7"
            strokeWidth="1.1"
            pointerEvents="none"
          />

          {/* Live Camera Position Marker */}
          <g
            data-testid="minimap-camera-marker"
            data-cam-x={Math.round(cameraTelemetry.position[0])}
            data-cam-z={Math.round(cameraTelemetry.position[2])}
            data-yaw={Math.round(yawDeg)}
            data-out-of-bounds={camPoint.isOutOfBounds ? 'true' : 'false'}
            pointerEvents="none"
          >
            <circle
              cx={camPoint.x}
              cy={camPoint.y}
              r="6.5"
              fill="#f59e0b"
              fillOpacity="0.24"
              stroke={camPoint.isOutOfBounds ? '#fb7185' : '#fbbf24'}
              strokeWidth="1"
              strokeDasharray={camPoint.isOutOfBounds ? '2 2' : undefined}
            />
            <circle
              cx={camPoint.x}
              cy={camPoint.y}
              r="3.8"
              fill="#f59e0b"
              stroke="#fffbeb"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Interactive Landmark Pins */}
        {projectedLandmarks.map(({ landmark, point }) => {
          const isSelected = landmark.id === selectedLandmarkId;
          const label = lang === 'ko' ? landmark.nameKo : landmark.nameEn;
          return (
            <button
              key={landmark.id}
              type="button"
              data-minimap-landmark={landmark.id}
              aria-label={label}
              title={label}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLandmark(landmark.id);
              }}
              onMouseEnter={() => setHoveredLandmarkId(landmark.id)}
              onMouseLeave={() => setHoveredLandmarkId(null)}
              style={{
                left: `${point.xPercent.toFixed(2)}%`,
                top: `${point.yPercent.toFixed(2)}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-125'
              }`}
            >
              <span
                className={`block rounded-full border ${
                  isSelected
                    ? 'w-2.5 h-2.5 bg-cyan-400 border-white shadow-[0_0_0_2px_rgba(34,211,238,0.35)]'
                    : 'w-2 h-2 bg-stone-200 border-stone-900 hover:bg-amber-300'
                }`}
              />
            </button>
          );
        })}

        {/* North Compass Badge */}
        <div
          aria-hidden="true"
          className="absolute top-2 right-2 pointer-events-none flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-950/80 border border-stone-700/70 text-[10px] font-semibold text-stone-300"
        >
          <Compass className="w-3 h-3 text-amber-400" />
          <span>N</span>
        </div>

        {/* Active / Hovered Landmark Caption (top-left, opposite North compass) */}
        {activeHoverLandmark && (
          <div className="absolute top-2 left-2 right-12 pointer-events-none flex items-center text-[10px] text-amber-100/95">
            <span className="px-1.5 py-0.5 rounded bg-stone-950/85 border border-stone-700/70 truncate max-w-full">
              {lang === 'ko' ? activeHoverLandmark.nameKo : activeHoverLandmark.nameEn}
            </span>
          </div>
        )}
      </div>

      {/* Footer Coordinate Telemetry & Legend */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-stone-800 bg-stone-950/80 text-[10px] text-stone-400">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-stone-300">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 border border-amber-100" />
            <span>{lang === 'ko' ? '카메라' : 'Cam'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 border border-white" />
            <span>{lang === 'ko' ? '명소' : 'Spot'}</span>
          </span>
        </div>

        <span
          data-testid="minimap-coords"
          className="font-mono tabular-nums text-stone-300"
        >
          X {Math.round(cameraTelemetry.position[0])} · Z {Math.round(cameraTelemetry.position[2])} · H{' '}
          {Math.round(cameraTelemetry.position[1])}m
        </span>
      </div>
    </section>
  );
};
