<script setup lang="ts">
// 桌面端侧栏收起按钮：贴屏幕左缘、上边栏以下区域的垂直中点。
// 收起状态挂在 <html> 的 .sb-collapsed class 上（style.css 据此移动侧栏与内容区），
// localStorage 持久化；config.mts head 里的内联脚本会在首帧前恢复，避免加载闪动。
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const { theme, frontmatter, page } = useData()

// 与 VitePress 同一套判断：按 relativePath 前缀匹配 sidebar 配置键，
// 无匹配键（如文章页）或首页/404/sidebar:false —— 没有侧栏，按钮不出现
const show = computed(() => {
  if (page.value.isNotFound) return false
  if (frontmatter.value.layout === 'home') return false
  if (frontmatter.value.sidebar === false) return false
  const sb = (theme.value as { sidebar?: unknown }).sidebar
  if (Array.isArray(sb)) return sb.length > 0
  if (!sb || typeof sb !== 'object') return false
  const map = sb as Record<string, unknown>
  const path = '/' + (page.value.relativePath ?? '').replace(/^\//, '')
  const key = Object.keys(map)
    .sort((a, b) => b.split('/').length - a.split('/').length)
    .find((k) => path.startsWith(k))
  const list = key ? map[key] : undefined
  return Array.isArray(list) && list.length > 0
})

const collapsed = ref(false)

onMounted(() => {
  collapsed.value = document.documentElement.classList.contains('sb-collapsed')
})

function toggle() {
  collapsed.value = !collapsed.value
  document.documentElement.classList.toggle('sb-collapsed', collapsed.value)
  try {
    localStorage.setItem('sb-collapsed', collapsed.value ? '1' : '0')
  } catch {
    /* 隐私模式等写不进就算了 */
  }
}
</script>

<template>
  <button
    v-if="show"
    class="sb-toggle"
    :class="{ collapsed }"
    :aria-expanded="!collapsed"
    :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
    :title="collapsed ? '展开侧栏' : '收起侧栏'"
    @click="toggle"
  >
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  </button>
</template>

<style scoped>
.sb-toggle {
  display: none; /* 移动端侧栏是抽屉，不显示 */
}

@media (min-width: 960px) {
  .sb-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    left: 0;
    /* 上边栏以下区域的垂直中点 */
    top: calc(var(--vp-nav-height) + (100vh - var(--vp-nav-height)) / 2);
    /* 展开时贴住侧栏右缘（= 内容区左内边距，两个断点的公式与 VitePress 一致） */
    transform: translateY(-50%) translateX(var(--vp-sidebar-width));
    width: 22px;
    height: 60px;
    border: 1px solid var(--vp-c-divider);
    border-left: none;
    border-radius: 0 10px 10px 0;
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-3);
    cursor: pointer;
    z-index: 30; /* 与顶栏同级：高于内容，不与侧栏重叠 */
    box-shadow: 2px 1px 8px var(--paper-edge);
    transition:
      transform 0.25s ease,
      color 0.2s,
      border-color 0.2s,
      background-color 0.2s;
  }

  .sb-toggle:hover {
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
    background-color: var(--vp-c-bg);
  }

  .sb-toggle svg {
    transition: transform 0.25s ease;
  }

  /* 收起后贴回屏幕左缘 */
  .sb-toggle.collapsed {
    transform: translateY(-50%) translateX(0);
  }

  .sb-toggle.collapsed svg {
    transform: rotate(180deg);
  }
}

@media (min-width: 1440px) {
  /* 宽屏时侧栏外缘随视口变宽（与 VPContent.has-sidebar 的 padding-left 同式） */
  .sb-toggle {
    transform: translateY(-50%)
      translateX(
        calc(
          (100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width)
        )
      );
  }
}
</style>
