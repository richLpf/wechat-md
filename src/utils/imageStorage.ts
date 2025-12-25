/**
 * 图片本地存储工具
 * 使用 localStorage 存储 base64 图片
 */

interface StoredImage {
  id: string
  name: string
  data: string // base64 数据
  size: number // 文件大小（字节）
  type: string // MIME 类型
  createdAt: number
}

const STORAGE_KEY = 'wechat-images'
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB 总大小限制

/**
 * 获取所有存储的图片
 */
export const getStoredImages = (): StoredImage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to get stored images:', error)
    return []
  }
}

/**
 * 计算已存储图片的总大小
 */
const getTotalSize = (): number => {
  const images = getStoredImages()
  return images.reduce((total, img) => total + img.size, 0)
}

/**
 * 将文件转换为 base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:image/...;base64, 前缀，只保留 base64 数据
      const base64 = result.split(',')[1] || result
      if (!base64) {
        reject(new Error('无法读取文件内容'))
        return
      }
      resolve(base64)
    }
    reader.onerror = (error) => {
      console.error('FileReader 错误:', error)
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 保存图片到本地存储
 */
export const saveImage = async (file: File): Promise<string | null> => {
  try {
    // 检查文件大小
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`图片大小不能超过 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
    }

    // 检查总大小
    const currentTotal = getTotalSize()
    if (currentTotal + file.size > MAX_TOTAL_SIZE) {
      throw new Error(`总存储空间不足，请先删除一些图片`)
    }

    // 转换为 base64
    const base64 = await fileToBase64(file)
    
    // 生成唯一 ID
    const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 确保图片类型正确（如果没有类型，默认为 image/png）
    const imageType = file.type || 'image/png'
    
    // 创建存储对象
    const storedImage: StoredImage = {
      id,
      name: file.name || `image-${id}.png`,
      data: base64,
      size: file.size,
      type: imageType,
      createdAt: Date.now(),
    }
    
    console.log('图片已保存:', {
      id,
      name: storedImage.name,
      type: storedImage.type,
      size: storedImage.size,
      dataLength: base64.length
    })

    // 保存到 localStorage
    const images = getStoredImages()
    images.push(storedImage)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))

    return id
  } catch (error) {
    console.error('Failed to save image:', error)
    throw error
  }
}

/**
 * 根据 ID 获取图片的 base64 数据 URL
 */
export const getImageDataUrl = (id: string): string | null => {
  try {
    const images = getStoredImages()
    const image = images.find(img => img.id === id)
    if (!image) return null
    
    // 返回完整的 data URL
    return `data:${image.type};base64,${image.data}`
  } catch (error) {
    console.error('Failed to get image:', error)
    return null
  }
}

/**
 * 根据 ID 获取图片信息
 */
export const getImageInfo = (id: string): StoredImage | null => {
  try {
    const images = getStoredImages()
    return images.find(img => img.id === id) || null
  } catch (error) {
    console.error('Failed to get image info:', error)
    return null
  }
}

/**
 * 删除图片
 */
export const deleteImage = (id: string): boolean => {
  try {
    const images = getStoredImages()
    const filtered = images.filter(img => img.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete image:', error)
    return false
  }
}

/**
 * 清理所有图片
 */
export const clearAllImages = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear images:', error)
    return false
  }
}

/**
 * 从 Markdown 图片语法中提取图片 ID
 * 支持格式: ![alt](local://image-id) 或 ![alt](local://img-xxx)
 */
export const extractImageId = (markdown: string): string[] => {
  const regex = /!\[.*?\]\(local:\/\/([^)]+)\)/g
  const ids: string[] = []
  let match
  while ((match = regex.exec(markdown)) !== null) {
    ids.push(match[1])
  }
  return ids
}

/**
 * 将图片 ID 转换为 data URL 用于显示
 */
export const convertImageUrl = (url: string): string => {
  if (url && url.startsWith('local://')) {
    const id = url.replace('local://', '').trim()
    if (!id) {
      console.warn('图片 ID 为空:', url)
      return url
    }
    const dataUrl = getImageDataUrl(id)
    if (!dataUrl) {
      console.warn('无法找到图片，ID:', id, '所有图片:', getStoredImages().map(img => img.id))
      return url
    }
    return dataUrl
  }
  return url
}

/**
 * 获取存储统计信息
 */
export const getStorageStats = () => {
  const images = getStoredImages()
  const totalSize = getTotalSize()
  return {
    count: images.length,
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    maxSizeMB: (MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2),
  }
}

