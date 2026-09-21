import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// Detección de dispositivo móvil
const isMobile = window.innerWidth <= 600;

// -----------------------
// ESCENA Y CÁMARA
// -----------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a051b); 

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
// En móvil alejamos ligeramente la cámara para abarcar el alto
camera.position.set(0, 0, isMobile ? 310 : 290);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = false; 
document.body.appendChild(renderer.domElement);

// Post-procesamiento
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7, 
    0.3, 
    0.15 
);
composer.addPass(bloomPass);

// Luz suave
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

/* -----------------------
   GALAXIA DE FONDO
----------------------- */
const starsGeometry = new THREE.BufferGeometry();
const starsArray = [];
const starsColors = [];

for (let i = 0; i < 9000; i++) {
    starsArray.push(
        (Math.random() - 0.5) * 4000,
        (Math.random() - 0.5) * 4000,
        (Math.random() - 0.5) * 4000
    );

    const c = new THREE.Color();
    const rand = Math.random();
    if (rand > 0.6) c.setHex(0xa78bfa); 
    else if (rand > 0.3) c.setHex(0x60a5fa); 
    else c.setHex(0xfde047); 

    starsColors.push(c.r, c.g, c.b);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsArray, 3));
starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

const starsMaterial = new THREE.PointsMaterial({ 
    size: 0.9, 
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

/* -----------------------
   PLANETA Y ANILLO 3D
----------------------- */
const planetGroup = new THREE.Group();
planetGroup.position.y = isMobile ? -5 : -10;

// Ajuste de tamaño del planeta en móvil
const planetRadius = isMobile ? 22 : 32;
const planet = new THREE.Mesh(
    new THREE.SphereGeometry(planetRadius, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
planetGroup.add(planet);

planetGroup.visible = false;
scene.add(planetGroup);

/* -----------------------
   DISCO DE PARTÍCULAS
----------------------- */
const diskParticlesCount = 10000;
const diskGeometry = new THREE.BufferGeometry();
const diskPositions = [];
const diskColors = [];

const minRad = isMobile ? 26 : 38;
const maxRadDelta = isMobile ? 28 : 42;

for (let i = 0; i < diskParticlesCount; i++) {
    const rad = minRad + Math.random() * maxRadDelta;
    const angle = Math.random() * Math.PI * 2;

    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = (Math.random() - 0.5) * 1.5;

    diskPositions.push(x, y, z);

    const c = new THREE.Color();
    c.setHex(Math.random() > 0.25 ? 0xffb300 : 0xffecb3);
    diskColors.push(c.r, c.g, c.b);
}

diskGeometry.setAttribute('position', new THREE.Float32BufferAttribute(diskPositions, 3));
diskGeometry.setAttribute('color', new THREE.Float32BufferAttribute(diskColors, 3));

const diskMaterial = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
});

const accretionDisk = new THREE.Points(diskGeometry, diskMaterial);
accretionDisk.rotation.x = 0.45;
planetGroup.add(accretionDisk);

/* -----------------------
   CORAZÓN CON POLVO ESTELAR
----------------------- */
const heartPoints = [];
const heartColors = [];
const totalParticles = 4000;

for (let i = 0; i < totalParticles; i++) {
    let t = Math.random() * Math.PI * 2;
    let r = Math.sqrt(Math.random());

    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    const scale = isMobile ? 0.75 : 1.0;
    const px = x * r * scale;
    const py = ((y + 17) * r * scale) + (isMobile ? 24 : 32);
    const pz = (Math.random() - 0.5) * 10 * (1 - r);

    heartPoints.push(px, py, pz);

    const colorChance = Math.random();
    let c = new THREE.Color();
    if (colorChance > 0.5) {
        c.setHex(0xff0055);
    } else if (colorChance > 0.2) {
        c.setHex(0xff66b2);
    } else {
        c.setHex(0xffffff);
    }

    heartColors.push(c.r, c.g, c.b);
}

const heartGeometry = new THREE.BufferGeometry();
heartGeometry.setAttribute('position', new THREE.Float32BufferAttribute(heartPoints, 3));
heartGeometry.setAttribute('color', new THREE.Float32BufferAttribute(heartColors, 3));

const heartMaterial = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
});

const heart = new THREE.Points(heartGeometry, heartMaterial);
heart.visible = false;
planetGroup.add(heart);

/* -----------------------
   RAMOS Y FOTOS
----------------------- */
const textureLoader = new THREE.TextureLoader();

