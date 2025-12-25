import { getTemplateById } from './templateStorage'
import { convertImageUrl } from './imageStorage'
// @ts-ignore - juice 可能没有类型定义
import juice from 'juice'

/**
 * 允许的 HTML 标签白名单
 */
const ALLOWED_TAGS = new Set([
  'section', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'img', 'hr',
  'strong', 'em', 'a', 'br', 'span'
])

/**
 * 清理和验证 HTML 元素（保留原有结构，只清理不允许的内容）
 */
const cleanElement = (element: Element, depth: number = 0): Element | null => {
  // 最大嵌套深度 3 层
  if (depth > 3) {
    return null
  }
  
  const tagName = element.tagName.toLowerCase()
  
  // 只保留允许的标签
  if (!ALLOWED_TAGS.has(tagName)) {
    // 如果不允许，尝试提取文本内容
    const text = element.textContent || ''
    if (text.trim()) {
      const p = document.createElement('p')
      p.textContent = text.trim()
      return p
    }
    return null
  }
  
  // 克隆元素（保留原有结构）
  const newElement = element.cloneNode(false) as HTMLElement
  
  // 处理 img 标签
  if (tagName === 'img') {
    const src = element.getAttribute('src')
    const alt = element.getAttribute('alt') || ''
    if (src) {
      newElement.setAttribute('src', src)
    }
    newElement.setAttribute('alt', alt)
    return newElement
  }
  
  // 处理嵌套规则
  if (tagName === 'ul' || tagName === 'ol') {
    // ul/ol 内只能包含 li
    Array.from(element.children).forEach(child => {
      if (child.tagName.toLowerCase() === 'li') {
        const cleaned = cleanElement(child, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      }
    })
    // 如果没有 li，返回 null
    if (newElement.children.length === 0) {
      return null
    }
    return newElement
  }
  
  if (tagName === 'blockquote') {
    // blockquote 内只能包含 p
    Array.from(element.children).forEach(child => {
      if (child.tagName.toLowerCase() === 'p') {
        const cleaned = cleanElement(child, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      } else {
        // 如果不是 p，包装成 p
        const text = child.textContent || ''
        if (text.trim()) {
          const p = document.createElement('p')
          p.textContent = text.trim()
          newElement.appendChild(p)
        }
      }
    })
    // 如果没有内容，返回 null
    if (newElement.children.length === 0) {
      return null
    }
    return newElement
  }
  
  // 其他标签：递归处理子元素
  Array.from(element.children).forEach(child => {
    const cleaned = cleanElement(child, depth + 1)
    if (cleaned) {
      newElement.appendChild(cleaned)
    }
  })
  
  // 如果没有子元素，保留文本内容
  if (newElement.children.length === 0) {
    const text = element.textContent || ''
    if (text.trim()) {
      newElement.textContent = text.trim()
    } else {
      // 如果既没有子元素也没有文本，返回 null（除了自闭合标签）
      if (!['br', 'hr', 'img'].includes(tagName)) {
        return null
      }
    }
  }
  
  return newElement
}

/**
 * 应用特殊规则样式
 */
const applySpecialRules = (element: HTMLElement): void => {
  const tagName = element.tagName.toLowerCase()
  const existingStyle = element.getAttribute('style') || ''
  const styles: string[] = []
  
  // 特殊规则：所有 <p> 内文本对齐 justify，letter-spacing 0.5px
  if (tagName === 'p') {
    if (!existingStyle.includes('text-align')) {
      styles.push('text-align: justify')
    }
    if (!existingStyle.includes('letter-spacing')) {
      styles.push('letter-spacing: 0.5px')
    }
  }
  
  // 移除强制覆盖 h2 样式的规则，保留模版原本的样式特色
  // 注释：之前强制为所有 h2 应用红色背景，这会覆盖模版样式
  // 如果需要统一 h2 样式，应该在模版 CSS 中定义，而不是在这里强制覆盖
  // if (tagName === 'h2') {
  //   if (!existingStyle.includes('background-color')) {
  //     styles.push('background-color: #C00000')
  //   }
  //   if (!existingStyle.includes('color')) {
  //     styles.push('color: #ffffff')
  //   }
  //   if (!existingStyle.includes('text-align')) {
  //     styles.push('text-align: center')
  //   }
  //   if (!existingStyle.includes('padding')) {
  //     styles.push('padding: 8px 24px')
  //   }
  //   if (!existingStyle.includes('border-radius')) {
  //     styles.push('border-radius: 4px')
  //   }
  // }
  
  // 应用特殊规则样式
  if (styles.length > 0) {
    element.setAttribute('style', (existingStyle ? existingStyle + '; ' : '') + styles.join('; '))
  }
  
  // 递归处理子元素
  Array.from(element.children).forEach(child => {
    applySpecialRules(child as HTMLElement)
  })
}

/**
 * 生成微信公众号格式的 HTML（使用 juice 转换 CSS 为内联样式）
 */
export const generateWechatHtml = (
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

  // 从预览区域获取 HTML
  let html = ''
  const preview = document.querySelector('.bytemd-preview .markdown-body')
  if (preview) {
    const cloned = preview.cloneNode(true) as HTMLElement
    
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
    
    html = cloned.outerHTML
  } else {
    console.warn('未找到预览区域')
    return ''
  }

  if (!html) {
    console.warn('HTML 内容为空')
    return ''
  }

  // 解析 HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body
  
  // 找到文章容器
  let articleElement = body.querySelector('.wechat-article') as HTMLElement
  if (!articleElement && body.firstElementChild) {
    articleElement = body.firstElementChild as HTMLElement
  }
  
  if (!articleElement) {
    console.warn('未找到文章容器')
    return ''
  }
  
  // 注意：在清理之前，先保留 class，因为 juice 需要 class 来匹配 CSS 规则
  // 构建完整的 HTML 文档（包含 CSS）
  // 需要将 .bytemd-preview .markdown-body 前缀从 CSS 中移除，因为 juice 需要匹配实际的 class
  let processedCss = css
  
  // 移除 .bytemd-preview .markdown-body 前缀，让 CSS 选择器能匹配到元素
  // 关键：需要处理两种格式：
  // 1. 连写格式：.bytemd-preview .markdown-body.wechat-article （没有空格）
  // 2. 空格分隔：.bytemd-preview .markdown-body .wechat-article-title （有空格）
  
  // 先处理连写情况：.bytemd-preview .markdown-body.wechat-article -> .wechat-article
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\./g, '.')
  
  // 处理空格分隔情况：.bytemd-preview .markdown-body .wechat-article-title -> .wechat-article-title
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+/g, '')
  
  // 处理剩余的 .bytemd-preview 前缀
  processedCss = processedCss.replace(/\.bytemd-preview\s+/g, '')
  
  // 处理剩余的 .markdown-body 前缀（空格分隔）
  processedCss = processedCss.replace(/\.markdown-body\s+/g, '')
  
  // 处理剩余的 .markdown-body 前缀（连写）
  processedCss = processedCss.replace(/\.markdown-body\./g, '.')
  
  // 调试：输出处理后的 CSS 预览
  console.log('CSS 前缀移除前长度:', css.length)
  console.log('CSS 前缀移除后长度:', processedCss.length)
  console.log('处理后的 CSS 预览（前 500 字符）:', processedCss.substring(0, 500))
  
  // 先不清理，保留 class 以便 juice 匹配样式
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
${processedCss}
  </style>
</head>
<body>
${articleElement.outerHTML}
</body>
</html>`
  
  console.log('准备处理的 HTML 预览:', fullHtml.substring(0, 500))
  console.log('处理后的 CSS 长度:', processedCss.length)
  
  // 使用 juice 将 CSS 转换为内联样式
  let result = ''
  try {
    result = juice(fullHtml, {
      removeStyleTags: true, // 移除 <style> 标签
      preserveMediaQueries: false, // 不保留媒体查询
      preserveFontFaces: false, // 不保留 @font-face
      preserveKeyFrames: false, // 不保留 @keyframes
      stripImportant: false, // 保留 !important
      xmlMode: false, // HTML 模式
      preserveImportant: true, // 保留 !important
      webResources: {
        images: false, // 不处理图片资源
        svgs: false, // 不处理 SVG
        scripts: false, // 不处理脚本
        links: false // 不处理链接
      }
    })
    
    console.log('juice 处理后的完整 HTML 长度:', result.length)
    console.log('juice 处理后的 HTML 预览（前 800 字符）:', result.substring(0, 800))
    
    // 从结果中提取 body 内容
    const resultDoc = parser.parseFromString(result, 'text/html')
    const resultBody = resultDoc.body
    
    // 获取 body 中的内容
    result = resultBody.innerHTML
    
    // 检查样式应用情况
    const tempCheck = document.createElement('div')
    tempCheck.innerHTML = result
    const elementsWithStyle = tempCheck.querySelectorAll('[style]')
    console.log(`juice 转换后，找到 ${elementsWithStyle.length} 个带内联样式的元素`)
    
    // 统计不同元素的样式应用情况
    const styleStats: Record<string, number> = {}
    elementsWithStyle.forEach(el => {
      const tagName = el.tagName.toLowerCase()
      styleStats[tagName] = (styleStats[tagName] || 0) + 1
    })
    console.log('样式应用统计:', styleStats)
    
    // 应用特殊规则
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = result
    applySpecialRules(tempDiv)
    result = tempDiv.innerHTML
    
    console.log('应用特殊规则后的 HTML 预览（前 500 字符）:', result.substring(0, 500))
    
  } catch (error) {
    console.error('juice 处理失败:', error)
    // 降级方案：直接返回清理后的 HTML
    result = articleElement.outerHTML
  }
  
  // 现在清理 HTML（移除不允许的标签）
  const tempDiv2 = document.createElement('div')
  tempDiv2.innerHTML = result
  const cleanedElement = cleanElement(tempDiv2.firstElementChild || tempDiv2, 0)
  if (!cleanedElement) {
    console.warn('清理后的元素为空')
    return ''
  }
  
  // 将外层容器改为 <section>，并添加微信公众号所需的基础样式
  const finalDoc = parser.parseFromString(cleanedElement.outerHTML, 'text/html')
  const finalBody = finalDoc.body
  let rootElement = finalBody.firstElementChild || finalBody
  
  // 如果是 div，改为 section
  if (rootElement.tagName.toLowerCase() === 'div') {
    const section = document.createElement('section')
    // 复制所有子元素
    Array.from(rootElement.children).forEach(child => {
      section.appendChild(child.cloneNode(true))
    })
    // 如果没有子元素，复制文本内容
    if (section.children.length === 0 && rootElement.textContent) {
      section.textContent = rootElement.textContent
    }
    rootElement = section
  } else if (rootElement.tagName.toLowerCase() !== 'section') {
    // 如果不是 section 也不是 div，包装成 section
    const section = document.createElement('section')
    section.appendChild(rootElement.cloneNode(true))
    rootElement = section
  }
  
  // 添加微信公众号所需的基础样式到 section
  const existingStyle = rootElement.getAttribute('style') || ''
  const baseStyles: Record<string, string> = {
    'font-size': '16px',
    'color': '#333',
    'line-height': '1.6',
    'word-spacing': '0px',
    'letter-spacing': '0px',
    'word-break': 'break-word',
    'word-wrap': 'break-word',
    'text-align': 'justify',
    'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  }
  
  // 解析现有样式
  const styleMap = new Map<string, string>()
  if (existingStyle) {
    existingStyle.split(';').forEach(style => {
      const trimmed = style.trim()
      if (trimmed) {
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex > 0) {
          const prop = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()
          styleMap.set(prop, value)
        }
      }
    })
  }
  
  // 合并样式：优先保留模版已内联的样式，只在缺失时才应用基础样式
  const allStyles: string[] = []
  
  // 先添加模版已有的样式（这些是 juice 转换后的模版样式，优先级最高）
  styleMap.forEach((value, prop) => {
    allStyles.push(`${prop}: ${value}`)
  })
  
  // 再添加缺失的基础样式（只在模版没有定义时才添加）
  Object.entries(baseStyles).forEach(([prop, value]) => {
    if (!styleMap.has(prop)) {
      allStyles.push(`${prop}: ${value}`)
    }
  })
  
  // 应用合并后的样式
  if (allStyles.length > 0) {
    rootElement.setAttribute('style', allStyles.join('; '))
  }
  
  // 移除所有 class 和 id 属性（但保留 style）
  const removeAttributes = (element: Element) => {
    element.removeAttribute('class')
    element.removeAttribute('id')
    // 移除 data-* 属性（但保留 data-tool 等微信公众号需要的）
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-tool' && attr.name !== 'data-website') {
        element.removeAttribute(attr.name)
      }
    })
    Array.from(element.children).forEach(child => {
      removeAttributes(child)
    })
  }
  
  // 移除属性
  removeAttributes(rootElement)
  result = rootElement.outerHTML
  
  // 最终调试输出
  console.log('=== 最终生成的 HTML ===')
  console.log('HTML 总长度:', result.length)
  console.log('HTML 预览（前 800 字符）:', result.substring(0, 800))
  
  // 检查最终结果中的样式情况
  const finalCheck = document.createElement('div')
  finalCheck.innerHTML = result
  const finalElementsWithStyle = finalCheck.querySelectorAll('[style]')
  console.log(`最终 HTML 中有 ${finalElementsWithStyle.length} 个带内联样式的元素`)
  
  // 如果结果为空或太短，返回警告
  if (!result || result.trim().length < 10) {
    console.error('生成的 HTML 为空或太短')
    return ''
  }
  
  return result
}
