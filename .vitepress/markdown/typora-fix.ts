// Typora 笔记适配（markdown-it 插件，两件事）：
// 1. 笔记页大标题：笔记正文从 ## 开始、没有 h1 —— 在渲染层把「文件名」作为
//    h1 注入到内容流开头，天然与正文同列对齐（比布局插槽注入不会超宽）
// 2. Typora 痕迹清理：
//    - 零宽字符（U+200B 零宽空格 / U+FEFF BOM / U+200C ZWNJ / U+200D ZWJ）——
//      常被 Typora 用来做缩进，会污染标题锚点 slug 和搜索索引
//    - <clinit>、<init> 这类"形似 HTML 标签的正文" —— VitePress 默认允许内联 HTML，
//      浏览器会把 <clinit> 当未知元素渲染成空，正文只剩 "()"；转回 text 类型按字面显示
const KNOWN_TAGS = new Set([
  'a', 'abbr', 'audio', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'button', 'caption',
  'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em',
  'fieldset', 'figcaption', 'figure', 'font', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'header', 'hr', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li',
  'main', 'mark', 'menu', 'nav', 'ol', 'optgroup', 'option', 'p', 'pre', 'q', 'rp',
  'rt', 'ruby', 's', 'samp', 'section', 'select', 'small', 'source', 'span', 'strong',
  'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead',
  'time', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
])

// 无属性的裸标签，如 <clinit>、</init>（带属性的 HTML 一律不动，交给正常解析）
const BARE_TAG = /^<\/?([A-Za-z][A-Za-z0-9_-]*)>$/

// 零宽字符集合：用码点构造字符类，源码里不出现真实的不可见字符
const ZERO_WIDTH = new RegExp(
  '[' + [0x200b, 0xfeff, 0x200c, 0x200d].map((cp) => String.fromCharCode(cp)).join('') + ']',
  'g'
)

// 文章页正文注入「文件名 h1」+「作者 · 创建 · 更新」行（时间/作者来自文章 front matter）。
// 笔记页不注入——正文原样展示，文件名只用于浏览器标签页标题（transformPageData）。
// index.md 落地页与显式关闭（hidePageTitle）的页面不注入
function injectPageTitle(state: any): void {
  const env = (state.env ?? {}) as {
    relativePath?: string
    path?: string
    frontmatter?: Record<string, unknown>
  }
  const rel = env.relativePath ?? env.path ?? ''
  if (!rel.startsWith('articles/')) return
  if (rel.endsWith('/index.md')) return
  if (env.frontmatter?.hidePageTitle) return

  const title = rel.split('/').pop()!.replace(/\.md$/, '')
  const hOpen = new state.Token('heading_open', 'h1', 1)
  hOpen.attrs = [['class', 'page-title']]
  const inline = new state.Token('inline', '', 0)
  const text = new state.Token('text', '', 0)
  text.content = title
  inline.content = title
  inline.children = [text]
  const hClose = new state.Token('heading_close', 'h1', -1)
  const tokens: any[] = [hOpen, inline, hClose]

  const html = articleMetaHtml(env.frontmatter ?? {})
  if (html) {
    const meta = new state.Token('html_block', '', 0)
    meta.content = html
    tokens.push(meta)
  }
  state.tokens.unshift(...tokens)
}

// front matter 的 `2026-10-13` 会被 YAML 解析成 Date，统一显示成年-月-日
function fmtDate(v: unknown): string {
  if (v == null) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v)
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s
}

function articleMetaHtml(fm: Record<string, unknown>): string {
  const parts: string[] = []
  if (fm.auther) parts.push(esc(String(fm.auther)))
  const cre = fmtDate(fm.cre_time)
  if (cre) parts.push('创建 ' + cre)
  const up = fmtDate(fm.up_time)
  if (up) parts.push('更新 ' + up)
  return parts.length ? `<p class="article-meta">${parts.join(' · ')}</p>\n` : ''
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const typoraFix = (md: any): void => {
  md.core.ruler.push('notes_page_title', injectPageTitle)
  md.core.ruler.after('inline', 'typora_fix', (state: any) => {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue
      for (const t of block.children) {
        t.content = t.content.replace(ZERO_WIDTH, '')
        if (t.type === 'html_inline') {
          const m = BARE_TAG.exec(t.content)
          if (m && !KNOWN_TAGS.has(m[1].toLowerCase())) {
            // 转回 text 类型，渲染时自动做 HTML 转义，<clinit>() 完整可见
            t.type = 'text'
            t.tag = ''
          }
        }
      }
    }
  })
}
