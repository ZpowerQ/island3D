<template>
  <div class="back" @click="handleBack">首页</div>
  <router-view />
</template>

<script setup lang="ts">
import router from "./router";

const handleBack = () => {
  router.push("/");
};
</script>

<style scoped>
.back {
  width: 50px;
  height: 40px;
  position: absolute;
  top: 20px;
  left: 20px;
  border-radius: 10px;
  background-color: aquamarine;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 999;
  opacity: 0.8;
}
</style>
