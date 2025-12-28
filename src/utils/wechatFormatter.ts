import { getTemplateById } from './templateStorage'
import { convertImageUrl } from './imageStorage'
// @ts-ignore - juice 可能没有类型定义
import juice from 'juice'

/**
 * 允许的 HTML 标签白名单
 */
const ALLOWED_TAGS = new Set([
  'section', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'img', 'hr',
  'strong', 'em', 'a', 'br', 'span', 'pre', 'code',
  'table', 'tr', 'th', 'td'  // 添加表格标签，不包括 thead/tbody
])

// 允许的代码块相关标签（用于微信公众号兼容格式）
// const CODE_BLOCK_ALLOWED_TAGS = new Set(['section', 'pre', 'code', 'span'])

/**
 * 清理和验证 HTML 元素（保留原有结构，只清理不允许的内容）
 */
const cleanElement = (element: Element, depth: number = 0): Element | null => {
  // 最大嵌套深度 3 层
  if (depth > 3) {
    return null
  }
  
  const tagName = element.tagName.toLowerCase()
  
  // 只保留允许的标签
  if (!ALLOWED_TAGS.has(tagName)) {
    // 如果不允许，尝试提取文本内容
    const text = element.textContent || ''
    if (text.trim()) {
      const p = document.createElement('p')
      p.textContent = text.trim()
      return p
    }
    return null
  }
  
  // 克隆元素（保留原有结构）
  const newElement = element.cloneNode(false) as HTMLElement
  
  // 处理 img 标签
  if (tagName === 'img') {
    const src = element.getAttribute('src')
    const alt = element.getAttribute('alt') || ''
    if (src) {
      newElement.setAttribute('src', src)
    }
    newElement.setAttribute('alt', alt)
    return newElement
  }
  
  // 处理嵌套规则
  if (tagName === 'ul' || tagName === 'ol') {
    // ul/ol 内只能包含 li
    Array.from(element.children).forEach(child => {
      if (child.tagName.toLowerCase() === 'li') {
        const cleaned = cleanElement(child, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      }
    })
    // 如果没有 li，返回 null
    if (newElement.children.length === 0) {
      return null
    }
    return newElement
  }
  
  if (tagName === 'blockquote') {
    // blockquote 内只能包含 p
    Array.from(element.children).forEach(child => {
      if (child.tagName.toLowerCase() === 'p') {
        const cleaned = cleanElement(child, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      } else {
        // 如果不是 p，包装成 p
        const text = child.textContent || ''
        if (text.trim()) {
          const p = document.createElement('p')
          p.textContent = text.trim()
          newElement.appendChild(p)
        }
      }
    })
    // 如果没有内容，返回 null
    if (newElement.children.length === 0) {
      return null
    }
    return newElement
  }
  
  if (tagName === 'pre') {
    // 普通 pre 标签处理：pre 内可以包含 code 标签，也可以直接包含文本
    
    // 普通 pre 标签处理：pre 内可以包含 code 标签，也可以直接包含文本
    Array.from(element.children).forEach(child => {
      const childTagName = child.tagName.toLowerCase()
      if (childTagName === 'code') {
        const cleaned = cleanElement(child, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      } else {
        // 如果不是 code，保留文本内容
        const text = child.textContent || ''
        if (text.trim()) {
          const code = document.createElement('code')
          code.textContent = text.trim()
          newElement.appendChild(code)
        }
      }
    })
    // 如果没有子元素，检查是否有文本内容
    if (newElement.children.length === 0) {
      const text = element.textContent || ''
      if (text.trim()) {
        const code = document.createElement('code')
        code.textContent = text.trim()
        newElement.appendChild(code)
      } else {
        return null
      }
    }
    return newElement
  }
  
  // 处理微信公众号格式的代码块 section
  if (tagName === 'section') {
    // 检查是否是代码块（通过 style 属性判断，包含 background:#f6f8fa）
    const style = element.getAttribute('style') || ''
    if (style.includes('background:#f6f8fa') || style.includes('background: #f6f8fa')) {
      // 这是代码块 section，保留整个结构和所有属性
      // 保留所有子元素（外层 div 和内层 div）
      Array.from(element.children).forEach(child => {
        if (child.tagName.toLowerCase() === 'div') {
          const cleaned = cleanElement(child, depth + 1)
          if (cleaned) {
            newElement.appendChild(cleaned)
          } else {
            // 如果清理失败，直接克隆（保留原始结构）
            const cloned = child.cloneNode(true) as HTMLElement
            newElement.appendChild(cloned)
          }
        }
      })
      // 保留所有属性（包括 style）
      Array.from(element.attributes).forEach(attr => {
        newElement.setAttribute(attr.name, attr.value)
      })
      return newElement
    }
    // 其他 section 标签正常处理（递归处理子元素）
  }
  
  // 处理表格结构
  if (tagName === 'table') {
    // table 内可能包含 tr 或 thead/tbody/tfoot（需要处理所有情况）
    let hasValidTr = false
    const allTrs: Element[] = []
    
    // 1. 先收集直接子元素中的 tr
    const directTrs = Array.from(element.children).filter(child => child.tagName.toLowerCase() === 'tr')
    allTrs.push(...directTrs)
    
    // 2. 收集 thead/tbody/tfoot 中的 tr（虽然理论上不应该有，但为了兼容性还是处理）
    const thead = element.querySelector('thead')
    if (thead) {
      const theadTrs = Array.from(thead.children).filter(child => child.tagName.toLowerCase() === 'tr')
      allTrs.push(...theadTrs)
    }
    
    const tbody = element.querySelector('tbody')
    if (tbody) {
      const tbodyTrs = Array.from(tbody.children).filter(child => child.tagName.toLowerCase() === 'tr')
      allTrs.push(...tbodyTrs)
    }
    
    const tfoot = element.querySelector('tfoot')
    if (tfoot) {
      const tfootTrs = Array.from(tfoot.children).filter(child => child.tagName.toLowerCase() === 'tr')
      allTrs.push(...tfootTrs)
    }
    
    console.log(`清理表格: 找到 ${allTrs.length} 个 tr 子元素（直接: ${directTrs.length}, thead: ${thead ? thead.children.length : 0}, tbody: ${tbody ? tbody.children.length : 0}）`)
    
    // 3. 处理所有收集到的 tr
    allTrs.forEach((child, index) => {
      console.log(`  处理 tr ${index + 1}:`, child.outerHTML.substring(0, 200))
      const cleaned = cleanElement(child, depth + 1)
      if (cleaned) {
        console.log(`  tr ${index + 1} 清理后保留，有 ${cleaned.children.length} 个子元素`)
        newElement.appendChild(cleaned)
        hasValidTr = true
      } else {
        console.warn(`  tr ${index + 1} 清理后返回 null，被丢弃`)
      }
    })
    
    // 如果没有有效的 tr，记录警告但保留表格（可能后续会添加内容）
    if (!hasValidTr) {
      console.warn('表格清理后没有有效的 tr 元素，但保留表格结构')
    }
    // 保留所有属性（包括 border, cellpadding, cellspacing, width）
    Array.from(element.attributes).forEach(attr => {
      newElement.setAttribute(attr.name, attr.value)
    })
    return newElement
  }
  
  if (tagName === 'tr') {
    // tr 内只能包含 th 或 td
    const thsAndTds = Array.from(element.children).filter(child => {
      const childTagName = child.tagName.toLowerCase()
      return childTagName === 'th' || childTagName === 'td'
    })
    console.log(`清理 tr: 找到 ${thsAndTds.length} 个 th/td 子元素`)
    thsAndTds.forEach((child, index) => {
      const childTagName = child.tagName.toLowerCase()
      console.log(`  处理 ${childTagName} ${index + 1}:`, child.outerHTML.substring(0, 100))
      const cleaned = cleanElement(child, depth + 1)
      if (cleaned) {
        console.log(`  ${childTagName} ${index + 1} 清理后保留`)
        newElement.appendChild(cleaned)
      } else {
        console.warn(`  ${childTagName} ${index + 1} 清理后返回 null，被丢弃`)
      }
    })
    // 如果没有 th 或 td，返回 null（不保留空的 tr）
    if (newElement.children.length === 0) {
      console.warn('tr 清理后没有有效的 th/td 子元素，返回 null')
      return null
    }
    // 保留所有属性（但不包括 style）
    Array.from(element.attributes).forEach(attr => {
      if (attr.name !== 'style') {
        newElement.setAttribute(attr.name, attr.value)
      }
    })
    return newElement
  }
  
  if (tagName === 'th' || tagName === 'td') {
    // th/td 内可以包含任何允许的内容
    // 处理所有子节点（包括文本节点和元素节点）
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        newElement.appendChild(node.cloneNode(true))
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const cleaned = cleanElement(node as Element, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      }
    })
    // 如果没有子节点，保留文本内容（即使为空也保留，避免单元格丢失）
    if (newElement.childNodes.length === 0) {
      const text = element.textContent || ''
      // 即使文本为空，也保留 th/td 元素（至少保留一个空格，避免单元格完全消失）
      newElement.textContent = text.trim() || ' '
    }
    // 保留所有属性（但不包括 style）
    Array.from(element.attributes).forEach(attr => {
      if (attr.name !== 'style') {
        newElement.setAttribute(attr.name, attr.value)
      }
    })
    return newElement
  }
  
  if (tagName === 'code') {
    // 普通 code 标签：保留所有文本内容，不处理子元素（因为代码块中的内容应该原样保留）
    const text = element.textContent || ''
    if (text.trim()) {
      newElement.textContent = text.trim()
      return newElement
    } else {
      // 如果没有文本内容，返回 null
      return null
    }
  }
  
  // 处理分隔符 p 标签（代码块后的分隔符）
  if (tagName === 'p') {
    const style = element.getAttribute('style') || ''
    if (style.includes('height:0') && style.includes('overflow:hidden')) {
      // 这是分隔符，保留完整结构和属性
      newElement.innerHTML = element.innerHTML || '&nbsp;'
      Array.from(element.attributes).forEach(attr => {
        newElement.setAttribute(attr.name, attr.value)
      })
      return newElement
    }
  }
  
  // 处理 p 标签：保留所有内容（包括文本和子元素如 br）
  if (tagName === 'p') {
    // 检查是否是分隔符
    const style = element.getAttribute('style') || ''
    if (style.includes('height:0') && style.includes('overflow:hidden')) {
      // 这是分隔符，保留完整结构和属性
      newElement.innerHTML = element.innerHTML || '&nbsp;'
      Array.from(element.attributes).forEach(attr => {
        newElement.setAttribute(attr.name, attr.value)
      })
      return newElement
    }
    
    // 普通 p 标签：处理所有子节点（包括文本节点和元素节点）
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // 文本节点直接克隆
        newElement.appendChild(node.cloneNode(true))
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 元素节点递归清理
        const cleaned = cleanElement(node as Element, depth + 1)
        if (cleaned) {
          newElement.appendChild(cleaned)
        }
      }
    })
    
    // 如果处理后没有内容，检查是否是空段落
    if (newElement.children.length === 0 && !newElement.textContent?.trim()) {
      // 完全空的段落，返回 null（除非是分隔符）
      return null
    }
    
    return newElement
  }
  
  // 其他标签：递归处理子元素
  Array.from(element.children).forEach(child => {
    const cleaned = cleanElement(child, depth + 1)
    if (cleaned) {
      newElement.appendChild(cleaned)
    }
  })
  
  // 如果没有子元素，保留文本内容
  if (newElement.children.length === 0) {
    const text = element.textContent || ''
    if (text.trim()) {
      newElement.textContent = text.trim()
    } else {
      // 如果既没有子元素也没有文本，返回 null（除了自闭合标签和分隔符）
      if (!['br', 'hr', 'img'].includes(tagName)) {
        // 检查是否是分隔符 p
        if (tagName === 'p') {
          const style = element.getAttribute('style') || ''
          if (style.includes('height:0') && style.includes('overflow:hidden')) {
            // 分隔符即使内容为空也保留
            newElement.innerHTML = '&nbsp;'
            Array.from(element.attributes).forEach(attr => {
              newElement.setAttribute(attr.name, attr.value)
            })
            return newElement
          }
        }
        return null
      }
    }
  }
  
  return newElement
}

