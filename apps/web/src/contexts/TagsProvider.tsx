import { useMemo, useState } from 'react'
import { TagsContext } from './tags'
import type { Tag } from './tags'
import { resolveTitle } from '../router/meta'

const TagsProvider = ({ initialPath, children }: { initialPath: string; children: React.ReactNode }) => {
  const [items, setItems] = useState<Tag[]>([{ key: initialPath, title: resolveTitle(initialPath), closable: false }])

  const value = useMemo(() => ({
    items,
    add: (path: string) => {
      setItems(prev => (prev.find(i => i.key === path) ? prev : [...prev, { key: path, title: resolveTitle(path), closable: true }]))
    },
    remove: (path: string) => {
      setItems(prev => prev.filter(i => i.key !== path))
    },
  }), [items])

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>
}

export default TagsProvider
