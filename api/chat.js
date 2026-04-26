/**
 * 代理 DeepSeek Chat API，密钥仅存在于 Vercel 环境变量 `DEEPSEEK_API_KEY`。
 * 与根目录的 `"type": "module"` 一致，使用 ESM 默认导出。
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: { message: 'DEEPSEEK_API_KEY is not configured' },
    })
  }

  let body
  try {
    body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body && typeof req.body === 'object'
          ? req.body
          : {}
  } catch {
    return res.status(400).json({ error: { message: 'Invalid JSON' } })
  }

  const { model, messages, temperature, max_tokens: maxTokens } = body
  if (typeof model !== 'string' || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: 'Invalid payload' } })
  }

  const out = {
    model,
    messages,
    temperature: typeof temperature === 'number' ? temperature : 0.9,
    max_tokens: Math.min(2048, typeof maxTokens === 'number' ? maxTokens : 600),
  }

  const up = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(out),
  })

  const data = await up.json()
  return res.status(up.status).json(data)
}