/**
 * 转换代码块为微信公众号兼容格式
 */
const convertCodeBlockForWechat = (preElement: HTMLElement): HTMLElement => {
  // 创建外层 section
  const section = document.createElement('section')
  
  // 获取代码内容
  // 优先从 code 标签获取，如果没有则从 pre 标签获取
  // 使用 textContent 可以获取所有嵌套元素的文本内容（包括 highlight.js 处理后的内容）
  const codeElement = preElement.querySelector('code')
  let codeText = ''
  if (codeElement) {
    // 获取 code 元素及其所有子元素的文本内容
    codeText = codeElement.textContent || codeElement.innerText || ''
  } else {
    // 如果没有 code 元素，直接从 pre 元素获取
    codeText = preElement.textContent || preElement.innerText || ''
  }
  
  // 如果仍然为空，尝试从所有子元素获取
  if (!codeText && preElement.children.length > 0) {
    codeText = Array.from(preElement.children)
      .map(child => {
        const htmlEl = child as HTMLElement
        return child.textContent || (htmlEl.innerText || '')
      })
      .join('\n')
  }
  
  // 设置 section 的样式
  section.setAttribute('style', 'background:#f6f8fa;padding:12px;border-radius:6px;margin:16px 0;')
  
  // 创建外层 div 容器
  const outerDiv = document.createElement('div')
  outerDiv.setAttribute('style', 'font-family:Menlo,monospace;font-size:14px;line-height:1.4;')
  
  // 按行分割代码，每行用内层 <div> 标签包裹
  const lines = codeText.split('\n')
  lines.forEach((line) => {
    const innerDiv = document.createElement('div')
    if (line === '') {
      // 空行用 &nbsp; 表示
      innerDiv.innerHTML = '&nbsp;'
    } else {
      innerDiv.textContent = line
    }
    outerDiv.appendChild(innerDiv)
  })
  
  section.appendChild(outerDiv)
  return section
}

