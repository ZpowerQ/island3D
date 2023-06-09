<template>
  <div class="car">
    <div class="canvasContainer" ref="canvasRef"></div>
    <!-- 控制汽车材质颜色 -->
    <div class="car-content">
      <div class="car-content-title">
        <h1>汽车展示与选配</h1>
      </div>
      <h2>选择车身颜色</h2>
      <div class="select">
        <div
          class="select-item"
          v-for="(item, index) in colors"
          :key="index"
          @click="changeColor(item)"
        >
          <div class="select-item-color" :style="{ background: item }"></div>
        </div>
      </div>
      <h2>选择贴膜材质</h2>
      <div class="select">
        <div
          class="select-item"
          v-for="(item, index) in materials"
          :key="index"
          @click="selectMaterial(item)"
        >
          <div class="select-item-text">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
let controls = null;
let colors = ["red", "blue", "green", "gray", "orange", "purple"];
let materials = [
  { name: "磨砂", value: 1 },
  { name: "冰晶", value: 0 },
];
let selectMaterial = (item) => {
  bodyMaterial.clearcoatRoughness = item.value;
  frontMaterial.clearcoatRoughness = item.value;
  hoodMaterial.clearcoatRoughness = item.value;
};
const canvasRef = ref(null);
// 创建场景
const scene = new THREE.Scene();
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 设置相机位置
camera.position.set(0, 2, 6);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  // 设置抗锯齿
  antialias: true,
});
// 设置渲染器大小
renderer.setSize(window.innerWidth, window.innerHeight);

const render = () => {
  renderer.render(scene, camera);
  controls && controls.update();
  requestAnimationFrame(render);
};

let wheels = [];
let carBody,
  frontCar,
  hoodCar,
  glassCar = null;
// 创建材质
const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ff0000",
  metalness: 1,
  roughness: 0.5,
  // 设置清漆
  clearcoat: 1,
  // 设置清漆光滑度
  clearcoatRoughness: 0,
});
const frontMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ff0000",
  metalness: 1,
  roughness: 0.5,
  // 设置清漆
  clearcoat: 1,
  // 设置清漆光滑度
  clearcoatRoughness: 0,
});
const hoodMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ff0000",
  metalness: 1,
  roughness: 0.5,
  // 设置清漆
  clearcoat: 1,
  // 设置清漆光滑度
  clearcoatRoughness: 0,
});
const wheelsMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ff0000",
  metalness: 1,
  roughness: 0.1,
});
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ffffff",
  metalness: 0,
  roughness: 0,
  transmission: 1,
  transparent: true,
});
let changeColor = (color) => {
  carBody.material.color = new THREE.Color(color);
  frontCar.material.color = new THREE.Color(color);
  hoodCar.material.color = new THREE.Color(color);
  wheels.forEach((item) => {
    item.material.color = new THREE.Color(color);
  });
};
onMounted(() => {
  // 将渲染器添加到dom中
  canvasRef.value.appendChild(renderer.domElement);
  // 初始化渲染器
  renderer.setClearColor("#000");
  scene.background = new THREE.Color("#ccc");
  scene.environment = new THREE.Color("#ccc");
  render();
  // 监听窗口变化
  window.addEventListener("resize", () => {
    // 更新渲染器大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 更新摄像头宽高比例
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新摄像头投影矩阵
    camera.updateProjectionMatrix();
  });
  // 添加网格地面
  const gridHelper = new THREE.GridHelper(10, 10);
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement);
  // 设置控制器阻尼
  controls.enableDamping = true;
  controls.update();

  // 添加gltf汽车模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/gltf/");
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("models/bmw01.glb", (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        console.log(child.name);
      }
      // 判断是否是轮毂
      if (child.isMesh && child.name.includes("轮毂")) {
        child.material = wheelsMaterial;
        wheels.push(child);
      }
      // 判断是否是车身
      if (child.isMesh && child.name.includes("Mesh002")) {
        carBody = child;
        carBody.material = bodyMaterial;
      }
      // 判断是否是前脸
      if (child.isMesh && child.name.includes("前脸")) {
        frontCar = child;
        frontCar.material = frontMaterial;
      }
      // 判断是否是引擎盖
      if (child.isMesh && child.name.includes("引擎盖_1")) {
        hoodCar = child;
        hoodCar.material = hoodMaterial;
      }
      // 判断是否是挡风玻璃
      if (child.isMesh && child.name.includes("挡风玻璃")) {
        glassCar = child;
        glassCar.material = glassMaterial;
      }
    });
    scene.add(model);
  });

  // 添加灯光
  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(0, 0, 10);
  scene.add(light1);
  const light2 = new THREE.DirectionalLight(0xffffff, 1);
  light2.position.set(0, 0, -10);
  scene.add(light2);
  const light3 = new THREE.DirectionalLight(0xffffff, 1);
  light3.position.set(10, 0, 0);
  scene.add(light3);
  const light4 = new THREE.DirectionalLight(0xffffff, 1);
  light4.position.set(-10, 0, 0);
  scene.add(light4);
  const light5 = new THREE.DirectionalLight(0xffffff, 1);
  light5.position.set(0, 10, 0);
  scene.add(light5);
  const light6 = new THREE.DirectionalLight(0xffffff, 0.3);
  light6.position.set(5, 10, 0);
  scene.add(light6);
  const light7 = new THREE.DirectionalLight(0xffffff, 0.3);
  light7.position.set(0, 10, 5);
  scene.add(light7);
  const light8 = new THREE.DirectionalLight(0xffffff, 0.3);
  light8.position.set(0, 10, -5);
  scene.add(light8);
  const light9 = new THREE.DirectionalLight(0xffffff, 0.3);
  light9.position.set(-5, -10, 0);
  scene.add(light9);
});
</script>

<style scoped>
.car-content {
  position: fixed;
  top: 0;
  right: 20px;
}
.select {
  display: flex;
  flex-wrap: wrap;
  width: 150px;
  justify-content: center;
  margin: 0 25px;
}
.select-item-color {
  width: 50px;
  height: 50px;
  margin: 10px;
  display: inline-block;
  cursor: pointer;
  border-radius: 14px;
  border: 1px solid #ccc;
}
.select-item-text {
  font-size: 20px;
  margin: 10px;
}
h1,
h2 {
  text-align: center;
}
</style>
