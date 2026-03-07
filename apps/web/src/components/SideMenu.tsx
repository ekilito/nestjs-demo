import { Menu } from 'antd'
import { TeamOutlined, UserSwitchOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { useMemo } from 'react'
import { useTags } from '../contexts/tags'

type MenuItem = Required<MenuProps>['items'][number]

const SideMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { add } = useTags()

  const items: MenuItem[] = useMemo(
    () => [
      {
        key: 'permission',
        icon: <SafetyCertificateOutlined />,
        label: '权限管理',
        children: [
          { key: '/permission/users', icon: <TeamOutlined />, label: '用户管理' },
          { key: '/permission/roles', icon: <UserSwitchOutlined />, label: '角色管理' },
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
      onClick={({ key }) => {
        if (typeof key === 'string') {
          add(key)
          navigate(key)
        }
      }}
      className="h-full"
    />
  )
}

export default SideMenu
