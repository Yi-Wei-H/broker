<script setup lang="ts">
// 笔记首页：直接进入侧边栏中的第一篇笔记。
// 第一篇 = sidebar 数据按拼音排序后的第一个叶子链接（与左侧栏完全一致）。
import { onMounted } from 'vue'
import { useData } from 'vitepress'

interface Item {
  text: string
  link?: string
  items?: Item[]
}

const { theme, site } = useData()

// 主题渲染侧栏链接时会自动拼 base，但序列化的 sidebar 原始数据没有前缀，
// 子路径部署（base: '/blog/'）下必须自己拼
function withBase(link: string): string {
  return site.value.base.replace(/\/$/, '') + link
}

function firstLink(items?: Item[]): string | null {
  for (const it of items ?? []) {
    if (it.link) return withBase(it.link)
    const sub = firstLink(it.items)
    if (sub) return sub
  }
  return null
}

const sidebar = (theme.value as { sidebar?: unknown }).sidebar
const groups: Item[] = Array.isArray(sidebar)
  ? (sidebar as Item[])
  : (((sidebar as Record<string, Item[]>)?.['/notes/']) ?? [])
const target = firstLink(groups)

onMounted(() => {
  if (target) window.location.replace(target)
})
</script>

<template>
  <p v-if="target" class="notes-entry">
    正在进入第一篇笔记，若没有自动跳转请<a :href="target">点这里</a>
  </p>
  <p v-else class="notes-entry">
    暂无笔记 —— 把 Markdown 文件（连同它的 assets
    图片文件夹）放进 src/notes/ 对应分类后重新构建即可。
  </p>
</template>

<style scoped>
.notes-entry {
  color: var(--vp-c-text-2);
  padding: 24px 0;
}
</style>
