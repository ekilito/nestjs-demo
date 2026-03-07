import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTags } from '../contexts/tags'

const TagsView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { items, remove } = useTags()

  const onEdit: TabsProps['onEdit'] = (targetKey, action) => {
    if (action === 'remove') {
      const key = targetKey as string
      const idx = items.findIndex(i => i.key === key)
      const next = items.filter(i => i.key !== key)
      if (key === location.pathname) {
        const fallback = next[idx - 1] || next[0]
        if (fallback) navigate(fallback.key)
      }
      remove(key)
    }
  }

  return (
    <Tabs
      type="editable-card"
      hideAdd
      items={items.map(i => ({ key: i.key, label: i.title, closable: i.closable !== false }))}
      activeKey={location.pathname}
      onChange={key => navigate(key)}
      onEdit={onEdit}
      className="mb-4"
    />
  )
}

export default TagsView
