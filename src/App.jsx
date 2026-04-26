import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const SYSTEM_PROMPT = `你是一位古老的魔鬼，拥有实现任何愿望的力量，但每一个愿望都伴随着可怕的代价。你的风格如同《猴爪》与《浮士德》的结合——华丽、诱惑、致命。

规则：
1. 用华丽的中世纪哥特修辞描述愿望如何被实现，让许愿者感到短暂的狂喜
2. 然后揭示可怕的代价和反噬——每个愿望必有致命副作用，绝不仁慈
3. 代价必须与愿望有讽刺性的关联（如许愿财富→变成将死的富豪；许愿爱情→爱人变成无法摆脱的幽灵；许愿智慧→大脑过载无法停止思考）
4. 语气要像一位优雅而残忍的贵族，带着戏谑和嘲弄
5. 结尾用一句话总结代价，格式为："代价：[简短描述]"
6. 全文200-400字，中文回复
7. 不要使用markdown格式，纯文本即可

示例风格：
"啊，无尽的财富……多么庸俗却又多么诱人的愿望。如你所愿——金币如暴雨般倾泻而下，你坐在黄金的王座上，商界在你脚下匍匐。你拥有了世界上最奢侈的一切……然而，魔鬼从不做亏本买卖。你体内的时间正在飞速流逝，每一枚金币都刻着你的寿命。你拥有了花不完的钱，却只剩下不到一年的生命来花它。"

现在，有人向你许下了愿望，请回应。`

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
        this.y = canvas.height + Math.random() * 100
        this.size = Math.random() * 3 + 1
        this.speedY = -(Math.random() * 0.8 + 0.2)
        this.speedX = (Math.random() - 0.5) * 0.3
        this.opacity = Math.random() * 0.5 + 0.1
        this.life = 0
        this.maxLife = Math.random() * 300 + 200
        this.color = Math.random() > 0.5
          ? `rgba(180, 40, 40, ${this.opacity})`
          : `rgba(80, 20, 20, ${this.opacity})`
      }
      update() {
        this.x += this.speedX + Math.sin(this.life * 0.01) * 0.3
        this.y += this.speedY
        this.life++
        if (this.life > this.maxLife) this.reset()
      }
      draw() {
        const fadeRatio = this.life < 50
          ? this.life / 50
          : this.life > this.maxLife - 50
            ? (this.maxLife - this.life) / 50
            : 1
        ctx.globalAlpha = this.opacity * fadeRatio
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < 80; i++) {
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
      <p className="summoning-text">正在缔结契约...</p>
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

  useEffect(() => {
    setTimeout(() => setTitleVisible(true), 300)
    setTimeout(() => setShowInput(true), 1200)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!wish.trim() || loading) return
    setLoading(true)
    setPhase('summoning')
    setResult('')

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `我许下愿望：${wish}` },
          ],
          temperature: 0.9,
          max_tokens: 600,
        }),
      })

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || '魔鬼沉默了……似乎你的愿望太过可怕，连魔鬼都不敢应答。'

      setTimeout(() => {
        setResult(content)
        setPhase('result')
        setLoading(false)
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
    <div className="app">
      <svg className="svg-filters" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="torn-edge">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
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

      <div className="lightning-overlay" />

      <div className="content">
        <header className={`title-area ${titleVisible ? 'visible' : ''}`}>
          <div className="title-decoration-top">✦ ━━━━━━━ ✦</div>
          <h1 className="main-title">
            <span className="title-gothic">Devil's Pact</span>
          </h1>
          <h2 className="sub-title">魔鬼契约</h2>
          <div className="title-divider">
            <span className="divider-line" />
            <span className="divider-icon">⛧</span>
            <span className="divider-line" />
          </div>
          <p className="tagline">"Omne initium veneficium est" — 万始皆巫</p>
        </header>

        {showInput && phase === 'idle' && (
          <div className="input-area enter-animation">
            <div className="parchment-frame">
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
              className={`seal-button ${wish.trim() ? 'active' : ''}`}
              onClick={handleSubmit}
              disabled={!wish.trim()}
            >
              <span className="seal-icon">⛧</span>
              <span className="seal-text">签订契约</span>
            </button>
            <p className="warning-text">⚠ 每个愿望皆有代价，魔鬼从不出售廉价之物</p>
          </div>
        )}

        {phase === 'summoning' && <PentagramSpinner />}

        {phase === 'result' && (
          <div className="result-area enter-animation">
            <div className="result-scroll">
              <TypewriterText text={result} />
            </div>
            <button className="seal-button reset-button" onClick={handleReset}>
              <span className="seal-icon">🕯</span>
              <span className="seal-text">再次许愿</span>
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
