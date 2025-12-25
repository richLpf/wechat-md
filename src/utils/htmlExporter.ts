import { getTemplateById } from './templateStorage'
import { processContent } from './htmlGenerator'
import { generateWechatHtml } from './wechatFormatter'
import { convertImageUrl } from './imageStorage'

/**
 * 从预览区域获取 HTML 内容
 */
export const getPreviewHtml = (): string => {
  const preview = document.querySelector('.bytemd-preview')
  if (preview) {
    const previewContent = preview.querySelector('.markdown-body')
    if (previewContent) {
      // 克隆元素以避免修改原始 DOM
      const cloned = previewContent.cloneNode(true) as HTMLElement
      
      // 确保有 wechat-article 类
      if (!cloned.classList.contains('wechat-article')) {
        cloned.classList.add('wechat-article')
      }
      
      // 移除 markdown-body 类（这是 bytemd 的容器类，不需要在导出的 HTML 中）
      cloned.classList.remove('markdown-body')
      
      // 处理本地图片：将 local:// 转换为 data URL
      const images = cloned.querySelectorAll('img[src^="local://"]')
      images.forEach((img) => {
        const src = img.getAttribute('src')
        if (src) {
          const dataUrl = convertImageUrl(src)
          if (dataUrl && dataUrl !== src) {
            img.setAttribute('src', dataUrl)
          }
        }
      })
      
      return cloned.outerHTML
    }
  }
  return ''
}

/**
 * 生成完整的 HTML（包含样式和内容）
 */
export const generateFullHtml = (
  content: string,
  isMarkdown: boolean,
  templateId: string | null
): string => {
  // 获取模版的 CSS
  let css = ''
  if (templateId) {
    const template = getTemplateById(templateId)
    if (template && template.css) {
      css = template.css.trim()
    }
  }

  // 优先从预览区域获取 HTML（更准确）
  let html = getPreviewHtml()
  
  // 如果无法从预览区域获取，则使用 processContent 生成
  if (!html) {
    html = processContent(content, isMarkdown)
    // 如果 html 已经包含 wechat-article 容器，直接使用；否则包装
    if (!html.includes('class="wechat-article"') && !html.includes("class='wechat-article'")) {
      html = `<div class="wechat-article">${html}</div>`
    }
  }

  // 生成完整的 HTML 文档
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>微信文章</title>
  <style>
${css ? css : '/* 未选择样式模版 */'}
  </style>
</head>
<body>
${html}
</body>
</html>`

  return fullHtml
}

/**
 * 生成仅内容 HTML（不包含完整文档结构）
 */
export const generateContentHtml = (
  content: string,
  isMarkdown: boolean
): string => {
  let html = processContent(content, isMarkdown)
  
  // 如果 html 已经包含 wechat-article 容器，直接使用；否则包装
  if (!html.includes('class="wechat-article"') && !html.includes("class='wechat-article'")) {
    html = `<div class="wechat-article">${html}</div>`
  }
  
  return html
}

/**
 * 生成微信公众号格式的 HTML（内联样式）
 */
export const generateWechatFormatHtml = (
  content: string,
  isMarkdown: boolean,
  templateId: string | null
): string => {
  return generateWechatHtml(content, isMarkdown, templateId)
}