/**
 * 从 style 字符串中提取背景色
 */
const extractBackgroundColor = (style: string): string | null => {
  if (!style) return null
  
  // 匹配 background-color: #xxx; 或 background: #xxx;
  const bgColorMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i)
  if (bgColorMatch) {
    const color = bgColorMatch[1].trim()
    // 如果是 rgb/rgba，转换为 hex（简化处理，只处理常见情况）
    if (color.startsWith('rgb')) {
      // 对于公众号，rgb 可能不被支持，返回 null
      return null
    }
    // 返回颜色值（可能是 hex、颜色名等）
    return color
  }
  return null
}

/**
 * 合并样式字符串
 * 将现有样式和新样式合并，新样式优先级更高
 * @param existingStyle 现有的 style 字符串
 * @param newStyle 新的 style 字符串
 * @returns 合并后的 style 字符串
 */
const mergeStyles = (existingStyle: string, newStyle: string): string => {
  // 解析现有样式
  const styleMap = new Map<string, string>()
  if (existingStyle) {
    existingStyle.split(';').forEach(style => {
      const trimmed = style.trim()
      if (trimmed) {
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex > 0) {
          const prop = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()
          styleMap.set(prop, value)
        }
      }
    })
  }
  
  // 解析新样式并覆盖现有样式
  if (newStyle) {
    newStyle.split(';').forEach(style => {
      const trimmed = style.trim()
      if (trimmed) {
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex > 0) {
          const prop = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()
          styleMap.set(prop, value) // 新样式覆盖旧样式
        }
      }
    })
  }
  
  // 构建合并后的样式字符串
  const mergedStyles: string[] = []
  styleMap.forEach((value, prop) => {
    mergedStyles.push(`${prop}: ${value}`)
  })
  
  return mergedStyles.join('; ')
}

/**
 * 转换所有代码块为微信公众号兼容格式
 */
const convertAllCodeBlocks = (element: HTMLElement): void => {
  // 查找所有 pre.wechat-article-code-block 元素
  const codeBlocks = element.querySelectorAll('pre.wechat-article-code-block')
  
  codeBlocks.forEach((preBlock) => {
    const pre = preBlock as HTMLElement
    const converted = convertCodeBlockForWechat(pre)
    
    // 替换原元素
    if (pre.parentNode) {
      pre.parentNode.replaceChild(converted, pre)
      
      // 在代码块后添加分隔符，阻止代码块合并
      const separator = document.createElement('p')
      separator.setAttribute('style', 'margin:0;height:0;overflow:hidden;')
      separator.innerHTML = '&nbsp;'
      
      // 插入分隔符
      if (converted.parentNode) {
        converted.parentNode.insertBefore(separator, converted.nextSibling)
      }
    }
  })
}

/**
 * 转换表格为微信公众号兼容格式
 * 每个 td/th 都必须有完整的 inline style
 */
