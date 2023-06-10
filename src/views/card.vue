<template>
  <div class="card">
    <div v-for="(item, i) in scenes" class="text_item" v-show="i == index">
      <h1>{{ item.text }}</h1>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Water } from "three/examples/jsm/objects/Water2.js";
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
camera.position.set(-3.23, 3, 4.06);
// 更新摄像头投影矩阵
camera.updateProjectionMatrix();

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置色调映射
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true; //允许阴影
renderer.physicallyCorrectLights = true; //允许物理正确

// 初始化控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(-8, 2, 0);
controls.update();

// 初始化gltfLoader
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");
gltfLoader.setDRACOLoader(dracoLoader);

// 加载环境纹理
let rgbeloader = new RGBELoader();
rgbeloader.load("textures/card/sky.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 加载房子模型
gltfLoader.load("models/cardScene.glb", (gltf) => {
  const model = gltf.scene;
  model.traverse((child) => {
    if (child.name == "Plane") {
      child.visible = false;
    }
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
});

// 设置水面效果
const waterGeometry = new THREE.CircleGeometry(300, 32);
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 100,
});
water.rotation.x = -Math.PI / 2;
water.position.y = -0.4;
scene.add(water);

// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 0);
scene.add(light);

// 添加点光源
const pointLight = new THREE.PointLight(0xffffff, 50);
pointLight.position.set(0.1, 2.4, 0);
pointLight.castShadow = true; //投射阴影
scene.add(pointLight);

// 创建点光源组
const pointLightGroup = new THREE.Group();
pointLightGroup.position.set(-8, 2.5, -1.5);
let radius = 3;
let pointLightArr = [];
for (let i = 0; i < 3; i++) {
  // 创建球体当灯泡
  let sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  let material = new THREE.MeshStandardMaterial({
    color: 0xffffff, //颜色
    emissive: 0xffffff, //发光颜色
    emissiveIntensity: 1, //发光强度
  });
  let sphere = new THREE.Mesh(sphereGeometry, material);
  sphere.position.set(
    radius * Math.cos((i * 2 * Math.PI) / 3),
    Math.cos((i * 2 * Math.PI) / 3),
    radius * Math.sin((i * 2 * Math.PI) / 3)
  );
  pointLightArr.push(sphere);
  let pointLight = new THREE.PointLight(0xffffff, 50);
  sphere.add(pointLight);
  pointLightGroup.add(sphere);
}
scene.add(pointLightGroup);

// 使用补间动画,让灯光组旋转
let options = { angle: 0 };
gsap.to(options, {
  duration: 10,
  angle: Math.PI * 2,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    pointLightGroup.rotation.y = options.angle;
    pointLightArr.forEach((item, index) => {
      item.position.set(
        radius * Math.cos((index * 2 * Math.PI) / 3),
        Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
        radius * Math.sin((index * 2 * Math.PI) / 3)
      );
    });
  },
});

function render() {
  renderer.render(scene, camera);
  controls && controls.update();
  requestAnimationFrame(render);
}

// 使用补间动画移动相机
let timeline1 = gsap.timeline();
let timeline2 = gsap.timeline();
// 定义相机移动函数
function moveCamera(position, target) {
  timeline1.to(camera.position, {
    duration: 1,
    x: position.x,
    y: position.y,
    z: position.z,
    ease: "power2.inOut",
  });
  timeline2.to(controls.target, {
    duration: 1,
    x: target.x,
    y: target.y,
    z: target.z,
    ease: "power2.inOut",
  });
}

