# WeChat MD - Markdown 转微信公众号格式化工具

> 一款专为微信公众号文章创作设计的 Markdown 编辑器，支持实时预览、样式模板管理和一键复制到公众号编辑器。

## ✨ 核心特性

### 📝 强大的 Markdown 编辑
- 基于 [ByteMD](https://github.com/bytedance/bytemd) 的专业 Markdown 编辑器
- 实时预览，所见即所得
- 支持 GFM（GitHub Flavored Markdown）语法
- 代码高亮显示
- 图片本地存储支持

### 🎨 丰富的样式模板
- **内置模板**：微信绿、极简蓝、活泼橙、雅致紫
- **自定义模板**：支持创建最多 3 个自定义样式模板
- **模板管理**：可视化模板编辑器，轻松管理所有模板
- **样式调试器**：实时编辑 CSS，即时预览效果

### 🚀 一键复制到公众号
- 自动将 CSS 转换为内联样式（兼容微信公众号限制）
- 智能清理 HTML，确保符合公众号规范
- 支持 HTML 格式复制，可直接粘贴到公众号编辑器
- 自动处理图片格式转换

### 💾 智能存储
- 内容自动保存到本地存储
- 支持导入 Markdown 文件
- 模板持久化存储

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI 组件库**：Ant Design
- **Markdown 编辑器**：ByteMD
- **样式内联化**：juice
- **代码高亮**：highlight.js

## 📦 快速开始

### 环境要求

- Node.js >= 16
- pnpm (推荐) 或 npm/yarn

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
pnpm dev
```

访问 `http://localhost:5173` 开始使用。

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
pnpm preview
```

## 🎯 使用指南

### 基本使用

1. **编写内容**：在左侧编辑区输入 Markdown 内容
2. **选择模板**：点击顶部"选择模版"按钮，选择你喜欢的样式模板
3. **预览效果**：右侧实时预览最终效果
4. **复制到公众号**：点击"复制到公众号"按钮，然后直接粘贴到微信公众号编辑器

### 自定义样式

1. 点击"样式编辑"按钮打开样式调试器
2. 在右侧编辑器中编写 CSS 样式
3. 实时预览样式效果
4. 满意后点击"保存为新模版"创建自定义模板

### 模板管理

1. 点击"模版管理"按钮
2. 查看所有可用模板（内置 + 自定义）
3. 编辑、删除自定义模板
4. 设置默认模板

### 导入文件

1. 点击顶部"文件"菜单
2. 选择"导入 Markdown"
3. 选择本地 `.md` 文件即可导入

## 📋 功能清单

- [x] Markdown 实时编辑与预览
- [x] 多种内置样式模板
- [x] 自定义样式模板（最多 3 个）
- [x] 样式实时调试器
- [x] 一键复制到公众号（HTML 格式）
- [x] CSS 自动内联化
- [x] HTML 智能清理与优化
- [x] 图片本地存储
- [x] 内容自动保存
- [x] Markdown 文件导入
- [x] 模板管理界面

## 🔧 项目结构

```
wechat-md/
├── src/
│   ├── components/          # React 组件
│   │   ├── ContentEditor/   # 主编辑器组件
│   │   ├── TemplateManager/ # 模板管理组件
│   │   └── StyleInjector.tsx
│   ├── utils/               # 工具函数
│   │   ├── wechatFormatter.ts    # 微信格式化
│   │   ├── htmlExporter.ts       # HTML 导出
│   │   ├── templateStorage.ts    # 模板存储
│   │   ├── imageStorage.ts       # 图片存储
│   │   └── builtinTemplates.ts   # 内置模板
│   ├── types/               # TypeScript 类型定义
│   └── App.tsx              # 应用入口
├── package.json
└── vite.config.ts
```

## 🎨 样式模板说明

### 内置模板

- **微信绿**：经典微信风格，绿色主题（默认模板）
- **极简蓝**：简洁清爽的蓝色主题
- **活泼橙**：活力四射的橙色主题
- **雅致紫**：优雅高贵的紫色主题

### 自定义模板

支持创建最多 3 个自定义模板，可以：
- 自定义所有 CSS 样式
- 保存为模板以便重复使用
- 随时编辑和删除

## ⚙️ 技术细节

### 微信公众号兼容性

- 自动将 CSS 转换为内联样式（使用 `juice` 库）
- 清理不符合规范的 HTML 标签和属性
- 保留微信公众号支持的基础样式
- 智能处理图片格式（支持 data URL）

### 样式作用域

所有自定义样式会自动添加 `.bytemd-preview .markdown-body` 前缀，确保样式只作用于预览区域，不影响编辑器本身。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如有问题或建议，请通过"问题反馈"按钮反馈。

## 📄 许可证

MIT License

## 🙏 致谢

- [ByteMD](https://github.com/bytedance/bytemd) - 优秀的 Markdown 编辑器
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言
- [juice](https://github.com/Automattic/juice) - CSS 内联化工具

---

**让 Markdown 写作更简单，让公众号排版更优雅！** 🎉

