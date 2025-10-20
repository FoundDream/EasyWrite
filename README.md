# ✍️ 写作助手 - Writing Assistant

一个专注于优化写作的浏览器插件，帮助你将中文快速转换为优质英文，特别适合在 GitHub 上写 Issue 和 PR。

## 🌟 功能特点

- 🎯 **智能翻译**：选中文本即可翻译成流畅的英文
- 🔧 **灵活配置**：支持免费翻译 API 或自定义 AI 服务（如 OpenAI）
- 🌐 **GitHub 集成**：无缝集成到 GitHub 的文本编辑界面
- ⚡ **极简交互**：选中文本后自动显示翻译工具条
- 🎨 **麦金塔风格**：优雅的毛玻璃效果，完美适配浅色/深色模式

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# Chrome/Edge
npm run dev

# Firefox
npm run dev:firefox
```

### 构建生产版本

```bash
# Chrome/Edge
npm run build

# Firefox
npm run build:firefox
```

### 打包扩展

```bash
npm run zip
```

## 📖 使用说明

1. **安装插件**

   - 开发模式：运行 `npm run dev`，然后在浏览器中加载 `.output/chrome-mv3` 目录
   - 生产版本：运行 `npm run build` 和 `npm run zip`，安装生成的 zip 文件

2. **配置翻译服务**

   - 点击浏览器工具栏的插件图标
   - 选择翻译服务：
     - **MyMemory API**（推荐新手）：免费，无需配置
     - **自定义 API**：支持 OpenAI 等 AI 服务，需要 API 密钥

3. **在 GitHub 上使用**
   - 打开任意 GitHub 的 Issue 或 PR 页面
   - 在评论框中输入中文内容
   - 用鼠标选中要翻译的文字
   - 点击弹出的麦金塔风格翻译工具条
   - 等待翻译完成，选中的文字会自动替换为英文

## 🔧 自定义 API 配置

如果你想使用 OpenAI 等更高质量的 AI 服务：

1. 获取 OpenAI API 密钥：https://platform.openai.com/api-keys
2. 在插件设置中选择"自定义 API"
3. 填入以下信息：
   - API 地址：`https://api.openai.com/v1/chat/completions`
   - API 密钥：你的 OpenAI API 密钥（sk-xxx）

## 🛣️ 路线图

- [x] 基础翻译功能
- [x] GitHub 页面集成
- [x] 多翻译服务支持
- [ ] 上下文收集功能
- [ ] 翻译历史记录
- [ ] 自定义提示词
- [ ] 支持更多网站（如 GitLab、Notion 等）
- [ ] 翻译质量评分
- [ ] 多语言支持

## 💡 技术栈

- **WXT**：现代化的浏览器插件开发框架
- **React 19**：用户界面
- **TypeScript**：类型安全
- **MyMemory API**：免费翻译服务
- **OpenAI API**（可选）：高质量 AI 翻译

## 📝 开发说明

项目结构：

```
entrypoints/
  ├── background.ts       # 后台脚本，处理翻译API调用
  ├── content.ts         # 内容脚本，注入GitHub页面
  └── popup/            # 插件弹窗，配置界面
      ├── App.tsx
      ├── App.css
      └── main.tsx
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License
