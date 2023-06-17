<template>
  <div class="football">
    <div ref="footballRef"></div>
    <h1>{{ percentage }}</h1>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import gsap from "gsap";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
let footballRef = ref(null);
let percentage = ref(30);
let animateId = null;
let renderer = null;
gsap.to(percentage, {
  value: 100,
  duration: 1,
  ease: "linear",
  repeat: -1,
  onUpdate: () => {
    percentage.value = Math.floor(percentage.value);
  },
});
onMounted(() => {
  // 创建场景
  const scene = new THREE.Scene();
  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(4, 2, 0);
  camera.updateProjectionMatrix();

  // 创建控制器
  const controls = new OrbitControls(camera, footballRef.value);
  controls.enableDamping = true;
  // controls.maxDistance = 10;
  controls.minDistance = 1;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置背景色
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5; // 曝光
  renderer.shadowMap.enabled = true; // 阴影
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 阴影类型
  footballRef.value.appendChild(renderer.domElement);

  // 加载纹理
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    "textures/football/outdoor.jpg",
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      scene.backgroundBlurriness = 0.2;
    }
  );

  // 添加聚光灯
  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(10, 50, 0);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 500;
  spotLight.shadow.camera.fov = 30;
  spotLight.shadow.bias = -0.00008;
  spotLight.intensity = 1;
  scene.add(spotLight);

  // 初始化物理世界
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  let ball, ballBody;
  // 加载模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("models/playground02.glb", (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh && child.name.search(/Solid/) == -1) {
        child.castShadow = true;
        child.receiveShadow = true;
        // trimesh类型
        const trimesh = new CANNON.Trimesh(
          child.geometry.attributes.position.array,
          child.geometry.index.array
        );
        // 创建刚体
        const trimeshBody = new CANNON.Body({
          mass: 0, // 质量
          shape: trimesh,
        });
        // 获取世界位置和旋转给物理世界
        trimeshBody.position.copy(child.getWorldPosition(new THREE.Vector3()));
        trimeshBody.quaternion.copy(
          child.getWorldQuaternion(new THREE.Quaternion())
        );
        world.addBody(trimeshBody);
      }
      if (child.name == "door") {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x000000,
          opacity: 0,
          transparent: true,
        });
      }
      if (child.name == "Soccer_Ball") {
        ball = child;
        // 创建球体
        const ballShape = new CANNON.Sphere(0.15);
        //创建球体刚体
        ballBody = new CANNON.Body({
          mass: 1, // 质量
          position: new CANNON.Vec3(0, 10, 0), // 位置
          shape: ballShape,
        });
        world.addBody(ballBody);
      }
      setTimeout(() => {
        ballBody.position.set(0, 10, 0); // 重置位置
        ballBody.velocity.set(0, 0, 0); // 重置速度
        ballBody.angularVelocity.set(0, 0, 0); // 重置角速度
      }, 2000);
    });
    scene.add(model);
  });
  let clock = new THREE.Clock();

  function render() {
    let delta = clock.getDelta();
    world.step(delta); // 更新物理世界
    if (ball && ballBody) {
      ball.position.copy(ballBody.position);
      ball.quaternion.copy(ballBody.quaternion);
    }
    if (camera.position.y <= 0.5) {
      camera.position.y = 0.5;
    }
    renderer.render(scene, camera);
    controls.update();
    animateId = requestAnimationFrame(render);
  }
  render();

  // 监听窗口变化
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  let isClick = false;
  window.addEventListener("click", () => {
    if (isClick) return;
    isClick = true;
    ballBody.applyForce(
      new CANNON.Vec3(
        -10 * percentage.value,
        6 * percentage.value,
        (Math.random() - 0.5) * percentage.value
      ),
      ballBody.position
    ); // 施加力
    setTimeout(() => {
      isClick = false;
      ballBody.position.set(0, 5, 0); // 重置位置
      ballBody.velocity.set(0, 0, 0); // 重置速度
      ballBody.angularVelocity.set(0, 0, 0); // 重置角速度
    }, 5000);
  });
});
onBeforeUnmount(() => {
  cancelAnimationFrame(animateId);
  renderer.dispose();
  animateId = null;
});
</script>

<style scoped>
h1 {
  position: fixed;
  left: 0;
  top: 0;
  color: #fff;
}
</style>
