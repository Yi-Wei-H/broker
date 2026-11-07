# 云端 · 静态博客
VitePress 驱动的个人博客「云端」。资源与代码分离——内容放在仓库外的任意目录，`broker.env` 指哪加载哪，dev/构建时自动同步进站。

## 资源管理（核心工作流）

### 1. 配置路径

```ini
NOTES_PATH=      # 笔记目录
ARTICLES_PATH=   # 文章目录
STAR_URL_PATH=   # 收藏数据
```

### 2. 资源约定

| 类型 | 格式 | 说明 |
|---|---|---|
| 笔记 | `.md` | 最多两级分类：`分类/子分类/笔记.md`；文件名=标题（正文从 `##` 开始）；图片放同目录 `assets/`，相对路径引用，同目录共享 |
| 文章 | `.md` + `.txt` | md 可带 front matter：`auther`（作者）/ `cre_time` / `up_time`（YYYY-MM-DD），列表按创建时间倒序；txt **原样发布**（构建时只改后缀，不改动内容），与 md 同名时 txt 跳过 |
| 收藏 | `starUrl.txt` | JSON 数组，`desc` 可省略：`[{ "name": "分组", "sites": [{ "name": "GitHub", "url": "https://...", "desc": "..." }] }]` |

## 目录结构

```
├── broker.env.example    资源路径配置样例（broker.env 为本地实际配置，不进 git）
├── scripts/load-resources.mjs   资源加载器（env 解析/镜像同步/txt转md/JSON转data.ts）
├── .vitepress/           站点配置与主题
├── src/                  页面骨架（notes/articles 下的内容与 starWeb/data.ts 均为同步产物）
└── deploy/               nginx.conf
```

## 兼容 Typora 笔记的处理

无需 frontmatter、正文从 `##` 开始也能正确识别标题；同一文件夹多篇笔记共享一个 `assets/`；笔记里的 `<clinit>()` 等尖括号文本按字面显示；零宽字符自动清理。

## 技术栈

VitePress，Node 18+
