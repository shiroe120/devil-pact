# Devil's Pact（魔鬼契约）

一个基于 **React** 与 **DeepSeek** 的轻量单页应用：在哥特式视觉氛围中写下愿望，由「魔鬼」以《猴爪》与《浮士德》式的叙事规则回复——先描绘愿望成真的幻景，再揭示扭曲而致命的代价。

## 能做什么

- 在羊皮纸风格输入框中输入中文愿望，提交后进入召唤阶段，再以打字机效果展示完整故事。
- 系统提示词约束模型：篇幅、结构（先美后代价）、语气（优雅而残忍的贵族感）、以 `代价：` 收尾的一句话总结等；回复为纯中文文本。
- 界面包含多层动效作为氛围渲染：游魂火焰光标、升起的余烬粒子、卢恩符文尘、血滴轨迹、法阵与灵魂光球、召唤中的五芒星与屏幕震动等；揭示「代价」时会有血脉冲等视觉强调。

## 技术栈

| 项 | 说明 |
| --- | --- |
| 构建 | [Vite](https://vitejs.dev/) 8 |
| 前端 | [React](https://react.dev/) 19 |
| 模型 API | [DeepSeek Chat](https://api.deepseek.com/) `deepseek-chat`（浏览器端 `fetch`） |
| 部署 | 仓库内提供 [Netlify](https://www.netlify.com/)（`netlify.toml`）与 [Vercel](https://vercel.com/)（`vercel.json` + `api/chat.js` 代理）的 SPA 回退配置 |

## 本地运行

```bash
npm install
npm run dev
```

在浏览器中打开 Vite 提示的本地地址即可。

## 环境变量

根目录有 `.env.example` 可拷贝为 `.env` 后按需填写（**不要提交**真实密钥）。

### 本地 `npm run dev`

```env
VITE_DEEPSEEK_API_KEY=你的_api_key
```

仅开发模式会读取；用于本地直连 API。

### 线上部署（Vercel，推荐：密钥不暴露给访客）

1. 在 [Vercel](https://vercel.com/) 导入本仓库，Framework Preset 选 **Vite**（或自动识别）。
2. 进入 Project → **Settings** → **Environment Variables**，添加：
   - **Name**：`DEEPSEEK_API_KEY`  
   - **Value**：你的 DeepSeek API Key  
   - 环境勾选 **Production** / **Preview** / **Development** 按需要。
3. 保存后重新 **Deploy**。

线上构建后的前端会请求同源的 `/api/chat`，由 [Vercel Serverless 函数 `api/chat.js`](api/chat.js) 在服务端代发，密钥**不会**打进静态资源。

**本地用与服务端同路径调试**：可安装 [Vercel CLI](https://vercel.com/docs/cli) 后在项目根执行 `vercel dev`，与线上一致走 `/api/chat`，并为此配置 `DEEPSEEK_API_KEY`（可用 `.env` / `.env.local` 等，勿提交仓库）。

## 构建与预览

```bash
npm run build
npm run preview
```

`dist` 为静态输出目录。若使用 **仅静态** 的主机（例如只上传 `dist` 而无服务端），需自行提供与 `api/chat.js` 等效的 API 代理，否则应使用 **Vercel** 这类能跑本仓库自带 API 的平台。

## 项目结构（简要）

- `index.html` — 页面元信息与字体引用  
- `src/main.jsx` — React 入口  
- `src/App.jsx` — 主界面、动效子组件、对话请求与状态机  
- `src/App.css` — 全站样式与动效  
- `src/index.css` — 全局基础样式  

---

*CAVEAT EMPTOR · 后果自负*
