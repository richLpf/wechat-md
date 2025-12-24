import { Template } from '../types'

/**
 * 内置模版 - 系统提供的默认模版
 * 这些模版不能被删除，只能使用
 */
export const builtinTemplates: Template[] = [
  {
    id: 'builtin-wechat-green',
    name: '微信绿',
    css: `.bytemd-preview .markdown-body.wechat-article {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  max-width: 677px;
  margin: 0 auto;
  padding: 20px;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 24px;
  font-weight: 600;
  color: #07c160;
  margin: 24px 0 16px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h2 {
  font-size: 20px;
  font-weight: 600;
  color: #07c160;
  margin: 20px 0 12px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 10px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.bytemd-preview .markdown-body .wechat-article-blockquote {
  border-left: 3px solid #07c160;
  padding: 10px 15px;
  margin: 16px 0;
  background: #f7f7f7;
  color: #666;
}

.bytemd-preview .markdown-body .wechat-article-list {
  margin: 12px 0;
  padding-left: 24px;
}

.bytemd-preview .markdown-body .wechat-article-list-item {
  margin: 8px 0;
  line-height: 1.8;
}

.bytemd-preview .markdown-body .wechat-article-code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

.bytemd-preview .markdown-body .wechat-article-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.bytemd-preview .markdown-body .wechat-article-th,
.bytemd-preview .markdown-body .wechat-article-td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.bytemd-preview .markdown-body .wechat-article-th {
  background: #f0f0f0;
  font-weight: 600;
}`,
    isDefault: true,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-minimal-blue',
    name: '极简蓝',
    css: `.bytemd-preview .markdown-body.wechat-article {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #2c3e50;
  max-width: 677px;
  margin: 0 auto;
  padding: 20px;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 24px;
  font-weight: 600;
  color: #3498db;
  margin: 24px 0 16px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h2 {
  font-size: 20px;
  font-weight: 600;
  color: #3498db;
  margin: 20px 0 12px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 16px 0 10px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.bytemd-preview .markdown-body .wechat-article-blockquote {
  border-left: 3px solid #3498db;
  padding: 10px 15px;
  margin: 16px 0;
  background: #ecf0f1;
  color: #555;
}

.bytemd-preview .markdown-body .wechat-article-list {
  margin: 12px 0;
  padding-left: 24px;
}

.bytemd-preview .markdown-body .wechat-article-list-item {
  margin: 8px 0;
  line-height: 1.8;
}

.bytemd-preview .markdown-body .wechat-article-code {
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.bytemd-preview .markdown-body .wechat-article-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.bytemd-preview .markdown-body .wechat-article-th,
.bytemd-preview .markdown-body .wechat-article-td {
  border: 1px solid #bdc3c7;
  padding: 10px;
  text-align: left;
}

.bytemd-preview .markdown-body .wechat-article-th {
  background: #ecf0f1;
  font-weight: 600;
}`,
    isDefault: false,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-lively-orange',
    name: '活泼橙',
    css: `.bytemd-preview .markdown-body.wechat-article {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  max-width: 677px;
  margin: 0 auto;
  padding: 20px;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 24px;
  font-weight: 600;
  color: #ff6b35;
  margin: 24px 0 16px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h2 {
  font-size: 20px;
  font-weight: 600;
  color: #ff6b35;
  margin: 20px 0 12px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 10px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.bytemd-preview .markdown-body .wechat-article-blockquote {
  border-left: 3px solid #ff6b35;
  padding: 10px 15px;
  margin: 16px 0;
  background: #fff5f0;
  color: #666;
}

.bytemd-preview .markdown-body .wechat-article-list {
  margin: 12px 0;
  padding-left: 24px;
}

.bytemd-preview .markdown-body .wechat-article-list-item {
  margin: 8px 0;
  line-height: 1.8;
}

.bytemd-preview .markdown-body .wechat-article-code {
  background: #fff5f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

.bytemd-preview .markdown-body .wechat-article-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.bytemd-preview .markdown-body .wechat-article-th,
.bytemd-preview .markdown-body .wechat-article-td {
  border: 1px solid #ffd4c4;
  padding: 10px;
  text-align: left;
}

.bytemd-preview .markdown-body .wechat-article-th {
  background: #fff5f0;
  font-weight: 600;
}`,
    isDefault: false,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-elegant-purple',
    name: '雅致紫',
    css: `.bytemd-preview .markdown-body.wechat-article {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  max-width: 677px;
  margin: 0 auto;
  padding: 20px;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 24px;
  font-weight: 600;
  color: #9b59b6;
  margin: 24px 0 16px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h2 {
  font-size: 20px;
  font-weight: 600;
  color: #9b59b6;
  margin: 20px 0 12px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 10px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-paragraph {
  margin: 12px 0;
  text-align: justify;
}

.bytemd-preview .markdown-body .wechat-article-blockquote {
  border-left: 3px solid #9b59b6;
  padding: 10px 15px;
  margin: 16px 0;
  background: #f4ecf7;
  color: #666;
}

.bytemd-preview .markdown-body .wechat-article-list {
  margin: 12px 0;
  padding-left: 24px;
}

.bytemd-preview .markdown-body .wechat-article-list-item {
  margin: 8px 0;
  line-height: 1.8;
}

.bytemd-preview .markdown-body .wechat-article-code {
  background: #f4ecf7;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

.bytemd-preview .markdown-body .wechat-article-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.bytemd-preview .markdown-body .wechat-article-th,
.bytemd-preview .markdown-body .wechat-article-td {
  border: 1px solid #e8d5f0;
  padding: 10px;
  text-align: left;
}

.bytemd-preview .markdown-body .wechat-article-th {
  background: #f4ecf7;
  font-weight: 600;
}`,
    isDefault: false,
    createdAt: 0,
    updatedAt: 0,
  },
]

/**
 * 获取所有内置模版
 */
export const getBuiltinTemplates = (): Template[] => {
  return builtinTemplates
}

/**
 * 检查是否为内置模版
 */
export const isBuiltinTemplate = (id: string): boolean => {
  return id.startsWith('builtin-')
}

