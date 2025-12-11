import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import SignUp from './modules/auth/pages/SignUp'
import SignIn from './modules/auth/pages/SignIn'
import Dashboard from './modules/auth/pages/Dashboard'
import DashboardPackages from './modules/auth/pages/DashboardPackages'
import PaymentMethods from './modules/payment/pages/PaymentMethods'
import Landing from './modules/auth/pages/Landing'
import Contact from './modules/auth/pages/Contact'
import Faqs from './modules/auth/pages/Faqs'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/faqs',
    element: <Faqs />,
  },
  {
    path: '/register',
    element: <SignUp />,
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
    path: '/dashboard/packages',
    element: <DashboardPackages />,
  },
  {
    path: '/dashboard/payment-methods',
    element: <PaymentMethods />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
], {
  basename: (import.meta.env.BASE_URL || '/').replace(/\/$/, ''),
})

export default function App() {
  return <RouterProvider router={router} />
}
