import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import Home from '../pages/Home'
import Users from '../pages/Users'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home />, handle: { title: '首页' } },
      {
        path: 'permission',
        children: [
          { path: 'users', element: <Users />, handle: { title: '用户管理' } },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

export default routes
