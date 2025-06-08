
    
    import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
  import { OrbitControls } from 'https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/RGBELoader.js';

      // === Setup Scene, Camera, Renderer ===
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(4, 4, 4);
      scene.background = new THREE.Color(0xffffff);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
 controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// === Mouse Tracking ===
const mouse = new THREE.Vector2();
let targetX = 0;
let targetZ = 0;

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  targetX = mouse.x * 1.5;
  targetZ = mouse.y * 1.5;
});

// === Shape Group ===
const shapeGroup = new THREE.Group();
scene.add(shapeGroup);

//let reflectiveMaterial;

new RGBELoader()
  .setPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/')
  .load('royal_esplanade_1k.hdr', function (hdrTexture) {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrTexture;
    scene.background = null; // keep background white

     addShapes();
    animate();
  });
   


    const reflectiveMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00008B,
        metalness: 0.5,
        roughness: 0,
       transmission: 1.0,
        thickness: 1,
        ior: 2.3,
        iridescenceIOR: 2.3,
        iridescence: 1,
        reflectivity: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        reflectivity: 1,
        specularIntensity: 1,
        specularColor: new THREE.Color(1, 1, 1),
        attenuationDistance: 2,
        attenuationColor: new THREE.Color(0x29A0FA),
      });

// === Shape Creators ===
function createCube() {
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), reflectiveMaterial);
}

function createSpiral() {
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 50 }, (_, i) =>
      new THREE.Vector3(Math.sin(i * 0.3) * 0.5, i * 0.05, Math.cos(i * 0.3) * 0.5))
  );
  const geometry = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
  return new THREE.Mesh(geometry, reflectiveMaterial);
}

function createTriangularPrism() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1, 0);
  shape.lineTo(0.5, Math.sqrt(3) / 2);
  shape.lineTo(0, 0);

  const extrudeSettings = { depth: 1, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  return new THREE.Mesh(geometry, reflectiveMaterial);
}

function createTorus() {
  return new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 16, 100), reflectiveMaterial);
}

function createSphere() {
  return new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), reflectiveMaterial);
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
    shape.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    shapeGroup.add(shape);
  });
}

// === Animate ===
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  time += 0.01;

  // Group float and mouse-follow
  shapeGroup.rotation.y += 0.002;
  shapeGroup.position.y = Math.sin(time) * 0.3;
  shapeGroup.position.x += (targetX - shapeGroup.position.x) * 0.05;
  shapeGroup.position.z += (targetZ - shapeGroup.position.z) * 0.05;

  // Each shape rotates individually
  shapeGroup.children.forEach((shape, i) => {
    shape.rotation.x += 0.01 + i * 0.002;
    shape.rotation.y += 0.01 + i * 0.003;
  });

  // Mouse-follow effect
  shapeGroup.position.x += (targetX - shapeGroup.position.x) * 0.05;
  // shapeGroup.position.z += (targetZ - shapeGroup.position.z) * 0.05;

  renderer.render(scene, camera);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
