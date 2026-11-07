// 资源加载器：dev/build 前把 broker.env 指定的外部资源同步进仓库（目标目录已 gitignore）
// 约定：NOTES_PATH=笔记目录(md)  ARTICLES_PATH=文章目录(md+txt，txt 原样转 md)
//       STAR_URL_PATH=starUrl.txt(JSON，结构同 StarGroup[])
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_FILE = path.join(ROOT, 'broker.env')
const NOTES_TARGET = path.join(ROOT, 'src/notes')
const ARTICLES_TARGET = path.join(ROOT, 'src/articles')
const DATA_TARGET = path.join(ROOT, 'src/starWeb/data.ts')

// 同步目标里属于程序本身的文件，清空与复制都要跳过
const KEEP = new Set(['index.md', 'README.md', 'ArticleList.vue'])

// BOM 用码点构造：源码里不出现不可见字符
const BOM = String.fromCharCode(0xfeff)

function stripBom(text) {
  return text.replace(BOM, '')
}

function parseEnv(file) {
  if (!fs.existsSync(file)) {
    console.error(`缺少 ${file}：请复制 broker.env.example 为 broker.env，填入三类资源路径`)
    process.exit(1)
  }
  const text = stripBom(fs.readFileSync(file, 'utf8'))
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue
    const m = line.match(/^([A-Za-z_]+)\s*=\s*(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return env
}

function emptyDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
  for (const e of fs.readdirSync(dir)) {
    if (!KEEP.has(e)) fs.rmSync(path.join(dir, e), { recursive: true, force: true })
  }
}

function listFiles(dir) {
  const files = []
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(path.join(d, e.name), r)
      else files.push(r)
    }
  }
  walk(dir, '')
  return files
}

// 镜像同步：外部有啥目标有啥，外部删了的目标也删（KEEP 程序文件除外）
function syncDir(source, target, txtToMd) {
  if (!source || !fs.existsSync(source)) {
    emptyDir(target)
    console.log(`  ⚠ 路径未配置或不存在，已置空: ${source || '(空)'}`)
    return 0
  }
  const files = listFiles(source)
  emptyDir(target)
  let count = 0
  for (const rel of files) {
    let out = rel
    if (txtToMd && rel.toLowerCase().endsWith('.txt')) {
      const mdTwin = rel.replace(/\.txt$/i, '.md')
      if (files.includes(mdTwin)) {
        console.log(`  ⚠ 与 ${mdTwin} 同名，txt 跳过: ${rel}`)
        continue
      }
      out = mdTwin
    }
    const dest = path.join(target, out)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(path.join(source, rel), dest)
    count++
  }
  return count
}

function writeData(groups) {
  const ts = `// 由 scripts/load-resources.mjs 从 starUrl.txt 自动生成，不要手改
export interface StarSite {
  name: string
  url: string
  desc?: string
}

export interface StarGroup {
  name: string
  sites: StarSite[]
}

export const groups: StarGroup[] = ${JSON.stringify(groups, null, 2)}
`
  fs.mkdirSync(path.dirname(DATA_TARGET), { recursive: true })
  fs.writeFileSync(DATA_TARGET, ts)
}

function syncStarUrl(file) {
  if (!file || !fs.existsSync(file)) {
    writeData([])
    console.log(`  ⚠ 路径未配置或文件不存在，收藏已置空: ${file || '(空)'}`)
    return 0
  }
  const text = stripBom(fs.readFileSync(file, 'utf8'))
  let groups
  try {
    groups = JSON.parse(text)
  } catch (e) {
    console.error(`starUrl.txt 不是合法 JSON：${e.message}`)
    process.exit(1)
  }
  if (!Array.isArray(groups)) {
    console.error('starUrl.txt 顶层必须是数组：[{ "name": "分组", "sites": [...] }]')
    process.exit(1)
  }
  writeData(groups)
  return groups.reduce((n, g) => n + (g.sites?.length ?? 0), 0)
}

const env = parseEnv(ENV_FILE)
const notes = syncDir(env.NOTES_PATH, NOTES_TARGET, false)
const articles = syncDir(env.ARTICLES_PATH, ARTICLES_TARGET, true)
const sites = syncStarUrl(env.STAR_URL_PATH)
console.log(`✓ 同步完成：笔记 ${notes} 个文件，文章 ${articles} 个文件，收藏 ${sites} 条`)
