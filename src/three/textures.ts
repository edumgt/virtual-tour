import * as THREE from 'three';

/**
 * Creates high-detail procedural textures for Korean traditional architecture.
 * 100% self-contained in canvas code (Zero external assets/404s).
 */

export function createGiwaRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark slate charcoal base (전통 암청색 기와)
  ctx.fillStyle = '#1e2126';
  ctx.fillRect(0, 0, 1024, 1024);

  // Concave & convex tile flutes (수기와 / 암기와)
  const cols = 24;
  const colWidth = 1024 / cols;
  const rows = 24;
  const rowHeight = 1024 / rows;

  for (let c = 0; c < cols; c++) {
    const x = c * colWidth;
    // Convex tile ridge gradient
    const grad = ctx.createLinearGradient(x, 0, x + colWidth, 0);
    grad.addColorStop(0, '#15171a');
    grad.addColorStop(0.2, '#2c3138');
    grad.addColorStop(0.5, '#484f5a'); // Highlight ridge
    grad.addColorStop(0.8, '#262a30');
    grad.addColorStop(1, '#111315');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, colWidth, 1024);

    // Weathered ceramic speckles & fine grain
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.6 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)';
      ctx.fillRect(x + Math.random() * colWidth, Math.random() * 1024, 2, 2);
    }
  }

  // Horizontal overlap lip lines with 3D drop shadow
  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    // Dark shadow groove
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, y, 1024, 5);

    // Bright ceramic glaze highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(0, y + 5, 1024, 2.5);

    // Round end-tile circular stamps (수막새 - Sumaksae lotus blossoms at bottom edges)
    for (let c = 0; c < cols; c++) {
      const cx = c * colWidth + colWidth / 2;
      ctx.beginPath();
      ctx.arc(cx, y + 4, colWidth * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createDancheongTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Traditional Dancheong base - deep celadon/malachite green (뇌록 - Noerok)
  ctx.fillStyle = '#174033';
  ctx.fillRect(0, 0, 1024, 512);

  // Chevron border patterns (Gisa/Meoricho)
  const segments = 8;
  const segW = 1024 / segments;

  for (let s = 0; s < segments; s++) {
    const cx = s * segW + segW / 2;
    const cy = 256;

    // Lotus flower petals (연화문) in Obang-saek (Red, Blue, Yellow, White, Black)
    // Red outer petal (장단/석간주)
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.fillStyle = '#a82025';
    ctx.fill();

    // Cobalt blue ring (군청)
    ctx.beginPath();
    ctx.arc(cx, cy, 72, 0, Math.PI * 2);
    ctx.fillStyle = '#193f6d';
    ctx.fill();

    // Imperial ochre yellow ring (황토/황)
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#d49b29';
    ctx.fill();

    // Center white pistil (백분)
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f3ec';
    ctx.fill();

    // Gold core dot
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    // Radiating lotus petal contours
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 25, cy + Math.sin(a) * 25);
      ctx.lineTo(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92);
      ctx.stroke();
    }
  }

  // Top horizontal band (석간주 적색)
  ctx.fillStyle = '#851a1d';
  ctx.fillRect(0, 0, 1024, 56);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(0, 48, 1024, 8);

  // Bottom horizontal band (군청색)
  ctx.fillStyle = '#122e50';
  ctx.fillRect(0, 456, 1024, 56);
  ctx.fillStyle = '#f5f3ec';
  ctx.fillRect(0, 448, 1024, 8);

  // Interlocking geometric fretwork (Goi/Whacheol)
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  for (let x = 0; x <= 1024; x += 48) {
    ctx.moveTo(x, 60);
    ctx.lineTo(x + 24, 90);
    ctx.lineTo(x + 48, 60);

    ctx.moveTo(x, 444);
    ctx.lineTo(x + 24, 414);
    ctx.lineTo(x + 48, 444);
  }
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGraniteStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Granite base tone (화강암 미색)
  ctx.fillStyle = '#dcd6c9';
  ctx.fillRect(0, 0, 1024, 1024);

  // Courses of Ashlar granite blocks (장대석 석축 Seams)
  const rows = 12;
  const rowH = 1024 / rows;
  const cols = 8;
  const colW = 1024 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    // Horizontal joint groove
    ctx.fillStyle = 'rgba(55, 48, 40, 0.55)';
    ctx.fillRect(0, y, 1024, 4);

    // Bevel light edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(0, y + 4, 1024, 2);

    // Vertical staggered masonry joints
    const stagger = (r % 2) * (colW / 2);
    for (let c = 0; c <= cols; c++) {
      const x = (c * colW + stagger) % 1024;
      ctx.fillStyle = 'rgba(55, 48, 40, 0.45)';
      ctx.fillRect(x, y, 3.5, rowH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(x + 3.5, y, 1.5, rowH);
    }
  }

  // Feldspar, quartz crystal granules, and biotite mica flakes
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise - 3));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 8));

    // Dark mica flakes
    if (Math.random() < 0.07) {
      data[i] = 45;
      data[i + 1] = 42;
      data[i + 2] = 38;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodGrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Korean Red Pine (적송) lacquer base
  ctx.fillStyle = '#7a281c';
  ctx.fillRect(0, 0, 512, 1024);

  // Longitudinal wood grain fibers
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const w = 1 + Math.random() * 3;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40, 12, 8, 0.5)' : 'rgba(155, 60, 40, 0.35)';
    ctx.fillRect(x, 0, w, 1024);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createLatticeWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Hanji paper translucent cream background
  ctx.fillStyle = '#f8f4e6';
  ctx.fillRect(0, 0, 512, 1024);

  // Outer wooden frame
  ctx.fillStyle = '#5c2215';
  ctx.fillRect(0, 0, 512, 28);
  ctx.fillRect(0, 996, 512, 28);
  ctx.fillRect(0, 0, 28, 1024);
  ctx.fillRect(484, 0, 28, 1024);

  // Central kickplate (머름벽) at bottom of door
  ctx.fillStyle = '#6b271a';
  ctx.fillRect(28, 780, 456, 216);
  ctx.strokeStyle = '#4a1910';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 788, 440, 200);

  // Vertical wood rib bars (Salmun - 세살창)
  ctx.fillStyle = '#7a2e20';
  for (let x = 48; x < 480; x += 32) {
    ctx.fillRect(x, 28, 6, 752);
  }

  // Horizontal wood rib bars
  for (let y = 48; y < 780; y += 48) {
    ctx.fillRect(28, y, 456, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createIlworobongdoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Sky deep azure blue
  ctx.fillStyle = '#16314f';
  ctx.fillRect(0, 0, 1024, 512);

  // Moon (White) on left
  ctx.beginPath();
  ctx.arc(200, 120, 52, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafd';
  ctx.fill();

  // Sun (Red) on right
  ctx.beginPath();
  ctx.arc(824, 120, 56, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();

  // Five Mountain Peaks (Obong) with layered jade mineral green
  const peakColors = ['#1d5c48', '#26735a', '#144637', '#226953', '#184d3c'];
  const peaks = [
    { x: 200, y: 220, w: 180 },
    { x: 360, y: 160, w: 200 },
    { x: 512, y: 130, w: 240 }, // Center main peak
    { x: 664, y: 160, w: 200 },
    { x: 824, y: 220, w: 180 },
  ];

  peaks.forEach((p, idx) => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.w / 2, 440);
    ctx.lineTo(p.x - p.w / 2, 440);
    ctx.closePath();
    ctx.fillStyle = peakColors[idx];
    ctx.fill();

    // White snow caps
    ctx.strokeStyle = '#e6f0ec';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(p.x - p.w * 0.25, p.y + 50);
    ctx.lineTo(p.x, p.y);
    ctx.lineTo(p.x + p.w * 0.25, p.y + 50);
    ctx.stroke();
  });

  // Red Pine trees on both flanks
  ctx.fillStyle = '#7a2918';
  ctx.fillRect(80, 260, 16, 180);
  ctx.fillRect(920, 260, 16, 180);

  // Stylized wave sea base (Pado)
  ctx.fillStyle = '#1c456f';
  ctx.fillRect(0, 420, 1024, 92);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let x = 0; x < 1024; x += 48) {
    ctx.beginPath();
    ctx.arc(x + 24, 430, 24, Math.PI, 0, false);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGwanghwamunSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Historically verified black lacquer signboard with gold leaf inscription
  ctx.fillStyle = '#101012';
  ctx.fillRect(0, 0, 1024, 400);

  // Gold ornate border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 16;
  ctx.strokeRect(20, 20, 984, 360);

  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, 952, 328);

  // Calligraphic "光 化 門" in royal gold
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 180px "Noto Serif KR", "Batang", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('光  化  門', 512, 204);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGeunjeongjeonSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e0e10';
  ctx.fillRect(0, 0, 1024, 400);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 16;
  ctx.strokeRect(20, 20, 984, 360);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 176px "Noto Serif KR", "Batang", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('勤  政  殿', 512, 204);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGyeonghoeruSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e0e10';
  ctx.fillRect(0, 0, 1024, 400);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 16;
  ctx.strokeRect(20, 20, 984, 360);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 176px "Noto Serif KR", "Batang", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('慶  會  樓', 512, 204);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates authentic Dancheong painted rafter-end medallions (마구리 단청).
 * Green base with red/yellow concentric lotus petals and white borders.
 */
export function createRafterEndTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background deep celadon green (뇌록)
  ctx.fillStyle = '#174033';
  ctx.fillRect(0, 0, 256, 256);

  const cx = 128;
  const cy = 128;

  // Outer red ring (석간주)
  ctx.beginPath();
  ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.fillStyle = '#942226';
  ctx.fill();

  // White border line
  ctx.strokeStyle = '#f5f4ef';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Deep cobalt ring (군청)
  ctx.beginPath();
  ctx.arc(cx, cy, 88, 0, Math.PI * 2);
  ctx.fillStyle = '#183863';
  ctx.fill();

  // Yellow lotus core (황토)
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.fillStyle = '#d99f2b';
  ctx.fill();

  // Pure white flower center with gold stamen
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#f8f6f0';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700';
  ctx.fill();

  // 8 radiating lotus petal contours
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
    ctx.lineTo(cx + Math.cos(a) * 110, cy + Math.sin(a) * 110);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates imperial twin ascending dragons amidst swirling clouds (홍예 천장 쌍룡도)
 * Painted inside the central royal arch vault of Gwanghwamun.
 */
export function createDragonCeilingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep imperial navy / indigo background (청천)
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Swirling auspicious clouds (운기문 - Un-gimun)
  ctx.fillStyle = 'rgba(40, 75, 99, 0.4)';
  for (let i = 0; i < 30; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const rad = 60 + Math.random() * 120;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red and Gold Flaming Dragon Pearls (여의주 - Yeouiju) in center
  const cx = 512;
  const cy = 512;

  const pearlGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 70);
  pearlGrad.addColorStop(0, '#ffffff');
  pearlGrad.addColorStop(0.3, '#ffcc00');
  pearlGrad.addColorStop(0.7, '#d62828');
  pearlGrad.addColorStop(1, 'rgba(214, 40, 40, 0)');
  ctx.fillStyle = pearlGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fill();

  // Swirling dragon serpentine bodies (황룡 & 청룡)
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 18;
  ctx.beginPath();
  // Dragon 1: S-curve from top-left to center
  ctx.moveTo(180, 200);
  ctx.bezierCurveTo(280, 120, 420, 220, 480, 450);
  ctx.bezierCurveTo(520, 560, 360, 680, 260, 820);
  ctx.stroke();

  // Dragon 2: S-curve from bottom-right to center
  ctx.strokeStyle = '#3a86ff';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(844, 824);
  ctx.bezierCurveTo(744, 904, 604, 804, 544, 574);
  ctx.bezierCurveTo(504, 464, 664, 344, 764, 204);
  ctx.stroke();

  // Dragon claws, whiskers, horns, and scales
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  for (let step = 0; step < 8; step++) {
    const angle = (step / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 160, cy + Math.sin(angle) * 160);
    ctx.lineTo(cx + Math.cos(angle + 0.3) * 280, cy + Math.sin(angle + 0.3) * 280);
    ctx.stroke();
  }

  // Auspicious cloud border in traditional red and white
  ctx.strokeStyle = '#c1121f';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, 984, 984);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 960, 960);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates authentic Joseon palace gable wall (합각벽 - Hapgak-byeok)
 * Features dark baked grey bricks (전돌), white lime plaster seams,
 * and decorative Chinese character medallions (수·복 / 壽·福).
 */
