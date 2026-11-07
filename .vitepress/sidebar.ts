import fs from 'node:fs'
import path from 'node:path'

// notes 目录位置：npm scripts 保证 cwd 为项目根；
// 不用 __dirname / import.meta.url —— config 会被 esbuild 打包，它们不可靠
const NOTES_DIR = path.resolve(process.cwd(), 'src/notes')

export interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

/**
 * 扫描 src/notes/ 生成嵌套分组侧边栏（config 加载时执行一次）：
 * - 文件夹 = 分组，*.md = 条目（文件名即标题）
 * - 跳过 assets/ 图片目录、隐藏文件、README.md
 * - 子文件夹里的 index.md 生成指向文件夹本身的链接
 * - 空目录返回 []，不报错
 */
export function genSidebar(): SidebarItem[] {
  if (!fs.existsSync(NOTES_DIR)) return []
  return walk(NOTES_DIR, '/notes/')
}

function walk(dir: string, base: string): SidebarItem[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const items: SidebarItem[] = []
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'assets') continue
    if (e.isFile() && e.name.endsWith('.md')) {
      if (e.name === 'README.md') continue
      if (e.name === 'index.md') {
        // 笔记目录自己的落地页，不进侧边栏
        if (base === '/notes/') continue
        items.push({ text: path.basename(dir), link: base })
      } else {
        // 逐段 encodeURI：文件夹名和文件名都可能含中文
        items.push({
          text: e.name.replace(/\.md$/, ''),
          link: base + encodeURI(e.name.replace(/\.md$/, '')) + '.html',
        })
      }
    } else if (e.isDirectory()) {
      const children = walk(path.join(dir, e.name), base + encodeURI(e.name) + '/')
      if (children.length) {
        items.push({ text: e.name, collapsed: true, items: children })
      }
    }
  }
  return items.sort((a, b) => a.text.localeCompare(b.text, 'zh'))
}
