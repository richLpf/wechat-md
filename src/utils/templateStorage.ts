import { Template } from '../types'
import { getBuiltinTemplates, isBuiltinTemplate } from './builtinTemplates'

const STORAGE_KEY = 'wechat-templates'
const DEFAULT_TEMPLATE_KEY = 'wechat-default-template-id' // 存储默认模版 ID
const MAX_CUSTOM_TEMPLATES = 3 // 用户自定义模版最多3个

/**
 * 获取所有模版（内置 + 用户自定义）
 */
export const getTemplates = (): Template[] => {
  const builtin = getBuiltinTemplates()
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    const customTemplates = data ? JSON.parse(data) : []
    
    // 获取用户设置的默认模版 ID
    const defaultId = localStorage.getItem(DEFAULT_TEMPLATE_KEY)
    
    // 合并内置模版和用户模版，内置模版在前
    const allTemplates = [...builtin, ...customTemplates]
    
    // 根据 localStorage 中的默认模版 ID 更新所有模版的 isDefault 状态
    // 确保只有一个模版是默认的
    if (defaultId) {
      // 如果设置了默认模版 ID，只有匹配的模版才是默认
      allTemplates.forEach(t => {
        t.isDefault = t.id === defaultId
      })
    } else {
      // 如果没有设置，使用内置模版中标记为默认的（微信绿）
      // 先重置所有模版的 isDefault 状态
      allTemplates.forEach(t => {
        if (isBuiltinTemplate(t.id)) {
          // 对于内置模版，使用原始定义中的 isDefault 状态
          // 但需要确保只有一个默认
          const originalBuiltin = builtin.find(b => b.id === t.id)
          t.isDefault = originalBuiltin ? originalBuiltin.isDefault : false
        } else {
          // 用户模版都不是默认
          t.isDefault = false
        }
      })
    }
    
    return allTemplates
  } catch (error) {
    console.error('Failed to get templates:', error)
    return builtin
  }
}

/**
 * 获取用户自定义模版
 */
export const getCustomTemplates = (): Template[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to get custom templates:', error)
    return []
  }
}

/**
 * 保存用户自定义模版（不能保存内置模版）
 */
export const saveTemplate = (template: Template): boolean => {
  try {
    // 不允许修改内置模版
    if (isBuiltinTemplate(template.id)) {
      console.warn('Cannot save builtin template')
      return false
    }

    const customTemplates = getCustomTemplates()
    
    // 检查是否超过最大数量限制
    const existingIndex = customTemplates.findIndex(t => t.id === template.id)
    if (existingIndex === -1 && customTemplates.length >= MAX_CUSTOM_TEMPLATES) {
      return false
    }

    // 如果设置为默认，保存默认模版 ID
    if (template.isDefault) {
      localStorage.setItem(DEFAULT_TEMPLATE_KEY, template.id)
      // 取消其他用户模版的默认状态
      customTemplates.forEach(t => {
        if (t.id !== template.id) {
          t.isDefault = false
        }
      })
    }

    if (existingIndex !== -1) {
      // 更新现有模版
      customTemplates[existingIndex] = { ...template, updatedAt: Date.now() }
    } else {
      // 添加新模版
      customTemplates.push({
        ...template,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates))
    return true
  } catch (error) {
    console.error('Failed to save template:', error)
    return false
  }
}

/**
 * 删除模版（只能删除用户自定义模版）
 */
export const deleteTemplate = (id: string): boolean => {
  try {
    // 不允许删除内置模版
    if (isBuiltinTemplate(id)) {
      console.warn('Cannot delete builtin template')
      return false
    }

    // 如果删除的是默认模版，清除默认模版设置
    const defaultId = localStorage.getItem(DEFAULT_TEMPLATE_KEY)
    if (defaultId === id) {
      localStorage.removeItem(DEFAULT_TEMPLATE_KEY)
    }

    const customTemplates = getCustomTemplates()
    const filtered = customTemplates.filter(t => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete template:', error)
    return false
  }
}

/**
 * 设置默认模版（可以是内置模版或用户模版）
 */
export const setDefaultTemplate = (id: string): boolean => {
  try {
    // 保存默认模版 ID 到 localStorage（这是唯一真实的默认模版标识）
    localStorage.setItem(DEFAULT_TEMPLATE_KEY, id)
    
    // 更新用户自定义模版的默认状态（仅用于显示，实际以 localStorage 为准）
    const customTemplates = getCustomTemplates()
    customTemplates.forEach(t => {
      t.isDefault = t.id === id
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates))
    
    // 触发更新事件，让所有组件重新获取模版列表
    window.dispatchEvent(new Event('templatesUpdated'))
    
    return true
  } catch (error) {
    console.error('Failed to set default template:', error)
    return false
  }
}

/**
 * 获取默认模版
 */
export const getDefaultTemplate = (): Template | null => {
  try {
    // 先从 localStorage 读取用户设置的默认模版 ID
    const defaultId = localStorage.getItem(DEFAULT_TEMPLATE_KEY)
    if (defaultId) {
      const template = getTemplateById(defaultId)
      if (template) {
        return template
      }
    }
    
    // 如果没有设置，查找标记为默认的模版
    const templates = getTemplates()
    const defaultTemplate = templates.find(t => t.isDefault)
    if (defaultTemplate) {
      return defaultTemplate
    }
    
    // 如果都没有，返回第一个内置模版（微信绿）
    return templates[0] || null
  } catch (error) {
    console.error('Failed to get default template:', error)
    const templates = getTemplates()
    return templates[0] || null
  }
}

/**
 * 根据 ID 获取模版（包括内置模版和用户模版）
 */
export const getTemplateById = (id: string): Template | null => {
  const templates = getTemplates()
  return templates.find(t => t.id === id) || null
}

/**
 * 检查是否可以添加更多用户自定义模版
 */
export const canAddMoreTemplates = (): boolean => {
  const customTemplates = getCustomTemplates()
  return customTemplates.length < MAX_CUSTOM_TEMPLATES
}

