<template>
  <div ref="photoRef"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let photoRef = ref(null);
let animateId = null;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// 添加控制器
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
onMounted(() => {
  photoRef.value.appendChild(renderer.domElement);
  // 加载纹理
  const texture = new THREE.TextureLoader().load("textures/photo3d/people.jpg");
  const deepTexture = new THREE.TextureLoader().load(
    "textures/photo3d/deep.jpg"
  );
  // 创建平面
  const geometry = new THREE.PlaneGeometry(8.504, 4.762);
  // const material = new THREE.MeshBasicMaterial({ map: texture });
  // 鼠标坐标
  const mouse = new THREE.Vector2();
  // 创建着色器材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: {
        value: texture,
      },
      uDepthTexture: {
        value: deepTexture,
      },
      vMouse: {
        value: mouse,
      },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform sampler2D uDepthTexture;
      uniform vec2 vMouse;
      uniform float uTime;
      void main() {
        vec4 color = texture2D(uTexture, vUv);
        vec4 depth = texture2D(uDepthTexture, vUv);
        float depthValue = depth.r;
        float x = vUv.x + (vMouse.x + sin(uTime)) * 0.01 * depthValue;
        float y = vUv.y + (vMouse.y + cos(uTime)) * 0.01 * depthValue;
        vec4 color2 = texture2D(uTexture, vec2(x, y));
        gl_FragColor = color2;
      }
    `,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  function render() {
    material.uniforms.vMouse.value = mouse;
    material.uniforms.uTime.value = performance.now() / 1000;
    renderer.render(scene, camera);
    // controls.update();
    animateId = requestAnimationFrame(render);
  }
  render();
  // 监听窗口变化
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
  // 监听鼠标移动
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
});
onBeforeUnmount(() => {
  cancelAnimationFrame(animateId);
  renderer.dispose();
  animateId = null;
});
</script>

<style scoped></style>
