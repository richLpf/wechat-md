import React, { useState, useEffect } from 'react'
import { Select, Space, Button, message, Dropdown } from 'antd'
import { WechatOutlined, CodeOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'
import { getTemplates, getDefaultTemplate } from '../../utils/templateStorage'
import StyleInjector from '../StyleInjector'
import wechatArticlePlugin from '../../utils/bytemdWechatPlugin'
import { generateFullHtml, generateContentHtml, getPreviewHtml, generateWechatFormatHtml } from '../../utils/htmlExporter'

const plugins = [gfm(), highlight(), wechatArticlePlugin()]

interface EditorPanelProps {
  content: string
  onChange: (content: string) => void
}

const EditorPanel: React.FC<EditorPanelProps> = ({ content, onChange }) => {
  const [templates, setTemplates] = useState(getTemplates())
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    getDefaultTemplate()?.id || null
  )

  // 监听模版变化
  useEffect(() => {
    const handleStorageChange = () => {
      const newTemplates = getTemplates()
      setTemplates(newTemplates)
      console.log('模版列表已更新:', newTemplates)
      // 如果当前选中的模版被删除，切换到默认模版
      if (selectedTemplateId && !newTemplates.find(t => t.id === selectedTemplateId)) {
        const defaultTemplate = getDefaultTemplate()
        setSelectedTemplateId(defaultTemplate?.id || null)
        console.log('切换到默认模版:', defaultTemplate)
      }
    }

    // 立即检查一次
    handleStorageChange()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('templatesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('templatesUpdated', handleStorageChange)
    }
  }, [selectedTemplateId])

  // 当选择的模版变化时，输出调试信息
  useEffect(() => {
    if (selectedTemplateId) {
      const template = getTemplates().find(t => t.id === selectedTemplateId)
      console.log('当前选择的模版:', template)
      if (template) {
        console.log('模版 CSS 长度:', template.css.length)
      }
    }
  }, [selectedTemplateId])

  // 为预览区域添加样式类，并确保样式正确应用
  useEffect(() => {
    const applyWechatClasses = () => {
      const preview = document.querySelector('.bytemd-preview')
      if (preview) {
        const previewContent = preview.querySelector('.markdown-body')
        if (previewContent) {
          // 添加 wechat-article 类
          if (!previewContent.classList.contains('wechat-article')) {
            previewContent.classList.add('wechat-article')
            console.log('已添加 wechat-article 类到预览区域')
          }
          
          // 为所有子元素添加对应的 class
          const addClassesToElements = (element: Element) => {
            const tagName = element.tagName.toLowerCase()
            
            switch (tagName) {
              case 'h1':
                if (!element.classList.contains('wechat-article-title')) {
                  element.classList.add('wechat-article-title')
                }
                break
              case 'h2':
                if (!element.classList.contains('wechat-article-h2')) {
                  element.classList.add('wechat-article-h2')
                }
                break
              case 'h3':
                if (!element.classList.contains('wechat-article-h3')) {
                  element.classList.add('wechat-article-h3')
                }
                break
              case 'p':
                if (!element.classList.contains('wechat-article-paragraph')) {
                  element.classList.add('wechat-article-paragraph')
                }
                break
              case 'blockquote':
                if (!element.classList.contains('wechat-article-blockquote')) {
                  element.classList.add('wechat-article-blockquote')
                }
                break
              case 'ul':
              case 'ol':
                if (!element.classList.contains('wechat-article-list')) {
                  element.classList.add('wechat-article-list')
                }
                break
              case 'li':
                if (!element.classList.contains('wechat-article-list-item')) {
                  element.classList.add('wechat-article-list-item')
                }
                break
              case 'table':
                if (!element.classList.contains('wechat-article-table')) {
                  element.classList.add('wechat-article-table')
                }
                break
              case 'th':
                if (!element.classList.contains('wechat-article-th')) {
                  element.classList.add('wechat-article-th')
                }
                break
              case 'td':
                if (!element.classList.contains('wechat-article-td')) {
                  element.classList.add('wechat-article-td')
                }
                break
              case 'pre':
                // 检查是否是代码块（包含 code 子元素或直接包含文本）
                const hasCodeChild = element.querySelector('code') !== null
                if (hasCodeChild || element.textContent?.trim()) {
                  if (!element.classList.contains('wechat-article-code-block')) {
                    element.classList.add('wechat-article-code-block')
                  }
                }
                break
              case 'code':
                if (!element.classList.contains('wechat-article-code')) {
                  element.classList.add('wechat-article-code')
                }
                break
              case 'hr':
                if (!element.classList.contains('wechat-article-hr')) {
                  element.classList.add('wechat-article-hr')
                }
                break
            }
            
            // 递归处理子元素
            Array.from(element.children).forEach(child => {
              addClassesToElements(child)
            })
          }
          
          // 为所有子元素添加 class
          Array.from(previewContent.children).forEach(child => {
            addClassesToElements(child)
          })
        } else {
          console.log('未找到 .markdown-body 元素')
        }
      } else {
        console.log('未找到 .bytemd-preview 元素')
      }
    }

    // 延迟执行，确保 DOM 已渲染
    const timeout = setTimeout(applyWechatClasses, 100)

    const observer = new MutationObserver(() => {
      applyWechatClasses()
    })

    // 观察整个文档的变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // 定期检查（作为备用方案）
    const interval = setInterval(applyWechatClasses, 1000)

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [content, selectedTemplateId])

  // 复制 HTML 功能
  const handleCopyHtml = async (type: 'full' | 'content' | 'wechat') => {
    try {
      let html = ''
      
      if (type === 'full') {
        // 复制完整 HTML（包含样式）
        html = generateFullHtml(content, true, selectedTemplateId)
      } else if (type === 'wechat') {
        // 复制微信公众号格式（内联样式）
        html = generateWechatFormatHtml(content, true, selectedTemplateId)
      } else {
        // 复制内容 HTML（仅内容部分）
        html = getPreviewHtml() || generateContentHtml(content, true)
      }

      if (!html) {
        message.warning('暂无内容可复制')
        return
      }

      await navigator.clipboard.writeText(html)
      const messages = {
        full: '完整 HTML 已复制到剪贴板',
        content: '内容 HTML 已复制到剪贴板',
        wechat: '微信公众号格式 HTML 已复制到剪贴板'
      }
      message.success(messages[type])
    } catch (error) {
      console.error('复制失败:', error)
      message.error('复制失败，请重试')
    }
  }

  const codeMenuItems: MenuProps['items'] = [
    {
      key: 'full',
      label: '复制完整 HTML（含样式）',
      onClick: () => handleCopyHtml('full'),
    },
    {
      key: 'content',
      label: '复制内容 HTML',
      onClick: () => handleCopyHtml('content'),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <span>选择样式模版：</span>
          <Select
            value={selectedTemplateId}
            onChange={setSelectedTemplateId}
            style={{ width: 300 }}
            placeholder="选择模版"
            options={templates.map(t => ({
              label: `${t.name}${t.isDefault ? ' (默认)' : ''}`,
              value: t.id,
            }))}
          />
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<WechatOutlined />}
            onClick={() => handleCopyHtml('wechat')}
            title="复制微信公众号格式"
            size="small"
          >
            公众号
          </Button>
          <Dropdown menu={{ items: codeMenuItems }} placement="bottomRight">
            <Button
              icon={<CodeOutlined />}
              title="复制 HTML 代码"
              size="small"
            >
              代码
            </Button>
          </Dropdown>
        </Space>
      </div>
      <StyleInjector templateId={selectedTemplateId} />
      <Editor
        value={content}
        plugins={plugins}
        onChange={onChange}
        placeholder="请输入 Markdown 内容..."
        editorConfig={{
          lineNumbers: true,
        }}
      />
      {templates.length === 0 && (
        <div style={{ marginTop: 16, padding: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4 }}>
          <span style={{ color: '#ad6800' }}>
            提示：请先在"模版管理"中创建至少一个模版，以便在预览中应用样式
          </span>
        </div>
      )}
    </div>
  )
}

export default EditorPanel
