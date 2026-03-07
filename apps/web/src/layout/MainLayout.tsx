import { Layout, theme } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SideMenu from '../components/SideMenu'
import TagsView from '../components/TagsView'
import TagsProvider from '../contexts/TagsProvider'

const { Sider, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const location = useLocation()

  return (
    <Layout className="min-h-screen w-full">
      <AppHeader collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TagsProvider initialPath={location.pathname}>
        <Layout hasSider className="w-full">
          <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={220}
            theme="light"
            className="border-r border-[rgba(5,5,5,0.06)] h-[calc(100vh-64px)] sticky top-16 overflow-auto"
          >
            <SideMenu />
          </Sider>
          <Content
            className="m-4 p-4 rounded-lg min-h-[calc(100vh-64px-32px)] overflow-auto"
            style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
          >
            <TagsView />
            <Outlet />
          </Content>
        </Layout>
      </TagsProvider>
    </Layout>
  )
}

export default MainLayout
