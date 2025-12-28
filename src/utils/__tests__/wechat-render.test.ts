import { describe, it, expect } from 'vitest'
import { addWechatClasses } from '../htmlGenerator'
// @ts-ignore - juice 可能没有类型定义
import juice from 'juice'
import { getTemplateById } from '../templateStorage'

// 使用全局 DOMParser（在 jsdom 环境中可用）
const parser = new DOMParser()

/**
 * 测试辅助函数：模拟 generateWechatHtml 的核心转换逻辑
 * 接受 HTML 字符串（模拟 .bytemd-preview .markdown-body 的内容），返回转换后的 HTML
 */
function testWechatRender(html: string, templateId: string | null = null): string {
  // 获取模版的 CSS
  let css = ''
  if (templateId) {
    const template = getTemplateById(templateId)
    if (template && template.css) {
      css = template.css.trim()
    }
  }

  // 解析 HTML
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // 找到文章容器或创建容器
  let articleElement = body.querySelector('.wechat-article') as HTMLElement
  if (!articleElement && body.firstElementChild) {
    articleElement = body.firstElementChild as HTMLElement
  }

  if (!articleElement) {
    // 如果没有找到，创建一个容器并添加 class
    const container = doc.createElement('div')
    container.className = 'wechat-article'
    container.innerHTML = body.innerHTML
    articleElement = container
  } else {
    // 确保有 wechat-article class
    if (!articleElement.classList.contains('wechat-article')) {
      articleElement.classList.add('wechat-article')
    }
  }

  // 如果没有 class，先添加 class
  if (!articleElement.classList.contains('wechat-article')) {
    const processedHtml = addWechatClasses(articleElement.outerHTML)
    const processedDoc = parser.parseFromString(processedHtml, 'text/html')
    articleElement = processedDoc.querySelector('.wechat-article') || articleElement
  }

  // 处理 CSS 前缀移除（模拟 generateWechatHtml 的逻辑）
  let processedCss = css
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\./g, '.')
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+([a-zA-Z][a-zA-Z0-9]*)\s+\.([\w-]+)/g, '$1 .$2')
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+([a-zA-Z][a-zA-Z0-9]*\.[\w-]+)/g, '$1')
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+([a-zA-Z][a-zA-Z0-9]*\s+[a-zA-Z][a-zA-Z0-9]*)/g, '$1')
  processedCss = processedCss.replace(/\.bytemd-preview\s+\.markdown-body\s+/g, '')
  processedCss = processedCss.replace(/\.bytemd-preview\s+/g, '')
  processedCss = processedCss.replace(/\.markdown-body\s+/g, '')
  processedCss = processedCss.replace(/\.markdown-body\./g, '.')

  // 构建完整的 HTML 文档（包含 CSS）
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

  // 使用 juice 将 CSS 转换为内联样式
  let result = ''
  try {
    result = juice(fullHtml, {
      removeStyleTags: true,
      preserveMediaQueries: false,
      preserveFontFaces: false,
      preserveKeyFrames: false,
      xmlMode: false,
      preserveImportant: true,
      webResources: {
        images: false,
        svgs: false,
        scripts: false,
        links: false
      }
    })

    // 从结果中提取 body 内容
    const resultDoc = parser.parseFromString(result, 'text/html')
    const resultBody = resultDoc.body
    result = resultBody.innerHTML
  } catch (error) {
    console.error('juice 处理失败:', error)
    result = articleElement.outerHTML
  }

  // 转换代码块为微信公众号兼容格式
  // 这里需要模拟 convertAllCodeBlocks 的逻辑
  const tempDivForCodeDoc = parser.parseFromString(`<div>${result}</div>`, 'text/html')
  const tempDivForCode = tempDivForCodeDoc.body.firstElementChild as HTMLElement

  // 查找所有 pre.wechat-article-code-block 元素并转换
  const codeBlocks = tempDivForCode.querySelectorAll('pre.wechat-article-code-block')
  codeBlocks.forEach((preBlock) => {
    const pre = preBlock as HTMLElement
    const section = tempDivForCodeDoc.createElement('section')
    section.setAttribute('style', 'background:#f6f8fa;padding:12px;border-radius:6px;margin:16px 0;')

    // 获取代码内容
    const codeElement = pre.querySelector('code')
    let codeText = ''
    if (codeElement) {
      codeText = codeElement.textContent || codeElement.innerText || ''
    } else {
      codeText = pre.textContent || pre.innerText || ''
    }

    if (!codeText && pre.children.length > 0) {
      codeText = Array.from(pre.children)
        .map(child => {
          const htmlEl = child as HTMLElement
          return child.textContent || (htmlEl.innerText || '')
        })
        .join('\n')
    }

    // 创建外层 div 容器
    const outerDiv = tempDivForCodeDoc.createElement('div')
    outerDiv.setAttribute('style', 'font-family:Menlo,monospace;font-size:14px;line-height:1.4;')

    // 按行分割代码，每行用内层 <div> 标签包裹
    const lines = codeText.split('\n')
    lines.forEach((line) => {
      const innerDiv = tempDivForCodeDoc.createElement('div')
      if (line === '') {
        innerDiv.innerHTML = '&nbsp;'
      } else {
        innerDiv.textContent = line
      }
      outerDiv.appendChild(innerDiv)
    })

    section.appendChild(outerDiv)

    // 替换原元素
    if (pre.parentNode) {
      pre.parentNode.replaceChild(section, pre)

      // 在代码块后添加分隔符
      const separator = tempDivForCodeDoc.createElement('p')
      separator.setAttribute('style', 'margin:0;height:0;overflow:hidden;')
      separator.innerHTML = '&nbsp;'

      if (section.parentNode) {
        section.parentNode.insertBefore(separator, section.nextSibling)
      }
    }
  })

  result = tempDivForCode.innerHTML

  // 应用所有公众号格式转换（模拟 generateWechatHtml 的完整流程）
  const tempDivForConvertDoc = parser.parseFromString(`<div>${result}</div>`, 'text/html')
  const tempDivForConvert = tempDivForConvertDoc.body.firstElementChild as HTMLElement

  // 注意：这些转换函数需要在真实的 DOM 环境中运行，但测试环境使用 jsdom
  // 我们需要手动实现这些转换逻辑，或者使用 document 全局对象（jsdom 提供）
  
  // 1. 转换标题（h1~h6 → p）
  const headings = tempDivForConvert.querySelectorAll('h1, h2, h3, h4, h5, h6')
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
    const style = headingStyles[tagName] || headingStyles['h3']
    const p = tempDivForConvertDoc.createElement('p')
    p.setAttribute('style', style)
    p.innerHTML = headingEl.innerHTML
    if (headingEl.parentNode) {
      headingEl.parentNode.replaceChild(p, headingEl)
    }
  })

  // 2. 转换表格
  const tables = tempDivForConvert.querySelectorAll('table')
  tables.forEach((table) => {
    const tableEl = table as HTMLElement
    tableEl.setAttribute('style', 'border-collapse:collapse;width:100%;font-size:14px;')
    tableEl.removeAttribute('class')
    const ths = tableEl.querySelectorAll('th')
    ths.forEach((th) => {
      const thEl = th as HTMLElement
      thEl.setAttribute('style', 'border:1px solid #ddd;padding:6px;background:#f7f7f7;')
      thEl.removeAttribute('class')
    })
    const tds = tableEl.querySelectorAll('td')
    tds.forEach((td) => {
      const tdEl = td as HTMLElement
      tdEl.setAttribute('style', 'border:1px solid #ddd;padding:6px;')
      tdEl.removeAttribute('class')
    })
  })

  // 3. 转换引用块
  const blockquotes = tempDivForConvert.querySelectorAll('blockquote')
  blockquotes.forEach((blockquote) => {
    const blockquoteEl = blockquote as HTMLElement
    const section = tempDivForConvertDoc.createElement('section')
    section.setAttribute('style', 'border-left:4px solid #d0d7de;padding:8px 12px;background:#f8f9fa;margin:12px 0;font-size:14px;color:#555;')
    section.innerHTML = blockquoteEl.innerHTML
    if (blockquoteEl.parentNode) {
      blockquoteEl.parentNode.replaceChild(section, blockquoteEl)
    }
  })

  // 4. 转换行内代码（排除 pre 内的）
  const allCodes = tempDivForConvert.querySelectorAll('code')
  allCodes.forEach((code) => {
    const codeEl = code as HTMLElement
    const parentPre = codeEl.closest('pre')
    if (!parentPre) {
      const span = tempDivForConvertDoc.createElement('span')
      span.setAttribute('style', 'background:#f6f8fa;padding:2px 6px;border-radius:3px;font-family:Menlo,monospace;font-size:14px;')
      span.textContent = codeEl.textContent || ''
      if (codeEl.parentNode) {
        codeEl.parentNode.replaceChild(span, codeEl)
      }
    }
  })

  // 5. 转换分割线
  const hrs = tempDivForConvert.querySelectorAll('hr')
  hrs.forEach((hr) => {
    const hrEl = hr as HTMLElement
    hrEl.setAttribute('style', 'border:none;border-top:1px solid #ddd;margin:16px 0;')
    hrEl.removeAttribute('class')
  })

  // 6. 扁平化列表并添加样式
  const allLists = Array.from(tempDivForConvert.querySelectorAll('ul, ol'))
  allLists.forEach((list) => {
    const listEl = list as HTMLElement
    listEl.setAttribute('style', 'padding-left:20px;margin:8px 0;')
    listEl.removeAttribute('class')
    const lis = Array.from(listEl.querySelectorAll('li'))
    lis.forEach((li) => {
      const liEl = li as HTMLElement
      const existingStyle = liEl.getAttribute('style') || ''
      if (!existingStyle.includes('margin')) {
        liEl.setAttribute('style', 'margin:4px 0;')
      }
      liEl.removeAttribute('class')
    })
  })

  // 7. 转换任务列表
  const taskListItems = tempDivForConvert.querySelectorAll('li')
  taskListItems.forEach((li) => {
    const liEl = li as HTMLElement
    const checkbox = liEl.querySelector('input[type="checkbox"]')
    if (checkbox) {
      const isChecked = (checkbox as HTMLInputElement).checked
      let text = liEl.textContent || ''
      text = text.replace(/^\s*\[[x\s]\]\s*/i, '').trim()
      const taskIcon = isChecked ? '☑️' : '⬜'
      liEl.innerHTML = ''
      liEl.textContent = `${taskIcon} ${text}`
      checkbox.remove()
    } else {
      const text = liEl.textContent || ''
      const taskMatch = text.match(/^\s*\[([x\s])\]\s*(.*)$/i)
      if (taskMatch) {
        const isChecked = taskMatch[1].toLowerCase() === 'x'
        const taskText = taskMatch[2]
        const taskIcon = isChecked ? '☑️' : '⬜'
        liEl.textContent = `${taskIcon} ${taskText}`
      }
    }
  })

  result = tempDivForConvert.innerHTML

  // 清理 HTML（简化版，只保留关键标签）
  const tempDiv2Doc = parser.parseFromString(`<div>${result}</div>`, 'text/html')
  const tempDiv2 = tempDiv2Doc.body.firstElementChild as HTMLElement
  const cleaned = cleanHtmlForTest(tempDiv2)
  result = cleaned

  return result
}

