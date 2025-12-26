/**
 * 将 HTML 字符串转换为带指定 class 的 HTML
 */
export const addWechatClasses = (html: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // 创建外层容器
  const container = doc.createElement('div')
  container.className = 'wechat-article'

  // 递归处理元素，添加 class
  const processElement = (element: Element): void => {
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case 'h1':
        element.className = 'wechat-article-title'
        break
      case 'h2':
        element.className = 'wechat-article-h2'
        break
      case 'h3':
        element.className = 'wechat-article-h3'
        break
      case 'p':
        element.className = 'wechat-article-paragraph'
        break
      case 'blockquote':
        element.className = 'wechat-article-blockquote'
        break
      case 'ul':
      case 'ol':
        element.className = 'wechat-article-list'
        break
      case 'li':
        element.className = 'wechat-article-list-item'
        break
      case 'table':
        element.className = 'wechat-article-table'
        break
      case 'th':
        element.className = 'wechat-article-th'
        break
      case 'td':
        element.className = 'wechat-article-td'
        break
      case 'pre':
        // 检查是否是代码块（包含 code 子元素或直接包含文本）
        const hasCodeChild = element.querySelector('code') !== null
        if (hasCodeChild || element.textContent?.trim()) {
          element.className = 'wechat-article-code-block'
        }
        break
      case 'code':
        element.className = 'wechat-article-code'
        break
      case 'hr':
        element.className = 'wechat-article-hr'
        break
    }

    // 递归处理子元素
    Array.from(element.children).forEach(child => {
      processElement(child as Element)
    })
  }

  // 处理 body 中的所有子元素
  if (body.children.length > 0) {
    Array.from(body.children).forEach(child => {
      processElement(child as Element)
      container.appendChild(child.cloneNode(true))
    })
  } else {
    // 如果没有子元素，直接使用 body 的内容并处理
    const tempDiv = doc.createElement('div')
    tempDiv.innerHTML = body.innerHTML
    Array.from(tempDiv.children).forEach(child => {
      processElement(child as Element)
    })
    container.innerHTML = tempDiv.innerHTML
  }

  return container.outerHTML
}

/**
 * 清理 HTML，移除行内样式
 */
export const cleanHtml = (html: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const removeInlineStyles = (element: Element): void => {
    element.removeAttribute('style')
    Array.from(element.children).forEach(child => {
      removeInlineStyles(child as Element)
    })
  }

  removeInlineStyles(body)
  return body.innerHTML
}

/**
 * 统一处理函数：将 Markdown 或 HTML 转换为带 class 的 HTML
 */
export const processContent = (content: string, isMarkdown: boolean): string => {
  let html = content
  
  if (isMarkdown) {
    // 如果是 Markdown，需要先转换为 HTML
    // 使用简单的转换，完整功能由 bytemd 编辑器处理
    html = convertMarkdownToHtml(content)
  }
  
  // 处理本地图片：将 local:// 转换为 data URL
  // 注意：这里只处理 HTML 中的图片，Markdown 中的图片在 convertMarkdownToHtml 中处理
  // 由于 processContent 是同步函数，图片转换在导出时由其他函数处理
  // 这里只保留 local:// 协议，实际转换在导出时进行
  
  // 清理 HTML（移除行内样式）
  html = cleanHtml(html)
  
  // 添加微信文章 class
  html = addWechatClasses(html)
  
  return html
}

/**
 * 简单的 Markdown 转 HTML（用于基本转换）
 * 注意：完整功能由 bytemd 编辑器处理
 */
const convertMarkdownToHtml = (markdown: string): string => {
  let html = markdown
    // 代码块
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // 图片（保留 local:// 协议，后续处理）
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img alt="$1" src="$2" />')
    // 水平线
    .replace(/^---$/gim, '<hr />')
    .replace(/^\*\*\*$/gim, '<hr />')

  // 处理引用
  const blockquoteRegex = /^> (.*$)/gim
  html = html.replace(blockquoteRegex, '<blockquote>$1</blockquote>')

  // 处理列表
  const lines = html.split('\n')
  let inList = false
  let listType = ''
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const ulMatch = line.match(/^[\*\-\+] (.*)$/)
    const olMatch = line.match(/^\d+\. (.*)$/)

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ul>')
        inList = true
        listType = 'ul'
      }
      processedLines.push(`<li>${ulMatch[1]}</li>`)
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ol>')
        inList = true
        listType = 'ol'
      }
      processedLines.push(`<li>${olMatch[1]}</li>`)
    } else {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = ''
      }
      if (line.trim() && !line.match(/^<[^>]+>$/)) {
        processedLines.push(`<p>${line}</p>`)
      } else {
        processedLines.push(line)
      }
    }
  }

  if (inList) {
    processedLines.push(`</${listType}>`)
  }

  html = processedLines.join('\n')

  return html
}

