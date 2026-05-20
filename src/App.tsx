import * as Sentry from '@sentry/react'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'
import RootLayout from './RootLayout'
import SignUp from './modules/auth/pages/SignUp'
import SignIn from './modules/auth/pages/SignIn'
import Dashboard from './modules/auth/pages/Dashboard'
import DashboardPackages from './modules/auth/pages/DashboardPackages'
import PaymentMethods from './modules/payment/pages/PaymentMethods'
import Subscriptions from './modules/auth/pages/Subscriptions'
import ProvisionedUserRoute from './modules/auth/components/ProvisionedUserRoute'
import AuthenticatedRoute from './modules/auth/components/AuthenticatedRoute'
import AccountDetails from './modules/auth/pages/AccountDetails'
import Landing from './modules/auth/pages/Landing'
import Contact from './modules/auth/pages/Contact'
import Faqs from './modules/auth/pages/Faqs'
import HowItWorks from './modules/auth/pages/HowItWorks'
import HowToHub from './modules/auth/pages/HowToHub'
import HowToJoinPage from './modules/auth/pages/HowToJoinPage'
import HowToActivate from './modules/auth/pages/HowToActivate'
import HowToTopUp from './modules/auth/pages/HowToTopUp'
import HowToRica from './modules/auth/pages/HowToRica'
import HowToDelivery from './modules/auth/pages/HowToDelivery'
import HowToPort from './modules/auth/pages/HowToPort'
import ForgotPassword from './modules/auth/pages/ForgotPassword'
import VerifyEmail from './modules/auth/pages/VerifyEmail'
import ResetPassword from './modules/auth/pages/ResetPassword'
import AuthAction from './modules/auth/pages/AuthAction'
import TermsAndConditions from './modules/auth/pages/TermsAndConditions'
import FairUsagePolicy from './modules/auth/pages/FairUsagePolicy'
import DeliveryTracking from './modules/warehouse/pages/DeliveryTracking'
import { useAuthState } from './modules/auth/hooks/useAuthState'

import './config/firebase'

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter)

const router = sentryCreateBrowserRouter(
  [
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
          path: '/how-it-works',
          element: <HowItWorks />,
        },
        {
          path: '/how-to',
          element: <HowToHub />,
        },
        {
          path: '/how-to/join',
          element: <HowToJoinPage />,
        },
        {
          path: '/how-to/activate',
          element: <HowToActivate />,
        },
        {
          path: '/how-to/top-up',
          element: <HowToTopUp />,
        },
        {
          path: '/how-to/rica',
          element: <HowToRica />,
        },
        {
          path: '/how-to/delivery',
          element: <HowToDelivery />,
        },
        {
          path: '/how-to/port',
          element: <HowToPort />,
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
          element: (
            <AuthenticatedRoute>
              <Outlet />
            </AuthenticatedRoute>
          ),
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
  ],
  {
    basename: (import.meta.env.BASE_URL || '/').replace(/\/$/, ''),
  },
)

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
