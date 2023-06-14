<template>
  <div class="football">
    <div ref="footballRef"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let footballRef = ref(null);

onMouted(() => {});
</script>

<style scoped></style>
