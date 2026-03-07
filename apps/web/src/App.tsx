
import { Route, Routes, Navigate } from 'react-router-dom'
import Users from './pages/Users'
import Roles from './pages/Roles'
import MainLayout from './layout/MainLayout'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/permission/users" replace />} />
        <Route path="permission">
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
