import React, { useState } from 'react'
import { Button, Space, message, Modal } from 'antd'
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons'
import TemplateList from './TemplateList'
import TemplateEditor from './TemplateEditor'
import { Template } from '../../types'
import { canAddMoreTemplates } from '../../utils/templateStorage'

const TemplateManager: React.FC = () => {
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAIPromptModal, setShowAIPromptModal] = useState(false)

  const handleCreate = () => {
    if (!canAddMoreTemplates()) {
      message.warning('最多只能创建 3 个模版，请先删除现有模版')
      return
    }
    setEditingTemplate(null)
    setEditorVisible(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setEditorVisible(true)
  }

  const handleEditorSuccess = () => {
    setEditorVisible(false)
    setEditingTemplate(null)
    setRefreshKey(prev => prev + 1)
    // 触发自定义事件，通知其他组件更新
    window.dispatchEvent(new Event('templatesUpdated'))
  }

  const handleEditorCancel = () => {
    setEditorVisible(false)
    setEditingTemplate(null)
  }

  const handleAIGenerate = () => {
    setShowAIPromptModal(true)
  }

  const geminiPrompt = `请生成一个微信公众号文章样式模版的 CSS 代码。

要求：
1. 模版的主题或用途为：【填写】
2. 模版主题色为：【填写】
3. 所有 CSS 选择器必须使用 .bytemd-preview .markdown-body 作为前缀
4. 必须包含以下元素的样式：
   - .wechat-article（外层容器）
   - .wechat-article-title（h1 标题）
   - .wechat-article-h2（h2 标题）
   - .wechat-article-h3（h3 标题）
   - .wechat-article-paragraph（段落）
   - .wechat-article-blockquote（引用）
   - .wechat-article-list（列表）
   - .wechat-article-list-item（列表项）
   - .wechat-article-code（行内代码）
   - .wechat-article-table（表格）
   - .wechat-article-th（表头）
   - .wechat-article-td（表格单元格）

5. 样式要求：
   - 适合微信公众号阅读体验
   - 字体大小 16px，行高 1.8
   - 最大宽度 677px，居中显示
   - 标题使用合适的颜色和字重
   - 引用块有左侧边框和背景色
   - 代码块有背景色和圆角
   - 表格有边框和合适的间距

6. 只返回 CSS 代码，不要包含任何解释文字

示例格式：
.bytemd-preview .markdown-body.wechat-article {
  font-size: 16px;
  line-height: 1.8;
  max-width: 677px;
  margin: 0 auto;
}

.bytemd-preview .markdown-body .wechat-article-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 16px;
}

...（其他样式）`

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建模版
          </Button>
          <Button icon={<ThunderboltOutlined />} onClick={handleAIGenerate}>
            AI生成模版
          </Button>
        </Space>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TemplateList key={refreshKey} onEdit={handleEdit} onRefresh={() => setRefreshKey(prev => prev + 1)} />
      </div>
      <TemplateEditor
        visible={editorVisible}
        template={editingTemplate}
        onCancel={handleEditorCancel}
        onSuccess={handleEditorSuccess}
      />

      {/* AI 生成模版提示词弹窗 */}
      <Modal
        title="AI 生成模版 - Gemini 3 提示词"
        open={showAIPromptModal}
        onCancel={() => setShowAIPromptModal(false)}
        footer={[
          <Button key="copy" type="primary" onClick={() => {
            navigator.clipboard.writeText(geminiPrompt)
            message.success('提示词已复制到剪贴板')
          }}>
            复制提示词
          </Button>,
          <Button key="close" onClick={() => setShowAIPromptModal(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 12, color: '#666' }}>
            将以下提示词复制到 Gemini 3，即可生成微信公众号文章样式模版的 CSS 代码：
          </p>
          <div
            style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              maxHeight: '500px',
              overflow: 'auto',
              fontFamily: 'Monaco, Menlo, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {geminiPrompt}
          </div>
        </div>
        <div style={{ 
          padding: '12px', 
          background: '#fffbe6', 
          border: '1px solid #ffe58f', 
          borderRadius: '4px',
          fontSize: '13px',
          color: '#ad6800'
        }}>
          <strong>使用说明：</strong>
          <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>复制上面的提示词</li>
            <li>打开 Gemini 3 对话界面</li>
            <li>粘贴提示词并发送</li>
            <li>复制生成的 CSS 代码</li>
            <li>在"创建模版"中粘贴 CSS 代码并保存</li>
          </ol>
        </div>
      </Modal>
    </div>
  )
}

export default TemplateManager

