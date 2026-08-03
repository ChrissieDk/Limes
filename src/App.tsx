import * as Sentry from '@sentry/react'
import { lazy, Suspense } from 'react'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'
import RootLayout from './RootLayout'
import ProvisionedUserRoute from './modules/auth/components/ProvisionedUserRoute'
import AuthenticatedRoute from './modules/auth/components/AuthenticatedRoute'
import { useAuthState } from './modules/auth/hooks/useAuthState'

const SignUp = lazy(() => import('./modules/auth/pages/SignUp'))
const SignIn = lazy(() => import('./modules/auth/pages/SignIn'))
const Dashboard = lazy(() => import('./modules/auth/pages/Dashboard'))
const DashboardPackages = lazy(() => import('./modules/auth/pages/DashboardPackages'))
const PaymentMethods = lazy(() => import('./modules/payment/pages/PaymentMethods'))
const Subscriptions = lazy(() => import('./modules/auth/pages/Subscriptions'))
const AccountDetails = lazy(() => import('./modules/auth/pages/AccountDetails'))
const Landing = lazy(() => import('./modules/auth/pages/Landing'))
const Contact = lazy(() => import('./modules/auth/pages/Contact'))
const Faqs = lazy(() => import('./modules/auth/pages/Faqs'))
const HowItWorks = lazy(() => import('./modules/auth/pages/HowItWorks'))
const PartnersPage = lazy(() => import('./modules/auth/pages/PartnersPage'))
const HowToHub = lazy(() => import('./modules/auth/pages/HowToHub'))
const HowToJoinPage = lazy(() => import('./modules/auth/pages/HowToJoinPage'))
const HowToActivate = lazy(() => import('./modules/auth/pages/HowToActivate'))
const HowToTopUp = lazy(() => import('./modules/auth/pages/HowToTopUp'))
const HowToRica = lazy(() => import('./modules/auth/pages/HowToRica'))
const HowToDelivery = lazy(() => import('./modules/auth/pages/HowToDelivery'))
const HowToPort = lazy(() => import('./modules/auth/pages/HowToPort'))
const ForgotPassword = lazy(() => import('./modules/auth/pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./modules/auth/pages/VerifyEmail'))
const ResetPassword = lazy(() => import('./modules/auth/pages/ResetPassword'))
const AuthAction = lazy(() => import('./modules/auth/pages/AuthAction'))
const TermsAndConditions = lazy(() => import('./modules/auth/pages/TermsAndConditions'))
const FairUsagePolicy = lazy(() => import('./modules/auth/pages/FairUsagePolicy'))
const DeliveryTracking = lazy(() => import('./modules/warehouse/pages/DeliveryTracking'))

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
          path: '/partners',
          element: <PartnersPage />,
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
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
