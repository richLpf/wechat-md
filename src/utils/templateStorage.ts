import { Template } from '../types'

const STORAGE_KEY = 'wechat-templates'
const MAX_TEMPLATES = 3

export const getTemplates = (): Template[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to get templates:', error)
    return []
  }
}

export const saveTemplate = (template: Template): boolean => {
  try {
    const templates = getTemplates()
    
    // 检查是否超过最大数量限制
    const existingIndex = templates.findIndex(t => t.id === template.id)
    if (existingIndex === -1 && templates.length >= MAX_TEMPLATES) {
      return false
    }

    // 如果设置为默认，取消其他模版的默认状态
    if (template.isDefault) {
      templates.forEach(t => {
        if (t.id !== template.id) {
          t.isDefault = false
        }
      })
    }

    if (existingIndex !== -1) {
      // 更新现有模版
      templates[existingIndex] = { ...template, updatedAt: Date.now() }
    } else {
      // 添加新模版
      templates.push({
        ...template,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    return true
  } catch (error) {
    console.error('Failed to save template:', error)
    return false
  }
}

export const deleteTemplate = (id: string): boolean => {
  try {
    const templates = getTemplates()
    const filtered = templates.filter(t => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete template:', error)
    return false
  }
}

export const setDefaultTemplate = (id: string): boolean => {
  try {
    const templates = getTemplates()
    templates.forEach(t => {
      t.isDefault = t.id === id
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    return true
  } catch (error) {
    console.error('Failed to set default template:', error)
    return false
  }
}

export const getDefaultTemplate = (): Template | null => {
  const templates = getTemplates()
  return templates.find(t => t.isDefault) || templates[0] || null
}

export const getTemplateById = (id: string): Template | null => {
  const templates = getTemplates()
  return templates.find(t => t.id === id) || null
}

export const canAddMoreTemplates = (): boolean => {
  const templates = getTemplates()
  return templates.length < MAX_TEMPLATES
}

