import "@vue/runtime-core";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    RouterView: typeof import("vue-router")["RouterView"];
  }
}
