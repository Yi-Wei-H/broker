import { createContentLoader } from 'vitepress'

// 文章列表数据源：构建期扫描 src/articles/**/*.md（含子目录与 front matter），
// 供 src/articles/ArticleList.vue 导入；目录内容来自 load-resources 同步
export default createContentLoader('articles/**/*.md')
