import { createContext, useContext } from 'react'

export type Tag = { key: string; title: string; closable?: boolean }

export type TagsCtx = {
  items: Tag[]
  add: (path: string) => void
  remove: (path: string) => void
}

export const TagsContext = createContext<TagsCtx | null>(null)

export const useTags = () => {
  const ctx = useContext(TagsContext)
  if (!ctx) throw new Error('useTags must be used within TagsProvider')
  return ctx
}
