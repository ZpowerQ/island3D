<template>
  <div class="canvas_container" ref="screenDom"></div>
</template>

<script setup>
import * as THREE from "three";
import { ref, onMounted, onUnmounted } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
let screenDom = ref(null);
onMounted(() => {
  // 创建场景
  let scene = new THREE.Scene();
  // 创建相机
  let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 6);
  // 创建渲染器
  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  screenDom.value.appendChild(renderer.domElement);

  // 创建辅助坐标轴
  let axes = new THREE.AxesHelper(5);
  scene.add(axes);

  // 添加控制器
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.update();

  // 创建rgbe加载器
  let hdrloader = new RGBELoader();
  hdrloader.load("textures/robot/sky12.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

  // 添加机器人
  let dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");
  dracoLoader.setDecoderConfig({ type: "js" });
  let gltfloader = new GLTFLoader();
  gltfloader.setDRACOLoader(dracoLoader);
  gltfloader.load("models/robot.glb", (gltf) => {
    let model = gltf.scene;
    scene.add(model);
  });

  // 添加直线光
  let light1 = new THREE.DirectionalLight(0xffffff, 0.3);
  light1.position.set(0, 10, 10);
  let light2 = new THREE.DirectionalLight(0xffffff, 0.3);
  light2.position.set(0, 10, -10);
  let light3 = new THREE.DirectionalLight(0xffffff, 0.3);
  light3.position.set(10, 10, 10);
  scene.add(light1, light2, light3);

  // 添加光阵
  let video = document.createElement("video");
  video.src = "textures/robot/zp2.mp4";
  video.loop = true;
  video.muted = true;
  video.play();
  let videoTexture = new THREE.VideoTexture(video);
  const videoGeoPlane = new THREE.PlaneGeometry(8, 4.5);
  const videoMatPlane = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true,
    side: THREE.DoubleSide,
    alphaMap: videoTexture,
  });
  const videoPlane = new THREE.Mesh(videoGeoPlane, videoMatPlane);
  videoPlane.position.set(0, 0.2, 0);
  videoPlane.rotation.set(-Math.PI / 2, 0, 0);
  scene.add(videoPlane);

  // 添加镜面反射
  let reflectorGeo = new THREE.PlaneGeometry(100, 100);
  let reflectPlane = new Reflector(reflectorGeo, {
    textureWidth: window.innerWidth,
    textureHeight: window.innerHeight,
    color: 0x332222,
  });
  reflectPlane.rotation.x = -Math.PI / 2;
  scene.add(reflectPlane);

  // 监听窗口变化
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function render() {
    renderer.render(scene, camera);
    controls && controls.update();
    requestAnimationFrame(render);
  }
  render();
});
</script>

<style scoped>
.canvas_container {
  width: 100vw;
  height: 100vh;
}
</style>
