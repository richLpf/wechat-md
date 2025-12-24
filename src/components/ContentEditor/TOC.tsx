import React, { useEffect } from 'react'
import { Anchor } from 'antd'

interface TOCItem {
  id: string
  level: number
  text: string
}

interface TOCProps {
  content: string
}

const TOC: React.FC<TOCProps> = ({ content }) => {
  // 提取 Markdown 标题
  const extractHeadings = (markdown: string): TOCItem[] => {
    const headings: TOCItem[] = []
    const lines = markdown.split('\n')
    let index = 0

    lines.forEach((line, lineIndex) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = `heading-${lineIndex}-${index++}`
        headings.push({ id, level, text })
      }
    })

    return headings
  }

  const headings = extractHeadings(content)

  if (headings.length === 0) {
    return null
  }

  // 为标题元素添加 id
  useEffect(() => {
    headings.forEach((heading, index) => {
      const elements = document.querySelectorAll(`.preview-content h${heading.level}`)
      if (elements[index] && !elements[index].id) {
        elements[index].id = heading.id
      }
    })
  }, [content, headings])

  const items = headings.map((heading) => ({
    key: heading.id,
    href: `#${heading.id}`,
    title: heading.text,
  }))

  return (
    <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>目录</div>
      <Anchor
        items={items}
        affix={false}
        showInkInFixed={false}
      />
    </div>
  )
}

export default TOC

