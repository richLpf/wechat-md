import type { BytemdPlugin } from 'bytemd'
import type { Root } from 'hast'
import { saveImage, convertImageUrl, getStoredImages } from './imageStorage'

/**
 * 插入图片到编辑器
 */
const insertImageToEditor = async (ctx: any, file: File) => {
  try {
    // 保存图片
    const imageId = await saveImage(file)
    if (!imageId) {
      alert('图片保存失败')
      return
    }

    // 插入 Markdown 图片语法
    const fileName = file.name || `screenshot-${Date.now()}.png`
    const markdown = `![${fileName}](local://${imageId})\n`
    
    // 获取当前光标位置和文档对象
    const cursor = ctx.editor.getCursor()
    const doc = ctx.editor.getDoc()
    
    // 兼容 CodeMirror 5 和 6
    if (doc && typeof doc.replaceRange === 'function') {
      // CodeMirror 5 API
      doc.replaceRange(markdown, cursor)
      
      // 移动光标到插入文本的末尾
      const lines = markdown.split('\n')
      const newLine = cursor.line + lines.length - 1
      const newCh = lines[lines.length - 1].length
      doc.setCursor({ line: newLine, ch: newCh })
    } else if (doc && typeof doc.replace === 'function') {
      // CodeMirror 6 API - 使用事务
      const from = typeof cursor === 'object' && 'line' in cursor 
        ? doc.line(cursor.line).from + cursor.ch 
        : cursor
      const to = from
      doc.replace(markdown, from, to)
    } else {
      // 降级方案：使用编辑器 API
      if (ctx.editor.insertText && typeof ctx.editor.insertText === 'function') {
        ctx.editor.insertText(markdown)
      } else {
        console.error('无法插入文本：不支持的编辑器 API')
        alert('无法插入图片，请手动粘贴')
        return
      }
    }
    
    ctx.editor.focus()
  } catch (error: any) {
    alert(error.message || '图片保存失败')
  }
}

/**
 * ByteMD 图片上传插件
 * 支持拖拽上传、点击上传和剪贴板粘贴图片到本地存储
 */
export default function imageUploadPlugin(): BytemdPlugin {
  return {
    rehype: (processor) => {
      return processor.use(() => {
        return (tree: Root) => {
          const visit = (node: any) => {
            if (node.type === 'element' && node.tagName === 'img') {
              // 处理图片标签，将 local:// URL 转换为 data URL
              if (node.properties && node.properties.src) {
                const src = node.properties.src as string
                if (src && src.startsWith('local://')) {
                  const dataUrl = convertImageUrl(src)
                  if (dataUrl && dataUrl !== src) {
                    node.properties.src = dataUrl
                  }
                }
              }
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
    actions: [
      {
        title: '上传图片',
        icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
        handler: {
          type: 'action',
          click: (ctx) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.multiple = false
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (!file) return
              await insertImageToEditor(ctx, file)
            }
            input.click()
          },
        },
      },
    ],
    editorEffect({ editor, codemirror }) {
      // 监听粘贴事件
      const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items || items.length === 0) return

        // 检查是否有图片数据
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          
          // 如果是图片类型
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault() // 阻止默认粘贴行为
            e.stopPropagation() // 阻止事件冒泡
            e.stopImmediatePropagation() // 阻止其他监听器
            
            const file = item.getAsFile()
            if (!file) continue

            // 获取编辑器上下文
            // 尝试多种方式获取 CodeMirror 实例
            let cm: any = codemirror
            if (!cm && (editor as any)?.codemirror) {
              cm = (editor as any).codemirror
            }

            if (!cm) {
              console.error('无法获取 CodeMirror 实例')
              return
            }

            const ctx = {
              editor: {
                getCursor: () => cm.getCursor ? cm.getCursor() : cm.state.selection.main.head,
                getDoc: () => cm.getDoc ? cm.getDoc() : cm.state.doc,
                focus: () => cm.focus ? cm.focus() : (editor as any)?.focus?.(),
              }
            }

            await insertImageToEditor(ctx, file)
            return
          }
        }
      }

      // 获取编辑器元素 - 尝试多种方式
      const getEditorElement = (): HTMLElement | null => {
        // 方式1: 尝试 CodeMirror 5 API
        if (codemirror && typeof (codemirror as any).getWrapperElement === 'function') {
          return (codemirror as any).getWrapperElement()
        }
        // 方式2: 尝试 CodeMirror 6 API
        if (codemirror && (codemirror as any).dom) {
          return (codemirror as any).dom
        }
        // 方式3: 通过 DOM 查询
        const editorContainer = document.querySelector('.bytemd-editor')
        if (editorContainer) {
          return editorContainer as HTMLElement
        }
        // 方式4: 通过 editor 参数
        if (editor && (editor as any).root) {
          return (editor as any).root
        }
        return null
      }

      // 延迟绑定，确保编辑器完全初始化
      const timeoutId = setTimeout(() => {
        const editorElement = getEditorElement()
        if (editorElement) {
          editorElement.addEventListener('paste', handlePaste, true)
        } else {
          console.warn('无法找到编辑器元素，粘贴功能可能无法正常工作')
        }
      }, 200)

      // 清理函数
      return () => {
        clearTimeout(timeoutId)
        const editorElement = getEditorElement()
        if (editorElement) {
          editorElement.removeEventListener('paste', handlePaste, true)
        }
      }
    },
    viewerEffect({ markdownBody }) {
      // 在预览中替换 local:// 图片链接为实际的 data URL（作为备用方案）
      const updateImages = () => {
        const images = markdownBody.querySelectorAll('img')
        let updatedCount = 0
        images.forEach((img) => {
          const src = img.getAttribute('src')
          if (src && src.startsWith('local://')) {
            const dataUrl = convertImageUrl(src)
            if (dataUrl && dataUrl !== src) {
              img.setAttribute('src', dataUrl)
              updatedCount++
              // 添加错误处理
              img.onerror = () => {
                console.error('图片加载失败:', {
                  originalSrc: src,
                  convertedUrl: dataUrl,
                  imageId: src.replace('local://', '')
                })
              }
              // 添加成功处理
              img.onload = () => {
                console.log('图片加载成功:', src)
              }
            } else {
              console.warn('无法转换图片 URL:', src, '所有存储的图片:', getStoredImages().map(img => img.id))
            }
          }
        })
        if (updatedCount > 0) {
          console.log(`已更新 ${updatedCount} 张图片`)
        }
      }

      // 延迟执行，确保 DOM 已渲染
      const timeoutId = setTimeout(() => {
        updateImages()
      }, 100)

      // 使用 MutationObserver 监听 DOM 变化，确保新插入的图片也能被处理
      const observer = new MutationObserver(() => {
        updateImages()
      })

      observer.observe(markdownBody, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
      })

      // 清理函数
      return () => {
        clearTimeout(timeoutId)
        observer.disconnect()
      }
    },
  }
}