export function createGableHapgakTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark slate-grey baked brick base (전돌)
  ctx.fillStyle = '#2f343b';
  ctx.fillRect(0, 0, 512, 512);

  // Diagonal herringbone / lattice brick pattern (사격자 무늬)
  ctx.strokeStyle = '#f0eee6'; // White lime mortar
  ctx.lineWidth = 3.5;

  const step = 42;
  ctx.beginPath();
  for (let x = -512; x <= 1024; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 512, 512);

    ctx.moveTo(x, 512);
    ctx.lineTo(x + 512, 0);
  }
  ctx.stroke();

  // Central circle medallion with royal character "壽" (Longevity)
  const cx = 256;
  const cy = 256;
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.fillStyle = '#8f2d2b'; // Dark vermilion red
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 100px "Noto Serif KR", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('壽', cx, cy + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates black forged iron hardware texture (철물 문두리 & 두정)
 * for Joseon gate door straps and bosses.
 */
export function createIronBandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Dark hammered wrought iron
  ctx.fillStyle = '#1c1c1f';
  ctx.fillRect(0, 0, 512, 128);

  // Hammered metal noise & scratches
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)';
    ctx.fillRect(Math.random() * 512, Math.random() * 128, 2, 2);
  }

  // Row of round dome rivet heads (철두정)
  const count = 6;
  const spacing = 512 / count;
  for (let i = 0; i < count; i++) {
    const rx = i * spacing + spacing / 2;
    const ry = 64;

    const grad = ctx.createRadialGradient(rx - 4, ry - 4, 2, rx, ry, 22);
    grad.addColorStop(0, '#55555c');
    grad.addColorStop(0.6, '#2a2a2e');
    grad.addColorStop(1, '#0e0e11');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, 22, 0, Math.PI * 2);
    ctx.fill();

    // Rivet edge shadow
    ctx.strokeStyle = '#050508';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a soft glowing radial snowflake particle texture
 */
