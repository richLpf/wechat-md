import { useEffect } from 'react'
import { getTemplateById } from '../utils/templateStorage'

interface StyleInjectorProps {
  templateId: string | null
}

const StyleInjector: React.FC<StyleInjectorProps> = ({ templateId }) => {
  useEffect(() => {
    const styleId = 'template-style'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    if (templateId) {
      const template = getTemplateById(templateId)
      if (template && template.css) {
        let css = template.css.trim()
        
        // 如果 CSS 中没有包含 .bytemd-preview 或 .markdown-body，自动添加作用域
        if (css && !css.includes('.bytemd-preview') && !css.includes('.markdown-body')) {
          // 为所有选择器添加 .bytemd-preview .markdown-body 前缀（跳过 @media 等规则）
          css = css.replace(/([^{}]+)\{/g, (match, selector) => {
            const trimmed = selector.trim()
            // 跳过 @ 规则和已经包含作用域的选择器
            if (trimmed.startsWith('@') || trimmed.includes('.bytemd-preview') || trimmed.includes('.markdown-body')) {
              return match
            }
            // 添加作用域
            return `.bytemd-preview .markdown-body ${trimmed} {`
          })
        }
        
        styleElement.textContent = css
        console.log('样式已注入:', template.name)
      } else {
        styleElement.textContent = ''
        console.log('模版不存在或 CSS 为空，templateId:', templateId)
      }
    } else {
      styleElement.textContent = ''
      console.log('未选择模版')
    }

    return () => {
      // 清理函数：组件卸载时不移除 style 标签，因为可能其他组件还在使用
      // 只清空内容
    }
  }, [templateId])

  return null
}

export default StyleInjector

