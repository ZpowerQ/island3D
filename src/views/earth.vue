<template>
  <div class="earth">
    <div class="canvas_container" ref="screenDom"></div>
  </div>
</template>

<script setup>
import * as THREE from "three";
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
let screenDom = ref(null);

const lon2xyz = (R, longitude, latitude) => {
  let lon = (longitude * Math.PI) / 180; //经度弧度值
  let lat = (latitude * Math.PI) / 180; //纬度弧度值
  lon = -lon; //经度取反

  //计算球面坐标
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);

  return new THREE.Vector3(x, y, z);
};

onMounted(() => {
  // 创建场景
  let scene = new THREE.Scene();
  // 创建相机
  let camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 300);
  // 创建渲染器
  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  screenDom.value.appendChild(renderer.domElement);

  // 创建控制器
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true; //自动旋转

  // 创建星空背景
  scene.background = new THREE.Color(0x030311);

  // 使用点材质创建星空效果
  const vertices = [];
  for (let i = 0; i < 500; i++) {
    const vertex = new THREE.Vector3();
    vertex.x = 800 * Math.random() - 400;
    vertex.y = 800 * Math.random() - 400;
    vertex.z = 800 * Math.random() - 400;
    vertices.push(vertex.x, vertex.y, vertex.z);
  }

  // 星空效果
  let starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertices), 3)
  );
  // 加载点材质效果
  const starsTexture = new THREE.TextureLoader().load(
    "textures/earth/stars.png"
  );
  const starsMaterial = new THREE.PointsMaterial({
    color: 0x4d76cf,
    size: 2,
    sizeAttenuation: true, //点材质是否根据距离进行大小调整
    map: starsTexture,
    transparent: true,
    alphaMap: starsTexture,
    opacity: 1,
  });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // 创建地球
  const earthGeometry = new THREE.SphereGeometry(50, 32, 32);
  const earthTexture = new THREE.TextureLoader().load("textures/earth/map.jpg");
  let earthMaterial = new THREE.MeshBasicMaterial({
    map: earthTexture,
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  // 创建发光地球
  let lightTexture = new THREE.TextureLoader().load("textures/earth/earth.jpg");
  let lightEarthGeometry = new THREE.SphereGeometry(53, 32, 32);
  let lightEarthMaterial = new THREE.MeshBasicMaterial({
    map: lightTexture,
    alphaMap: lightTexture, //透明度贴图
    transparent: true,
    blending: THREE.AdditiveBlending, //颜色混合模式
  });
  let lightEarth = new THREE.Mesh(lightEarthGeometry, lightEarthMaterial);
  scene.add(lightEarth);

  // 添加地球内外发光精灵
  let spriteTexture = new THREE.TextureLoader().load("textures/earth/glow.png");
  let spriteMaterial = new THREE.SpriteMaterial({
    map: spriteTexture,
    color: 0x4d76cf,
    transparent: true,
    depthWrite: false, //关闭深度写入
    depthTest: false, //关闭深度测试
    blending: THREE.AdditiveBlending,
  });
  let sprite = new THREE.Sprite(spriteMaterial); //创建精灵
  sprite.scale.set(155, 155, 0); //设置精灵大小
  scene.add(sprite);

  // 内发光
  let spriteTexture1 = new THREE.TextureLoader().load(
    "textures/earth/innerGlow.png"
  );
  let spriteMaterial1 = new THREE.SpriteMaterial({
    map: spriteTexture1,
    color: 0x4d76cf,
    transparent: true,
    depthWrite: false, //关闭深度写入
    depthTest: false, //关闭深度测试
    blending: THREE.AdditiveBlending,
  });
  let sprite1 = new THREE.Sprite(spriteMaterial1); //创建精灵
  sprite1.scale.set(128, 128, 0); //设置精灵大小
  scene.add(sprite1);

  // 实现光柱
  for (let i = 0; i < 30; i++) {
    let lightPillarTexture = new THREE.TextureLoader().load(
      "textures/earth/light_column.png"
    );
    let lightPillarGeometry = new THREE.PlaneGeometry(3, 20);
    let lightPillarMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: lightPillarTexture,
      alphaMap: lightPillarTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false, //关闭深度写入
    });
    let lightPillar = new THREE.Mesh(lightPillarGeometry, lightPillarMaterial);
    lightPillar.add(lightPillar.clone().rotateY(Math.PI / 2));

    // 创建波纹扩散效果
    let circlePlane = new THREE.PlaneGeometry(6, 6);
    let circleTexture = new THREE.TextureLoader().load(
      "textures/earth/label.png"
    );
    let circleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: circleTexture,
      transparent: true,
      depthWrite: false, //关闭深度写入
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    let circleMesh = new THREE.Mesh(circlePlane, circleMaterial);
    circleMesh.rotation.x = -Math.PI / 2;
    circleMesh.position.set(0, -7, 0);
    lightPillar.add(circleMesh);

    gsap.to(circleMesh.scale, {
      duration: 1 + Math.random() * 0.5,
      x: 2,
      y: 2,
      z: 2,
      repeat: -1,
      yoyo: true, //循环
      ease: "power2.inOut",
    });

    // 设置光柱位置
    let lat = Math.random() * 180 - 90;
    let lon = Math.random() * 360 - 180;
    let position = lon2xyz(60, lon, lat);
    lightPillar.position.set(position.x, position.y, position.z);

    lightPillar.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      position.clone().normalize()
    ); // 设置光柱朝向
    scene.add(lightPillar);
  }

  // 添加月球
  let moonTexture = new THREE.TextureLoader().load("textures/earth/moon.jpg");
  let moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    emissive: 0xffffff,
    emissiveMap: moonTexture,
  });
  let moonGeometry = new THREE.SphereGeometry(5, 32, 32);
  let moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(150, 0, 0);
  scene.add(moon);

  // 设置月球环
  let moonRingTexture = new THREE.TextureLoader().load(
    "textures/earth/moon_ring.png"
  );
  let moonRingMaterial = new THREE.MeshBasicMaterial({
    map: moonRingTexture,
    transparent: true,
    depthWrite: false, //关闭深度写入
    side: THREE.DoubleSide,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  let moonRingGeometry = new THREE.RingGeometry(145, 155, 64);
  let moonRing = new THREE.Mesh(moonRingGeometry, moonRingMaterial);
  moonRing.rotation.x = -Math.PI / 2;
  scene.add(moonRing);

  // 让月球运动
  let time = { value: 0 };
  gsap.to(time, {
    duration: 10,
    value: 1,
    repeat: -1,
    ease: "linear",
    onUpdate: () => {
      moon.position.x = 150 * Math.cos(time.value * Math.PI * 2);
      moon.position.z = 150 * Math.sin(time.value * Math.PI * 2);
      moon.rotation.y = time.value * Math.PI * 2;
    },
  });

  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  render();

  // 监听窗口变化
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
</script>

<style scoped></style>
