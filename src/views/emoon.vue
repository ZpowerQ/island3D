<template>
  <div ref="emoonRef" class="emoon"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeMount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
let animateId: any = null;
let renderer: THREE.WebGLRenderer | null = null;
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
let scene = new THREE.Scene();

let labelRenderer: CSS2DRenderer | null = null;
let moon, earth: THREE.Object3D<THREE.Event>;
let emoonRef = ref(null);
let clock = new THREE.Clock();
//实例化纹理加载器
let textureLoader = new THREE.TextureLoader();
onMounted(() => {
  //初始化渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // 渲染阴影
  renderer.shadowMap.enabled = true;
  (emoonRef.value! as HTMLElement).appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  (emoonRef.value! as HTMLElement).appendChild(labelRenderer.domElement);
  // 地球和月球的半径大小
  const EARTH_RADIUS = 2.5;
  const MOON_RADIUS = 0.27;
  camera.position.set(10, 5, 20);
  // 创建聚光灯光源
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 10);
  spotLight.intensity = 2; //光照强度
  spotLight.castShadow = true; //开启阴影
  scene.add(spotLight);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.intensity = 0.3; //光照强度
  scene.add(ambientLight);

  // 添加月球
  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
  const moonMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("textures/emoon/moon_1024.jpg"),
  });
  let moon = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moon);

  // 添加地球
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
  const earthMaterial = new THREE.MeshPhongMaterial({
    shininess: 5, //高光亮度
    map: textureLoader.load("textures/emoon/earth_atmos_2048.jpg"),
    specularMap: textureLoader.load("textures/emoon/earth_specular_2048.jpg"), //高光贴图
    normalMap: textureLoader.load("textures/emoon/earth_normal_2048.jpg"), //法线贴图
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.receiveShadow = true; //接收阴影
  earth.castShadow = true; //开启阴影
  scene.add(earth);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function render() {
    const elapsed = clock.getElapsedTime();
    moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);

    // 地球自转
    let axis = new THREE.Vector3(0, 1, 0);
    // earth.rotateOnAxis(axis, ((elapsed * Math.PI) / 1000) % 360);
    earth.rotateOnAxis(axis, 0.01);
    renderer!.render(scene, camera);
    labelRenderer!.render(scene, camera);
    animateId = requestAnimationFrame(render);
  }
  render();

  // 添加标签
  const earthDiv = document.createElement("div");
  earthDiv.className = "label";
  earthDiv.textContent = "Earth";
  const earthLabel = new CSS2DObject(earthDiv);
  earthLabel.position.set(0, EARTH_RADIUS + 0.5, 0);
  earth.add(earthLabel);

  // 添加标签
  const moonDiv = document.createElement("div");
  moonDiv.className = "label";
  moonDiv.textContent = "moon";
  const moonLabel = new CSS2DObject(moonDiv);
  moonLabel.position.set(0, MOON_RADIUS + 0.5, 0);
  moon.add(moonLabel);
  // 监听窗口变化
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer!.setSize(width, height);
    earthLabel.position.set(0, EARTH_RADIUS + 0.5, 0);
    moonLabel.position.set(0, MOON_RADIUS + 0.5, 0);
    renderer!.setPixelRatio(window.devicePixelRatio);
  });
});
onBeforeMount(() => {
  cancelAnimationFrame(animateId);
  renderer?.dispose();
  animateId = null;
});
</script>

<style scoped>
.emoon {
  background-image: url("../../public/textures/emoon/star.jpg");
  background-size: cover;
}
.label {
  color: #fff;
  font-size: 16px;
  z-index: -1;
}
</style>
