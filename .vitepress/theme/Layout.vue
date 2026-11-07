<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import SidebarToggle from './SidebarToggle.vue'
import BackToTop from './components/BackToTop.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 侧栏收起按钮（position: fixed，插槽位置只决定 DOM 挂载点） -->
    <template #layout-bottom>
      <SidebarToggle />
      <BackToTop />
    </template>
  </DefaultTheme.Layout>
</template>