const convertTablesForWechat = (element: HTMLElement): void => {
  const tables = element.querySelectorAll('table')
  console.log(`convertTablesForWechat: 找到 ${tables.length} 个表格`)
  
  tables.forEach((table, tableIndex) => {
    console.log(`处理表格 ${tableIndex + 1}:`, table.outerHTML.substring(0, 300))
    const tableEl = table as HTMLElement
    
    // 1. 移除所有 CSS style
    tableEl.removeAttribute('style')
    tableEl.removeAttribute('class')
    tableEl.removeAttribute('id')
    
    // 2. 添加传统 HTML 属性
    tableEl.setAttribute('border', '1')
    tableEl.setAttribute('cellpadding', '6')
    tableEl.setAttribute('cellspacing', '0')
    tableEl.setAttribute('width', '100%')
    
    // 3. 移除 thead/tbody，将 tr 直接移到 table 下
    const allTrs: HTMLElement[] = []
    
    // 收集 thead 中的 tr（在移除之前先收集，避免引用丢失）
    const thead = tableEl.querySelector('thead')
    if (thead) {
      // 使用 Array.from 确保获取实际的元素数组
      const theadTrs = Array.from(thead.querySelectorAll('tr'))
      theadTrs.forEach(tr => {
        allTrs.push(tr as HTMLElement)
        // 立即将 tr 移动到 table 下，避免在 remove 时丢失
        tableEl.appendChild(tr)
      })
      thead.remove()
    }
    
    // 收集 tbody 中的 tr（在移除之前先收集，避免引用丢失）
    const tbody = tableEl.querySelector('tbody')
    if (tbody) {
      // 使用 Array.from 确保获取实际的元素数组
      const tbodyTrs = Array.from(tbody.querySelectorAll('tr'))
      tbodyTrs.forEach(tr => {
        allTrs.push(tr as HTMLElement)
        // 立即将 tr 移动到 table 下，避免在 remove 时丢失
        tableEl.appendChild(tr)
      })
      tbody.remove()
    }
    
    // 收集直接子元素中的 tr（如果没有 thead/tbody）
    if (allTrs.length === 0) {
      const directTrs = Array.from(tableEl.children).filter(child => child.tagName.toLowerCase() === 'tr')
      directTrs.forEach(tr => allTrs.push(tr as HTMLElement))
    }
    
    // 4. 处理所有 tr（转换 th 为 td，提取背景色，移除 style）
    allTrs.forEach(tr => {
      // 检查 tr 是否有 th 或 td 内容（在移除属性之前检查，避免误删）
      const hasContent = tr.querySelector('th, td') !== null
      if (!hasContent) {
        // 如果没有内容，移除这个 tr
        console.warn('表格 tr 没有内容，将被移除:', tr.outerHTML)
        tr.remove()
        return
      }
      
      // 提取 tr 的背景色（在移除 style 之前）
      const trStyle = tr.getAttribute('style') || ''
      const trBgColor = extractBackgroundColor(trStyle)
      if (trBgColor) {
        tr.setAttribute('bgcolor', trBgColor)
      }
      
      // 移除 tr 的 style、class、id
      tr.removeAttribute('style')
      tr.removeAttribute('class')
      tr.removeAttribute('id')
      
      // 处理 th：转换为 td，提取背景色，添加 strong 标签强调
      const ths = tr.querySelectorAll('th')
      ths.forEach(th => {
        const thEl = th as HTMLElement
        const thStyle = thEl.getAttribute('style') || ''
        const thBgColor = extractBackgroundColor(thStyle)
        
        // 创建新的 td 元素
        const td = document.createElement('td')
        
        // 设置背景色
        if (thBgColor) {
          td.setAttribute('bgcolor', thBgColor)
        }
        
        // 保留其他属性（但不包括 style、class、id）
        Array.from(thEl.attributes).forEach(attr => {
          if (attr.name !== 'style' && attr.name !== 'class' && attr.name !== 'id') {
            td.setAttribute(attr.name, attr.value)
          }
        })
        
        // 将 th 的内容包装在 strong 标签中（强调表头）
        const content = thEl.textContent || thEl.innerHTML || ''
        if (content.trim()) {
          const strong = document.createElement('strong')
          strong.textContent = content.trim()
          td.appendChild(strong)
        } else {
          td.textContent = ' '
        }
        
        // 替换 th 为 td
        thEl.parentNode?.replaceChild(td, thEl)
      })
      
      // 处理 td：提取背景色，移除 style
      const tds = tr.querySelectorAll('td')
      tds.forEach(td => {
        const tdEl = td as HTMLElement
        const tdStyle = tdEl.getAttribute('style') || ''
        const tdBgColor = extractBackgroundColor(tdStyle)
        
        // 设置背景色
        if (tdBgColor) {
          tdEl.setAttribute('bgcolor', tdBgColor)
        }
        
        // 移除 style、class、id
        tdEl.removeAttribute('style')
        tdEl.removeAttribute('class')
        tdEl.removeAttribute('id')
      })
    })
    
    // 5. 验证表格是否有有效的 tr
    const finalTrs = tableEl.querySelectorAll('tr')
    console.log(`表格转换完成，共有 ${finalTrs.length} 个 tr 元素`)
    if (finalTrs.length === 0) {
      console.warn('警告：表格转换后没有有效的 tr 元素，表格 HTML:', tableEl.outerHTML)
    } else {
      finalTrs.forEach((tr, index) => {
        const thCount = tr.querySelectorAll('th').length
        const tdCount = tr.querySelectorAll('td').length
        console.log(`  tr ${index + 1}: ${thCount} 个 th, ${tdCount} 个 td`)
      })
    }
  })
}

/**
 * 转换标题为 p 标签（h1~h6 → p）
 */
const convertHeadingsForWechat = (element: HTMLElement): void => {
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  
  const headingStyles: Record<string, string> = {
    'h1': 'font-size:24px;font-weight:600;margin:16px 0 8px;',
    'h2': 'font-size:20px;font-weight:600;margin:16px 0 8px;',
    'h3': 'font-size:18px;font-weight:600;margin:16px 0 8px;',
    'h4': 'font-size:16px;font-weight:600;margin:14px 0 8px;',
    'h5': 'font-size:15px;font-weight:600;margin:12px 0 8px;',
    'h6': 'font-size:14px;font-weight:600;margin:10px 0 8px;'
  }
  
  headings.forEach((heading) => {
    const headingEl = heading as HTMLElement
    const tagName = headingEl.tagName.toLowerCase()
    const newStyle = headingStyles[tagName] || headingStyles['h3']
    
    // 获取现有样式（juice 已转换的模板样式）
    const existingStyle = headingEl.getAttribute('style') || ''
    
    // 合并样式：保留模板样式，添加公众号必需样式
    const mergedStyle = mergeStyles(existingStyle, newStyle)
    
    // 创建新的 p 标签
    const p = document.createElement('p')
    p.setAttribute('style', mergedStyle)
    p.innerHTML = headingEl.innerHTML
    
    // 替换原元素
    if (headingEl.parentNode) {
      headingEl.parentNode.replaceChild(p, headingEl)
    }
  })
}

/**
 * 扁平化列表并添加 inline style
 * 注意：根据测试用例，保持嵌套结构，只添加样式，不扁平化
 */
const flattenListsForWechat = (element: HTMLElement): void => {
  // 处理所有 ul 和 ol
  const allLists = Array.from(element.querySelectorAll('ul, ol'))
  
  allLists.forEach((list) => {
    const listEl = list as HTMLElement
    
    // 合并列表样式：保留模板样式，添加公众号必需样式
    const existingListStyle = listEl.getAttribute('style') || ''
    const newListStyle = 'padding-left:20px;margin:8px 0;'
    listEl.setAttribute('style', mergeStyles(existingListStyle, newListStyle))
    listEl.removeAttribute('class')
    listEl.removeAttribute('id')
    
    // 处理所有 li
    const lis = Array.from(listEl.querySelectorAll('li'))
    lis.forEach((li) => {
      const liEl = li as HTMLElement
      
      // 合并 li 样式：保留模板样式，添加公众号必需样式
      const existingLiStyle = liEl.getAttribute('style') || ''
      const newLiStyle = 'margin:4px 0;'
      liEl.setAttribute('style', mergeStyles(existingLiStyle, newLiStyle))
      liEl.removeAttribute('class')
      liEl.removeAttribute('id')
    })
  })
}

/**
 * 获取元素在 DOM 树中的深度
 */