let scenes = [
  {
    text: "圣诞快乐",
    callback: () => {
      // 执行函数切换位置
      moveCamera(
        new THREE.Vector3(-3.23, 3, 4.06),
        new THREE.Vector3(-8, 2, 0)
      );
    },
  },
  {
    text: "感谢在这么大的世界里，我们相遇了",
    callback: () => {
      // 执行函数切换位置
      moveCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
    },
  },
  {
    text: "愿与你探寻世界的每一个角落",
    callback: () => {
      // 执行函数切换位置
      moveCamera(new THREE.Vector3(10, 3, 0), new THREE.Vector3(5, 2, 0));
    },
  },
  {
    text: "愿将天上的星星送给你",
    callback: () => {
      // 执行函数切换位置
      moveCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
      makeHeart();
    },
  },
  {
    text: "祝大家健康快乐",
    callback: () => {
      // 执行函数切换位置
      moveCamera(new THREE.Vector3(-20, 1.3, 6.6), new THREE.Vector3(5, 2, 0));
    },
  },
];
let index = ref(0);
let isAnimate = false;
// 监听鼠标滚轮事件
window.addEventListener("wheel", (e) => {
  if (isAnimate) return;
  isAnimate = true;
  if (e.deltaY > 0) {
    index.value++;
    if (index.value > scenes.length - 1) {
      index.value = 0;
      removeHeart();
    }
  }
  scenes[index.value].callback();
  setTimeout(() => {
    isAnimate = false;
  }, 1000);
});

onMounted(() => {
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
});

// 实例化创建漫天星星
let starsInstance = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 10,
  }),
  100
);
// 星星随机分布到天上
let starsArr = [];
let endArr = [];
for (let i = 0; i < 100; i++) {
  let x = Math.random() * 100 - 50;
  let y = Math.random() * 100 - 50;
  let z = Math.random() * 100 - 50;
  starsArr.push(new THREE.Vector3(x, y, z));

  let matrix = new THREE.Matrix4(); //创建一个4x4矩阵
  matrix.setPosition(x, y, z); //设置矩阵的位置
  starsInstance.setMatrixAt(i, matrix); //设置每个实例的矩阵
}
scene.add(starsInstance);

//创建爱心路径
let heartShape = new THREE.Shape();
heartShape.moveTo(25, 25);
heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

// 根据爱心路径获取点
let center = new THREE.Vector3(0, 2, 10);
for (let i = 0; i < 100; i++) {
  let point = heartShape.getPoint(i / 100);
  endArr.push(
    new THREE.Vector3(
      point.x * 0.1 + center.x,
      point.y * 0.1 + center.y,
      center.z
    )
  );
}

// 创建爱心
function makeHeart() {
  let params = { time: 0 };
  gsap.to(params, {
    time: 1,
    duration: 1,
    onUpdate: () => {
      for (let i = 0; i < 100; i++) {
        let x = starsArr[i].x + (endArr[i].x - starsArr[i].x) * params.time;
        let y = starsArr[i].y + (endArr[i].y - starsArr[i].y) * params.time;
        let z = starsArr[i].z + (endArr[i].z - starsArr[i].z) * params.time;
        let matrix = new THREE.Matrix4(); //创建一个4x4矩阵
        matrix.setPosition(x, y, z); //设置矩阵的位置
        starsInstance.setMatrixAt(i, matrix); //设置每个实例的矩阵
      }
      starsInstance.instanceMatrix.needsUpdate = true;
    },
  });
}
// 移除爱心
function removeHeart() {
  let params = { time: 0 };
  gsap.to(params, {
    time: 1,
    duration: 1,
    onUpdate: () => {
      for (let i = 0; i < 100; i++) {
        let x = endArr[i].x + (starsArr[i].x - endArr[i].x) * params.time;
        let y = endArr[i].y + (starsArr[i].y - endArr[i].y) * params.time;
        let z = endArr[i].z + (starsArr[i].z - endArr[i].z) * params.time;
        let matrix = new THREE.Matrix4(); //创建一个4x4矩阵
        matrix.setPosition(x, y, z); //设置矩阵的位置
        starsInstance.setMatrixAt(i, matrix); //设置每个实例的矩阵
      }
      starsInstance.instanceMatrix.needsUpdate = true;
    },
  });
}
</script>

<style scoped>
canvas {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}
.text_item {
  position: fixed;
  left: 10px;
  top: 10px;
  z-index: 10;
  pointer-events: none;
  transition: all 1s;
  color: #fff;
}
</style>
