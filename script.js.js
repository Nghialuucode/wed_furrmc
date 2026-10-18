import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ═══════════════════════════════════════════
   DOM
═══════════════════════════════════════════ */
const landing      = document.getElementById('landing');
const experience   = document.getElementById('experience');
const startBtn     = document.getElementById('startBtn');
const canvas       = document.getElementById('webgl');
const audio        = document.getElementById('bgMusic');
const lyricsEl     = document.getElementById('lyrics');
const floatingText = document.getElementById('floatingText');
const messagePopup = document.getElementById('messagePopup');

/* ═══════════════════════════════════════════
   DEVICE / PERFORMANCE
═══════════════════════════════════════════ */
const IS_MOBILE     = window.innerWidth < 768;
const FRAG_COUNT    = IS_MOBILE ? 1200 : 2500;
const STAR_COUNT    = IS_MOBILE ? 2000 : 5000;

/* ═══════════════════════════════════════════
   LYRICS — Bạn có thể chỉnh lại "time" (giây) cho khớp nhạc của bạn
═══════════════════════════════════════════ */
const LYRICS = [
  { time: 0,    text: '🎵 Baby girl',                                                          chorus: false },
  { time: 3,    text: 'I just wanna be a part of your world',                                   chorus: false },
  { time: 6.5,  text: 'Let everything around us swirl',                                         chorus: false },
  { time: 10,   text: 'Đột nhiên khung cảnh chuyển khác',                                       chorus: false },
  { time: 13,   text: 'Em bảo anh cần phải thôi chờ em vì không còn cách nào khác ngoài việc là hai ta phải dừng', chorus: false },
  { time: 19,   text: 'Anh bảo đừng, em bảo quá muộn',                                          chorus: false },
  { time: 22.5, text: 'Anh bảo, "Em điên à, em biết mà, anh không thể buông"',                   chorus: false },
  { time: 27,   text: 'Sao mà anh buông được',                                                  chorus: false },
  { time: 29.5, text: 'Từ khi ngày em đến thì chứng rối loạn lo âu nó đã không còn quẩn quanh', chorus: false },
  { time: 35,   text: 'Anh đã vứt hết đống Xanax và cuộc hẹn với bác sĩ chỉ vì em mới là trị liệu của anh', chorus: false },
  { time: 41,   text: 'Đừng đi, mình sẽ chống lại thế giới, mình sẽ sống cuộc sống mới',        chorus: false },
  { time: 46,   text: 'Nếu em muốn, mình sẽ tới một thành phố yên bình hơn',                     chorus: false },
  { time: 51,   text: 'Xong hai ta hôn thật lâu, nước mắt em lăn trên má',                      chorus: false },
  { time: 56,   text: 'Giật mình tỉnh khỏi cơn mơ, anh nhận ra (bởi vì)',                       chorus: false },
  { time: 60,   text: '💖 Không yêu em thì yêu ai? (Không yêu em thì yêu ai?)',                 chorus: true  },
  { time: 63,   text: 'Anh bất chấp hết đến ngày mai (bất chấp hết đến ngày mai)',              chorus: true  },
  { time: 66,   text: 'Không yêu em thì yêu ai? (Không yêu em thì yêu ai?)',                    chorus: true  },
  { time: 69,   text: 'Và với nước mắt lạnh đôi vai (hoh-oh-oh-oh-oh-oh)',                      chorus: true  },
  { time: 72.5, text: 'Không yêu em thì yêu ai? (Ai? Ai? Ai? Ai?)',                             chorus: true  },
  { time: 76,   text: 'Anh bất chấp hết đến ngày mai (bất chấp hết đến ngày mai, yeah)',        chorus: true  },
  { time: 79,   text: 'Không yêu em thì yêu ai? (Không yêu em thì yêu ai?)',                    chorus: true  },
  { time: 82,   text: 'Với nước mắt lạnh đôi vai',                                              chorus: true  },
  { time: 85,   text: 'Yeah, anh biết là chuyện có thể sai (đúng)',                             chorus: false },
  { time: 89,   text: 'Nhưng anh vẫn sẽ đứng ở đây chờ đợi em kể cả khi mà em đang có bạn trai', chorus: false },
  { time: 95,   text: 'Không em thì ai? (Không ai!)',                                           chorus: true  },
  { time: 98,   text: 'Không yêu em thì yêu ai? (Không ai! Không yêu em thì yêu ai?)',          chorus: true  },
  { time: 101,  text: 'Không yêu em thì yêu ai? (Không ai! Không yêu em thì yêu ai?)',          chorus: true  },
  { time: 104,  text: 'Let me hear you say, one, two, three, let\'s go',                         chorus: false },
  { time: 108,  text: 'Không yêu em thì yêu ai? (Yeah, không yêu em thì yêu ai?)',               chorus: true  },
  { time: 111,  text: 'Anh bất chấp hết đến ngày mai (yeah, bất chấp hết đến ngày mai)',        chorus: true  },
  { time: 114,  text: 'Không yêu em thì yêu ai? (Ai? Ai? Ai? Ai? Yeah)',                        chorus: true  },
  { time: 117,  text: 'Và với nước mắt lạnh đôi vai (hoh-oh-oh-oh-oh-oh)',                      chorus: true  },
  { time: 120,  text: 'Không yêu em thì yêu ai? (Không biết yêu em thì anh biết yêu ai?)',      chorus: true  },
  { time: 123,  text: 'Anh bất chấp hết đến ngày mai (yeah, bất chấp hết đến ngày mai, let\'s go)', chorus: true },
  { time: 126,  text: 'Không yêu em thì yêu ai? (Ai? Không yêu em thì yêu ai?)',                chorus: true  },
  { time: 129,  text: 'Với nước mắt lạnh đôi vai (không yêu em thì yêu ai? Không yêu em thì yêu ai?)', chorus: true },
  { time: 133,  text: '(Không một ai)',                                                         chorus: false },
];

