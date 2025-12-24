import type { BytemdPlugin } from 'bytemd'
import type { Root } from 'hast'

/**
 * ByteMD 插件：为预览内容添加微信文章 class
 */
export default function wechatArticlePlugin(): BytemdPlugin {
  return {
    rehype: (processor) => {
      return processor.use(() => {
        return (tree: Root) => {
          const visit = (node: any) => {
            if (node.type === 'element') {
              const tagName = node.tagName.toLowerCase()
              
              // 为元素添加对应的 class
              if (!node.properties) {
                node.properties = {}
              }
              
              // className 可能是字符串或数组
              let className: string[] = []
              if (typeof node.properties.className === 'string') {
                className = [node.properties.className]
              } else if (Array.isArray(node.properties.className)) {
                className = [...node.properties.className]
              }

              switch (tagName) {
                case 'h1':
                  if (!className.includes('wechat-article-title')) {
                    className.push('wechat-article-title')
                  }
                  break
                case 'h2':
                  if (!className.includes('wechat-article-h2')) {
                    className.push('wechat-article-h2')
                  }
                  break
                case 'h3':
                  if (!className.includes('wechat-article-h3')) {
                    className.push('wechat-article-h3')
                  }
                  break
                case 'p':
                  if (!className.includes('wechat-article-paragraph')) {
                    className.push('wechat-article-paragraph')
                  }
                  break
                case 'blockquote':
                  if (!className.includes('wechat-article-blockquote')) {
                    className.push('wechat-article-blockquote')
                  }
                  break
                case 'ul':
                case 'ol':
                  if (!className.includes('wechat-article-list')) {
                    className.push('wechat-article-list')
                  }
                  break
                case 'li':
                  if (!className.includes('wechat-article-list-item')) {
                    className.push('wechat-article-list-item')
                  }
                  break
                case 'table':
                  if (!className.includes('wechat-article-table')) {
                    className.push('wechat-article-table')
                  }
                  break
                case 'th':
                  if (!className.includes('wechat-article-th')) {
                    className.push('wechat-article-th')
                  }
                  break
                case 'td':
                  if (!className.includes('wechat-article-td')) {
                    className.push('wechat-article-td')
                  }
                  break
                case 'code':
                  if (!className.includes('wechat-article-code')) {
                    className.push('wechat-article-code')
                  }
                  break
                case 'hr':
                  if (!className.includes('wechat-article-hr')) {
                    className.push('wechat-article-hr')
                  }
                  break
              }

              // 为 markdown-body 容器添加 wechat-article class
              if (tagName === 'div' && className.includes('markdown-body')) {
                if (!className.includes('wechat-article')) {
                  className.push('wechat-article')
                }
              }

              node.properties.className = className
            }

            if (node.children && Array.isArray(node.children)) {
              node.children.forEach(visit)
            }
          }

          visit(tree)
          return tree
        }
      })
    },
  }
}

