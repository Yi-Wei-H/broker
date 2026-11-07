<script setup lang="ts">
// 右下角圆形回到顶部按钮：只在 笔记/文章/收藏 内容页出现，滚动超过一屏渐现
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const show = ref(false)

// 不锚定开头：base 子路径部署（/blog/...）下 route.path 带前缀，
// 按路径段匹配即可；(/|$) 边界避免误伤 /notesX 之类的路径
function enabled() {
  return /\/(notes|articles|starWeb)(\/|$)/.test(route.path)
}

function onScroll() {
  show.value = window.scrollY > 300
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="btt">
    <button
      v-if="show && enabled()"
      class="back-to-top"
      type="button"
      aria-label="回到顶部"
      title="回到顶部"
      @click="toTop"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  background: var(--vp-nav-bg-color);
  -webkit-backdrop-filter: saturate(150%) blur(12px);
  backdrop-filter: saturate(150%) blur(12px);
  box-shadow: 0 2px 8px var(--paper-edge);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.back-to-top:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.back-to-top svg {
  width: 18px;
  height: 18px;
}

.btt-enter-active,
.btt-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.btt-enter-from,
.btt-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 手机端缩小并贴边 */
@media (max-width: 767px) {
  .back-to-top {
    width: 36px;
    height: 36px;
    right: 16px;
    bottom: 16px;
  }

  .back-to-top svg {
    width: 15px;
    height: 15px;
  }
}
</style>
