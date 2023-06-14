<template>
  <div ref="newYearRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let newYearRef = ref(null);
let showText = false;
let material = null;
onMounted(() => {
  // 初始化场景
  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // 初始化相机
  let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 3;
  // 初始化渲染器
  let renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  newYearRef.value.appendChild(renderer.domElement);

  // 加载模型
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/gltf/");
  loader.setDRACOLoader(dracoLoader);
  loader.load("models/newyear.glb", function (gltf) {
    let text = gltf.scene.children[0];
    scene.add(text);

    let geometry = text.geometry;
    const position = geometry.attributes.position;
    const vertexCount = position.count;
    const triangleCount = vertexCount / 3;

    const randomDirections = [];
    const randomStrengths = [];
    for (let i = 0; i < triangleCount; i++) {
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      )
        .normalize()
        .toArray();
      randomDirections.push(dir[0], dir[1], dir[2]);
      const randomStrength = Math.random();
      randomStrengths.push(randomStrength, randomStrength, randomStrength);
    }
    const randomDirAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(randomDirections),
      3
    );
    geometry.setAttribute("randomDirection", randomDirAttribute);
    const randomStrengthAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(randomStrengths),
      1
    );
    geometry.setAttribute("randomStrength", randomStrengthAttribute);

    // 定义着色器材质
    material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 1 } },
      vertexShader: `
        attribute vec3 randomDirection;
        attribute float randomStrength;
        uniform float time;
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          vec3 pos = position.xyz;
          pos += randomDirection * randomStrength * time;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        void main() {
          vec3 color = normalize(vPosition) * 0.5 + 0.5;
          color.z = color.z * 3.0;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });
    text.material = material;
  });

  // 初始化控制器
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  let clock = new THREE.Clock();
  let value = 0;
  function render() {
    let delta = clock.getDelta();
    if (material) {
      if (showText) {
        value -= delta;
        value = Math.max(value, 0);
        material.uniforms.time.value = value;
      } else {
        value += delta;
        value = Math.min(value, 1);
        material.uniforms.time.value = value;
      }
    }
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener("click", () => {
    showText = !showText;
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
</script>

<style scoped></style>
