import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message, Space } from 'antd'
import { Template } from '../../types'
import {
  saveTemplate,
  canAddMoreTemplates,
} from '../../utils/templateStorage'
import { isBuiltinTemplate } from '../../utils/builtinTemplates'

const { TextArea } = Input

interface TemplateEditorProps {
  visible: boolean
  template: Template | null
  onCancel: () => void
  onSuccess: () => void
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  visible,
  template,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      if (template) {
        form.setFieldsValue(template)
      } else {
        form.resetFields()
        // 检查是否可以添加新模版
        if (!canAddMoreTemplates()) {
          message.warning('最多只能创建 3 个模版，请先删除现有模版')
          onCancel()
          return
        }
      }
    }
  }, [visible, template, form, onCancel])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 检查是否为内置模版
      if (template && isBuiltinTemplate(template.id)) {
        message.warning('系统模版不能编辑')
        return
      }

      setLoading(true)

      const newTemplate: Template = {
        id: template?.id || `template-${Date.now()}`,
        name: values.name,
        css: values.css,
        isDefault: values.isDefault || false,
        createdAt: template?.createdAt || Date.now(),
        updatedAt: Date.now(),
      }

      // 检查是否超过限制
      if (!template && !canAddMoreTemplates()) {
        message.error('最多只能创建 3 个模版')
        setLoading(false)
        return
      }

      if (saveTemplate(newTemplate)) {
        message.success(template ? '更新成功' : '创建成功')
        form.resetFields()
        onSuccess()
      } else {
        message.error('保存失败，可能已达到模版数量限制')
      }
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={template ? '编辑模版' : '创建模版'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          保存
        </Button>,
      ]}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="模版名称"
          rules={[{ required: true, message: '请输入模版名称' }]}
        >
          <Input placeholder="请输入模版名称" />
        </Form.Item>
        <Form.Item
          name="css"
          label="CSS 代码"
          rules={[{ required: true, message: '请输入 CSS 代码' }]}
        >
          <TextArea
            rows={20}
            placeholder="请输入 CSS 代码，例如：&#10;.wechat-article {&#10;  font-size: 16px;&#10;  line-height: 1.6;&#10;}&#10;.wechat-article-title {&#10;  font-size: 24px;&#10;  font-weight: bold;&#10;}"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
        <Form.Item name="isDefault" valuePropName="checked">
          <Space>
            <input
              type="checkbox"
              checked={form.getFieldValue('isDefault') || false}
              onChange={(e) => form.setFieldValue('isDefault', e.target.checked)}
            />
            <span>设为默认模版</span>
          </Space>
        </Form.Item>
        <div style={{ color: '#999', fontSize: '12px', marginTop: '-16px', marginBottom: '16px' }}>
          提示：CSS 中应使用 .wechat-article、.wechat-article-title 等 class 选择器
        </div>
      </Form>
    </Modal>
  )
}

export default TemplateEditor

