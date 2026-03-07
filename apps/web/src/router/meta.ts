export const routeTitleMap: Record<string, string> = {
  '/permission': '权限管理',
  '/permission/users': '用户管理',
  '/permission/roles': '角色管理',
}

export const resolveTitle = (path: string) => routeTitleMap[path] ?? path