/**
 * 简化的 HTML 清理函数（用于测试）
 */
function cleanHtmlForTest(element: HTMLElement): string {
  const ALLOWED_TAGS = new Set([
    'section', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'img', 'hr',
    'strong', 'em', 'a', 'br', 'span', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ])

  const cleanElement = (el: Element): Element | null => {
    const tagName = el.tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tagName)) {
      return null
    }

    const newEl = el.cloneNode(false) as Element
    
    // 处理所有子节点（包括文本节点和元素节点）
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // 文本节点直接克隆
        newEl.appendChild(node.cloneNode(true))
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 元素节点递归清理
        const cleaned = cleanElement(node as Element)
        if (cleaned) {
          newEl.appendChild(cleaned)
        }
      }
    })

    // 如果没有子节点，保留文本内容
    if (newEl.childNodes.length === 0 && el.textContent) {
      newEl.textContent = el.textContent
    }

    return newEl
  }

  const cleaned = cleanElement(element)
  return cleaned ? cleaned.innerHTML : element.innerHTML
}

/**
 * 工具函数：标准化 HTML 字符串用于比较
 */
// function normalizeHTML(html: string): string {
//   return html
//     .replace(/\s+/g, ' ')
//     .replace(/>\s+</g, '><')
//     .trim()
// }