const imagePaths = [
    './assets/Ramo1.png',
    './assets/uno.jpeg',
    './assets/Ramo2.png',
    './assets/dos.jpeg',
    './assets/Ramo3.png',
    './assets/tres.jpeg',
    './assets/Ramo4.png',
    './assets/cuatro.jpeg',
    './assets/Ramo5.png',
    './assets/Ramo6.png',
    './assets/principal.jpeg',
    './assets/Ramo7.png',
    './assets/Ramo8.png',
    './assets/seis.jpeg',
    './assets/Ramo9.png'
];

const overlayGroup = new THREE.Group();
scene.add(overlayGroup);

const bouquets = [];
const spriteScale = isMobile ? 16 : 24;

imagePaths.forEach((path) => {
    const texture = textureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace; 

    const mat = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        blending: THREE.NormalBlending
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(spriteScale, spriteScale, 1);
    sprite.visible = false;

    overlayGroup.add(sprite);
    bouquets.push(sprite);
});

/* -----------------------
   ESTRELLAS CON VERSOS DE AMOR
----------------------- */
const verses = [
    "Briyhith S. H., eres la luz que alegra cada uno de mis días.",
    "Bajo estas estrellas, mi lugar favorito siempre será a tu lado.",
    "Gracias por existir y por llenar mi vida de tanto amor, Briyhith.",
    "Que tu camino siempre esté ilumindo de girasoles y sonrisas.",
    "William M. N. te ama hoy, mañana y siempre.",
    "Cada flor de este universo es un abrazo sincero para ti.",
    "Tu sonrisa ilumina mi mundo entero, mi niña hermosa.",
    "Contigo hasta el universo más lejano se siente como nuestro hogar.",
    "Que nunca te falten motivos para sonreír, mi princesa.",
    "Las flores amarillas florecen con la misma gracia con la que tú caminas.",
    "Eres mi presente favorito y mi sueño hecho realidad.",
    "Briyhith & William: Una historia escrita en las estrellas."
];

function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.quadraticCurveTo(32, 32, 64, 32);
    ctx.quadraticCurveTo(32, 32, 32, 64);
    ctx.quadraticCurveTo(32, 32, 0, 32);
    ctx.quadraticCurveTo(32, 32, 32, 0);
    ctx.closePath();
    ctx.fill();

    const starTex = new THREE.CanvasTexture(canvas);
    starTex.colorSpace = THREE.SRGBColorSpace;
    return starTex;
}

const starTexture = createStarTexture();
const interactiveStars = [];

for (let i = 0; i < 12; i++) {
    const mat = new THREE.SpriteMaterial({ map: starTexture, transparent: true, opacity: 0.95 });
    const sprite = new THREE.Sprite(mat);
    const starScale = isMobile ? 8 : 11;
    sprite.scale.set(starScale, starScale, 1);
    
    sprite.userData = { 
        verse: verses[i % verses.length],
        speedY: Math.random() * 0.12 + 0.08
    };

    const isLeft = i % 2 === 0;
    const xOffset = isMobile ? (isLeft ? (-55 - Math.random() * 25) : (55 + Math.random() * 25)) : (isLeft ? (-110 - Math.random() * 40) : (110 + Math.random() * 40));
    
    sprite.position.x = xOffset;
    sprite.position.y = -120 + Math.random() * 240;
    sprite.position.z = (Math.random() - 0.5) * 60;

    sprite.visible = false;
    scene.add(sprite);
    interactiveStars.push(sprite);
}

// Raycaster e Interacción
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function handleStarInteraction(clientX, clientY) {
    const modal = document.getElementById('letterModal');
    if (modal && modal.style.display === 'flex') return;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveStars);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        const content = document.getElementById('letterContent');

        if (modal && content) {
            content.innerText = `"${clickedStar.userData.verse}"`;
            modal.style.display = 'flex';
        }
    }
}

window.addEventListener('click', (e) => handleStarInteraction(e.clientX, e.clientY));
window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) handleStarInteraction(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

// Cerrar Modal
const closeModalBtn = document.getElementById('closeModal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modal = document.getElementById('letterModal');
        if (modal) modal.style.display = 'none';
    });
}

const modalOverlay = document.getElementById('letterModal');
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });
}