export function createSnowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const cx = 32;
  const cy = 32;

  // Soft glowing snowflake orb
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.35, 'rgba(240, 248, 255, 0.85)');
  grad.addColorStop(0.7, 'rgba(220, 235, 255, 0.35)');
  grad.addColorStop(1, 'rgba(200, 225, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates an elongated translucent rain streak particle texture
 */
export function createRainParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Smooth vertical streak gradient
  const grad = ctx.createLinearGradient(16, 0, 16, 128);
  grad.addColorStop(0, 'rgba(200, 225, 255, 0.0)');
  grad.addColorStop(0.3, 'rgba(225, 240, 255, 0.4)');
  grad.addColorStop(0.85, 'rgba(240, 250, 255, 0.95)');
  grad.addColorStop(1, 'rgba(180, 215, 245, 0.1)');

  ctx.fillStyle = grad;
  ctx.fillRect(13, 0, 6, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates high-detail modern architectural glass curtain wall texture
 * with reflective sky sheen and aluminum mullion grids.
 */
export function createModernGlassFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep architectural glass base (tinted blue-black)
  ctx.fillStyle = '#1c2634';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle sky reflection gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 512, 512);
  skyGrad.addColorStop(0, '#2b3f5c');
  skyGrad.addColorStop(0.5, '#1e2c3d');
  skyGrad.addColorStop(1, '#151e2a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Office floor grid: 8 floors x 8 window bays
  const rows = 8;
  const cols = 8;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const y = r * rowH;

      // Dark window pane with glass reflection
      const paneGrad = ctx.createLinearGradient(x, y, x + colW, y + rowH);
      paneGrad.addColorStop(0, 'rgba(80, 130, 185, 0.45)');
      paneGrad.addColorStop(0.3, 'rgba(40, 75, 120, 0.25)');
      paneGrad.addColorStop(1, 'rgba(20, 40, 70, 0.6)');
      ctx.fillStyle = paneGrad;
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

      // Random warm interior office light (15% chance of warm glow)
      if ((r * 13 + c * 7) % 7 === 1) {
        ctx.fillStyle = 'rgba(255, 230, 170, 0.35)';
        ctx.fillRect(x + 6, y + 6, colW - 12, rowH - 12);
      }

      // Aluminum mullions (horizontal and vertical window frames)
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, colW, rowH);
    }

    // Heavy concrete floor spandrel band between storeys
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, (r + 1) * rowH - 3, 512, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Kyobo Building iconic terracotta / reddish-brown granite grid texture
 * designed by César Pelli at Gwanghwamun Intersection.
 */
