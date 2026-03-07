
import { useRoutes } from 'react-router-dom'
import routes from './router/routes'

const App = () => {
  const element = useRoutes(routes)
  return element
}

export default App
