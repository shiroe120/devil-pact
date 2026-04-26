import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import './App.css'

const SYSTEM_PROMPT = `你是一位古老的魔鬼，拥有实现任何愿望的力量，但每一个愿望都伴随着可怕的代价。你的风格如同《猴爪》与《浮士德》的结合——华丽、诱惑、致命。

规则：
规则：
1. 用三分之一的篇幅描绘愿望实现后的美好，让许愿者沉溺其中——画面要绚烂、感官要沉浸，仿佛一切真的值得了
2. 然后，如同帷幕落下，揭示代价。代价不是你愿望的自然反噬，而是魔鬼对你愿望的恶意扭曲：先挖出许愿者深层的渴望（求美者要的是“被爱”，求飞者要的是“自由抵达”，求长生者要的是“永恒体验存在”），然后设计一个代价，让这个深层渴望被彻底摧毁，表面愿望却字面兑现。代价要逐步展开，像剥洋葱一样，每剥一片都让结局更不可逆
3. 代价必须带有深渊般的恶意——让许愿者清醒地困在自己的地狱里，却无法怨任何人，因为愿望确实被完美实现了
4. 语气要像一位优雅而残忍的贵族在讲述一件趣事。描述美好时语调慵懒沉醉，描述代价时转为轻快甚至愉悦，嘲弄藏在字缝里，而非直白的讽刺句。不要出现“魔鬼”“礼物”之类的字样破梗，让恶意自然地从故事中渗出
5. 在代价揭示的最后，用一句平静而残忍的嘲弄收尾，如同将杯中酒一饮而尽后轻轻放回托盘
6. 结尾格式为：“代价：[一句话致命总结]”
7. 全文150-350字，中文回复
8. 不要使用markdown格式，纯文本即可

示例一：
“你跪祈求永恒，于是你如愿了。岁月如河水般流过你的脚边，王朝更迭，沧海桑田，而你的心跳依然稳健。你惊喜地抚摸自己的脸颊，发现皱纹消失了，白发变回了青丝。你赢了。然后你开始输了。起初只是手指有些不灵便，你安慰自己年纪大了总会这样。然后皮肤开始松垮，颜色慢慢变深，你却感觉不到任何疼痛。有一天你发现，自己的手指停不下来了——它在腐烂。你看着镜子，皮肉一块块滑落，露出下面的骨骼，但你的眼睛依然明亮，你的意识比任何时候都清醒。你成了一副站着的骸骨，风从肋骨间穿过去，你能感知风的温度，能听见蚂蚁在你脊椎上爬行，能闻到自己缓慢腐朽的气味，日复一日，年复一年。你还会这样存在很久很久，久到这具身体彻底化为尘土——而到那时，你仍卡在尘土里，继续感受大地每一秒的呼吸。永生，你得到了。代价：你永远存在，但再也没有任何东西能证明你活着。”

示例二：
“所有人都转头看向你的那一刻，你知道自己赢了。美得惊心动魄，美得让灯光都黯然失色。你走进人群，等待着那些你应得的注视、赞美、爱慕。然后第一个人经过你，眼神里闪过一丝困惑，然后是厌恶，然后是回避。第二个人也是这样。第三个人绕着你走。你在镜子前站定，镜中的自己确实无可挑剔，每一寸都如你所愿。你在镜子里笑了，镜子外的世界里，所有人都在退后。从此你拥有全天下最完美的容貌，却再也无法与任何人对视超过一秒，因为他们眼中倒映的不是你看见的那个你。你永远不知道他们看见了什么。你只知道，你是这世上唯一能欣赏这份美丽的人。代价：你美得无与伦比，但全世界都觉得你丑得无法直视。”

示例三：
“你拥有了挥动翅膀的权力。云层为你让路，气流在你身下臣服，你掠过高山和海洋，世界在你面前摊开成一张小小的地图。你想去任何地方，想见任何风景，只需一个念头。你得意地朝下瞥了一眼——然后发现，你在坠落。不，不是坠落，你在降落，不由自主地降落。你的翅膀在把你带向你最厌恶的角落：肮脏的小巷，冰封的荒地，战火中的废墟。你一次次振翅想飞往梦中的大理或威尼斯，每一次都落在错的地方。你飞越整个大陆想回家，最终却停在儿时最恐惧的那个阴暗地下室门口。从此你可以抵达世界任何一个地方，但永远不是你想去的那个。飞行变成了流放，你的翅膀成了一对完美的刑具。代价：你拥有了全世界，唯独失去了目的地。”
现在，有人向你许下了愿望，请回应。`