/* -----------------------
   FRASES FLOTANTES DE LA PAREJA (SIN REPETIR)
----------------------- */
const phrasesList = [
    'William ❤️ Briyhith',
    'Eres mi lugar favorito',
    'Briyhith S. H. ✨',
    'Gracias por existir, mi amor',
    'Siempre habrá un girasol para ti',
    'Este universo fue creado para ti',
    'Tu sonrisa ilumina mis días',
    'William M. N. te ama',
    'Mi amor por ti es infinito ♾️',
    'Juntos en nuestro propio universo 🌌',
    'Mi niña hermosa 🌻',
    'Tu felicidad es la mía 💖',
    'Cada día a tu lado es un regalo 🎁',
    'Amor de mi vida ❤️',
    'Eres mi sueño hecho realidad ✨',
    'Para siempre juntos, Briyhith & William 💑'
];

const container = document.getElementById('phraseContainer');

if (container) {
    // Se recorre exactamente el tamaño de la lista para que aparezca UNA SOLA vez cada frase
    phrasesList.forEach((text) => {
        const div = document.createElement('div');
        div.className = 'phrase';
        div.innerText = text;
        
        div.style.position = 'absolute';
        div.style.color = '#fef08a';
        div.style.textShadow = '0 0 10px rgba(253, 224, 71, 0.6)';
        div.style.fontSize = isMobile ? (Math.random() * 0.2 + 0.75) + 'rem' : (Math.random() * 0.35 + 0.85) + 'rem';
        div.style.pointerEvents = 'none';
        div.style.opacity = '0.85';
        div.style.whiteSpace = 'nowrap'; // Evita que frases largas se partan en varias líneas

        container.appendChild(div);
        animateFloatingPhrase(div);
    });
}

function animateFloatingPhrase(el) {
    const startX = Math.random() * (window.innerWidth - 120);
    const startY = Math.random() * (window.innerHeight - 40);

    gsap.set(el, { x: startX, y: startY });

    gsap.to(el, {
        x: `+=${(Math.random() - 0.5) * (isMobile ? 60 : 120)}`,
        y: `+=${(Math.random() - 0.5) * (isMobile ? 60 : 120)}`,
        duration: Math.random() * 6 + 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
}

/* -----------------------
   BOTÓN DE ENTRADA
----------------------- */
const startBtn = document.getElementById('startBtn');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        gsap.to('#intro', {
            opacity: 0,
            duration: 1.5,
            onComplete: () => {
                const introEl = document.getElementById('intro');
                if (introEl) introEl.style.display = 'none';
            }
        });

        gsap.to('#floatingTitle', { opacity: 1, duration: 3 });

        gsap.to(camera.position, {
            z: isMobile ? 220 : 170,
            duration: 4,
            ease: 'power2.inOut'
        });

        planetGroup.visible = true;
        heart.visible = true;
        bouquets.forEach(b => { b.visible = true; });
        interactiveStars.forEach(s => { s.visible = true; });
    });
}

/* -----------------------
   ANIMACIÓN CONTINUA
----------------------- */
function animate() {
    requestAnimationFrame(animate);

    stars.rotation.y += 0.00015;
    accretionDisk.rotation.z += 0.0018;

    // Latido del corazón
    const time = Date.now() * 0.003;
    const pulse = 1 + Math.sin(time) * 0.03;
    heart.scale.set(pulse, pulse, pulse);

    // Órbita constante de los ramos (Radio adaptado a pantallas móviles)
    const bouquetCount = bouquets.length;
    const orbitRadius = isMobile ? 62 : 115; // En celular reduce para que quepan en pantalla vertical

    bouquets.forEach((b, index) => {
        const angle = Date.now() * 0.00025 + (index * (Math.PI * 2 / bouquetCount));

        b.position.x = planetGroup.position.x + Math.cos(angle) * orbitRadius;
        b.position.z = Math.sin(angle) * orbitRadius;
        b.position.y = planetGroup.position.y + Math.sin(angle * 2) * (isMobile ? 5 : 8);
    });

    // Ascenso suave de estrellas
    interactiveStars.forEach((s, index) => {
        s.position.y += s.userData.speedY;
        s.position.x += Math.sin(time + index) * 0.05;

        if (s.position.y > 130) {
            s.position.y = -130;
        }
    });

    // Render en dos fases independientes
    renderer.clear();
    
    // 1. Dibujar galaxia, planeta y resplandor
    overlayGroup.visible = false;
    composer.render();

    // 2. Dibujar imágenes vívidas por encima
    overlayGroup.visible = true;
    renderer.clearDepth();
    renderer.render(scene, camera);
}

animate();

/* -----------------------
   RESIZE ADAPTATIVO
----------------------- */
window.addEventListener('resize', () => {
    const mobileNow = window.innerWidth <= 600;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});