import React from 'react'
import { Layout } from 'antd'
import ContentEditor from './components/ContentEditor'

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <ContentEditor />
    </Layout>
  )
}

export default App

