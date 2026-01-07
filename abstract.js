
  import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js';

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Camera ===
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(4, 4, 4);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Lights (needed even with HDR) ===
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// === Mouse Tracking ===
const mouse = new THREE.Vector2();
let targetX = 0;
let targetZ = 0;

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  targetX = mouse.x * 1.5;
  targetZ = mouse.y * 1.5;
});

// === Group ===
const shapeGroup = new THREE.Group();
scene.add(shapeGroup);

// === HDR ENVIRONMENT (CRITICAL FIX) ===
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

new RGBELoader()
 .load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/metro_noord_4k.hdr',
    (hdrTexture) => {
      const envMap = pmrem.fromEquirectangular(hdrTexture).texture;

      scene.environment = envMap;

      hdrTexture.dispose();
      pmrem.dispose();
   
  });

// === Material ===
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x0033aa,
  metalness: 0,
  roughness: 0,

  transmission: 1,
  thickness: 1,
  ior: 1.5,

  clearcoat: 1,
  clearcoatRoughness: 0,

  iridescence: 1,
  iridescenceIOR: 1.3,

  attenuationDistance: 2,
  attenuationColor: new THREE.Color(0x29a0fa),

  specularIntensity: 1,
});

// === Shapes ===
function createCube() {
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), glassMaterial);
}

function createSpiral() {
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 50 }, (_, i) =>
      new THREE.Vector3(
        Math.sin(i * 0.3) * 0.5,
        i * 0.05,
        Math.cos(i * 0.3) * 0.5
      )
    )
  );
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.1, 8),
    glassMaterial
  );
}

function createTriangularPrism() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1, 0);
  shape.lineTo(0.5, Math.sqrt(3) / 2);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1,
    bevelEnabled: false,
  });
  geo.center();
  return new THREE.Mesh(geo, glassMaterial);
}

function createTorus() {
  return new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    glassMaterial
  );
}

function createSphere() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    glassMaterial
  );
}

function addShapes() {
  const shapes = [
    createCube(),
    createSpiral(),
    createTriangularPrism(),
    createTorus(),
    createSphere(),
  ];

  const radius = 2;
  shapes.forEach((shape, i) => {
    const angle = (i / shapes.length) * Math.PI * 2;
    shape.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
    shapeGroup.add(shape);
  });
}

// === Animate ===
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  time += 0.01;

  shapeGroup.rotation.y += 0.002;
  shapeGroup.position.y = Math.sin(time) * 0.3;

  shapeGroup.position.x += (targetX - shapeGroup.position.x) * 0.05;
  shapeGroup.position.z += (targetZ - shapeGroup.position.z) * 0.05;

  shapeGroup.children.forEach((shape, i) => {
    shape.rotation.x += 0.01 + i * 0.002;
    shape.rotation.y += 0.01 + i * 0.003;
  });

  renderer.render(scene, camera);
}
 addShapes();
animate();

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});});
