import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

/* ══════════ DOM ══════════ */
const landing = document.getElementById('landing');
const experience = document.getElementById('experience');
const startBtn = document.getElementById('startBtn');
const canvas = document.getElementById('webgl');
const audio = document.getElementById('bgMusic');
const lyricsEl = document.getElementById('lyrics');
const messagePopup = document.getElementById('messagePopup');

/* ══════════ LYRICS DATA ══════════ */
// (Giữ nguyên phần lyrics của bạn, tôi rút gọn ở đây để code chạy mượt)
const LYRICS = [
  { time: 0, text: '🎵 Baby girl', chorus: false },
  { time: 3, text: 'I just wanna be a part of your world', chorus: false },
  { time: 6.5, text: 'Let everything around us swirl', chorus: false },
  { time: 10, text: 'Đột nhiên khung cảnh chuyển khác', chorus: false },
  { time: 13, text: 'Em bảo anh cần phải thôi chờ em...', chorus: false },
  { time: 60, text: '💖 Không yêu em thì yêu ai?', chorus: true },
  { time: 66, text: 'Anh bất chấp hết đến ngày mai', chorus: true },
  // Lưu ý: Bạn hãy copy toàn bộ mảng LYRICS từ code cũ của tôi vào đây nhé
];

const MESSAGES = [
  '💖 Dyn ơi, em là cả vũ trụ của anh ✨',
  '💕 Mỗi ngôi sao trên trời đều không sáng bằng nụ cười của em 🌟',
  '❤️‍🔥 Cả đời này, anh chỉ yêu mình em 💖',
  '🌌 Trong hàng tỷ vì sao, anh vẫn chọn em ✨',
];

/* ══════════ THREE.JS SETUP ══════════ */
let scene, camera, renderer, composer, clock;
let galaxy, heartParticles, textGroup;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let started = false;
let lyricsStartTime = 0;
let currentLyricIndex = -1;

function initThree() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.02);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 18); // Lùi ra xa để thấy tổng thể

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);

  // POST PROCESSING (BLOOM - Tạo hiệu ứng phát sáng Neon)
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.8,   // Cường độ sáng
    0.8,   // Bán kính tỏa sáng
    0.1    // Ngưỡng sáng
  );
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  clock = new THREE.Clock();

  createGalaxy();
  createHeart();
  create3DText();

  window.addEventListener('resize', onResize);
  window.addEventListener('pointerdown', onPointerDown);

  animate();
}

/* ══════════ TEXTURE HẠT SÁNG ══════════ */
function getParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,150,200,1)');
  gradient.addColorStop(0.5, 'rgba(255,0,100,0.6)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

/* ══════════ 1. DẢI NGÂN HÀ XOÁY ỐC (GALAXY) ══════════ */
function createGalaxy() {
  const params = {
    count: 50000,
    size: 0.05,
    radius: 20,
    branches: 4, // Số nhánh xoáy
    spin: 1.5,
    randomness: 0.5,
    randomnessPower: 3,
    insideColor: '#ff88cc',
    outsideColor: '#ff0044',
  };

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);

  const colorInside = new THREE.Color(params.insideColor);
  const colorOutside = new THREE.Color(params.outsideColor);

  for (let i = 0; i < params.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * params.radius;
    const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;
    const spinAngle = radius * params.spin;

    const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / params.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: params.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    map: getParticleTexture(),
  });

  galaxy = new THREE.Points(geometry, material);
  galaxy.position.y = -5; // Đặt ngân hà ở phía dưới
  scene.add(galaxy);

  // Lỗ đen ở giữa
  const blackHoleGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const blackHoleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
  blackHole.position.set(0, -5, 0);
  scene.add(blackHole);

  // Viền sáng quanh lỗ đen
  const ringGeo = new THREE.TorusGeometry(1.6, 0.05, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3388 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(0, -5, 0);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
}