// const getElementDepth = (element: Element): number => {
//   let depth = 0
//   let current: Element | null = element
//   while (current && current.parentElement) {
//     depth++
//     current = current.parentElement
//   }
//   return depth
// }

/**
 * 转换任务列表为伪任务列表
 */
const convertTaskListsForWechat = (element: HTMLElement): void => {
  // 查找所有包含 checkbox 的 li
  const taskListItems = element.querySelectorAll('li')
  
  taskListItems.forEach((li) => {
    const liEl = li as HTMLElement
    const checkbox = liEl.querySelector('input[type="checkbox"]')
    
    if (checkbox) {
      const isChecked = (checkbox as HTMLInputElement).checked
      // const checkboxText = checkbox.textContent || ''
      
      // 获取 li 的文本内容（排除 checkbox）
      let text = liEl.textContent || ''
      // 移除 checkbox 相关的文本标记（如 [x] 或 [ ]）
      text = text.replace(/^\s*\[[x\s]\]\s*/i, '').trim()
      
      // 创建新的文本内容
      const taskIcon = isChecked ? '☑️' : '⬜'
      const newText = `${taskIcon} ${text}`
      
      // 清空 li 内容并设置新文本
      liEl.innerHTML = ''
      liEl.textContent = newText
      
      // 设置 li 样式（移除 list-style，因为任务列表不需要圆点）
      const existingStyle = liEl.getAttribute('style') || ''
      if (!existingStyle.includes('list-style')) {
        const mergedStyle = mergeStyles(existingStyle, 'list-style:none;')
        liEl.setAttribute('style', mergedStyle)
      }
      
      // 移除 checkbox
      checkbox.remove()
    } else {
      // 检查文本中是否有 [x] 或 [ ] 标记
      const text = liEl.textContent || ''
      const taskMatch = text.match(/^\s*\[([x\s])\]\s*(.*)$/i)
      
      if (taskMatch) {
        const isChecked = taskMatch[1].toLowerCase() === 'x'
        const taskText = taskMatch[2]
        const taskIcon = isChecked ? '☑️' : '⬜'
        
        liEl.textContent = `${taskIcon} ${taskText}`
        
        // 设置 li 样式
        const existingStyle = liEl.getAttribute('style') || ''
        if (!existingStyle.includes('list-style')) {
          const mergedStyle = mergeStyles(existingStyle, 'list-style:none;')
          liEl.setAttribute('style', mergedStyle)
        }
      }
    }
  })
}

/**
 * 转换引用块为 section
 */
const convertBlockquotesForWechat = (element: HTMLElement): void => {
  const blockquotes = element.querySelectorAll('blockquote')
  
  blockquotes.forEach((blockquote) => {
    const blockquoteEl = blockquote as HTMLElement
    
    // 获取现有样式（juice 已转换的模板样式）
    const existingStyle = blockquoteEl.getAttribute('style') || ''
    const newStyle = 'border-left:4px solid #d0d7de;padding:8px 12px;background:#f8f9fa;margin:12px 0;font-size:14px;color:#555;'
    
    // 合并样式：保留模板样式，添加公众号必需样式
    const mergedStyle = mergeStyles(existingStyle, newStyle)
    
    // 创建新的 section 标签
    const section = document.createElement('section')
    section.setAttribute('style', mergedStyle)
    section.innerHTML = blockquoteEl.innerHTML
    
    // 替换原元素
    if (blockquoteEl.parentNode) {
      blockquoteEl.parentNode.replaceChild(section, blockquoteEl)
    }
  })
}

/**
 * 转换行内代码为 span
 */
const convertInlineCodeForWechat = (element: HTMLElement): void => {
  // 查找所有 code 标签，但排除在 pre 内的
  const allCodes = element.querySelectorAll('code')
  
  allCodes.forEach((code) => {
    const codeEl = code as HTMLElement
    
    // 检查是否在 pre 内
    const parentPre = codeEl.closest('pre')
    if (parentPre) {
      // 在 pre 内，跳过（代码块已经单独处理）
      return
    }
    
    // 获取现有样式（juice 已转换的模板样式）
    const existingStyle = codeEl.getAttribute('style') || ''
    const newStyle = 'background:#f6f8fa;padding:2px 6px;border-radius:3px;font-family:Menlo,monospace;font-size:14px;'
    
    // 合并样式：保留模板样式，添加公众号必需样式
    const mergedStyle = mergeStyles(existingStyle, newStyle)
    
    // 创建新的 span 标签
    const span = document.createElement('span')
    span.setAttribute('style', mergedStyle)
    span.textContent = codeEl.textContent || ''
    
    // 替换原元素
    if (codeEl.parentNode) {
      codeEl.parentNode.replaceChild(span, codeEl)
    }
  })
}

/**
 * 转换分割线
 */
const convertHrForWechat = (element: HTMLElement): void => {
  const hrs = element.querySelectorAll('hr')
  
  hrs.forEach((hr) => {
    const hrEl = hr as HTMLElement
    
    // 获取现有样式（juice 已转换的模板样式）
    const existingStyle = hrEl.getAttribute('style') || ''
    const newStyle = 'border:none;border-top:1px solid #ddd;margin:16px 0;'
    
    // 合并样式：保留模板样式，添加公众号必需样式
    const mergedStyle = mergeStyles(existingStyle, newStyle)
    hrEl.setAttribute('style', mergedStyle)
    hrEl.removeAttribute('class')
    hrEl.removeAttribute('id')
  })
}

/**
 * 应用特殊规则样式
 */