export function createKyoboFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta brick-red base
  ctx.fillStyle = '#853e34';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle stone fleck texture
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // 6 floors x 6 bays grid
  const rows = 6;
  const cols = 6;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const y = r * rowH;

      // Recessed dark bronze-tinted glass window
      ctx.fillStyle = '#181b22';
      ctx.fillRect(x + 7, y + 8, colW - 14, rowH - 16);

      // Glass reflection
      const wGrad = ctx.createLinearGradient(x + 7, y + 8, x + colW - 7, y + rowH - 8);
      wGrad.addColorStop(0, 'rgba(60, 80, 110, 0.4)');
      wGrad.addColorStop(0.5, 'rgba(30, 40, 55, 0.1)');
      wGrad.addColorStop(1, 'rgba(15, 20, 30, 0.5)');
      ctx.fillStyle = wGrad;
      ctx.fillRect(x + 7, y + 8, colW - 14, rowH - 16);

      // Deep terracotta chamfered sill highlight
      ctx.fillStyle = '#a64d42';
      ctx.fillRect(x + 7, y + rowH - 10, colW - 14, 2);
    }

    // Heavy horizontal granite beam
    ctx.fillStyle = '#6e3128';
    ctx.fillRect(0, r * rowH, 512, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Government Complex Seoul (정부서울청사) monumental bureaucratic stone grid texture
 */
export function createGovernmentFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Light limestone / architectural concrete
  ctx.fillStyle = '#dde2e8';
  ctx.fillRect(0, 0, 512, 512);

  // 8 rows x 6 columns
  const rows = 8;
  const cols = 6;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const y = r * rowH;

      // Vertical pilaster strip shadow
      ctx.fillStyle = '#2c333e';
      ctx.fillRect(x + 10, y + 6, colW - 20, rowH - 12);

      // Glass tint
      ctx.fillStyle = 'rgba(70, 95, 125, 0.5)';
      ctx.fillRect(x + 12, y + 8, colW - 24, rowH - 16);

      // White vertical stone pilasters
      ctx.fillStyle = '#eef2f7';
      ctx.fillRect(x, y, 6, rowH);
    }

    // Horizontal concrete floor spandrels
    ctx.fillStyle = '#cbd2dc';
    ctx.fillRect(0, r * rowH, 512, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates asphalt roadway texture with lane markings and crosswalks
 */
export function createAsphaltRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark charcoal asphalt
  ctx.fillStyle = '#26282c';
  ctx.fillRect(0, 0, 512, 512);

  // Asphalt grain noise
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // Yellow central double median lines
  ctx.fillStyle = '#f5c518';
  ctx.fillRect(253, 0, 2.5, 512);
  ctx.fillRect(257, 0, 2.5, 512);

  // White lane divider dashes (left and right)
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < 512; y += 40) {
    // Left roadway lanes
    ctx.fillRect(80, y, 2.5, 22);
    ctx.fillRect(165, y, 2.5, 22);
    // Right roadway lanes
    ctx.fillRect(345, y, 2.5, 22);
    ctx.fillRect(430, y, 2.5, 22);
  }

  // White boundary side curb lines
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, 0, 3, 512);
  ctx.fillRect(505, 0, 3, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Lotte World Tower sleek silver-ice-blue glass diagrid curtain-wall texture
 */
export function createLotteTowerGlassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Cool silver-blue glass base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#5a82a6');
  grad.addColorStop(0.5, '#8ab4d8');
  grad.addColorStop(1, '#3d6185');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal story bands (16 floors per tile)
  const rows = 16;
  const cols = 8;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const y = r * rowH;

      // Subtle reflective glass pane variation
      const lit = (r * 7 + c * 11) % 9 === 0;
      ctx.fillStyle = lit
        ? 'rgba(215, 240, 255, 0.45)'
        : 'rgba(18, 40, 68, 0.35)';
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 5);
    }

    // Crisp silver-white spandrel rib
    ctx.fillStyle = r % 4 === 0 ? '#dbe8f5' : '#9bb6cf';
    ctx.fillRect(0, r * rowH, 512, r % 4 === 0 ? 4 : 2);
  }

  // Diagonal aluminum diagrid highlights
  ctx.strokeStyle = 'rgba(230, 242, 255, 0.38)';
  ctx.lineWidth = 2;
  for (let x = -512; x <= 1024; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 256, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 512);
    ctx.lineTo(x + 256, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Lotte World Mall & Avenuel warm ivory stone + horizontal glass ribbon facade texture
 */
export function createLotteMallFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ebe6dc';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const rowH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    // Ribbon glass window strip
    ctx.fillStyle = '#1f364d';
    ctx.fillRect(0, y + 14, 512, rowH - 28);

    // Warm interior retail glow
    ctx.fillStyle = 'rgba(255, 224, 165, 0.25)';
    ctx.fillRect(10, y + 18, 492, rowH - 36);

    // Vertical aluminum mullions
    ctx.fillStyle = '#cfd6de';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, y + 14, 2, rowH - 28);
    }

    // Ivory stone fascia band
    ctx.fillStyle = '#d6cfc2';
    ctx.fillRect(0, y, 512, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates fairy-tale limestone block & arched castle window texture for Lotte World Magic Castle
 */
export function createMagicCastleWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm cream fairy-tale limestone
  ctx.fillStyle = '#efe5d1';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle ashlar stone joints
  ctx.strokeStyle = 'rgba(140, 120, 95, 0.32)';
  ctx.lineWidth = 2;
  const rows = 16;
  const rowH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    const offset = (r % 2) * 32;
    for (let x = offset; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowH);
      ctx.stroke();
    }
  }

  // Gothic arched castle windows
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 64 + col * 128;
      const cy = 110 + row * 240;

      ctx.fillStyle = '#1b2a47';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, Math.PI, 0);
      ctx.lineTo(cx + 18, cy + 44);
      ctx.lineTo(cx - 18, cy + 44);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#c8b48e';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates N Seoul Tower observation pod glass, steel cladding, and warm revolving restaurant window bands
 */