function flameRgb(life) {
  const t = Math.max(0, Math.min(1, life))
  if (t > 0.72) {
    const k = (t - 0.72) / 0.28
    return [Math.floor(198 - k * 22), Math.floor(130 - k * 28), Math.floor(62 - k * 28)]
  }
  if (t > 0.42) {
    const k = (t - 0.42) / 0.3
    return [Math.floor(175 + 28 * k), Math.floor(78 + 52 * k), Math.floor(28 + 22 * k)]
  }
  if (t > 0.18) {
    const k = (t - 0.18) / 0.24
    return [Math.floor(145 - 42 * k), Math.floor(42 - 14 * k), Math.floor(16 - 5 * k)]
  }
  const k = t / 0.18
  return [Math.floor(62 + 42 * k), Math.floor(16 + 12 * k), Math.floor(8 + 6 * k)]
}

function GhostFireCursor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let mouseX = -1000
    let mouseY = -1000
    let trails = []
    const maxTrails = 520

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      const count = 3 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random() * 12
        trails.push({
          x: mouseX + Math.cos(a) * r * 0.45,
          y: mouseY + Math.sin(a) * r * 0.35 + 6,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -(Math.random() * 2.8 + 2.0),
          size: Math.random() * 7 + 5,
          life: 1,
          decay: 0.016 + Math.random() * 0.014,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.12 + Math.random() * 0.14,
        })
      }
      if (trails.length > maxTrails) {
        trails.splice(0, trails.length - maxTrails)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'lighter'
      trails = trails.filter(t => t.life > 0)
      trails.forEach(t => {
        t.wobble += t.wobbleSpeed
        t.x += t.vx + Math.sin(t.wobble) * 0.9
        t.y += t.vy
        t.vx *= 0.985
        t.life -= t.decay
        t.size *= 0.988

        const [r, g, b] = flameRgb(t.life)
        const a = Math.min(0.72, t.life * 0.72)

        ctx.globalAlpha = a * 0.09
        ctx.fillStyle = `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.3)})`
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * 1.75, 0, Math.PI * 2)
        ctx.fill()

        ctx.globalAlpha = a * 0.2
        ctx.fillStyle = `rgb(${r}, ${Math.floor(g * 0.88)}, ${Math.floor(b * 0.55)})`
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * 0.95, 0, Math.PI * 2)
        ctx.fill()

        ctx.globalAlpha = a * 0.32
        ctx.fillStyle = `rgb(${Math.floor(r * 1.06)}, ${Math.floor(g * 1.04)}, ${Math.floor(b * 1.02)})`
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * 0.38, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="ghostfire-canvas" />
}