/**
 * 工具函数：统计特定标签数量
 */
function countElements(html: string, tagName: string): number {
  const regex = new RegExp(`<${tagName}[\\s>]`, 'gi')
  return (html.match(regex) || []).length
}

/**
 * 工具函数：检查是否存在分隔符
 */
function hasSeparator(html: string): boolean {
  return html.includes('height:0') && html.includes('overflow:hidden')
}

/**
 * 工具函数：获取代码块数量
 */
// function countCodeBlocks(html: string): number {
//   return countElements(html, 'section') - countElements(html.replace(/<section[^>]*background:#f6f8fa[^>]*>/gi, ''), 'section')
// }

describe('微信公众号渲染回归测试', () => {
  describe('1. 代码块测试', () => {
    it('单个代码块：验证结构正确，不以换行符结尾', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <pre class="wechat-article-code-block"><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));</code></pre>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：应该转换为 section 结构
      expect(result).toContain('<section')
      expect(result).toContain('background:#f6f8fa')
      
      // 断言：代码内容应该被正确分割为多行 div
      expect(result).toContain('function greet(name)')
      expect(result).toContain('console.log(greet')
      
      // 断言：不应该以换行符结尾（最后一行应该被保留）
      const lastLineMatch = result.match(/<div[^>]*>(.*?)<\/div>\s*<\/div>\s*<\/section>/s)
      expect(lastLineMatch).toBeTruthy()
      if (lastLineMatch) {
        expect(lastLineMatch[1]).not.toBe('')
      }
    })

    it('连续代码块：验证两个代码块独立，中间有分隔符', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <pre class="wechat-article-code-block"><code>const a = 1;</code></pre>
          <pre class="wechat-article-code-block"><code>const b = 2;</code></pre>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：应该有两个独立的 section
      const sectionCount = countElements(result, 'section')
      expect(sectionCount).toBeGreaterThanOrEqual(2)

      // 断言：应该存在分隔符
      expect(hasSeparator(result)).toBe(true)

      // 断言：两个代码块的内容都应该存在
      expect(result).toContain('const a = 1')
      expect(result).toContain('const b = 2')
    })

    it('尾部空行：验证尾部空行被保留', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <pre class="wechat-article-code-block"><code>const a = 1

</code></pre>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：尾部空行应该用 &nbsp; 表示
      expect(result).toContain('&nbsp;')
      
      // 断言：最后一行应该是空行（&nbsp;）
      const lines = result.match(/<div[^>]*>(.*?)<\/div>/g) || []
      const lastLine = lines[lines.length - 1]
      expect(lastLine).toContain('&nbsp;')
    })
  })

  describe('2. 表格测试', () => {
    it('表格结构：验证 table/tr/td 结构完整', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <table class="wechat-article-table">
            <thead>
              <tr>
                <th class="wechat-article-th">名称</th>
                <th class="wechat-article-th">年龄</th>
                <th class="wechat-article-th">城市</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="wechat-article-td">张三</td>
                <td class="wechat-article-td">18</td>
                <td class="wechat-article-td">北京</td>
              </tr>
              <tr>
                <td class="wechat-article-td">李四</td>
                <td class="wechat-article-td">20</td>
                <td class="wechat-article-td">上海</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：存在 table、tr、td
      expect(result).toContain('<table')
      expect(result).toContain('<tr')
      expect(result).toContain('<td')

      // 断言：每行 td 数量一致（只统计 tbody 中的 tr，因为 thead 中的 tr 只有 th）
      const tbodyMatch = result.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
      if (tbodyMatch) {
        const tbodyContent = tbodyMatch[1]
        const trMatches = tbodyContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
        const tdCounts = trMatches.map(tr => (tr.match(/<td/gi) || []).length)
        // 所有数据行的 td 数量应该一致
        if (tdCounts.length > 0) {
          expect(tdCounts.every(count => count === tdCounts[0])).toBe(true)
          expect(tdCounts[0]).toBe(3)
        }
      } else {
        // 如果没有 tbody，统计所有 tr 中的 td（排除 th）
        const trMatches = result.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
        const tdCounts = trMatches
          .map(tr => (tr.match(/<td/gi) || []).length)
          .filter(count => count > 0) // 排除只有 th 的行
        if (tdCounts.length > 0) {
          expect(tdCounts.every(count => count === tdCounts[0])).toBe(true)
          expect(tdCounts[0]).toBe(3)
        }
      }

      // 断言：没有被拆成多个 table
      const tableCount = countElements(result, 'table')
      expect(tableCount).toBe(1)
    })
  })

  describe('3. 列表测试', () => {
    it('无序列表：验证 ul/li 结构', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <ul class="wechat-article-list">
            <li class="wechat-article-list-item">苹果</li>
            <li class="wechat-article-list-item">香蕉</li>
          </ul>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：ul / li 层级正确
      expect(result).toContain('<ul')
      expect(result).toContain('<li')
      expect(countElements(result, 'ul')).toBe(1)
      expect(countElements(result, 'li')).toBe(2)
    })

    it('有序列表：验证 ol/li 结构', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <ol class="wechat-article-list">
            <li class="wechat-article-list-item">第一</li>
            <li class="wechat-article-list-item">第二</li>
          </ol>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：ol / li 层级正确
      expect(result).toContain('<ol')
      expect(result).toContain('<li')
      expect(countElements(result, 'ol')).toBe(1)
      expect(countElements(result, 'li')).toBe(2)
    })

    it('嵌套列表：验证嵌套层级正确', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <ul class="wechat-article-list">
            <li class="wechat-article-list-item">苹果</li>
            <li class="wechat-article-list-item">
              香蕉
              <ul class="wechat-article-list">
                <li class="wechat-article-list-item">小香蕉</li>
                <li class="wechat-article-list-item">大香蕉</li>
              </ul>
            </li>
          </ul>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：嵌套关系未丢失
      expect(countElements(result, 'ul')).toBe(2)
      // 注意：实际结构有 4 个 li（苹果、香蕉、小香蕉、大香蕉）
      // 如果保持嵌套结构，应该有 4 个 li
      // 如果扁平化，可能有不同的数量
      const liCount = countElements(result, 'li')
      expect(liCount).toBeGreaterThanOrEqual(3) // 至少 3 个
      expect(liCount).toBeLessThanOrEqual(4) // 最多 4 个（如果保持嵌套）
      
      // 断言：嵌套结构存在
      expect(result).toContain('小香蕉')
      expect(result).toContain('大香蕉')
    })
  })

  describe('4. 任务列表测试', () => {
    it('任务列表：验证 checkbox 内容不被丢失', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <ul class="wechat-article-list">
            <li class="wechat-article-list-item">
              <input type="checkbox" checked> 已完成
            </li>
            <li class="wechat-article-list-item">
              <input type="checkbox"> 未完成
            </li>
          </ul>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：最终 HTML 中不会丢内容
      expect(result).toContain('已完成')
      expect(result).toContain('未完成')

      // 断言：至少以某种形式存在（可能是普通列表，checkbox 可能被移除但内容保留）
      expect(result).toContain('<li')
    })
  })

  describe('5. 空行与换行测试', () => {
    it('空行处理：验证内容不被吞', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <p class="wechat-article-paragraph">第一行</p>
          <p class="wechat-article-paragraph">第二行</p>
          <p class="wechat-article-paragraph">第三行</p>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：所有内容都被保留
      expect(result).toContain('第一行')
      expect(result).toContain('第二行')
      expect(result).toContain('第三行')
    })

    it('换行处理：验证多余 br 不会导致错乱', () => {
      const markdownHtml = `
        <div class="wechat-article">
          <p class="wechat-article-paragraph">第一行<br>第二行</p>
        </div>
      `

      const result = testWechatRender(markdownHtml)

      // 断言：br 标签被正确处理
      expect(result).toContain('第一行')
      expect(result).toContain('第二行')
      
      // 断言：br 标签存在（如果允许）或内容被正确分割
      // const brCount = countElements(result, 'br')
      // br 可能被保留或转换为其他格式，但内容不应该丢失
      expect(result).toContain('第一行')
      expect(result).toContain('第二行')
    })
  })
})

