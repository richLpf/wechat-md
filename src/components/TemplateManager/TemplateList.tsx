import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm } from 'antd'
import { DeleteOutlined, StarOutlined, StarFilled, EditOutlined } from '@ant-design/icons'
import { Template } from '../../types'
import {
  getTemplates,
  deleteTemplate,
  setDefaultTemplate,
} from '../../utils/templateStorage'
import { isBuiltinTemplate } from '../../utils/builtinTemplates'

interface TemplateListProps {
  onEdit: (template: Template) => void
  onRefresh: () => void
}

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onRefresh }) => {
  const [templates, setTemplates] = useState<Template[]>(getTemplates())

  // 监听模版变化
  useEffect(() => {
    const handleStorageChange = () => {
      const newTemplates = getTemplates()
      setTemplates(newTemplates)
    }

    // 立即更新一次
    handleStorageChange()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('templatesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('templatesUpdated', handleStorageChange)
    }
  }, [])

  // 当 onRefresh 被调用时更新列表
  useEffect(() => {
    const newTemplates = getTemplates()
    setTemplates(newTemplates)
  }, [onRefresh])

  const handleDelete = (id: string) => {
    if (isBuiltinTemplate(id)) {
      message.warning('系统模版不能删除')
      return
    }
    if (deleteTemplate(id)) {
      message.success('删除成功')
      onRefresh()
      // 触发自定义事件，通知其他组件更新
      window.dispatchEvent(new Event('templatesUpdated'))
    } else {
      message.error('删除失败')
    }
  }

  const handleSetDefault = (id: string) => {
    if (setDefaultTemplate(id)) {
      message.success('设置默认模版成功')
      onRefresh()
      // 触发自定义事件，通知其他组件更新
      window.dispatchEvent(new Event('templatesUpdated'))
    } else {
      message.error('设置失败')
    }
  }

  const columns = [
    {
      title: '模版名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Template) => (
        <Space>
          <span>{name}</span>
          {isBuiltinTemplate(record.id) && (
            <Tag color="blue">系统模版</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '默认模版',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (isDefault: boolean) =>
        isDefault ? (
          <Tag color="gold">
            <StarFilled /> 默认
          </Tag>
        ) : null,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (timestamp: number) =>
        new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (timestamp: number) =>
        new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Template) => {
        const isBuiltin = isBuiltinTemplate(record.id)
        return (
          <Space>
            {!isBuiltin && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              >
                编辑
              </Button>
            )}
            {!record.isDefault && (
              <Button
                type="link"
                icon={<StarOutlined />}
                onClick={() => handleSetDefault(record.id)}
              >
                设为默认
              </Button>
            )}
            {!isBuiltin && (
              <Popconfirm
                title="确定要删除这个模版吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <Table
      dataSource={templates}
      columns={columns}
      rowKey="id"
      pagination={false}
      locale={{ emptyText: '暂无模版，请创建' }}
      scroll={{ y: 'calc(100vh - 200px)' }}
    />
  )
}

export default TemplateList

