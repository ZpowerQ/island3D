<template>
  <div>home</div>
</template>

<script setup>
import * as THREE from "three";

// 初始化场景
const scene = new THREE.Scene();

// 初始化相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

</script>

<style scoped></style>
