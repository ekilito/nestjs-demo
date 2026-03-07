import { Menu } from 'antd'
import { TeamOutlined, SafetyCertificateOutlined, HomeOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { useMemo } from 'react'

type MenuItem = Required<MenuProps>['items'][number]

const SideMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const items: MenuItem[] = useMemo(
    () => [
      { key: '/', icon: <HomeOutlined />, label: '首页' },
      {
        key: 'permission',
        icon: <SafetyCertificateOutlined />,
        label: '权限管理',
        children: [
          { key: '/permission/users', icon: <TeamOutlined />, label: '用户管理' },
        ],
      },
    ],
    [],
  )

  return (
    <Menu
      mode="inline"
      items={items}
      selectedKeys={[location.pathname]}
      defaultOpenKeys={['permission']}
      inlineIndent={16}
      style={{ padding: 6 }}
      onClick={({ key }) => {
        if (typeof key === 'string') {
          navigate(key)
        }
      }}
      className="h-full"
    />
  )
}

export default SideMenu
