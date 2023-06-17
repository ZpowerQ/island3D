<template>
  <div ref="missileRef"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入着色器代码
import vertexShader from "../assets/three/shader/vertexShader.glsl?raw";
import fragmentShader from "../assets/three/shader/fragmentShader.glsl?raw";

let missileRef = ref(null);

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
  camera.position.set(0, 0, 5);
  camera.updateProjectionMatrix();

  // 创建控制器
  const controls = new OrbitControls(camera, missileRef.value);
  controls.enableDamping = true;

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  missileRef.value.appendChild(renderer.domElement);

  let missile, mapwkl, mapels, curvePath;
  // 加载gltf模型
  const loader = new GLTFLoader();
  loader.load(
    "models/missile/ew8.glb",
    (gltf) => {
      missile = gltf.scene.children[3];
      mapwkl = gltf.scene.children[1];
      mapels = gltf.scene.children[0];
      curvePath = gltf.scene.children[2];
      scene.add(missile);
      scene.add(mapwkl);
      scene.add(mapels);

      // 根据点创建曲线
      let points = [];
      for (
        let i = curvePath.geometry.attributes.position.count - 1;
        i >= 0;
        i--
      ) {
        points.push(
          new THREE.Vector3(
            curvePath.geometry.attributes.position.array[i * 3],
            curvePath.geometry.attributes.position.array[i * 3 + 1],
            curvePath.geometry.attributes.position.array[i * 3 + 2]
          )
        );
      }
      curvePath = new THREE.CatmullRomCurve3(points);
    },
    // 加载进度
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // 加载错误
    (error) => {
      console.log("An error happened");
    }
  );

  // 创建平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 1);
  scene.add(directionalLight);

  // 创建平行光
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight2.position.set(0, -10, -1);
  scene.add(directionalLight2);

  // 创建计时器
  let clock = new THREE.Clock();
  let params = { iTime: { value: 0 } };
  // 添加爆炸声
  const listener = new THREE.AudioListener();
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("textures/missile/bomb.mp3", (buffer) => {
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
  });
  function render() {
    // 设置5s循环一次
    let t = clock.getElapsedTime() % 5;
    t = t / 5;
    // 设置导弹飞行路径
    //先判断curvePath是否存在，如果存在则设置导弹位置
    if (curvePath) {
      missile.position.copy(curvePath.getPointAt(t));
      if (t + 0.1 < 1) {
        missile.lookAt(curvePath.getPointAt(t + 0.01));
      }
      if (t > 0.95) {
        scene.add(sprite);
        if (!sound.isPlaying) {
          sound.play();
        }
      }
    }
    params.iTime.value = t * 10;
    renderer.render(scene, camera);
    controls && controls.update();
    requestAnimationFrame(render);
  }
  render();

  // 创建精灵材质
  let spriteMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
  // 添加精灵图
  let sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5, 0.5, 0.5);
  sprite.position.set(-5.5, 0.8, 0);
  // scene.add(sprite);

  // 添加着色器代码
  spriteMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `
      #include <common>
      varying vec2 vUv;
      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_vertex>",
      `
      #include <uv_vertex>
      vUv = uv;
      `
    );
    //替换片源着色器
    shader.fragmentShader = fragmentShader;
    //定义uniform变量
    shader.uniforms.iResolution = {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    };
    shader.uniforms.iTime = params.iTime;
    shader.uniforms.iMouse = { value: new THREE.Vector2(0, 0) };
    shader.uniforms.iChannel0 = {
      value: new THREE.TextureLoader().load("textures/missile/iChannel0.png"),
    };
    shader.uniforms.iChannel1 = {
      value: new THREE.TextureLoader().load("textures/missile/iChannel1.png"),
    };
    shader.uniforms.iChannel2 = {
      value: new THREE.TextureLoader().load("textures/missile/iChannel2.png"),
    };
  };

  // 监听窗口变化
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
</script>

<style scoped></style>