/* ═══════════════════════════════════════════
   MESSAGES — khi chạm vào tim nhỏ
═══════════════════════════════════════════ */
const MESSAGES = [
  '💖 Dyn ơi, em là cả vũ trụ của anh ✨',
  '💕 Mỗi ngôi sao trên trời đều không sáng bằng nụ cười của em 🌟',
  '💗 Anh không cần gì khác, chỉ cần em ở đây thôi 💫',
  '❤️‍🔥 Cả đời này, anh chỉ yêu mình em 💖',
  '💝 Không yêu em thì yêu ai? — Chỉ có em thôi 💕',
  '🌌 Trong hàng tỷ vì sao, anh vẫn chọn em ✨',
  '💞 Dyn — định mệnh của đời anh ♡',
];

/* ═══════════════════════════════════════════
   THREE.JS STATE
═══════════════════════════════════════════ */
let scene, camera, renderer, composer, clock;
let heartGroup, stars, sparkleGroup, shardMesh;
let clickables = [];
const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();

let started = false;
let lyricsStartTime = 0;
let currentLyricIndex = -1;

const floatingObjs = [];

/* ═══════════════════════════════════════════
   INIT THREE
═══════════════════════════════════════════ */
function initThree() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000008, 0.015);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 6.5);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !IS_MOBILE,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000005, 1);

  // Bloom
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.4,   // strength
    0.7,   // radius
    0.6    // threshold
  );
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Lights (for sparkle ambience)
  const l1 = new THREE.PointLight(0xff0044, 2, 30);
  l1.position.set(4, 3, 4);
  scene.add(l1);
  const l2 = new THREE.PointLight(0x8800ff, 1.5, 30);
  l2.position.set(-4, -3, 4);
  scene.add(l2);

  createStars();
  createHeart();
  createSparkles();
  createClickableHearts();

  clock = new THREE.Clock();

  window.addEventListener('resize', onResize);
  window.addEventListener('pointerdown', onCanvasPointerDown);

  animate();
}

/* ═══════════════════════════════════════════
   STARS
═══════════════════════════════════════════ */
function createStars() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors    = new Float32Array(STAR_COUNT * 3);
  const color = new THREE.Color();

  for (let i = 0; i < STAR_COUNT; i++) {
    // Distribute on shell
    const r = 80 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Color palette: white → pink → blue
    const hue = Math.random() < 0.35 ? 0.92 : (Math.random() < 0.5 ? 0.6 : 0);
    const sat = hue === 0 ? 0 : 0.4 + Math.random() * 0.4;
    const lum = 0.7 + Math.random() * 0.3;
    color.setHSL(hue, sat, lum);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  stars = new THREE.Points(geo, mat);
  scene.add(stars);
}

/* ═══════════════════════════════════════════
   HEART — built from red fragments
═══════════════════════════════════════════ */
function insideHeart(x, y) {
  // Implicit heart: (x²+y²-1)³ - x²y³ < 0
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y < 0;
}

