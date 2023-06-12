<template>
  <div>
    <div ref="wordContainer"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { onMounted } from "vue";

let wordContainer = ref(null);
// 创建场景
const scene = new THREE.Scene();
// 创建相机
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
camera.position.set(0, 0, 800);
// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

onMounted(() => {
  wordContainer.value.appendChild(renderer.domElement);
  // 添加环境纹理
  const texture = new THREE.TextureLoader().load("textures/word/room.jpg");
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.backgroundBlurriness = 0.5;
  scene.environment = texture;

  // 添加控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  // 加载字体
  const loader = new FontLoader();
  loader.load("FangSong_Regular.json", (font) => {
    const geometry = new TextGeometry("华南理工大学", {
      font: font,
      size: 80,
      height: 15,
      curveSegments: 12, // 曲线分段数，使得文字的曲线更加光滑
      bevelEnabled: true, // 启用斜角
      bevelThickness: 10, // 斜角厚度
      bevelSize: 2, // 斜角大小
      bevelOffset: 0, // 斜角偏移量
      bevelSegments: 5, // 斜角分段数
    });
    geometry.center();
    // 设置字体材质
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xeeeeff,
      roughness: 0,
      reflectivity: 1,
      thickness: 80,
      ior: 1.5, // 折射率
      transmission: 1, // 透明度
      side: THREE.DoubleSide,
    });
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  });
  // 监听窗口变化
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