const applySpecialRules = (element: HTMLElement): void => {
  const tagName = element.tagName.toLowerCase()
  const existingStyle = element.getAttribute('style') || ''
  const styles: string[] = []
  
  // 特殊规则：所有 <p> 内文本对齐 justify，letter-spacing 0.5px
  // 但是代码块中的 p 标签（margin:0）不需要这些样式
  if (tagName === 'p') {
    // 检查是否是代码块中的 p（通过父元素或 style 属性判断）
    const parent = element.parentElement
    const isCodeBlockP = parent && parent.tagName.toLowerCase() === 'section' && 
      ((parent.getAttribute('style') || '').includes('background:#f6f8fa') || (parent.getAttribute('style') || '').includes('background: #f6f8fa'))
    
    // 如果 p 标签的 style 包含 font-family:Menlo 或 font-family:monospace，说明是代码块中的 p
    const isCodeP = existingStyle.includes('font-family:Menlo') || existingStyle.includes('font-family: monospace') || 
      (existingStyle.includes('margin:0') && existingStyle.includes('font-family'))
    
    // 检查是否是分隔符（height:0;overflow:hidden）
    const isSeparator = existingStyle.includes('height:0') && existingStyle.includes('overflow:hidden')
    
    if (!isCodeBlockP && !isCodeP && !isSeparator) {
      if (!existingStyle.includes('text-align')) {
        styles.push('text-align: justify')
      }
      if (!existingStyle.includes('letter-spacing')) {
        styles.push('letter-spacing: 0.5px')
      }
    }
  }
  
  // 特殊规则：代码块中的 div 不需要应用特殊样式
  if (tagName === 'div') {
    // 检查是否是代码块中的 div（通过父元素判断）
    const parent = element.parentElement
    if (parent) {
      // 检查父元素是否是代码块 section
      if (parent.tagName.toLowerCase() === 'section') {
        const parentStyle = parent.getAttribute('style') || ''
        if (parentStyle.includes('background:#f6f8fa') || parentStyle.includes('background: #f6f8fa')) {
          // 这是代码块中的 div，不应用特殊规则
          return
        }
      }
      // 检查父元素是否是代码块的外层 div（包含 font-family:Menlo）
      if (parent.tagName.toLowerCase() === 'div') {
        const parentStyle = parent.getAttribute('style') || ''
        if (parentStyle.includes('font-family:Menlo') || parentStyle.includes('font-family: monospace')) {
          // 这是代码块中的内层 div，不应用特殊规则
          return
        }
      }
    }
  }
  
  // 移除强制覆盖 h2 样式的规则，保留模版原本的样式特色
  // 注释：之前强制为所有 h2 应用红色背景，这会覆盖模版样式
  // 如果需要统一 h2 样式，应该在模版 CSS 中定义，而不是在这里强制覆盖
  // if (tagName === 'h2') {
  //   if (!existingStyle.includes('background-color')) {
  //     styles.push('background-color: #C00000')
  //   }
  //   if (!existingStyle.includes('color')) {
  //     styles.push('color: #ffffff')
  //   }
  //   if (!existingStyle.includes('text-align')) {
  //     styles.push('text-align: center')
  //   }
  //   if (!existingStyle.includes('padding')) {
  //     styles.push('padding: 8px 24px')
  //   }
  //   if (!existingStyle.includes('border-radius')) {
  //     styles.push('border-radius: 4px')
  //   }
  // }
  
  // 应用特殊规则样式
  if (styles.length > 0) {
    element.setAttribute('style', (existingStyle ? existingStyle + '; ' : '') + styles.join('; '))
  }
  
  // 递归处理子元素
  Array.from(element.children).forEach(child => {
    applySpecialRules(child as HTMLElement)
  })
}

/**
 * 生成微信公众号格式的 HTML（使用 juice 转换 CSS 为内联样式）
 */
export const generateWechatHtml = (
  _content: string,
  _isMarkdown: boolean,
  templateId: string | null
): string => {
  // 获取模版的 CSS
  let css = ''
  if (templateId) {
    const template = getTemplateById(templateId)
    if (template && template.css) {
      css = template.css.trim()
    }
  }

  // 从预览区域获取 HTML
  let html = ''
  const preview = document.querySelector('.bytemd-preview .markdown-body')
  if (preview) {
    const cloned = preview.cloneNode(true) as HTMLElement
    
    // 处理本地图片：将 local:// 转换为 data URL
    const images = cloned.querySelectorAll('img[src^="local://"]')
    images.forEach((img) => {
      const src = img.getAttribute('src')
      if (src) {
        const dataUrl = convertImageUrl(src)
        if (dataUrl && dataUrl !== src) {
          img.setAttribute('src', dataUrl)
        }
      }
    })
    
    html = cloned.outerHTML
  } else {
    console.warn('未找到预览区域')
    return ''
  }

  if (!html) {
    console.warn('HTML 内容为空')
    return ''
  }

  // 解析 HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body
  
  // 找到文章容器
  let articleElement = body.querySelector('.wechat-article') as HTMLElement
  if (!articleElement && body.firstElementChild) {
    articleElement = body.firstElementChild as HTMLElement
  }
  
  if (!articleElement) {
    console.warn('未找到文章容器')
    return ''
  }
  
  // 注意：在清理之前，先保留 class，因为 juice 需要 class 来匹配 CSS 规则
  // 构建完整的 HTML 文档（包含 CSS）
  // 需要将 .bytemd-preview .markdown-body 前缀从 CSS 中移除，因为 juice 需要匹配实际的 class
  let processedCss = css
  
  // 移除 .bytemd-preview .markdown-body 前缀，让 CSS 选择器能匹配到元素
  // 关键：需要处理多种格式：
  // 1. 连写格式：.bytemd-preview .markdown-body.wechat-article （没有空格）
  // 2. 空格分隔：.bytemd-preview .markdown-body .wechat-article-title （有空格）
  // 3. 标签选择器：.bytemd-preview .markdown-body pre.wechat-article-code-block （标签+class）
  // 4. 标签选择器：.bytemd-preview .markdown-body pre code （纯标签）
  // 5. 标签+空格+class：.bytemd-preview .markdown-body pre .wechat-article-code （标签 空格 class）
  
  // 先处理连写情况：.bytemd-preview .markdown-body.wechat-article -> .wechat-article
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\./g, '.')
  
  // 处理标签+空格+class的情况：.bytemd-preview .markdown-body pre .wechat-article-code -> pre .wechat-article-code
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+([a-zA-Z][a-zA-Z0-9]*)\s+\.([\w-]+)/g, '$1 .$2')
  
  // 处理标签+class的情况：.bytemd-preview .markdown-body pre.wechat-article-code-block -> pre.wechat-article-code-block
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+([a-zA-Z][a-zA-Z0-9]*\.[\w-]+)/g, '$1')
  
  // 处理标签选择器：.bytemd-preview .markdown-body pre code -> pre code
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+([a-zA-Z][a-zA-Z0-9]*\s+[a-zA-Z][a-zA-Z0-9]*)/g, '$1')
  
  // 处理空格分隔情况：.bytemd-preview .markdown-body .wechat-article-title -> .wechat-article-title
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+/g, '')
  
  // 处理剩余的 .bytemd-preview 前缀
  processedCss = processedCss.replace(/\.bytemd-preview\s+/g, '')
  
  // 处理剩余的 .markdown-body 前缀（空格分隔）
  processedCss = processedCss.replace(/\.markdown-body\s+/g, '')
  
  // 处理剩余的 .markdown-body 前缀（连写）
  processedCss = processedCss.replace(/\.markdown-body\./g, '.')
  
  // 调试：输出处理后的 CSS 预览
  console.log('CSS 前缀移除前长度:', css.length)
  console.log('CSS 前缀移除后长度:', processedCss.length)
  console.log('处理后的 CSS 预览（前 500 字符）:', processedCss.substring(0, 500))
  
  // 先不清理，保留 class 以便 juice 匹配样式
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
${processedCss}
  </style>