function createHeart() {
  heartGroup = new THREE.Group();

  const shardGeo = new THREE.TetrahedronGeometry(0.045);
  const shardMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });

  const mesh = new THREE.InstancedMesh(shardGeo, shardMat, FRAG_COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  let placed = 0;
  let tries  = 0;
  const MAX_TRIES = FRAG_COUNT * 30;

  while (placed < FRAG_COUNT && tries < MAX_TRIES) {
    tries++;
    const x = (Math.random() - 0.5) * 2.3;
    const y = (Math.random() - 0.5) * 2.3 + 0.05;

    if (!insideHeart(x, y)) continue;

    const dist = Math.sqrt(x * x + y * y);
    const thickness = 0.4 * Math.max(0.12, 1 - dist * 0.65);
    const z = (Math.random() - 0.5) * thickness;

    dummy.position.set(x, y, z);
    dummy.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    const s = 0.5 + Math.random() * 1.1;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    mesh.setMatrixAt(placed, dummy.matrix);

    // Red palette
    const hue   = 0.97 + Math.random() * 0.05;
    const sat   = 0.9 + Math.random() * 0.1;
    const light = 0.35 + Math.random() * 0.45;
    color.setHSL(hue, sat, light);
    mesh.setColorAt(placed, color);

    placed++;
  }

  mesh.count = placed;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  shardMesh = mesh;
  heartGroup.add(mesh);
  heartGroup.scale.setScalar(2.0);
  scene.add(heartGroup);
}

/* ═══════════════════════════════════════════
   SPARKLES
═══════════════════════════════════════════ */
function createSparkles() {
  const N = IS_MOBILE ? 120 : 250;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2.2 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffaacc,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  sparkleGroup = new THREE.Points(geo, mat);
  scene.add(sparkleGroup);
}

/* ═══════════════════════════════════════════
   CLICKABLE HEARTS (3D Sprites)
═══════════════════════════════════════════ */
function createHeartSpriteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ff3388';
  ctx.shadowColor = '#ff3388';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(64, 112);
  ctx.bezierCurveTo(8, 70, 18, 18, 50, 24);
  ctx.bezierCurveTo(60, 26, 64, 42, 64, 42);
  ctx.bezierCurveTo(64, 42, 68, 26, 78, 24);
  ctx.bezierCurveTo(110, 18, 120, 70, 64, 112);
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function createClickableHearts() {
  const tex = createHeartSpriteTexture();
  const basePositions = [
    { x: 3.2,  y: 1.8,  z: 0.5 },
    { x: -3.2, y: 1.8,  z: 0.5 },
    { x: 3.6,  y: -1.2, z: 0.3 },
    { x: -3.6, y: -1.2, z: 0.3 },
    { x: 0,    y: 2.8,  z: 0 },
    { x: 0,    y: -2.8, z: 0 },
  ];

  basePositions.forEach((p, i) => {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: 0xff99cc,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(p.x, p.y, p.z);
    sprite.scale.setScalar(0.45);
    sprite.userData.basePos  = { ...p };
    sprite.userData.message  = MESSAGES[i % MESSAGES.length];
    sprite.userData.phase    = i * 1.37;
    scene.add(sprite);
    clickables.push(sprite);
  });
}

/* ═══════════════════════════════════════════
   FLOATING ENGLISH TEXT
═══════════════════════════════════════════ */
const PHRASES = [
  { text: '❤ I LOVE YOU ❤',       size: 1.5 },
  { text: '✦ MY UNIVERSE ✦',      size: 1.2 },
  { text: '∞ FOREVER ∞',          size: 1.25 },
  { text: '✧ D Y N A S T Y ✧',   size: 1.35 },
  { text: '★ YOU ARE MY STAR ★',  size: 1.05 },
  { text: '♡ ALWAYS ♡',           size: 1.2 },
  { text: '☾ TO THE MOON ☽',      size: 1.1 },
  { text: '💫 SOULMATE 💫',        size: 1.25 },
  { text: '✨ MY EVERYTHING ✨',   size: 1.15 },
  { text: '★ STARS ALIGNED ★',    size: 1.05 },
  { text: '♡ ONE & ONLY ♡',       size: 1.15 },
  { text: '✧ ✦ DYNA ✦ ✧',        size: 1.4 },
];

function createFloatingTexts() {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const scale  = minDim / 800;

  PHRASES.forEach((phrase, i) => {
    const el = document.createElement('div');
    el.className = 'floating-phrase';
    el.textContent = phrase.text;
    el.style.fontSize = `${phrase.size}rem`;
    floatingText.appendChild(el);

    const angle  = (i / PHRASES.length) * Math.PI * 2;
    const radius = (200 + Math.random() * 180) * scale;

    floatingObjs.push({
      el,
      angle,
      radius,
      speed:     0.08 + Math.random() * 0.18,
      bobSpeed:  0.4 + Math.random() * 0.6,
      bobPhase:  Math.random() * Math.PI * 2,
      bobAmp:    15 + Math.random() * 20,
      opacityBase: 0.55 + Math.random() * 0.3,
    });
  });
}

/* ═══════════════════════════════════════════
   ANIMATION LOOP
═══════════════════════════════════════════ */
function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  updateStars(t);
  updateHeart(t);
  updateSparkles(t);
  updateClickables(t);
  updateFloatingTexts(t);

  composer.render();
}

function updateStars(t) {
  if (!stars) return;
  stars.rotation.y = t * 0.008;
  stars.rotation.x = t * 0.003;
}

