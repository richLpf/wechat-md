import React, { useState, useEffect } from 'react'
import { Input, Button, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface StyleEditorProps {
  currentStyle: string
  onStyleChange: (style: string) => void
  onSaveTemplate?: () => void
}

const StyleEditor: React.FC<StyleEditorProps> = ({ currentStyle, onStyleChange, onSaveTemplate }) => {
  const [localStyle, setLocalStyle] = useState(currentStyle)

  useEffect(() => {
    setLocalStyle(currentStyle)
  }, [currentStyle])

  const handleChange = (value: string) => {
    setLocalStyle(value)
    onStyleChange(value)
  }

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#d4d4d4'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #3e3e3e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>样式调试器</div>
        {onSaveTemplate && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="small"
            onClick={onSaveTemplate}
            style={{ background: 'var(--emerald-primary)', borderColor: 'var(--emerald-primary)' }}
          >
            存为新模版
          </Button>
        )}
      </div>
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <TextArea
          value={localStyle}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="输入 CSS 代码，所有选择器需使用 .preview-content 作用域"
          rows={20}
          style={{
            fontFamily: 'Monaco, Menlo, "Courier New", monospace',
            fontSize: 13,
            background: '#252526',
            color: '#d4d4d4',
            border: '1px solid #3e3e3e',
            resize: 'none',
            height: '100%'
          }}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: '#858585' }}>
          提示：所有 CSS 选择器会自动添加 .preview-content 前缀
        </div>
      </div>
    </div>
  )
}

export default StyleEditor

