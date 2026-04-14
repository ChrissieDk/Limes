import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import SignUp from './modules/auth/pages/SignUp'
import SignIn from './modules/auth/pages/SignIn'
import Dashboard from './modules/auth/pages/Dashboard'
import DashboardPackages from './modules/auth/pages/DashboardPackages'
import PaymentMethods from './modules/payment/pages/PaymentMethods'
import Subscriptions from './modules/auth/pages/Subscriptions'
import AccountDetails from './modules/auth/pages/AccountDetails'
import Landing from './modules/auth/pages/Landing'
import Contact from './modules/auth/pages/Contact'
import Faqs from './modules/auth/pages/Faqs'
import ForgotPassword from './modules/auth/pages/ForgotPassword'
import VerifyEmail from './modules/auth/pages/VerifyEmail'
import ResetPassword from './modules/auth/pages/ResetPassword'
import AuthAction from './modules/auth/pages/AuthAction'
import TermsAndConditions from './modules/auth/pages/TermsAndConditions'
import FairUsagePolicy from './modules/auth/pages/FairUsagePolicy'

import './config/firebase'

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
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/auth/action',
    element: <AuthAction />,
  },
  {
    path: '/auth/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPassword />,
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
    path: '/dashboard/subscriptions',
    element: <Subscriptions />,
  },
  {
    path: '/dashboard/edit-details',
    element: <AccountDetails />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/terms-and-conditions',
    element: <TermsAndConditions />,
  },
  {
    path: '/terms',
    element: <TermsAndConditions />,
  },
  {
    path: '/fair-usage-policy',
    element: <FairUsagePolicy />,
  },
], {
  basename: (import.meta.env.BASE_URL || '/').replace(/\/$/, ''),
})

export default function App() {
  return <RouterProvider router={router} />
}
