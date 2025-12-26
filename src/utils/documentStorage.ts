/**
 * 文档存储工具
 * 支持保存、加载、删除多个文档，最多5篇
 */

export interface Document {
  id: string
  name: string
  content: string
  selectedTemplateId: string | null
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'wechat-documents'
const CURRENT_DOCUMENT_KEY = 'wechat-current-document-id'
const MAX_DOCUMENTS = 5

/**
 * 获取所有文档
 */
export const getDocuments = (): Document[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get documents:', error)
    return []
  }
}

/**
 * 获取当前文档ID
 */
export const getCurrentDocumentId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_DOCUMENT_KEY)
  } catch (error) {
    console.error('Failed to get current document ID:', error)
    return null
  }
}

/**
 * 设置当前文档ID
 */
export const setCurrentDocumentId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(CURRENT_DOCUMENT_KEY, id)
    } else {
      localStorage.removeItem(CURRENT_DOCUMENT_KEY)
    }
  } catch (error) {
    console.error('Failed to set current document ID:', error)
  }
}

/**
 * 获取当前文档
 */
export const getCurrentDocument = (): Document | null => {
  const currentId = getCurrentDocumentId()
  if (!currentId) {
    return null
  }
  const documents = getDocuments()
  return documents.find(doc => doc.id === currentId) || null
}

/**
 * 根据ID获取文档
 */
export const getDocumentById = (id: string): Document | null => {
  const documents = getDocuments()
  return documents.find(doc => doc.id === id) || null
}

/**
 * 保存文档
 */
export const saveDocument = (document: Document): boolean => {
  try {
    const documents = getDocuments()
    const existingIndex = documents.findIndex(doc => doc.id === document.id)
    
    const updatedDocument = {
      ...document,
      updatedAt: Date.now()
    }
    
    if (existingIndex >= 0) {
      // 更新现有文档
      documents[existingIndex] = updatedDocument
    } else {
      // 检查是否超过最大数量
      if (documents.length >= MAX_DOCUMENTS) {
        console.warn(`最多只能保存 ${MAX_DOCUMENTS} 篇文档`)
        return false
      }
      // 添加新文档
      documents.push(updatedDocument)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    return true
  } catch (error) {
    console.error('Failed to save document:', error)
    return false
  }
}

/**
 * 创建新文档
 */
export const createDocument = (name?: string, content?: string): Document => {
  const documents = getDocuments()
  
  // 检查是否超过最大数量
  if (documents.length >= MAX_DOCUMENTS) {
    throw new Error(`最多只能保存 ${MAX_DOCUMENTS} 篇文档，请先删除现有文档`)
  }
  
  const newDocument: Document = {
    id: `doc-${Date.now()}`,
    name: name || `文档 ${documents.length + 1}`,
    content: content || '',
    selectedTemplateId: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  saveDocument(newDocument)
  setCurrentDocumentId(newDocument.id)
  
  return newDocument
}

/**
 * 删除文档
 */
export const deleteDocument = (id: string): boolean => {
  try {
    const documents = getDocuments()
    const filtered = documents.filter(doc => doc.id !== id)
    
    if (filtered.length === documents.length) {
      // 文档不存在
      return false
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // 如果删除的是当前文档，切换到第一个文档或清空
    const currentId = getCurrentDocumentId()
    if (currentId === id) {
      if (filtered.length > 0) {
        setCurrentDocumentId(filtered[0].id)
      } else {
        setCurrentDocumentId(null)
      }
    }
    
    return true
  } catch (error) {
    console.error('Failed to delete document:', error)
    return false
  }
}

/**
 * 更新文档名称
 */
export const updateDocumentName = (id: string, name: string): boolean => {
  try {
    const documents = getDocuments()
    const document = documents.find(doc => doc.id === id)
    
    if (!document) {
      return false
    }
    
    document.name = name.trim()
    document.updatedAt = Date.now()
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    return true
  } catch (error) {
    console.error('Failed to update document name:', error)
    return false
  }
}

/**
 * 检查是否可以创建新文档
 */
export const canCreateDocument = (): boolean => {
  const documents = getDocuments()
  return documents.length < MAX_DOCUMENTS
}

/**
 * 获取文档数量
 */
export const getDocumentCount = (): number => {
  return getDocuments().length
}

