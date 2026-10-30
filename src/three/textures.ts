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
