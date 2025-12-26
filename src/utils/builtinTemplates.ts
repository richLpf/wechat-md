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
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bytemd-preview .markdown-body pre .wechat-article-code {
  background: transparent;
  padding: 0;
  color: inherit;
  display: inline;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block {
  background: #f5f5f5;
  padding: 14px 10px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #333;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-bottom: 20px;
  overflow-x: auto;
  line-height: 1.6;
  border: 1px solid #e0e0e0;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示 */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #d73a49;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #032f62;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
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
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bytemd-preview .markdown-body pre .wechat-article-code {
  background: transparent;
  padding: 0;
  color: inherit;
  display: inline;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block {
  background: #ecf0f1;
  padding: 14px 10px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #2c3e50;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-bottom: 20px;
  overflow-x: auto;
  line-height: 1.6;
  border: 1px solid #d0d7de;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示 */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #d73a49;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #032f62;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
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
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bytemd-preview .markdown-body pre .wechat-article-code {
  background: transparent;
  padding: 0;
  color: inherit;
  display: inline;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block {
  background: #fff5f0;
  padding: 14px 10px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #333;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-bottom: 20px;
  overflow-x: auto;
  line-height: 1.6;
  border: 1px solid #ffe5d4;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示 */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #d73a49;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #032f62;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
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
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bytemd-preview .markdown-body pre .wechat-article-code {
  background: transparent;
  padding: 0;
  color: inherit;
  display: inline;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block {
  background: #f4ecf7;
  padding: 14px 10px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  color: #333;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-bottom: 20px;
  overflow-x: auto;
  line-height: 1.6;
  border: 1px solid #e8d5f0;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示 */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #d73a49;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #032f62;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
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
  {
    id: 'builtin-science-purple',
    name: '科技紫',
    css: `.bytemd-preview .markdown-body.wechat-article {
  font-size: 16px;
  line-height: 1.8;
  max-width: 677px;
  margin: 0 auto;
  color: #333;
  padding: 20px;
  background-color: #ffffff;
  font-family: -apple-system-font, system-ui, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 26px;
  font-weight: bold;
  color: #7c3aed;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 30px;
  padding: 0 10px;
}

.bytemd-preview .markdown-body .wechat-article-h2 {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  background-color: #7c3aed;
  display: inline-block;
  padding: 5px 15px;
  border-radius: 4px;
  margin: 30px 0 20px;
  box-shadow: 2px 2px 10px rgba(124, 58, 237, 0.2);
}

.bytemd-preview .markdown-body .wechat-article-h3 {
  font-size: 19px;
  font-weight: bold;
  color: #7c3aed;
  border-left: 4px solid #7c3aed;
  padding-left: 12px;
  margin: 25px 0 15px;
}

.bytemd-preview .markdown-body .wechat-article-paragraph {
  font-size: 16px;
  line-height: 1.8;
  color: #3f3f3f;
  margin-bottom: 20px;
  text-align: justify;
}

.bytemd-preview .markdown-body .wechat-article-blockquote {
  border-left: 5px solid #7c3aed;
  background-color: #f5f3ff;
  padding: 15px 20px;
  margin: 20px 0;
  color: #555;
  border-radius: 0 4px 4px 0;
}

.bytemd-preview .markdown-body .wechat-article-list {
  padding-left: 20px;
  margin: 20px 0;
}

.bytemd-preview .markdown-body .wechat-article-list-item {
  position: relative;
  list-style: none;
  padding-left: 20px;
  margin-bottom: 10px;
}

.bytemd-preview .markdown-body .wechat-article-list-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #7c3aed;
  font-weight: bold;
}

.bytemd-preview .markdown-body .wechat-article-code {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 14px;
  background-color: #f6f8fa;  
  color: #7c3aed;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #eaecef;
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bytemd-preview .markdown-body pre .wechat-article-code {
  background: transparent;
  padding: 0;
  color: inherit;
  border: none;
  display: inline;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block {
  background-color: #2d2d2d;
  color: #ccc;
  padding: 14px 10px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  line-height: 1.5;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  border: 1px solid #1a1a1a;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示（深色主题） */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #c792ea;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #c3e88d;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #546e7a;
  font-style: italic;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示 */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #d73a49;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #032f62;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.bytemd-preview .markdown-body .wechat-article-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  overflow-x: auto;
  display: block;
}

.bytemd-preview .markdown-body .wechat-article-th {
  background-color: #7c3aed;
  color: white;
  padding: 12px 15px;
  text-align: left;
  border: 1px solid #ddd;
}

.bytemd-preview .markdown-body .wechat-article-td {
  padding: 10px 15px;
  border: 1px solid #eee;
  font-size: 14px;
}

.bytemd-preview .markdown-body .wechat-article-table tr:nth-child(even) {
  background-color: #fafafa;
}

.wechat-article-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  color: #7c3aed;
}`,
    isDefault: false,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-modern-purple',
    name: '现代紫',
    css: `.bytemd-preview .markdown-body.wechat-article {
  font-size: 16px;
  line-height: 1.8;
  max-width: 677px;
  margin: 0 auto;
  color: #333;
  word-break: break-word;
  font-family: -apple-system-font, system-ui, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 24px;
  font-weight: 600;
  color: #222;
  text-align: center;
  margin: 32px 0 24px;
  line-height: 1.4;
}

.bytemd-preview .markdown-body .wechat-article-h2 {
  font-size: 20px;
  font-weight: bold;
  color: #7c3aed;
  margin: 40px 0 16px;
  padding-bottom: 4px;
  border-bottom: 2px solid #7c3aed;
  display: inline-block;
}

.bytemd-preview .markdown-body .wechat-article-h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
}

.bytemd-preview .markdown-body .wechat-article-h3::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: #7c3aed;
  margin-right: 8px;
  border-radius: 2px;
}

.bytemd-preview .markdown-body .wechat-article-paragraph {
  margin: 0 0 1.6em;
  color: #3e3e3e;
  letter-spacing: 0.5px;
  text-align: justify;
}

.bytemd-preview .markdown-body .wechat-article-blockquote {
  margin: 20px 0;
  padding: 12px 16px;
  border-left: 3px solid #7c3aed;
  background-color: #f9f7ff;
  color: #666;
  font-size: 15px;
}

.bytemd-preview .markdown-body .wechat-article-list {
  margin: 16px 0;
  padding-left: 24px;
}

.bytemd-preview .markdown-body .wechat-article-list-item {
  margin-bottom: 8px;
  color: #444;
  position: relative;
}

.bytemd-preview .markdown-body .wechat-article-code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 14px;
  background-color: #f6f6f6;
  color: #7c3aed;
  padding: 2px 6px;
  border-radius: 3px;
  margin: 0 2px;
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.bytemd-preview .markdown-body pre .wechat-article-code {
  background: transparent;
  padding: 0;
  color: inherit;
  margin: 0;
  display: inline;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 14px;
  background-color: #f6f6f6;
  color: #333;
  padding: 14px 10px;
  border-radius: 3px;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-bottom: 20px;
  overflow-x: auto;
  line-height: 1.6;
  border: 1px solid #e0e0e0;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

/* 确保 highlight.js 的语法高亮样式在代码块中正确显示 */
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs {
  background: transparent;
  color: inherit;
  padding: 0;
  display: block;
  overflow-x: auto;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-keyword,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-selector-tag,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-built_in,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-name {
  color: #d73a49;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-string,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-title,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-section {
  color: #032f62;
}

.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-comment,
.bytemd-preview .markdown-body pre.wechat-article-code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.bytemd-preview .markdown-body .wechat-article-table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #eee;
}

.bytemd-preview .markdown-body .wechat-article-th {
  background-color: #7c3aed;
  color: #ffffff;
  padding: 12px;
  font-weight: bold;
  border: 1px solid #7c3aed;
}

.bytemd-preview .markdown-body .wechat-article-td {
  padding: 10px 12px;
  border: 1px solid #eee;
  font-size: 14px;
  text-align: left;
}

.bytemd-preview .markdown-body .wechat-article-table tr:nth-child(even) {
  background-color: #fafafa;
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

