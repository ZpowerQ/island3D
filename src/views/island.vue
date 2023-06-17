<template>
  <div ref="islandRef"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
// 导入控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入水面
import { Water } from "three/examples/jsm/objects/Water2.js";
// 导入glt载入库
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 导入hdr加载库
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
let animateId = null;
let islandRef = ref(null);
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
camera.position.set(-10, 50, 130);

// 更新摄像头宽高比例
camera.aspect = window.innerWidth / window.innerHeight;
// 更新摄像头投影矩阵
camera.updateProjectionMatrix();
// 将摄像头添加到场景
scene.add(camera);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 设置抗锯齿
  antialias: true,
  // 对数深度缓冲区
  logarithmicDepthBuffer: true,
});

// 设置渲染器宽高
renderer.setSize(window.innerWidth, window.innerHeight);

// 监听屏幕的大小，修改渲染器的宽高和相机的比例
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

onMounted(() => {
  islandRef.value.appendChild(renderer.domElement);
});
onBeforeUnmount(() => {
  // 清除动画
  cancelAnimationFrame(animateId);
  renderer.dispose();
  animateId = null;
  // video.pause();
  // video = null;
  // water = null;
});
// 初始化控制器
const controls = new OrbitControls(camera, renderer.domElement);

function render() {
  // 渲染场景
  renderer.render(scene, camera);
  // 引擎自动更新渲染器
  animateId = requestAnimationFrame(render);
}

// render();

// 创建一个巨大的天空球体
let texture = new THREE.TextureLoader().load("textures/sky/sky.jpg");
const skyGeometry = new THREE.SphereGeometry(500, 60, 60);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: texture,
});
skyGeometry.scale(1, 1, -1);
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// 视频纹理
// let video = document.createElement("video");
// video.src = "textures/sky/sky.mp4";
// video.loop = true;
// video.muted = true;
// video.oncanplay = () => {
//   render();
//   video.play();
//   let texture = new THREE.VideoTexture(video);
//   skyMaterial.map = texture;
//   skyMaterial.map.needsUpdate = true;
// };
render();
// 载入环境纹理hdr(让小岛不为黑色)
const hdrloader = new RGBELoader();
hdrloader.loadAsync("textures/sky/050.hdr").then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-100, 100, 10);

// 创建水面
const waterGeometry = new THREE.CircleGeometry(300, 64);
let water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 1,
});
water.position.y = 3;
// 水面旋转
water.rotation.x = -Math.PI / 2;
scene.add(water);

// 添加小岛模型
// 实例化gltf载入库
const loader = new GLTFLoader();
// 实例化draco解码库
const dracoLoader = new DRACOLoader();
// 设置draco解码库路径
dracoLoader.setDecoderPath("./draco/");
// 设置gltf载入库的draco解码库
loader.setDRACOLoader(dracoLoader);
loader.load("models/island2.glb", (gltf) => {
  scene.add(gltf.scene);
});
</script>

<style scoped>
body {
  background-color: #1d1a1f;
}
</style>
