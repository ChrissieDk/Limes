import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import SignUp from './modules/auth/pages/SignUp'
import SignIn from './modules/auth/pages/SignIn'
import Dashboard from './modules/auth/pages/Dashboard'
import Landing from './modules/auth/pages/Landing'
import Contact from './modules/auth/pages/Contact'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
