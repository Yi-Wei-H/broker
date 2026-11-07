import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import { setupThemeTransition } from './theme-transition'
import './style.css'

// 注：笔记页大标题已改为 markdown 渲染层注入（.vitepress/markdown/typora-fix.ts），
// 不再用 Layout 的 doc-top 插槽 —— 插槽渲染在 .container 之外，分隔线会超宽越过右侧大纲栏
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp() {
    // 主题切换的圆形扩散/收缩动画（PC 端，不支持的浏览器自动跳过）
    setupThemeTransition()
  },
} satisfies Theme