export function createNamsanTowerBodyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Clean silver-white architectural aluminum panel base
  ctx.fillStyle = '#e5e9ef';
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal observatory window bands
  const bands = [110, 220, 330];
  bands.forEach((y, idx) => {
    ctx.fillStyle = '#18283c';
    ctx.fillRect(0, y, 512, 68);

    // Warm interior dining & observatory glow
    ctx.fillStyle = idx === 1 ? 'rgba(255, 210, 125, 0.48)' : 'rgba(130, 200, 255, 0.35)';
    ctx.fillRect(0, y + 10, 512, 48);

    // Vertical dark steel mullions
    ctx.fillStyle = '#2d3748';
    for (let x = 0; x < 512; x += 24) {
      ctx.fillRect(x, y, 4, 68);
    }
  });

  // Metallic panel seam rings
  ctx.fillStyle = '#94a3b8';
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(0, y, 512, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Hannam-dong luxury hillside villa & terraced apartment facade texture
 */
export function createHannamVillaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm travertine & cream limestone exterior
  ctx.fillStyle = '#ded5c5';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 5;
  const cols = 4;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const y = r * rowH;

      // Recessed bronze-framed panoramic terrace window
      ctx.fillStyle = '#24303e';
      ctx.fillRect(x + 12, y + 14, colW - 24, rowH - 34);

      // Warm residential interior light
      if ((r * 5 + c * 3) % 4 !== 0) {
        ctx.fillStyle = 'rgba(255, 226, 175, 0.36)';
        ctx.fillRect(x + 16, y + 18, colW - 32, rowH - 42);
      }

      // Glass balcony balustrade
      ctx.fillStyle = 'rgba(175, 210, 230, 0.45)';
      ctx.fillRect(x + 10, y + rowH - 26, colW - 20, 14);
      ctx.strokeStyle = '#3e3a35';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + rowH - 26, colW - 20, 14);
    }

    // Travertine stone floor band
    ctx.fillStyle = '#c5baa7';
    ctx.fillRect(0, r * rowH, 512, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates warm terracotta orange Bavarian scalloped clay roof tile texture (남해 독일마을 주황 지붕)
 */
export function createGermanRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c94f26';
  ctx.fillRect(0, 0, 512, 512);

  const cols = 16;
  const rows = 16;
  const colW = 512 / cols;
  const rowH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const shade = ((r * 7 + c * 11) % 5) * 8 - 16;
      const red = Math.min(245, Math.max(170, 206 + shade));
      const green = Math.min(130, Math.max(58, 79 + Math.floor(shade * 0.6)));
      const blue = Math.min(70, Math.max(24, 38 + Math.floor(shade * 0.3)));

      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.beginPath();
      ctx.rect(x + 1, y + 1, colW - 2, rowH - 3);
      ctx.fill();

      // Tile lap shadow & sun rim highlight
      ctx.fillStyle = 'rgba(55, 18, 8, 0.42)';
      ctx.fillRect(x, y + rowH - 4, colW, 4);
      ctx.fillStyle = 'rgba(255, 195, 145, 0.25)';
      ctx.fillRect(x + 2, y + 2, colW - 4, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates German Village crisp white-cream lime plaster wall with dark Fachwerk beams, shuttered windows, and flower boxes
 */
export function createGermanWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Clean sunlit Bavarian cream-white stucco
  ctx.fillStyle = '#f6f2e9';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle plaster grain
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(180,170,150,0.08)';
    ctx.fillRect((i * 73) % 512, (i * 137) % 512, 3, 3);
  }

  // Horizontal dark timber floor beam (Fachwerk)
  ctx.fillStyle = '#472d1c';
  ctx.fillRect(0, 246, 512, 16);
  ctx.fillRect(0, 0, 14, 512);
  ctx.fillRect(498, 0, 14, 512);
  ctx.fillRect(249, 0, 14, 512);

  // 2 floors x 2 large European casement windows with green/cedar shutters & geranium flower boxes
  const positions = [
    [68, 54],
    [320, 54],
    [68, 304],
    [320, 304],
  ];
  positions.forEach(([wx, wy]) => {
    const ww = 124;
    const wh = 126;

    // Exterior forest-green shutters
    ctx.fillStyle = '#2d5a42';
    ctx.fillRect(wx - 24, wy, 20, wh);
    ctx.fillRect(wx + ww + 4, wy, 20, wh);

    // Window frame & sky-reflective glass panes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);

    const glassGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
    glassGrad.addColorStop(0, '#2a4d6e');
    glassGrad.addColorStop(0.5, '#1e354d');
    glassGrad.addColorStop(1, '#396488');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(wx, wy, ww, wh);

    // Warm sunlit interior glow
    ctx.fillStyle = 'rgba(255, 224, 165, 0.28)';
    ctx.fillRect(wx + 8, wy + 8, ww - 16, wh - 16);

    // Mullion crossbars
    ctx.fillStyle = '#f5f2eb';
    ctx.fillRect(wx + ww * 0.5 - 3, wy, 6, wh);
    ctx.fillRect(wx, wy + wh * 0.45 - 3, ww, 6);

    // Flower box with red/pink geraniums
    ctx.fillStyle = '#5c3824';
    ctx.fillRect(wx - 4, wy + wh + 4, ww + 8, 22);
    ctx.fillStyle = '#336b38';
    ctx.fillRect(wx, wy + wh - 6, ww, 12);
    for (let f = 0; f < 5; f++) {
      ctx.fillStyle = f % 2 === 0 ? '#e13b4a' : '#f47290';
      ctx.beginPath();
      ctx.arc(wx + 14 + f * 24, wy + wh - 4, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates weathered coastal masonry stone texture for Namhae terraced retaining walls (계단식 석축 옹벽)
 */
export function createGermanStoneWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#a89f91';
  ctx.fillRect(0, 0, 512, 256);

  const rows = 6;
  const cols = 8;
  const rowH = 256 / rows;
  const colW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const tone = 152 + ((r * 13 + c * 19) % 32) - 16;
      const warm = 140 + ((r * 7 + c * 11) % 24) - 12;
      const cool = 126 + ((r * 5 + c * 17) % 20) - 10;
      ctx.fillStyle = `rgb(${tone}, ${warm}, ${cool})`;
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

      ctx.fillStyle = 'rgba(255, 250, 240, 0.18)';
      ctx.fillRect(x + 3, y + 3, colW - 6, 3);
      ctx.fillStyle = 'rgba(55, 48, 40, 0.35)';
      ctx.fillRect(x + 2, y + rowH - 4, colW - 4, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates European granite cobblestone street texture for German-ro promenade (독일로 돌길)
 */
export function createGermanCobbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5c5852';
  ctx.fillRect(0, 0, 256, 512);

  const rows = 24;
  const cols = 10;
  const rowH = 512 / rows;
  const colW = 256 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const shade = 112 + ((r * 11 + c * 7) % 28) - 14;
      ctx.fillStyle = `rgb(${shade + 6}, ${shade + 2}, ${shade - 4})`;
      ctx.fillRect(x + 1.5, y + 1.5, colW - 3, rowH - 3);
    }
  }

  // Light stone curb bands on both edges
  ctx.fillStyle = '#cbc4b8';
  ctx.fillRect(0, 0, 14, 512);
  ctx.fillRect(242, 0, 14, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates lush coastal hillside grass, moss & clover meadow texture
 */
export function createCoastalLawnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3f6b3c';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle organic earth & moss patches
  for (let i = 0; i < 420; i++) {
    const x = (i * 79 + (i % 7) * 13) % 256;
    const y = (i * 113 + (i % 5) * 19) % 256;
    const r = 3 + (i % 6);
    ctx.fillStyle =
      i % 4 === 0
        ? 'rgba(104, 148, 76, 0.28)'
        : i % 4 === 1
        ? 'rgba(42, 74, 38, 0.3)'
        : i % 4 === 2
        ? 'rgba(72, 108, 56, 0.25)'
        : 'rgba(116, 102, 72, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine grass blade strokes
  for (let i = 0; i < 900; i++) {
    const x = (i * 37) % 256;
    const y = (i * 61) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(130, 178, 92, 0.24)' : 'rgba(28, 56, 28, 0.28)';
    ctx.fillRect(x, y, 1.5, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Synthesizes a seamless tileable tangent-space water wave normal map (DataTexture)
 * from layered multi-directional periodic capillary/swell waves for realistic PBR water reflections.
 */
export function createWaterNormalTexture(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  const twoPi = Math.PI * 2;

  // Periodic wave octaves (integer cycles over [0, 1] guarantee seamless tiling)
  const waves: [number, number, number][] = [
    [2, 3, 0.34],
    [-3, 2, 0.28],
    [5, -4, 0.18],
    [-6, -5, 0.14],
    [9, 7, 0.09],
    [-8, 11, 0.07],
    [13, -10, 0.05],
  ];

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      let dx = 0;
      let dy = 0;

      for (let w = 0; w < waves.length; w++) {
        const [kx, ky, amp] = waves[w];
        const phase = twoPi * (kx * u + ky * v);
        const c = Math.cos(phase) * amp;
        dx += kx * c * 0.24;
        dy += ky * c * 0.24;
      }

      // Tangent-space normal N = normalize(-dx, -dy, 1)
      const invLen = 1 / Math.hypot(dx, dy, 1);
      const nx = -dx * invLen;
      const ny = -dy * invLen;
      const nz = 1 * invLen;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates furrowed natural tree bark texture (소나무·활엽수 수피 텍스처)
 */
export function createTreeBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4e3929';
  ctx.fillRect(0, 0, 256, 512);

  // Vertical bark plates & deep fissures
  for (let i = 0; i < 240; i++) {
    const x = (i * 19) % 256;
    const y = (i * 47) % 512;
    const w = 4 + (i % 8);
    const h = 24 + (i % 48);
    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(110, 82, 58, 0.55)'
        : i % 3 === 1
        ? 'rgba(40, 26, 18, 0.65)'
        : 'rgba(135, 96, 66, 0.35)';
    ctx.fillRect(x, y, w, h);
  }

  // Subtle lichen & mossy highlights near crevices
  for (let i = 0; i < 90; i++) {
    const x = (i * 67) % 256;
    const y = (i * 89) % 512;
    ctx.fillStyle = 'rgba(84, 108, 66, 0.25)';
    ctx.fillRect(x, y, 5, 10);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates dappled leaf cluster foliage texture so tree crowns read as dense natural leaves
 */
export function createLeafCanopyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3b6837';
  ctx.fillRect(0, 0, 256, 256);

  // Deep interior shadow blotches + sunlit outer leaf clusters
  for (let i = 0; i < 550; i++) {
    const x = (i * 53 + (i % 11) * 7) % 256;
    const y = (i * 97 + (i % 13) * 5) % 256;
    const rx = 3 + (i % 5);
    const ry = 2 + (i % 4);
    const rot = (i * 0.7) % Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (i % 5 === 0) {
      ctx.fillStyle = 'rgba(20, 44, 22, 0.65)';
    } else if (i % 5 === 1 || i % 5 === 2) {
      ctx.fillStyle = 'rgba(72, 122, 62, 0.72)';
    } else if (i % 5 === 3) {
      ctx.fillStyle = 'rgba(116, 168, 86, 0.62)';
    } else {
      ctx.fillStyle = 'rgba(46, 86, 44, 0.68)';
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates delicate multi-petal sakura cherry blossom cluster texture (왕벚꽃 잎 텍스처)
 */
export function createBlossomCanopyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab3c6';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 650; i++) {
    const x = (i * 47 + (i % 9) * 11) % 256;
    const y = (i * 83 + (i % 7) * 13) % 256;
    const r = 2.5 + (i % 4);
    ctx.fillStyle =
      i % 6 === 0
        ? 'rgba(130, 74, 92, 0.35)' // twig depth
        : i % 3 === 0
        ? 'rgba(255, 240, 245, 0.85)'
        : 'rgba(247, 174, 200, 0.78)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates weathered coastal granite & mountain crag rock texture (화강암 암반·테트라포드 텍스처)
 */
export function createCoastalRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#7b7870';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 600; i++) {
    const x = (i * 59) % 256;
    const y = (i * 101) % 256;
    const s = 2 + (i % 6);
    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(220, 215, 205, 0.22)'
        : i % 3 === 1
        ? 'rgba(48, 45, 42, 0.32)'
        : 'rgba(138, 130, 118, 0.25)';
    ctx.fillRect(x, y, s, s * 0.7);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}



