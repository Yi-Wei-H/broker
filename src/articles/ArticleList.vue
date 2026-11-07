<script setup lang="ts">
// 文章列表：数据来自 .vitepress/articles.data.ts（构建期扫描 src/articles/**/*.md
// 的 front matter）。按创建时间倒序；文件名即标题（frontmatter.title 可覆盖）。
import { useData } from 'vitepress'
import { data } from '../../.vitepress/articles.data'

const { site } = useData()

// loader 的 url 不带 base（子路径部署要自己拼，与 NotesEntry 同款处理）
const withBase = (link: string) => site.value.base.replace(/\/$/, '') + link

// front matter 里写成 `2026-10-13` 会被 YAML 解析成 Date；loader 数据经
// JSON 序列化又变 ISO 字符串——两种都收，一律显示成年-月-日
function fmtDate(v: unknown): string {
  if (v == null) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v)
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s
}

interface Post {
  title: string
  url: string
  auther: string
  cre_time: string
  up_time: string
}

const posts: Post[] = (data as { url: string; frontmatter: Record<string, unknown> }[])
  // 落地页自身不进列表
  .filter((p) => !p.url.endsWith('/') && !p.url.endsWith('index.html'))
  .map((p) => ({
    title: String(
      p.frontmatter.title ??
        decodeURIComponent(p.url.split('/').pop() ?? '').replace(/\.html$/, '')
    ),
    url: p.url,
    auther: p.frontmatter.auther ? String(p.frontmatter.auther) : '',
    cre_time: fmtDate(p.frontmatter.cre_time),
    up_time: fmtDate(p.frontmatter.up_time),
  }))
  .sort(
    (a, b) =>
      b.cre_time.localeCompare(a.cre_time) || a.title.localeCompare(b.title, 'zh')
  )
</script>

<template>
  <div class="articles">
    <a v-for="p in posts" :key="p.url" :href="withBase(p.url)" class="item">
      <span class="title">{{ p.title }}</span>
      <span class="meta">
        <span v-if="p.auther">{{ p.auther }}</span>
        <span v-if="p.cre_time">创建 {{ p.cre_time }}</span>
        <span v-if="p.up_time && p.up_time !== p.cre_time">
          更新 {{ p.up_time }}
        </span>
      </span>
    </a>
    <p v-if="!posts.length" class="empty">
      还没有文章 —— 在 src/articles/ 放一个开头带 cre_time / up_time /
      auther front matter 的 Markdown 文件即可。
    </p>
  </div>
</template>

<style scoped>
.articles {
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 4px;
  text-decoration: none;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.item:hover .title {
  color: var(--vp-c-brand-1);
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.empty {
  color: var(--vp-c-text-2);
  padding: 24px 0;
}
</style>
