<template>
  <div class="home">
    <div v-for="(item, index) in allRoutes" class="path_box">
      <span class="path_item" @click="handleClick(index)">{{ item.name }}</span>
    </div>
  </div>
</template>

<script setup>
import allRoutes from "./hook/allRoute.ts";
import Router from "../router";
const handleClick = (index) => {
  Router.push({ path: allRoutes[index].path });
};
</script>

<style scoped>
.home {
  margin: 100px 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.path_item {
  padding: 5px 10px;
  cursor: pointer;
  background-color: cornflowerblue;
  border-radius: 5px;
}
</style>
