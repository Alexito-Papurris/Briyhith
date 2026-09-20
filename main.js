import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

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
camera.position.set(0, 0, 290);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace; // Garantiza que los colores generales sean fieles
renderer.autoClear = false; 
document.body.appendChild(renderer.domElement);

// Post-procesamiento (Glow / Bloom para el universo)
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

for (let i = 0; i < 10000; i++) {
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
   PLANETA NEGRO
----------------------- */
const planetGroup = new THREE.Group();
planetGroup.position.y = -10;

const planet = new THREE.Mesh(
    new THREE.SphereGeometry(32, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
planetGroup.add(planet);

planetGroup.visible = false;
scene.add(planetGroup);

/* -----------------------
   DISCO DE PARTÍCULAS
----------------------- */
const diskParticlesCount = 12000;
const diskGeometry = new THREE.BufferGeometry();
const diskPositions = [];
const diskColors = [];

for (let i = 0; i < diskParticlesCount; i++) {
    const rad = 38 + Math.random() * 42;
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
const totalParticles = 4500;

for (let i = 0; i < totalParticles; i++) {
    let t = Math.random() * Math.PI * 2;
    let r = Math.sqrt(Math.random());

    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    const scale = 1.0;
    const px = x * r * scale;
    const py = ((y + 17) * r * scale) + 32;
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
   RAMOS Y FOTOS (COLOR CORREGIDO Y VÍVIDO)
----------------------- */
const textureLoader = new THREE.TextureLoader();

const imagePaths = [
    './assets/Ramo1.png',
    './assets/Ramo2.png',
    './assets/Ramo3.png',
    './assets/Ramo4.png',
    './assets/Ramo5.png',
    './assets/Ramo6.png',
    './assets/Ramo7.png',
    './assets/Ramo8.png',
    './assets/Ramo9.png'
];

const overlayGroup = new THREE.Group();
scene.add(overlayGroup);

const bouquets = [];

imagePaths.forEach((path) => {
    const texture = textureLoader.load(path);
    // AQUÍ ESTÁ LA CLAVE PARA QUITAR EL EFECTO BLANQUEADO/OPACO:
    texture.colorSpace = THREE.SRGBColorSpace; 

    const mat = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        blending: THREE.NormalBlending
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(24, 24, 1);
    sprite.visible = false;

    overlayGroup.add(sprite);
    bouquets.push(sprite);
});

/* -----------------------
   ESTRELLAS LATERALES CON VERSOS
----------------------- */
const verses = [
    "Cultivo una rosa blanca para el amigo sincero que me da su mano franca.",
    "Bajo las estrellas amarillas, tu sonrisa siempre será mi lugar favorito.",
    "Eres la luz que hace florecer hasta los rincones más oscuros.",
    "Que tu camino siempre esté iluminado de girasoles y sueños cumplidos.",
    "Un detalle no mide la distancia, sino el cariño con el que se entrega.",
    "Cada flor que abre su capullo lleva un susurro de alegría para ti.",
    "Tu alegría llena de color incluso el universo más lejano.",
    "Un abrazo sincero guardado en el vuelo suave de una estrella.",
    "Que nunca te falten motivos para sonreír bajo este cielo.",
    "Las flores amarillas iluminan el presente tanto como tus recuerdos.",
    "Florece con calma, el tiempo siempre premia a las almas bonitas.",
    "Gracias por hacer este mundo un lugar un poco más brillante."
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

for (let i = 0; i < 14; i++) {
    const mat = new THREE.SpriteMaterial({ map: starTexture, transparent: true, opacity: 0.95 });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(11, 11, 1);
    
    sprite.userData = { 
        verse: verses[i % verses.length],
        speedY: Math.random() * 0.12 + 0.08
    };

    const isLeft = i % 2 === 0;
    sprite.position.x = isLeft ? (-110 - Math.random() * 40) : (110 + Math.random() * 40);
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
   ESTRELLAS FUGACES
----------------------- */
function createShootingStar() {
    const geometry = new THREE.BufferGeometry();
    const positions = [0, 0, 0, -25, 15, -10];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });

    const starLine = new THREE.Line(geometry, material);

    starLine.position.set(
        (Math.random() - 0.2) * 200 + 50,
        Math.random() * 80 + 40,
        (Math.random() - 0.5) * 100
    );

    scene.add(starLine);

    gsap.to(starLine.position, {
        x: starLine.position.x - 220,
        y: starLine.position.y - 130,
        duration: 1.2,
        ease: 'power1.in',
        onComplete: () => {
            scene.remove(starLine);
            geometry.dispose();
            material.dispose();
        }
    });
}

setInterval(() => {
    if (planetGroup.visible) createShootingStar();
}, 4000);

/* -----------------------
   FRASES FLOTANTES
----------------------- */
const phrasesList = [
    'Gracias por existir',
    'Que todos tus sueños florezcan',
    'Tu sonrisa ilumina mis días',
    'Siempre habrá un girasol para ti',
    'Feliz Día de las Flores Amarillas',
    'Este universo fue creado para ti',
    'Que nunca te falten motivos para sonreír'
];

const container = document.getElementById('phraseContainer');

if (container) {
    for (let i = 0; i < 16; i++) {
        const div = document.createElement('div');
        div.className = 'phrase';
        div.innerText = phrasesList[i % phrasesList.length];
        
        div.style.position = 'absolute';
        div.style.color = '#fef08a';
        div.style.textShadow = '0 0 10px rgba(253, 224, 71, 0.5)';
        div.style.fontSize = (Math.random() * 0.4 + 0.8) + 'rem';
        div.style.pointerEvents = 'none';
        div.style.opacity = '0.7';

        container.appendChild(div);
        animateFloatingPhrase(div);
    }
}

function animateFloatingPhrase(el) {
    const startX = Math.random() * (window.innerWidth - 150);
    const startY = Math.random() * (window.innerHeight - 50);

    gsap.set(el, { x: startX, y: startY });

    gsap.to(el, {
        x: `+=${(Math.random() - 0.5) * 120}`,
        y: `+=${(Math.random() - 0.5) * 120}`,
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
            z: 170,
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

    // Movimiento interno del corazón
    const positions = heartGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.02;
        positions[i + 1] += Math.cos(time + i) * 0.02;
    }
    heartGeometry.attributes.position.needsUpdate = true;

    // Órbita constante de las imágenes
    const bouquetCount = bouquets.length;
    bouquets.forEach((b, index) => {
        const angle = Date.now() * 0.00025 + (index * (Math.PI * 2 / bouquetCount));
        const radius = 115;

        b.position.x = planetGroup.position.x + Math.cos(angle) * radius;
        b.position.z = Math.sin(angle) * radius;
        b.position.y = planetGroup.position.y + Math.sin(angle * 2) * 8;
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
    
    // 1. Dibujar galaxia, planeta y resplandor (Bloom)
    overlayGroup.visible = false;
    composer.render();

    // 2. Dibujar imágenes con su color e intensidad real encima
    overlayGroup.visible = true;
    renderer.clearDepth();
    renderer.render(scene, camera);
}

animate();

/* -----------------------
   RESIZE
----------------------- */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});