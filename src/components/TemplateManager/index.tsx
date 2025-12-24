import React, { useState } from 'react'
import { Button, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import TemplateList from './TemplateList'
import TemplateEditor from './TemplateEditor'
import { Template } from '../../types'
import { canAddMoreTemplates } from '../../utils/templateStorage'

const TemplateManager: React.FC = () => {
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建模版
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
    </div>
  )
}

export default TemplateManager

