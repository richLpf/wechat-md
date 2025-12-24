import React, { useState, useEffect } from 'react'
import { Select, Card } from 'antd'
import { processContent } from '../../utils/htmlGenerator'
import { getTemplates, getDefaultTemplate } from '../../utils/templateStorage'
import StyleInjector from '../StyleInjector'

interface PreviewPanelProps {
  content: string
  isMarkdown: boolean
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ content, isMarkdown }) => {
  const [templates, setTemplates] = useState(getTemplates())
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    getDefaultTemplate()?.id || null
  )

  // 监听模版变化（使用事件监听更高效）
  useEffect(() => {
    const handleStorageChange = () => {
      const newTemplates = getTemplates()
      setTemplates(newTemplates)
      // 如果当前选中的模版被删除，切换到默认模版
      if (selectedTemplateId && !newTemplates.find(t => t.id === selectedTemplateId)) {
        const defaultTemplate = getDefaultTemplate()
        setSelectedTemplateId(defaultTemplate?.id || null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // 也监听自定义事件（用于同窗口内的更新）
    window.addEventListener('templatesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('templatesUpdated', handleStorageChange)
    }
  }, [selectedTemplateId])

  // 生成 HTML
  const htmlContent = content
    ? processContent(content, isMarkdown)
    : '<div class="wechat-article"><p>请输入内容以查看预览</p></div>'

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
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
      </div>
      <StyleInjector templateId={selectedTemplateId} />
      <Card title="预览效果" style={{ minHeight: 500 }}>
        {templates.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            请先在"模版管理"中创建至少一个模版
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{
              minHeight: 400,
              padding: '20px',
            }}
          />
        )}
      </Card>
    </div>
  )
}

export default PreviewPanel

