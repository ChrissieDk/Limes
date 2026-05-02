import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'
import RootLayout from './RootLayout'
import SignUp from './modules/auth/pages/SignUp'
import SignIn from './modules/auth/pages/SignIn'
import Dashboard from './modules/auth/pages/Dashboard'
import DashboardPackages from './modules/auth/pages/DashboardPackages'
import PaymentMethods from './modules/payment/pages/PaymentMethods'
import Subscriptions from './modules/auth/pages/Subscriptions'
import ProvisionedUserRoute from './modules/auth/components/ProvisionedUserRoute'
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
import DeliveryTracking from './modules/warehouse/pages/DeliveryTracking'
import { useAuthState } from './modules/auth/hooks/useAuthState'

import './config/firebase'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
        path: 'dashboard',
        element: <Outlet />,
        children: [
          {
            element: (
              <ProvisionedUserRoute>
                <Outlet />
              </ProvisionedUserRoute>
            ),
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'payment-methods', element: <PaymentMethods /> },
              { path: 'subscriptions', element: <Subscriptions /> },
              { path: 'delivery-tracking', element: <DeliveryTracking /> },
            ],
          },
          { path: 'packages', element: <DashboardPackages /> },
          { path: 'edit-details', element: <AccountDetails /> },
        ],
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
    ],
  },
], {
  basename: (import.meta.env.BASE_URL || '/').replace(/\/$/, ''),
})

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  )
}

export default function App() {
  const { ready } = useAuthState()
  if (!ready) {
    return <AuthLoadingScreen />
  }
  return <RouterProvider router={router} />
}
