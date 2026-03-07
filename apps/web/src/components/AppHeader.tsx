import { Avatar, Dropdown, Layout, Space, Typography, theme } from 'antd'
import { DownOutlined, LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Header } = Layout
const { Text } = Typography

const menuItems: MenuProps['items'] = [
  {
    key: 'logout',
    label: (
      <span>
        <LogoutOutlined style={{ marginRight: 8 }} />
        退出登录
      </span>
    ),
  },
]

type Props = {
  collapsed: boolean
  onToggle: () => void
}

const AppHeader = ({ collapsed, onToggle }: Props) => {
  const {
    token: { colorBgContainer, colorText, colorPrimary },
  } = theme.useToken()

  return (
    <Header
      className="px-4 flex items-center justify-between border-b border-[rgba(5,5,5,0.06)] sticky top-0 z-100 w-full"
      style={{ background: colorBgContainer }}
    >
      <div className="flex items-center gap-2">
        <span className="cursor-pointer text-18px" onClick={onToggle}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
        <Text strong className="text-18px" style={{ color: colorPrimary }}>
          CMS
        </Text>
      </div>
      <Dropdown menu={{ items: menuItems }}>
        <Space className="cursor-pointer" style={{ color: colorText }}>
          <Avatar size={28} icon={<UserOutlined />} />
          <span>admin</span>
          <DownOutlined />
        </Space>
      </Dropdown>
    </Header>
  )
}

export default AppHeader
