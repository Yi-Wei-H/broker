import { defineConfig } from 'vitepress'
import { genSidebar } from './sidebar'
import { typoraFix } from './markdown/typora-fix'
import { groups as starGroups } from '../src/starWeb/data'

export default defineConfig({
  lang: 'zh-CN', // 输出 <html lang="zh-CN">
  title: '云端',
  description: '个人学习笔记与网站收藏',
  base: '/blog/', // 部署在服务器的 /blog 子路径下
  head: [
    ['link', { rel: 'icon', href: '/blog/favicon.svg' }],
    // 首帧前恢复侧栏收起状态（html.sb-collapsed），避免桌面端加载时先展开再收起闪动
    [
      'script',
      {},
      `try{if(localStorage.getItem('sb-collapsed')==='1')document.documentElement.classList.add('sb-collapsed')}catch(e){}`,
    ],
  ],
  srcDir: 'src',
  outDir: 'dist',
  cleanUrls: false, // 保留 .html 后缀，Nginx 零重写配置
  ignoreDeadLinks: true, // 手丢的笔记可能带失效相对链接，不让它炸构建
  srcExclude: ['**/README.md'], // notes/README.md 是本地说明，不生成页面

  markdown: {
    config: (md) => md.use(typoraFix),
  },

  // 笔记/文章无 frontmatter.title、无 h1，默认会把页面标题退化成站名 ——
  // 按文件名补上（浏览器标签页标题和搜索结果标题都依赖它）
  transformPageData(pageData) {
    const rel = pageData.relativePath
    if (
      (rel.startsWith('notes/') || rel.startsWith('articles/')) &&
      !pageData.frontmatter.title
    ) {
      const segs = rel.split('/')
      const file = segs.pop()!.replace(/\.md$/, '')
      // 子分类 index.md 用文件夹名做标题，与侧栏显示一致
      pageData.title = file === 'index' ? segs[segs.length - 1] : file
    }
    // 笔记内容页打标识类：样式层用于"第一个 h2 不带分隔线"等原样展示定制
    if (rel.startsWith('notes/') && rel !== 'notes/index.md') {
      pageData.frontmatter.pageClass = 'notes-page'
    }
  },

  themeConfig: {
    siteTitle: '云端',
    logo: '/favicon.svg', // 站名左侧图标（易）
    // 首页不单独占一项：点左上角站名即回首页
    nav: [
      { text: '笔记', link: '/notes/' },
      { text: '文章', link: '/articles/' },
      { text: '收藏的网址', link: '/starWeb/' },
    ],
    sidebar: {
      '/notes/': genSidebar(),
      // 收藏页使用与笔记页完全相同的真侧栏（fixed 从上到下、同宽度、同边界样式）
      '/starWeb/': starGroups.map((g) => ({
        text: g.name,
        link: '/starWeb/#starweb-' + g.name,
      })),
    },
    outline: { level: [2, 3], label: '此页内容' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    footer: {
      message: '记录所学 · 收藏所用',
      copyright: 'Copyright © 2026 云端',
    },
  },
})