/* ══════════ 2. TRÁI TIM TỪ HẠT SÁNG ══════════ */
function createHeart() {
  const count = 15000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const color1 = new THREE.Color('#ff0044');
  const color2 = new THREE.Color('#ffffff');

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Công thức toán học tạo hình trái tim 3D
    let t = Math.random() * Math.PI * 2;
    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    // Thu nhỏ lại
    x *= 0.25;
    y *= 0.25;

    // Tạo độ dày (Z) và làm hạt bung ra ngẫu nhiên
    let z = (Math.random() - 0.5) * 2 * (1 - Math.abs(y)); 
    
    // Thêm độ nhiễu để trái tim trông như được tạo từ các mảnh vụn
    const noise = 0.15;
    positions[i3] = x + (Math.random() - 0.5) * noise;
    positions[i3 + 1] = y + 2.5 + (Math.random() - 0.5) * noise; // Nâng lên trên
    positions[i3 + 2] = z + (Math.random() - 0.5) * noise;

    // Màu sắc: Lõi trắng, viền đỏ
    const mixedColor = color2.clone().lerp(color1, Math.random());
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    map: getParticleTexture(),
  });

  heartParticles = new THREE.Points(geometry, material);
  scene.add(heartParticles);
}

/* ══════════ 3. CHỮ 3D TRÔI NỔI ══════════ */
function create3DText() {
  const loader = new FontLoader();
  // Sử dụng font có sẵn trên CDN
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    textGroup = new THREE.Group();
    const phrases = ['DYN', 'I LOVE YOU', 'HAPPY BIRTHDAY', 'FOREVER', 'MY UNIVERSE'];

    phrases.forEach((text, index) => {
      const geometry = new TextGeometry(text, {
        font: font,
        size: 0.5,
        height: 0.05,
      });
      
      geometry.center(); // Căn giữa chữ

      const material = new THREE.MeshBasicMaterial({ 
        color: index % 2 === 0 ? 0xff3388 : 0xffffff,
        transparent: true,
        opacity: 0.7
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Xếp chữ xung quanh
      const angle = (index / phrases.length) * Math.PI * 2;
      const radius = 8;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 4,
        Math.sin(angle) * radius
      );
      
      mesh.lookAt(0, mesh.position.y, 0); // Hướng mặt về trái tim
      mesh.rotateY(Math.PI); // Úp mặt chữ ra ngoài
      
      mesh.userData = { baseY: mesh.position.y, speed: Math.random() * 0.5 + 0.5 };
      textGroup.add(mesh);
    });

    scene.add(textGroup);
  });
}

/* ══════════ ANIMATION LOOP ══════════ */
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // 1. Ngân hà xoay chậm
  if (galaxy) {
    galaxy.rotation.y = t * 0.1;
  }

  // 2. Trái tim đập nhịp
  if (heartParticles) {
    heartParticles.rotation.y = t * 0.2;
    // Nhịp đập kép (lub-dub)
    const beat = Math.sin(t * 6) * 0.05;
    const scale = 1.0 + (beat > 0 ? beat : 0);
    heartParticles.scale.set(scale, scale, scale);
  }

  // 3. Chữ 3D bay lên xuống
  if (textGroup) {
    textGroup.children.forEach(child => {
      child.position.y = child.userData.baseY + Math.sin(t * child.userData.speed) * 1.5;
      child.rotation.y += 0.002; // Tự xoay
    });
  }

  composer.render();
}

/* ══════════ TƯƠNG TÁC (CLICK) ══════════ */
function onPointerDown(event) {
  if (!started) return;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  // Nếu chạm vào bất kỳ đâu trong vùng trái tim hoặc lỗ đen
  const intersects = raycaster.intersectObjects([heartParticles, galaxy]);
  
  if (intersects.length > 0) {
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    showMessage(msg);
  }
}

function showMessage(msg) {
  messagePopup.textContent = msg;
  messagePopup.classList.add('show');
  clearTimeout(window.msgTimer);
  window.msgTimer = setTimeout(() => {
    messagePopup.classList.remove('show');
  }, 3000);
}

/* ══════════ LYRICS SYNC ══════════ */
function startLyricsSync() {
  lyricsStartTime = performance.now();
  const tick = () => {
    if (!started) return;
    let now = (audio && audio.readyState >= 2 && !audio.paused) 
      ? audio.currentTime 
      : (performance.now() - lyricsStartTime) / 1000;

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

/* ══════════ START ══════════ */
initThree();

startBtn.addEventListener('click', () => {
  landing.classList.add('fade-out');
  setTimeout(() => {
    started = true;
    experience.classList.add('active');
    
    // Play nhạc
    audio.volume = 0.7;
    audio.play().catch(() => console.log('Chưa có file nhạc hoặc bị chặn autoplay.'));
    
    startLyricsSync();
  }, 800);
});

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