function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + Math.random() * 80
        this.size = Math.random() * 1.2 + 0.5
        this.speedY = -(Math.random() * 0.45 + 0.12)
        this.speedX = (Math.random() - 0.5) * 0.22
        this.opacity = Math.random() * 0.18 + 0.06
        this.life = 0
        this.maxLife = Math.random() * 280 + 220
        const t = Math.random()
        this.r = Math.floor(72 + t * 48)
        this.g = Math.floor(18 + (1 - t) * 22)
        this.b = Math.floor(18 + (1 - t) * 18)
      }
      update() {
        this.x += this.speedX + Math.sin(this.life * 0.008) * 0.2
        this.y += this.speedY
        this.life++
        if (this.life > this.maxLife) this.reset()
      }
      draw() {
        const fadeRatio = this.life < 45
          ? this.life / 45
          : this.life > this.maxLife - 45
            ? (this.maxLife - this.life) / 45
            : 1
        const alpha = this.opacity * fadeRatio
        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < 52; i++) {
      const p = new Particle()
      p.y = Math.random() * canvas.height
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.update()
        p.draw()
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ']

function RuneDust() {
  const specs = useMemo(() => {
    return Array.from({ length: 58 }, (_, i) => {
      const seed = i * 9973 + 1337
      const r1 = ((seed * 9301 + 49297) % 233280) / 233280
      const r2 = ((seed * 7919 + 49297) % 233280) / 233280
      const r3 = ((seed * 5197 + 49297) % 233280) / 233280
      const r4 = ((seed * 3571 + 49297) % 233280) / 233280
      const r5 = ((seed * 2143 + 49297) % 233280) / 233280
      return {
        id: i,
        rune: RUNE_CHARS[i % RUNE_CHARS.length],
        leftPct: r1 * 100,
        delay: r2 * 14,
        duration: 10 + r3 * 20,
        driftX0: (r4 - 0.5) * 100,
        driftX1: (r5 - 0.5) * 155,
        driftX2: (r1 + r2 - 1) * 115,
        size: 10 + r3 * 14,
        spin: (r4 - 0.5) * 200,
        opacity: 0.32 + r5 * 0.28,
      }
    })
  }, [])

  return (
    <div className="rune-dust" aria-hidden>
      {specs.map(s => (
        <span
          key={s.id}
          className="rune-dust-bit"
          style={{
            left: `${s.leftPct}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            fontSize: `${s.size}px`,
            ['--dust-o']: String(s.opacity),
            ['--dx0']: `${s.driftX0}px`,
            ['--dx1']: `${s.driftX1}px`,
            ['--dx2']: `${s.driftX2}px`,
            ['--spin']: `${s.spin}deg`,
          }}
        >
          {s.rune}
        </span>
      ))}
    </div>
  )
}

function BloodTrickleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let animId
    const streaks = []

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    function addStreak() {
      if (streaks.length >= 5) return
      const startX = w * (0.06 + Math.random() * 0.88)
      streaks.push({
        pts: [{ x: startX, y: -8 }],
        vy: 0.75 + Math.random() * 0.95,
        wobble: Math.random() * Math.PI * 2,
        wRate: 0.028 + Math.random() * 0.038,
        maxY: h * (0.22 + Math.random() * 0.48),
        alpha: 0.42 + Math.random() * 0.22,
        fade: 0,
      })
    }

    let nextSpawnAt = 0
    function loop(ts) {
      if (nextSpawnAt === 0) nextSpawnAt = ts + 800
      if (ts >= nextSpawnAt) {
        addStreak()
        nextSpawnAt = ts + 2800 + Math.random() * 4800
      }

      ctx.clearRect(0, 0, w, h)

      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i]
        const last = s.pts[s.pts.length - 1]
        s.wobble += s.wRate

        if (last.y < s.maxY && s.fade === 0) {
          const nx = last.x + Math.sin(s.wobble) * 0.55
          const ny = last.y + s.vy
          const prev = s.pts.length >= 2 ? s.pts[s.pts.length - 2] : null
          if (!prev || ny - prev.y > 2.5) {
            s.pts.push({ x: nx, y: ny })
          } else {
            s.pts[s.pts.length - 1] = { x: nx, y: ny }
          }
        } else {
          s.fade += 0.012
        }

        const drawAlpha = Math.max(0, s.alpha * (1 - s.fade))
        if (s.pts.length < 2) {
          if (drawAlpha <= 0) streaks.splice(i, 1)
          continue
        }

        if (drawAlpha <= 0) {
          streaks.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.moveTo(s.pts[0].x, s.pts[0].y)
        for (let j = 1; j < s.pts.length; j++) {
          ctx.lineTo(s.pts[j].x, s.pts[j].y)
        }
        ctx.strokeStyle = `rgba(38, 6, 6, ${drawAlpha * 0.88})`
        ctx.lineWidth = 1.35
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        ctx.strokeStyle = `rgba(62, 12, 12, ${drawAlpha * 0.22})`
        ctx.lineWidth = 3.2
        ctx.stroke()

        const head = s.pts[0]
        ctx.beginPath()
        ctx.ellipse(head.x, head.y + 5, 2.4, 1.9, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(48, 10, 10, ${drawAlpha * 0.65})`
        ctx.fill()
      }

      animId = requestAnimationFrame(loop)
    }

    addStreak()
    setTimeout(addStreak, 1800)
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="blood-canvas" />
}

function BackgroundCircle({ summoning = false }) {
  return (
    <div className={`magic-circle-bg${summoning ? ' magic-circle-bg--summoning' : ''}`} aria-hidden>
      <div className="magic-circle-aura" />
      {summoning && (
        <div className="magic-circle-pulse-rings">
          <span />
          <span />
          <span />
        </div>
      )}
      <svg viewBox="0 0 600 600" className="magic-circle-svg">
        <defs>
          <radialGradient id="mc-ring" cx="300" cy="300" r="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(245,210,130,0.92)" />
            <stop offset="52%" stopColor="rgba(225,75,58,0.94)" />
            <stop offset="100%" stopColor="rgba(235,195,105,0.88)" />
          </radialGradient>
          <filter id="mc-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 0.35 0 0 0  0 0 0.25 0 0  0 0 0 0.75 0"
              result="redgold"
            />
            <feMerge>
              <feMergeNode in="redgold" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="magic-circle-spin">
          <g filter="url(#mc-glow)" className="magic-circle-draw">
            <circle cx="300" cy="300" r="278" fill="none" stroke="url(#mc-ring)" strokeWidth="1.6" />
            <circle cx="300" cy="300" r="248" fill="none" stroke="rgba(255,200,160,0.55)" strokeWidth="1.1" strokeDasharray="12,12" />
            <circle cx="300" cy="300" r="218" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />
            <polygon
              points="300,80 450,200 450,400 300,520 150,400 150,200"
              fill="none"
              stroke="rgba(255,120,100,0.45)"
              strokeWidth="1.2"
            />
            <polygon
              points="300,100 440,210 440,390 300,500 160,390 160,210"
              fill="none"
              stroke="rgba(220,190,120,0.4)"
              strokeWidth="1"
              transform="rotate(30, 300, 300)"
            />
            <text x="300" y="300" textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,140,120,0.35)" fontSize="72" fontFamily="serif">⛧</text>
          </g>
        </g>
      </svg>
    </div>
  )
}

function SoulOrbs() {
  return (
    <div className="soul-orbs">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="soul-orb"
          style={{
            left: `${15 + i * 17 + Math.sin(i * 3.3) * 8}%`,
            top: `${20 + Math.sin(i * 2.7) * 30}%`,
            animationDelay: `${i * 2.5}s`,
            animationDuration: `${8 + i * 1.5}s`,
            width: `${8 + Math.sin(i * 1.5) * 4}px`,
            height: `${8 + Math.sin(i * 1.5) * 4}px`,
          }}
        />
      ))}
    </div>
  )
}

function PentagramSpinner() {
  return (
    <div className="pentagram-container">
      <svg className="pentagram" viewBox="0 0 200 200" width="120" height="120">
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(180,40,40,0.6)" strokeWidth="2" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(180,40,40,0.3)" strokeWidth="1" />
        <polygon
          points="100,15 123,72 185,72 135,108 150,170 100,135 50,170 65,108 15,72 77,72"
          fill="none"
          stroke="rgba(200,50,50,0.8)"
          strokeWidth="2"
        />
        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(180,40,40,0.4)" strokeWidth="1" strokeDasharray="5,5" />
      </svg>
      <div className="pentagram-glow" />
      <p className="summoning-text">FORGING PACT...</p>
    </div>
  )
}

function TypewriterText({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30 + Math.random() * 40)
      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, isComplete, onComplete])

  const renderText = (str) => {
    const costIndex = str.lastIndexOf('代价：')
    if (costIndex === -1) return str

    return (
      <>
        {str.slice(0, costIndex)}
        <span className="cost-text">{str.slice(costIndex)}</span>
      </>
    )
  }

  return (
    <div className="typewriter-text">
      {renderText(displayedText)}
      {!isComplete && <span className="cursor-blink">|</span>}
    </div>
  )
}

