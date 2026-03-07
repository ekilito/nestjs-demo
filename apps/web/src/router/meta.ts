export const routeTitleMap: Record<string, string> = {
  '/': '首页',
  '/permission': '权限管理',
  '/permission/users': '用户管理',
}

export const resolveTitle = (path: string) => routeTitleMap[path] ?? path
