/**
 * 将 CSS 规则转换为内联样式（使用更强大的方法）
 */
const applyCssAsInlineStyles = (element: HTMLElement, css: string): void => {
  // 创建临时 style 元素来应用 CSS
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  
  // 使用 getComputedStyle 获取计算后的样式
  const computedStyles = window.getComputedStyle(element)
  const styleMap = new Map<string, string>()
  
  // 获取所有 CSS 属性
  for (let i = 0; i < computedStyles.length; i++) {
    const prop = computedStyles[i]
    const value = computedStyles.getPropertyValue(prop)
    if (value) {
      styleMap.set(prop, value)
    }
  }
  
  // 构建内联样式字符串
  let inlineStyle = ''
  styleMap.forEach((value, prop) => {
    // 只保留重要的样式属性（避免复制所有默认样式）
    if (value && value !== 'normal' && value !== 'none' && value !== 'auto') {
      inlineStyle += `${prop}: ${value}; `
    }
  })
  
  // 应用内联样式
  if (inlineStyle) {
    element.setAttribute('style', inlineStyle.trim())
  }
  
  // 清理临时 style 元素
  document.head.removeChild(style)
}

/**
 * 简单的选择器匹配（仅支持基本选择器）
 */
const matchesSelector = (element: HTMLElement, selector: string): boolean => {
  const cleanSelector = selector.trim()
  
  // 类选择器
  if (cleanSelector.startsWith('.')) {
    const className = cleanSelector.substring(1)
    return element.classList.contains(className)
  }
  
  // ID 选择器
  if (cleanSelector.startsWith('#')) {
    return element.id === cleanSelector.substring(1)
  }
  
  // 标签选择器
  if (cleanSelector === element.tagName.toLowerCase()) {
    return true
  }
  
  // 组合选择器（简单处理）
  if (cleanSelector.includes('.')) {
    const parts = cleanSelector.split('.')
    const tagName = parts[0]
    const className = parts[1]
    return element.tagName.toLowerCase() === tagName && element.classList.contains(className)
  }
  
  return false
}

/**
 * 将 CSS 应用到元素及其子元素（使用计算样式方法）
 */
const applyStylesToElement = (element: HTMLElement, css: string): void => {
  // 创建临时容器和样式
  const tempContainer = document.createElement('div')
  tempContainer.style.position = 'absolute'
  tempContainer.style.left = '-9999px'
  tempContainer.style.visibility = 'hidden'
  
  const clonedElement = element.cloneNode(true) as HTMLElement
  tempContainer.appendChild(clonedElement)
  
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  document.body.appendChild(tempContainer)
  
  // 递归处理所有元素
  const processElement = (el: HTMLElement, originalEl: HTMLElement) => {
    // 获取计算后的样式
    const computed = window.getComputedStyle(el)
    const inlineStyle: string[] = []
    
    // 提取重要的样式属性
    const importantProps = [
      'color', 'font-size', 'font-weight', 'font-family', 'line-height',
      'text-align', 'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
      'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
      'background', 'background-color', 'border', 'border-radius', 'border-color', 'border-width', 'border-style',
      'width', 'max-width', 'display', 'text-decoration', 'text-indent'
    ]
    
    importantProps.forEach(prop => {
      const value = computed.getPropertyValue(prop)
      if (value && value !== 'normal' && value !== 'none' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)') {
        // 转换 CSS 属性名为内联样式格式（camelCase）
        const inlineProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        inlineStyle.push(`${inlineProp}: ${value}`)
      }
    })
    
    // 应用内联样式到原始元素
    if (inlineStyle.length > 0) {
      const existingStyle = originalEl.getAttribute('style') || ''
      originalEl.setAttribute('style', existingStyle + (existingStyle ? '; ' : '') + inlineStyle.join('; '))
    }
    
    // 处理子元素
    const children = Array.from(el.children)
    const originalChildren = Array.from(originalEl.children)
    children.forEach((child, index) => {
      if (originalChildren[index]) {
        processElement(child as HTMLElement, originalChildren[index] as HTMLElement)
      }
    })
  }
  
  processElement(clonedElement, element)
  
  // 清理
  document.head.removeChild(style)
  document.body.removeChild(tempContainer)
}

import { getTemplateById } from './templateStorage'
import { processContent } from './htmlGenerator'

/**
 * 生成微信公众号格式的 HTML（内联样式，无 class）
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

  // 从预览区域获取 HTML（包含所有样式类）
  let html = ''
  const preview = document.querySelector('.bytemd-preview .markdown-body')
  if (preview) {
    const cloned = preview.cloneNode(true) as HTMLElement
    if (!cloned.classList.contains('wechat-article')) {
      cloned.classList.add('wechat-article')
    }
    cloned.classList.remove('markdown-body')
    html = cloned.outerHTML
  } else {
    // 如果无法从预览获取，使用 processContent 生成
    html = processContent(content, isMarkdown)
    if (!html.includes('class="wechat-article"') && !html.includes("class='wechat-article'")) {
      html = `<div class="wechat-article">${html}</div>`
    }
  }

  // 创建临时 DOM 来应用样式
  const tempDiv = document.createElement('div')
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  tempDiv.innerHTML = html
  document.body.appendChild(tempDiv)
  
  const articleElement = tempDiv.querySelector('.wechat-article') as HTMLElement
  
  if (articleElement && css) {
    // 应用 CSS 到元素（转换为内联样式）
    applyStylesToElement(articleElement, css)
  }

  // 获取处理后的 HTML
  let finalHtml = articleElement ? articleElement.outerHTML : html

  // 清理：移除 class 和 id 属性（微信公众号不需要）
  const parser = new DOMParser()
  const doc = parser.parseFromString(finalHtml, 'text/html')
  const body = doc.body
  
  const removeAttributes = (element: Element) => {
    element.removeAttribute('class')
    element.removeAttribute('id')
    // 移除 data-* 属性
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        element.removeAttribute(attr.name)
      }
    })
    Array.from(element.children).forEach(child => {
      removeAttributes(child)
    })
  }
  
  removeAttributes(body)
  
  // 清理临时元素
  document.body.removeChild(tempDiv)
  
  return body.innerHTML
}

