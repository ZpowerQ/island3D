<template>
  <div class="canvasContainer" ref="canvasContainer"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const canvasContainer = ref(null);
onMounted(() => {
  // 初始化场景
  const scene = new THREE.Scene();
  // 初始化相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // 设置相机位置
  camera.position.set(1.5, 1, 1.5);
  // 更新摄像头宽高比例
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像头投影矩阵
  camera.updateProjectionMatrix();

  // 加载背景纹理
  const loader = new THREE.TextureLoader();
  const bgTexture = loader.load("textures/bear/050.jpg");
  // 折射设置
  bgTexture.mapping = THREE.EquirectangularRefractionMapping;

  scene.background = bgTexture;
  scene.environment = bgTexture;

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  // 加载小熊模型
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("models/bear.gltf", (gltf) => {
    const model = gltf.scene.children[0];
    // 设置水晶材质
    model.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      envMap: bgTexture,
      refractionRatio: 0.7,
      reflectivity: 0.99,
      // opacity:0.5,
    });
    model.scale.set(1.5, 1.5, 1.5);
    scene.add(model);
  });

  // 初始化渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // 设置渲染器大小
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 监听窗口变化
  window.addEventListener("resize", () => {
    // 更新渲染器大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 更新摄像头宽高比例
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新摄像头投影矩阵
    camera.updateProjectionMatrix();
  });
  // 将渲染器添加到页面中
  canvasContainer.value.appendChild(renderer.domElement);
  // 添加控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  // 设置控制器阻尼
  controls.enableDamping = true;
  // 渲染函数
  const render = () => {
    // 更新控制器
    controls.update();
    // 渲染场景
    renderer.render(scene, camera);
    // 递归渲染
    requestAnimationFrame(render);
  };

  render();
});
</script>

<style scoped></style>