</head>
<body>
${articleElement.outerHTML}
</body>
</html>`
  
  console.log('准备处理的 HTML 预览:', fullHtml.substring(0, 500))
  console.log('处理后的 CSS 长度:', processedCss.length)
  
  // 使用 juice 将 CSS 转换为内联样式
  let result = ''
  try {
    result = juice(fullHtml, {
      removeStyleTags: true, // 移除 <style> 标签
      preserveMediaQueries: false, // 不保留媒体查询
      preserveFontFaces: false, // 不保留 @font-face
      preserveKeyFrames: false, // 不保留 @keyframes
      xmlMode: false, // HTML 模式
      preserveImportant: true, // 保留 !important
      webResources: {
        images: false, // 不处理图片资源
        svgs: false, // 不处理 SVG
        scripts: false, // 不处理脚本
        links: false // 不处理链接
      }
    })
    
    console.log('juice 处理后的完整 HTML 长度:', result.length)
    console.log('juice 处理后的 HTML 预览（前 800 字符）:', result.substring(0, 800))
    
    // 从结果中提取 body 内容
    const resultDoc = parser.parseFromString(result, 'text/html')
    const resultBody = resultDoc.body
    
    // 获取 body 中的内容
    result = resultBody.innerHTML
    
    // 检查样式应用情况
    const tempCheck = document.createElement('div')
    tempCheck.innerHTML = result
    const elementsWithStyle = tempCheck.querySelectorAll('[style]')
    console.log(`juice 转换后，找到 ${elementsWithStyle.length} 个带内联样式的元素`)
    
    // 统计不同元素的样式应用情况
    const styleStats: Record<string, number> = {}
    elementsWithStyle.forEach(el => {
      const tagName = el.tagName.toLowerCase()
      styleStats[tagName] = (styleStats[tagName] || 0) + 1
    })
    console.log('样式应用统计:', styleStats)
    
    // 应用特殊规则
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = result
    applySpecialRules(tempDiv)
    result = tempDiv.innerHTML
    
    console.log('应用特殊规则后的 HTML 预览（前 500 字符）:', result.substring(0, 500))
    
  } catch (error) {
    console.error('juice 处理失败:', error)
    // 降级方案：直接返回清理后的 HTML
    result = articleElement.outerHTML
  }
  
  // 转换代码块为微信公众号兼容格式（在清理之前）
  const tempDivForCode = document.createElement('div')
  tempDivForCode.innerHTML = result
  convertAllCodeBlocks(tempDivForCode)
  result = tempDivForCode.innerHTML
  
  // 应用所有公众号格式转换（在 juice 转换之后，清理之前）
  const tempDivForConvert = document.createElement('div')
  tempDivForConvert.innerHTML = result
  
  // 调试：检查表格转换前的状态
  const tablesBeforeConvert = tempDivForConvert.querySelectorAll('table')
  console.log(`=== 表格转换前，共有 ${tablesBeforeConvert.length} 个表格 ===`)
  tablesBeforeConvert.forEach((table, index) => {
    console.log(`表格 ${index + 1} 转换前 HTML:`, table.outerHTML.substring(0, 500))
    const thead = table.querySelector('thead')
    const tbody = table.querySelector('tbody')
    const directTrs = Array.from(table.children).filter(child => child.tagName.toLowerCase() === 'tr')
    console.log(`  有 thead: ${!!thead}, 有 tbody: ${!!tbody}, 直接 tr: ${directTrs.length}`)
    if (thead) {
      const theadTrs = thead.querySelectorAll('tr')
      console.log(`  thead 中有 ${theadTrs.length} 个 tr`)
      theadTrs.forEach((tr, trIndex) => {
        const ths = tr.querySelectorAll('th')
        const tds = tr.querySelectorAll('td')
        console.log(`    thead tr ${trIndex + 1}: ${ths.length} 个 th, ${tds.length} 个 td`)
      })
    }
    if (tbody) {
      const tbodyTrs = tbody.querySelectorAll('tr')
      console.log(`  tbody 中有 ${tbodyTrs.length} 个 tr`)
      tbodyTrs.forEach((tr, trIndex) => {
        const ths = tr.querySelectorAll('th')
        const tds = tr.querySelectorAll('td')
        console.log(`    tbody tr ${trIndex + 1}: ${ths.length} 个 th, ${tds.length} 个 td`)
      })
    }
  })
  
  // 执行顺序很重要：
  // 1. 先转换标题（h1~h6 → p），因为其他转换可能依赖标题结构
  convertHeadingsForWechat(tempDivForConvert)
  
  // 2. 转换表格（每个 td/th 添加完整 inline style）
  convertTablesForWechat(tempDivForConvert)
  
  // 调试：检查表格转换后的状态
  const tablesAfterConvert = tempDivForConvert.querySelectorAll('table')
  console.log(`表格转换后，共有 ${tablesAfterConvert.length} 个表格`)
  tablesAfterConvert.forEach((table, index) => {
    const trs = table.querySelectorAll('tr')
    console.log(`  表格 ${index + 1}: ${trs.length} 个 tr`)
    trs.forEach((tr, trIndex) => {
      const ths = tr.querySelectorAll('th')
      const tds = tr.querySelectorAll('td')
      console.log(`    tr ${trIndex + 1}: ${ths.length} 个 th, ${tds.length} 个 td`)
    })
  })
  
  // 3. 转换引用块（blockquote → section）
  convertBlockquotesForWechat(tempDivForConvert)
  
  // 4. 转换行内代码（code → span，排除 pre 内的）
  convertInlineCodeForWechat(tempDivForConvert)
  
  // 5. 转换分割线（hr 添加样式）
  convertHrForWechat(tempDivForConvert)
  
  // 6. 扁平化列表并添加样式（在任务列表转换之前）
  flattenListsForWechat(tempDivForConvert)
  
  // 7. 转换任务列表（checkbox → 伪任务列表）
  convertTaskListsForWechat(tempDivForConvert)
  
  result = tempDivForConvert.innerHTML
  
  // 调试：检查转换后的 result 中的表格状态
  const tempCheckResult = document.createElement('div')
  tempCheckResult.innerHTML = result
  const tablesInResult = tempCheckResult.querySelectorAll('table')
  console.log(`=== result 中的表格状态: 共有 ${tablesInResult.length} 个表格 ===`)
  tablesInResult.forEach((table, index) => {
    const trs = table.querySelectorAll('tr')
    console.log(`  result 中表格 ${index + 1}: ${trs.length} 个 tr`)
    console.log(`  result 中表格 ${index + 1} HTML:`, table.outerHTML.substring(0, 500))
  })
  
  // 现在清理 HTML（移除不允许的标签）
  // 注意：清理时需要保留 section 标签
  const tempDiv2 = document.createElement('div')
  tempDiv2.innerHTML = result
  
  // 调试：检查清理前的表格状态
  const tablesBeforeClean = tempDiv2.querySelectorAll('table')
  console.log(`=== 清理前，共有 ${tablesBeforeClean.length} 个表格 ===`)
  tablesBeforeClean.forEach((table, index) => {
    const trs = table.querySelectorAll('tr')
    console.log(`  清理前表格 ${index + 1}: ${trs.length} 个 tr`)
    trs.forEach((tr, trIndex) => {
      const ths = tr.querySelectorAll('th')
      const tds = tr.querySelectorAll('td')
      console.log(`    清理前 tr ${trIndex + 1}: ${ths.length} 个 th, ${tds.length} 个 td`)
      console.log(`    清理前 tr ${trIndex + 1} HTML:`, tr.outerHTML.substring(0, 200))
    })
  })
  
  const cleanedElement = cleanElement(tempDiv2.firstElementChild || tempDiv2, 0)
  
  // 调试：检查清理后的表格状态
  if (cleanedElement) {
    const tempCheck = document.createElement('div')
    tempCheck.appendChild(cleanedElement.cloneNode(true))
    const tablesAfterClean = tempCheck.querySelectorAll('table')
    console.log(`=== 清理后，共有 ${tablesAfterClean.length} 个表格 ===`)
    tablesAfterClean.forEach((table, index) => {
      const trs = table.querySelectorAll('tr')
      console.log(`  清理后表格 ${index + 1}: ${trs.length} 个 tr`)
      if (trs.length === 0) {
        console.warn(`  警告：清理后表格 ${index + 1} 没有 tr 元素`)
        console.warn(`  清理后表格 ${index + 1} HTML:`, table.outerHTML)
      }
    })
  }
  if (!cleanedElement) {
    console.warn('清理后的元素为空')
    return ''
  }
  
  // 将外层容器改为 <section>，并添加微信公众号所需的基础样式
  const finalDoc = parser.parseFromString(cleanedElement.outerHTML, 'text/html')
  const finalBody = finalDoc.body
  let rootElement = finalBody.firstElementChild || finalBody
  
  // 如果是 div，改为 section
  if (rootElement.tagName.toLowerCase() === 'div') {
    const section = document.createElement('section')
    // 复制所有子元素
    Array.from(rootElement.children).forEach(child => {
      section.appendChild(child.cloneNode(true))
    })
    // 如果没有子元素，复制文本内容
    if (section.children.length === 0 && rootElement.textContent) {
      section.textContent = rootElement.textContent
    }
    rootElement = section
  } else if (rootElement.tagName.toLowerCase() !== 'section') {
    // 如果不是 section 也不是 div，包装成 section
    const section = document.createElement('section')
    section.appendChild(rootElement.cloneNode(true))
    rootElement = section
  }
  
  // 添加微信公众号所需的基础样式到 section
  const existingStyle = rootElement.getAttribute('style') || ''
  const baseStyles: Record<string, string> = {
    'font-size': '16px',
    'color': '#333',
    'line-height': '1.6',
    'word-spacing': '0px',
    'letter-spacing': '0px',
    'word-break': 'break-word',
    'word-wrap': 'break-word',
    'text-align': 'justify',
    'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  }
  
  // 解析现有样式
  const styleMap = new Map<string, string>()
  if (existingStyle) {
    existingStyle.split(';').forEach(style => {
      const trimmed = style.trim()
      if (trimmed) {
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex > 0) {
          const prop = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()
          styleMap.set(prop, value)
        }
      }
    })
  }
  
  // 合并样式：优先保留模版已内联的样式，只在缺失时才应用基础样式
  const allStyles: string[] = []
  
  // 先添加模版已有的样式（这些是 juice 转换后的模版样式，优先级最高）
  styleMap.forEach((value, prop) => {
    allStyles.push(`${prop}: ${value}`)
  })
  
  // 再添加缺失的基础样式（只在模版没有定义时才添加）
  Object.entries(baseStyles).forEach(([prop, value]) => {
    if (!styleMap.has(prop)) {
      allStyles.push(`${prop}: ${value}`)
    }
  })
  
  // 应用合并后的样式
  if (allStyles.length > 0) {
    rootElement.setAttribute('style', allStyles.join('; '))
  }
  
  // 移除所有 class 和 id 属性（但保留 style）
  const removeAttributes = (element: Element) => {
    element.removeAttribute('class')
    element.removeAttribute('id')
    // 移除 data-* 属性（但保留 data-tool 等微信公众号需要的）
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-tool' && attr.name !== 'data-website') {
        element.removeAttribute(attr.name)
      }
    })
    Array.from(element.children).forEach(child => {
      removeAttributes(child)
    })
  }
  
  // 移除属性
  removeAttributes(rootElement)
  result = rootElement.outerHTML
  
  // 最终调试输出
  console.log('=== 最终生成的 HTML ===')
  console.log('HTML 总长度:', result.length)
  console.log('HTML 预览（前 800 字符）:', result.substring(0, 800))
  
  // 检查最终结果中的样式情况
  const finalCheck = document.createElement('div')
  finalCheck.innerHTML = result
  const finalElementsWithStyle = finalCheck.querySelectorAll('[style]')
  console.log(`最终 HTML 中有 ${finalElementsWithStyle.length} 个带内联样式的元素`)
  
  // 如果结果为空或太短，返回警告
  if (!result || result.trim().length < 10) {
    console.error('生成的 HTML 为空或太短')
    return ''
  }
  
  return result
}
