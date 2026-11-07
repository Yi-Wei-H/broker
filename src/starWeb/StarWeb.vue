<script setup lang="ts">
// 收藏页主体：分组卡片网格。
// 左侧分类导航由 VitePress 真侧栏提供（config.mts 读取同一份 data.ts 生成），
// 各分组标题的锚点 id 供侧栏跳转定位。
import type { StarGroup } from './data'

defineProps<{ groups: StarGroup[] }>()

// 首字头像按名称哈希取色，无外部请求（不依赖 favicon 服务，国内服务器友好）
const PALETTE = [
  '#5c7cfa',
  '#40c057',
  '#fa5252',
  '#7950f2',
  '#0ca678',
  '#f76707',
  '#1098ad',
  '#d6336c',
]
function colorOf(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0
  return PALETTE[h % PALETTE.length]
}

function anchor(g: Group) {
  return 'starweb-' + g.name
}
</script>

<template>
  <div class="starweb">
    <section v-for="g in groups" :id="anchor(g)" :key="g.name" class="group">
      <h2>{{ g.name }}</h2>
      <div class="cards">
        <a
          v-for="s in g.sites"
          :key="s.url"
          :href="s.url"
          target="_blank"
          rel="noopener"
          class="card"
        >
          <span class="avatar" :style="{ background: colorOf(s.name) }">
            {{ s.name.trim().charAt(0).toUpperCase() }}
          </span>
          <span class="info">
            <b>{{ s.name }}</b>
            <small v-if="s.desc">{{ s.desc }}</small>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.group {
  scroll-margin-top: calc(var(--vp-nav-height) + 24px);
  margin: 0 0 36px;
}

.group h2 {
  margin: 0 0 14px;
  padding: 0;
  border: none;
  font-size: 20px;
}

.cards {
  display: grid;
  /* 桌面固定一行三个；minmax(0,1fr) 允许窄屏收缩不溢出 */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.card:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.avatar {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.info b {
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.info small {
  color: var(--vp-c-text-2);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 959px) {
  .group {
    margin-bottom: 28px;
  }

  .group h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .card {
    padding: 10px 12px;
    gap: 10px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>
