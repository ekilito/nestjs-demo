import { Layout, theme } from 'antd'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SideMenu from '../components/SideMenu'

const { Sider, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()


  return (
    <Layout className="min-h-screen w-full">
      <AppHeader collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <Layout hasSider className="w-full">
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          collapsedWidth={48}
          width={220}
          theme="light"
          className="border-r border-[rgba(5,5,5,0.06)] h-[calc(100vh-64px)] sticky top-16 overflow-auto"
        >
          <SideMenu />
        </Sider>
        <Layout className="w-full">
          <Content
            className="mx-2 mt-2 mb-2 p-2 rounded-lg min-h-[calc(100vh-64px-24px)]"
            style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

    </Layout>
  )
}

export default MainLayout
