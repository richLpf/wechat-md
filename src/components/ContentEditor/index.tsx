import React, { useState, useEffect, useRef } from 'react'
import { Button, Drawer, Space, message, Dropdown, Modal, Input, Popconfirm } from 'antd'
import { WechatOutlined, SettingOutlined, CheckOutlined, FileTextOutlined, DownOutlined, QuestionCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'
import StyleEditor from './StyleEditor'
import StyleInjector from '../StyleInjector'
import TemplateManager from '../TemplateManager'
import wechatArticlePlugin from '../../utils/bytemdWechatPlugin'
import imageUploadPlugin from '../../utils/bytemdImagePlugin'
import { generateWechatFormatHtml } from '../../utils/htmlExporter'
import { getTemplates, getDefaultTemplate, getTemplateById, saveTemplate, canAddMoreTemplates } from '../../utils/templateStorage'
import { 
  getDocuments, 
  getCurrentDocument, 
  getCurrentDocumentId, 
  setCurrentDocumentId, 
  saveDocument, 
  createDocument, 
  deleteDocument, 
  updateDocumentName,
  canCreateDocument,
  type Document
} from '../../utils/documentStorage'

const plugins = [gfm(), highlight(), wechatArticlePlugin(), imageUploadPlugin()]

const ContentEditor: React.FC = () => {
  // 文档管理状态
  const [documents, setDocuments] = useState<Document[]>(getDocuments())
  const [currentDocumentId, setCurrentDocumentIdState] = useState<string | null>(getCurrentDocumentId())
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameDocId, setRenameDocId] = useState<string | null>(null)
  const [renameDocName, setRenameDocName] = useState('')
  const isSwitchingRef = useRef(false) // 防止切换文档时触发保存

  // 从当前文档恢复内容
  const [content, setContent] = useState(() => {
    const currentDoc = getCurrentDocument()
    return currentDoc?.content || ''
  })
  const [currentStyle, setCurrentStyle] = useState('')
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(() => {
    const currentDoc = getCurrentDocument()
    return currentDoc?.selectedTemplateId || getDefaultTemplate()?.id || null
  })
  const [templates, setTemplates] = useState(getTemplates())

  // 初始化：如果没有文档，创建第一个
  useEffect(() => {
    const docs = getDocuments()
    if (docs.length === 0) {
      const newDoc = createDocument('文档 1')
      setDocuments([newDoc])
      setCurrentDocumentIdState(newDoc.id)
      setSelectedTemplateId(getDefaultTemplate()?.id || null)
    } else {
      // 如果有文档但没有当前文档，选择第一个
      const currentId = getCurrentDocumentId()
      if (!currentId || !docs.find(d => d.id === currentId)) {
        const firstDoc = docs[0]
        setCurrentDocumentIdState(firstDoc.id)
        setCurrentDocumentId(firstDoc.id)
        loadDocument(firstDoc.id)
      } else {
        loadDocument(currentId)
      }
    }
  }, [])

  // 加载文档
  const loadDocument = (docId: string) => {
    const allDocs = getDocuments() // 从 localStorage 读取最新数据
    const doc = allDocs.find(d => d.id === docId)
    if (doc) {
      isSwitchingRef.current = true
      setContent(doc.content)
      setSelectedTemplateId(doc.selectedTemplateId || getDefaultTemplate()?.id || null)
      setCurrentDocumentIdState(docId)
      setCurrentDocumentId(docId)
      setDocuments(allDocs) // 更新文档列表
      setTimeout(() => {
        isSwitchingRef.current = false
      }, 100)
    }
  }

  // 保存当前文档
  const saveCurrentDocument = () => {
    if (!currentDocumentId || isSwitchingRef.current) {
      return
    }
    const allDocs = getDocuments() // 从 localStorage 读取最新数据
    const doc = allDocs.find(d => d.id === currentDocumentId)
    if (doc) {
      const updatedDoc: Document = {
        ...doc,
        content,
        selectedTemplateId,
        updatedAt: Date.now()
      }
      saveDocument(updatedDoc)
      // 更新本地状态
      setDocuments(getDocuments())
    }
  }

  // 监听模版变化
  useEffect(() => {
    const handleStorageChange = () => {
      const newTemplates = getTemplates()
      setTemplates(newTemplates)
      if (selectedTemplateId && !newTemplates.find(t => t.id === selectedTemplateId)) {
        const defaultTemplate = getDefaultTemplate()
        setSelectedTemplateId(defaultTemplate?.id || null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('templatesUpdated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('templatesUpdated', handleStorageChange)
    }
  }, [selectedTemplateId])

  // 初始化样式
  useEffect(() => {
    if (selectedTemplateId) {
      const template = getTemplateById(selectedTemplateId)
      if (template && template.css) {
        setCurrentStyle(template.css)
      } else {
        setCurrentStyle('')
      }
    } else {
      setCurrentStyle('')
    }
  }, [selectedTemplateId, templates])


  // 处理样式变化（添加作用域）
  const handleStyleChange = (style: string) => {
    if (style.includes('.preview-content') || style.includes('.markdown-body')) {
      setCurrentStyle(style)
      return
    }
    // 自动为所有选择器添加 .bytemd-preview .markdown-body 前缀
    const scopedStyle = style.replace(/([^{}]+)\{/g, (match, selector) => {
      const trimmed = selector.trim()
      if (trimmed.startsWith('@') || trimmed.includes('.markdown-body') || trimmed.includes('.preview-content')) {
        return match
      }
      return `.bytemd-preview .markdown-body ${trimmed} {`
    })
    setCurrentStyle(scopedStyle)
  }

  // 复制到公众号
  const handleCopyToWechat = async () => {
    try {
      const html = generateWechatFormatHtml(content, true, selectedTemplateId)
      
      if (!html || html.trim().length === 0) {
        message.error('没有内容可复制，请先输入内容')
        return
      }
      
      console.log('准备复制的 HTML:', html.substring(0, 500))
      
      // 使用 Clipboard API 复制为 text/html 格式
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          // 创建 ClipboardItem，设置 text/html 格式
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([html], { type: 'text/plain' })
          })
          await navigator.clipboard.write([clipboardItem])
          setCopySuccess(true)
          message.success('已复制到剪贴板（HTML 格式），可直接粘贴到微信公众号编辑器')
          setTimeout(() => setCopySuccess(false), 2000)
        } catch (clipboardError) {
          console.warn('ClipboardItem 失败，尝试降级方案:', clipboardError)
          // 降级方案：使用 execCommand
          await copyWithExecCommand(html)
        }
      } else {
        // 降级方案：使用 execCommand
        await copyWithExecCommand(html)
      }
    } catch (error) {
      console.error('复制失败:', error)
      message.error('复制失败，请重试')
    }
  }

  // 使用 execCommand 复制（降级方案）
  const copyWithExecCommand = async (html: string) => {
    try {
      // 创建临时容器
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'fixed'
      tempDiv.style.left = '0'
      tempDiv.style.top = '0'
      tempDiv.style.width = '1px'
      tempDiv.style.height = '1px'
      tempDiv.style.opacity = '0'
      tempDiv.style.pointerEvents = 'none'
      tempDiv.contentEditable = 'true'
      tempDiv.innerHTML = html
      document.body.appendChild(tempDiv)
      
      // 选中内容
      const range = document.createRange()
      range.selectNodeContents(tempDiv)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        
        // 执行复制
        const success = document.execCommand('copy')
        selection.removeAllRanges()
        document.body.removeChild(tempDiv)
        
        if (success) {
          setCopySuccess(true)
          message.success('已复制到剪贴板（HTML 格式），可直接粘贴到微信公众号编辑器')
          setTimeout(() => setCopySuccess(false), 2000)
        } else {
          throw new Error('execCommand 复制失败')
        }
      } else {
        document.body.removeChild(tempDiv)
        throw new Error('无法获取 selection')
      }
    } catch (error) {
      console.error('execCommand 复制失败:', error)
      throw error
    }
  }

  // 导入文件
  const handleImport = (importedContent: string) => {
    setContent(importedContent)
    // 保存到当前文档
    saveCurrentDocument()
  }

  // 内容变化时自动保存到当前文档
  useEffect(() => {
    if (!isSwitchingRef.current && currentDocumentId) {
      const timer = setTimeout(() => {
        if (!isSwitchingRef.current && currentDocumentId) {
          const allDocs = getDocuments()
          const doc = allDocs.find(d => d.id === currentDocumentId)
          if (doc) {
            const updatedDoc: Document = {
              ...doc,
              content,
              selectedTemplateId,
              updatedAt: Date.now()
            }
            saveDocument(updatedDoc)
            setDocuments(getDocuments())
          }
        }
      }, 500) // 防抖：500ms后保存
      return () => clearTimeout(timer)
    }
  }, [content, selectedTemplateId, currentDocumentId])

  // 切换文档
  const handleSwitchDocument = (docId: string) => {
    if (docId === currentDocumentId) {
      return
    }
    // 先保存当前文档
    saveCurrentDocument()
    // 加载新文档
    loadDocument(docId)
    setDocuments(getDocuments())
  }

  // 新建文档
  const handleCreateDocument = () => {
    if (!canCreateDocument()) {
      message.warning('最多只能保存 5 篇文档，请先删除现有文档')
      return
    }
    // 保存当前文档
    saveCurrentDocument()
    // 创建新文档
    const newDoc = createDocument()
    setDocuments(getDocuments())
    loadDocument(newDoc.id)
    message.success('新文档已创建')
  }

  // 删除文档
  const handleDeleteDocument = (docId: string) => {
    if (deleteDocument(docId)) {
      const updatedDocs = getDocuments()
      setDocuments(updatedDocs)
      if (updatedDocs.length > 0) {
        loadDocument(updatedDocs[0].id)
      }
      message.success('文档已删除')
    } else {
      message.error('删除失败')
    }
  }

  // 重命名文档
  const handleRenameDocument = (docId: string) => {
    const allDocs = getDocuments() // 从 localStorage 读取最新数据
    const doc = allDocs.find(d => d.id === docId)
    if (doc) {
      setRenameDocId(docId)
      setRenameDocName(doc.name)
      setShowRenameModal(true)
    }
  }

  // 确认重命名
  const handleConfirmRename = () => {
    if (!renameDocId || !renameDocName.trim()) {
      message.warning('请输入文档名称')
      return
    }
    if (updateDocumentName(renameDocId, renameDocName.trim())) {
      setDocuments(getDocuments())
      setShowRenameModal(false)
      setRenameDocId(null)
      setRenameDocName('')
      message.success('文档已重命名')
    } else {
      message.error('重命名失败')
    }
  }

  // 保存当前样式为新模版
  const handleSaveAsTemplate = () => {
    if (!currentStyle.trim()) {
      message.warning('请先输入样式代码')
      return
    }
    if (!canAddMoreTemplates()) {
      message.warning('最多只能创建 3 个模版，请先删除现有模版')
      return
    }
    setTemplateName('')
    setShowSaveTemplateModal(true)
  }

  // 确认保存模版
  const handleConfirmSaveTemplate = () => {
    if (!templateName.trim()) {
      message.warning('请输入模版名称')
      return
    }
    if (!currentStyle.trim()) {
      message.warning('样式代码不能为空')
      return
    }

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: templateName.trim(),
      css: currentStyle.trim(),
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (saveTemplate(newTemplate)) {
      message.success('模版保存成功')
      setShowSaveTemplateModal(false)
      setTemplateName('')
      // 更新模版列表
      const newTemplates = getTemplates()
      setTemplates(newTemplates)
      // 触发更新事件
      window.dispatchEvent(new Event('templatesUpdated'))
      // 延迟选中新创建的模版，确保模版已保存到 localStorage
      setTimeout(() => {
        // 重新获取模版列表，确保包含新保存的模版
        const updatedTemplates = getTemplates()
        setTemplates(updatedTemplates)
        // 选中新创建的模版
        setSelectedTemplateId(newTemplate.id)
        // 立即更新样式
        const savedTemplate = getTemplateById(newTemplate.id)
        if (savedTemplate && savedTemplate.css) {
          setCurrentStyle(savedTemplate.css)
        }
      }, 50)
    } else {
      message.error('模版保存失败')
    }
  }

  return (
    <div style={{ height: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Space>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 600, 
            color: 'var(--emerald-primary)',
            fontFamily: 'Inter, sans-serif',
            marginRight: 16
          }}>
            Markdown → 公众号格式化工具
          </div>
          {/* 文档切换 */}
          <Dropdown
            menu={{
              items: [
                ...documents.map(doc => ({
                  key: doc.id,
                  label: (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '4px 0',
                      minWidth: 200
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: doc.id === currentDocumentId ? 'var(--emerald-primary)' : '#d1d5db',
                            display: 'inline-block',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
                      </div>
                      <Space size={4} onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRenameDocument(doc.id)
                          }}
                          style={{ padding: '0 4px' }}
                        />
                        <Popconfirm
                          title="确定要删除这篇文档吗？"
                          onConfirm={(e) => {
                            e?.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={(e) => e.stopPropagation()}
                            style={{ padding: '0 4px' }}
                          />
                        </Popconfirm>
                      </Space>
                    </div>
                  ),
                  onClick: () => handleSwitchDocument(doc.id)
                })),
                {
                  type: 'divider'
                },
                {
                  key: 'new',
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PlusOutlined />
                      <span>新建文档</span>
                    </div>
                  ),
                  onClick: handleCreateDocument,
                  disabled: !canCreateDocument()
                }
              ],
              style: { minWidth: 240 }
            }}
            trigger={['click']}
          >
            <Button 
              size="small" 
              type="text" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: currentDocumentId ? 'var(--emerald-primary)' : '#666',
                fontWeight: currentDocumentId ? 500 : 400
              }}
            >
              {currentDocumentId 
                ? (() => {
                    const doc = documents.find(d => d.id === currentDocumentId)
                    return doc ? doc.name : '选择文档'
                  })()
                : '选择文档'
              }
              <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'import',
                  label: '导入 Markdown',
                  icon: <FileTextOutlined />,
                  onClick: () => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.md'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const text = event.target?.result as string
                          handleImport(text)
                          message.success('文件导入成功')
                        }
                        reader.readAsText(file)
                      }
                    }
                    input.click()
                  }
                }
              ]
            }}
          >
            <Button 
              size="small" 
              type="text" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              文件
              <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
          <Button
            size="small"
            type="text"
            onClick={() => setShowTemplateManager(true)}
          >
            模版管理
          </Button>
          <Dropdown
            menu={{
              items: templates.map(t => ({
                key: t.id,
                label: (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    padding: '4px 0'
                  }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: t.id === selectedTemplateId ? 'var(--emerald-primary)' : '#d1d5db',
                        display: 'inline-block',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ flex: 1 }}>{t.name}</span>
                    {t.isDefault && (
                      <span style={{ fontSize: 12, color: '#999' }}>(默认)</span>
                    )}
                  </div>
                ),
                onClick: () => setSelectedTemplateId(t.id)
              })),
              style: { minWidth: 180 }
            }}
            trigger={['click']}
          >
            <Button 
              size="small" 
              type="text" 
              style={{ 
                padding: '4px 8px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: selectedTemplateId ? 'var(--emerald-primary)' : '#666',
                fontWeight: selectedTemplateId ? 500 : 400
              }}
            >
              {selectedTemplateId 
                ? (() => {
                    const template = templates.find(t => t.id === selectedTemplateId)
                    return template ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {template.name}
                      </span>
                    ) : '选择模版'
                  })()
                : '选择模版'
              }
              <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        </Space>
        <Space>
          <Button
            size="small"
            type="text"
            icon={<QuestionCircleOutlined />}
            onClick={() => {
              window.open('https://vqc26krqvye.feishu.cn/share/base/form/shrcnOyxyHQPOtpgREHag6u8kXe', '_blank')
            }}
          >
            问题反馈
          </Button>
          <Button
            icon={<SettingOutlined />}
            size="small"
            onClick={() => setShowStyleEditor(!showStyleEditor)}
            type={showStyleEditor ? 'primary' : 'default'}
          >
            样式编辑
          </Button>
          <Button
            type="primary"
            icon={copySuccess ? <CheckOutlined /> : <WechatOutlined />}
            onClick={handleCopyToWechat}
            size="small"
            style={{
              background: copySuccess ? '#10b981' : 'var(--emerald-primary)',
              borderColor: copySuccess ? '#10b981' : 'var(--emerald-primary)',
              animation: copySuccess ? 'scaleIn 0.3s ease' : 'none'
            }}
          >
            {copySuccess ? '已复制' : '复制到公众号'}
          </Button>
        </Space>
      </div>


      <div style={{ background: '#fff' }}>
        <StyleInjector templateId={selectedTemplateId} />
        <style>{currentStyle}</style>
        <Editor
          value={content}
          plugins={plugins}
          onChange={setContent}
          placeholder="请输入 Markdown 内容..."
        />
      </div>

      {/* 样式编辑器抽屉 */}
      <Drawer
        title="样式调试器"
        placement="right"
        onClose={() => setShowStyleEditor(false)}
        open={showStyleEditor}
        width={400}
        styles={{
          body: {
            padding: 0,
            background: '#1e1e1e'
          }
        }}
      >
        <StyleEditor
          currentStyle={currentStyle}
          onStyleChange={handleStyleChange}
          onSaveTemplate={handleSaveAsTemplate}
        />
      </Drawer>

      {/* 模版管理抽屉 */}
      <Drawer
        title="模版管理"
        placement="right"
        onClose={() => setShowTemplateManager(false)}
        open={showTemplateManager}
        width={900}
        styles={{
          body: {
            padding: '24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <TemplateManager />
      </Drawer>

      {/* 保存模版弹窗 */}
      <Modal
        title="保存为新模版"
        open={showSaveTemplateModal}
        onOk={handleConfirmSaveTemplate}
        onCancel={() => {
          setShowSaveTemplateModal(false)
          setTemplateName('')
        }}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>模版名称：</div>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="请输入模版名称"
            onPressEnter={handleConfirmSaveTemplate}
            autoFocus
          />
        </div>
      </Modal>

      {/* 重命名文档弹窗 */}
      <Modal
        title="重命名文档"
        open={showRenameModal}
        onOk={handleConfirmRename}
        onCancel={() => {
          setShowRenameModal(false)
          setRenameDocId(null)
          setRenameDocName('')
        }}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>文档名称：</div>
          <Input
            value={renameDocName}
            onChange={(e) => setRenameDocName(e.target.value)}
            placeholder="请输入文档名称"
            onPressEnter={handleConfirmRename}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  )
}

export default ContentEditor