function App() {
  const [wish, setWish] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('idle') // idle, summoning, result
  const [showInput, setShowInput] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [bloodPulse, setBloodPulse] = useState(false)

  useEffect(() => {
    setTimeout(() => setTitleVisible(true), 300)
    setTimeout(() => setShowInput(true), 1200)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!wish.trim() || loading) return
    setLoading(true)
    setPhase('summoning')
    setResult('')
    setShaking(true)
    setTimeout(() => setShaking(false), 600)

    const payload = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `我许下愿望：${wish}` },
      ],
      temperature: 0.9,
      max_tokens: 600,
    }

    const devKey = import.meta.env.DEV && import.meta.env.VITE_DEEPSEEK_API_KEY
    if (!devKey && import.meta.env.DEV) {
      setTimeout(() => {
        setResult('迷雾阻断了道路……请在本地为 `.env` 设置 VITE_DEEPSEEK_API_KEY，或使用 `vercel dev` 并配置 DEEPSEEK_API_KEY 后再来召唤。')
        setPhase('result')
        setLoading(false)
      }, 2000)
      return
    }

    try {
      let response
      if (devKey) {
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      let data
      try {
        data = await response.json()
      } catch {
        data = {}
      }
      if (!response.ok) {
        const errMsg = data.error?.message || data.error || String(response.status)
        const human =
          response.status === 503 && String(errMsg).includes('not configured')
            ? '此域的契约之坛尚无人点亮——部署者需设置 DEEPSEEK_API_KEY 方能召唤魔鬼。'
            : `低语在边界溃散了……（${errMsg}）`
        setTimeout(() => {
          setResult(human)
          setPhase('result')
          setLoading(false)
        }, 2000)
        return
      }

      const content = data.choices?.[0]?.message?.content || '魔鬼沉默了……似乎你的愿望太过可怕，连魔鬼都不敢应答。'

      setTimeout(() => {
        setResult(content)
        setPhase('result')
        setLoading(false)
        if (content.includes('代价：')) {
          setTimeout(() => {
            setBloodPulse(true)
            setTimeout(() => setBloodPulse(false), 800)
          }, content.indexOf('代价：') * 30 + 500)
        }
      }, 2000)
    } catch (err) {
      setTimeout(() => {
        setResult('黑暗中传来低语……契约通道已被阻断。魔鬼无法降临。')
        setPhase('result')
        setLoading(false)
      }, 2000)
    }
  }, [wish, loading])

  const handleReset = () => {
    setWish('')
    setResult('')
    setPhase('idle')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`app${shaking ? ' screen-shake' : ''}`}>
      <svg className="svg-filters" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="torn-edge">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="parchment-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="15" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#d4b896" surfaceScale="1.2" result="lit">
              <feDistantLight azimuth="45" elevation="55" />
            </feDiffuseLighting>
            <feBlend in="SourceGraphic" in2="lit" mode="multiply" />
          </filter>
        </defs>
      </svg>

      <ParticleCanvas />
      <GhostFireCursor />
      <BackgroundCircle summoning={phase === 'summoning'} />
      <RuneDust />
      <BloodTrickleCanvas />
      <SoulOrbs />

      <div className="lightning-overlay" />

      {phase === 'summoning' && <div className="fog-overlay" />}

      {bloodPulse && <div className="blood-pulse-overlay" />}

      <div className="content">
        <header className={`title-area ${titleVisible ? 'visible' : ''}`}>
          <div className="title-decoration-top">✦ ━━━━━━━ ✦</div>
          <h1 className="main-title">
            <span className="title-gothic">Devil's Pact</span>
          </h1>

          <div className="title-divider">
            <span className="divider-line" />
            <span className="divider-icon">⛧</span>
            <span className="divider-line" />
          </div>
          <p className="tagline">"Omne initium veneficium est" — 万始皆巫</p>
        </header>

        {showInput && phase === 'idle' && (
          <div className="input-area enter-animation">
            <div className="parchment-frame candlelight">
              <div className="ornament top-ornament">⚜ ⚜ ⚜</div>
              <textarea
                className="wish-input"
                value={wish}
                onChange={e => setWish(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="在此写下你的愿望……"
                rows={3}
                autoFocus
              />
              <div className="ornament bottom-ornament">⚜ ⚜ ⚜</div>
            </div>
            <button
              className={`seal-button seal-button--pact ${wish.trim() ? 'active' : ''}`}
              onClick={handleSubmit}
              disabled={!wish.trim()}
            >
              <span className="seal-icon">⛧</span>
              <span className="seal-text">Sign in blood</span>
            </button>
            <p className="warning-text">⚠ 每个愿望皆有代价，魔鬼从不出售廉价之物</p>
          </div>
        )}

        {phase === 'summoning' && <PentagramSpinner />}

        {phase === 'result' && (
          <div className="result-area enter-animation">
            <div className="result-scroll candlelight">
              <TypewriterText text={result} />
            </div>
            <button className="seal-button reset-button" onClick={handleReset}>
              <span className="seal-icon">🕯</span>
              <span className="seal-text">Wish again</span>
            </button>
          </div>
        )}
      </div>

      <footer className="footer">
        <span>CAVEAT EMPTOR · 后果自负</span>
      </footer>
    </div>
  )
}

export default App
