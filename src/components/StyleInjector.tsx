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

    const updateStyle = () => {
      if (templateId) {
        // 延迟获取，确保模版已保存到 localStorage
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
        } else {
          styleElement.textContent = ''
        }
      } else {
        styleElement.textContent = ''
      }
    }

    // 立即执行一次
    updateStyle()

    // 监听模版更新事件，确保新保存的模版能立即生效
    const handleTemplatesUpdated = () => {
      updateStyle()
    }
    window.addEventListener('templatesUpdated', handleTemplatesUpdated)

    return () => {
      window.removeEventListener('templatesUpdated', handleTemplatesUpdated)
    }
  }, [templateId])

  return null
}

export default StyleInjector

