// 主题切换的圆形扩散/收缩动画（View Transitions API，仅 PC 端）
// 亮→暗：暗色以主题按钮为中心向外辐射，铺满整个页面
// 暗→亮：相反，暗色从最远端向按钮中心收缩，逐渐变小直至消失
//
// 实现要点（保证第一帧就有动画，无时序假设）：
// 1. 捕获阶段拦下原始点击（stopPropagation），VitePress 不会先切
// 2. 过渡回调里【同步、直接】完成切换：html.dark class + localStorage。
//    主题按钮的图标/旋钮本来就是 .dark class 驱动的 CSS，无需经过 Vue
// 3. 圆心/半径在点击时算好写进 CSS 变量，clip-path 动画完全由 style.css
//    里的 keyframes 驱动 —— 伪元素树建立的第一帧就带起始 clip-path。
//    不能等 transition.ready 再用 JS 补挂动画：补挂晚一帧，置顶的暗色
//    新画面会未裁剪整屏闪现（表现为「先全黑，再放动画」）
export function setupThemeTransition(): void {
  if (typeof window === 'undefined') return

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown
  }
  if (!doc.startViewTransition) return // 不支持的浏览器：正常无动画切换

  const isPC = window.matchMedia('(min-width: 960px)')
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null
      const btn = target?.closest?.('.VPSwitchAppearance')
      if (!(btn instanceof HTMLElement)) return
      if (!isPC.matches || noMotion.matches) return

      // 拦下原始点击，切换时机由过渡回调控制
      e.stopPropagation()
      e.preventDefault()

      const rect = btn.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      // 半径 = 按钮中心到页面最远角的距离
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const root = document.documentElement
      root.style.setProperty('--vt-x', `${x}px`)
      root.style.setProperty('--vt-y', `${y}px`)
      root.style.setProperty('--vt-r', `${r}px`)

      const next = !root.classList.contains('dark')
      doc.startViewTransition(() => {
        root.classList.toggle('dark', next)
        localStorage.setItem(
          'vitepress-theme-appearance',
          next ? 'dark' : 'light'
        )
        // 图标由 class 驱动会自动跟上；aria 同步一下（VitePress 内部 ref 不经过这里）
        btn.setAttribute('aria-checked', String(next))
      })
    },
    { capture: true }
  )
}