function updateHeart(t) {
  if (!heartGroup) return;

  // Slow rotation
  heartGroup.rotation.y = t * 0.22;
  heartGroup.rotation.x = Math.sin(t * 0.35) * 0.08;

  // Double-thump heartbeat
  const beatPeriod = 1.2;
  const phase = (t % beatPeriod) / beatPeriod;
  let pulse = 0;
  if (phase < 0.10) {
    pulse = Math.sin((phase / 0.10) * Math.PI);
  } else if (phase > 0.17 && phase < 0.27) {
    pulse = Math.sin(((phase - 0.17) / 0.10) * Math.PI) * 0.55;
  }

  const base  = 2.0;
  const scale = base * (1 + pulse * 0.16);
  heartGroup.scale.set(scale, scale, scale);
}

function updateSparkles(t) {
  if (!sparkleGroup) return;
  sparkleGroup.rotation.y = -t * 0.15;
  sparkleGroup.rotation.z = Math.sin(t * 0.3) * 0.1;
}

function updateClickables(t) {
  clickables.forEach((s) => {
    const b = s.userData.basePos;
    const p = s.userData.phase;
    s.position.x = b.x + Math.sin(t * 0.5 + p) * 0.28;
    s.position.y = b.y + Math.cos(t * 0.7 + p) * 0.28;
    s.position.z = b.z + Math.sin(t * 0.4 + p) * 0.3;
    s.scale.setScalar(0.45 + Math.sin(t * 2.2 + p) * 0.07);
  });
}

function updateFloatingTexts(t) {
  if (!floatingObjs.length) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const k = minDim / 800;

  floatingObjs.forEach((o) => {
    const angle = o.angle + t * o.speed;
    const x = cx + Math.cos(angle) * o.radius * (window.innerWidth / minDim) * 0.9;
    const y = cy + Math.sin(angle) * o.radius * 0.65 + Math.sin(t * o.bobSpeed + o.bobPhase) * o.bobAmp;
    o.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    const op = o.opacityBase + Math.sin(t * 1.3 + o.bobPhase) * 0.25;
    o.el.style.opacity = Math.max(0.15, Math.min(1, op));
  });
}

/* ═══════════════════════════════════════════
   CLICK / TAP ON 3D SPRITES
═══════════════════════════════════════════ */
function onCanvasPointerDown(e) {
  if (!started) return;
  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(clickables, false);
  if (hits.length > 0) {
    showMessage(hits[0].object.userData.message);
  }
}

/* ═══════════════════════════════════════════
   MESSAGE POPUP
═══════════════════════════════════════════ */
let msgTimer;
function showMessage(msg) {
  messagePopup.textContent = msg;
  messagePopup.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => {
    messagePopup.classList.remove('show');
  }, 4200);
}

/* ═══════════════════════════════════════════
   LYRICS SYNC
═══════════════════════════════════════════ */
function startLyricsSync() {
  lyricsStartTime = performance.now();

  const tick = () => {
    if (!started) return;

    let now;
    if (audio && audio.readyState >= 2 && !audio.paused) {
      now = audio.currentTime;
    } else {
      now = (performance.now() - lyricsStartTime) / 1000;
    }

    let idx = -1;
    for (let i = 0; i < LYRICS.length; i++) {
      if (now >= LYRICS[i].time) idx = i;
      else break;
    }

    if (idx !== currentLyricIndex && idx >= 0) {
      currentLyricIndex = idx;
      const line = LYRICS[idx];
      lyricsEl.textContent = line.text;
      lyricsEl.classList.toggle('chorus', !!line.chorus);
      lyricsEl.classList.add('show');
    }

    requestAnimationFrame(tick);
  };
  tick();
}

/* ═══════════════════════════════════════════
   START EXPERIENCE
═══════════════════════════════════════════ */
function startExperience() {
  started = true;
  lyricsStartTime = performance.now();

  experience.classList.add('active');

  // Play audio (user gesture already handled)
  audio.volume = 0.65;
  const playPromise = audio.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(() => {
      console.warn('Audio autoplay blocked or file missing — lyrics will use timer.');
    });
  }

  // Build floating texts
  createFloatingTexts();

  // Start lyrics
  startLyricsSync();

  // Resync lyrics time on audio events
  audio.addEventListener('play',  () => { lyricsStartTime = performance.now() - audio.currentTime * 1000; });
  audio.addEventListener('seeked',() => { lyricsStartTime = performance.now() - audio.currentTime * 1000; });
}

/* ═══════════════════════════════════════════
   RESIZE
═══════════════════════════════════════════ */
function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
initThree();

startBtn.addEventListener('click', () => {
  landing.classList.add('fade-out');
  setTimeout(() => {
    startExperience();
  }, 600);
});