import { lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import RootLayout from "./RootLayout";
import ProvisionedUserRoute from "./modules/auth/components/ProvisionedUserRoute";
import AuthenticatedRoute from "./modules/auth/components/AuthenticatedRoute";
import { useAuthState } from "./modules/auth/hooks/useAuthState";

import "./config/firebase";

// Lazy-load all page components for route-level code splitting.
// Only the landing page loads upfront; everything else loads on demand.
const Landing = lazy(() => import("./modules/auth/pages/Landing"));
const SignUp = lazy(() => import("./modules/auth/pages/SignUp"));
const SignIn = lazy(() => import("./modules/auth/pages/SignIn"));
const Dashboard = lazy(() => import("./modules/auth/pages/Dashboard"));
const DashboardPackages = lazy(
  () => import("./modules/auth/pages/DashboardPackages"),
);
const PaymentMethods = lazy(
  () => import("./modules/payment/pages/PaymentMethods"),
);
const Subscriptions = lazy(() => import("./modules/auth/pages/Subscriptions"));
const AccountDetails = lazy(
  () => import("./modules/auth/pages/AccountDetails"),
);
const Contact = lazy(() => import("./modules/auth/pages/Contact"));
const Faqs = lazy(() => import("./modules/auth/pages/Faqs"));
const HowItWorks = lazy(() => import("./modules/auth/pages/HowItWorks"));
const PartnersPage = lazy(() => import("./modules/auth/pages/PartnersPage"));
const HowToHub = lazy(() => import("./modules/auth/pages/HowToHub"));
const HowToJoinPage = lazy(() => import("./modules/auth/pages/HowToJoinPage"));
const HowToActivate = lazy(() => import("./modules/auth/pages/HowToActivate"));
const HowToTopUp = lazy(() => import("./modules/auth/pages/HowToTopUp"));
const HowToRica = lazy(() => import("./modules/auth/pages/HowToRica"));
const HowToDelivery = lazy(() => import("./modules/auth/pages/HowToDelivery"));
const HowToPort = lazy(() => import("./modules/auth/pages/HowToPort"));
const ForgotPassword = lazy(
  () => import("./modules/auth/pages/ForgotPassword"),
);
const VerifyEmail = lazy(() => import("./modules/auth/pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./modules/auth/pages/ResetPassword"));
const AuthAction = lazy(() => import("./modules/auth/pages/AuthAction"));
const TermsAndConditions = lazy(
  () => import("./modules/auth/pages/TermsAndConditions"),
);
const FairUsagePolicy = lazy(
  () => import("./modules/auth/pages/FairUsagePolicy"),
);
const DeliveryTracking = lazy(
  () => import("./modules/warehouse/pages/DeliveryTracking"),
);
const LinesPage = lazy(() => import("./modules/auth/pages/LinesPage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div
        className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function LazyPage({ Component }: { Component: React.ComponentType }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const sentryCreateBrowserRouter = import.meta.env.DEV
  ? createBrowserRouter
  : Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

const router = sentryCreateBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          path: "/",
          element: <LazyPage Component={Landing} />,
        },
        {
          path: "/faqs",
          element: <LazyPage Component={Faqs} />,
        },
        {
          path: "/how-it-works",
          element: <LazyPage Component={HowItWorks} />,
        },
        {
          path: "/partners",
          element: <LazyPage Component={PartnersPage} />,
        },
        {
          path: "/how-to",
          element: <LazyPage Component={HowToHub} />,
        },
        {
          path: "/how-to/join",
          element: <LazyPage Component={HowToJoinPage} />,
        },
        {
          path: "/how-to/activate",
          element: <LazyPage Component={HowToActivate} />,
        },
        {
          path: "/how-to/top-up",
          element: <LazyPage Component={HowToTopUp} />,
        },
        {
          path: "/how-to/rica",
          element: <LazyPage Component={HowToRica} />,
        },
        {
          path: "/how-to/delivery",
          element: <LazyPage Component={HowToDelivery} />,
        },
        {
          path: "/how-to/port",
          element: <LazyPage Component={HowToPort} />,
        },
        {
          path: "/register",
          element: <LazyPage Component={SignUp} />,
        },
        {
          path: "/signup",
          element: <LazyPage Component={SignUp} />,
        },
        {
          path: "/signin",
          element: <LazyPage Component={SignIn} />,
        },
        {
          path: "/forgot-password",
          element: <LazyPage Component={ForgotPassword} />,
        },
        {
          path: "/auth/action",
          element: <LazyPage Component={AuthAction} />,
        },
        {
          path: "/auth/verify-email",
          element: <LazyPage Component={VerifyEmail} />,
        },
        {
          path: "/auth/reset-password",
          element: <LazyPage Component={ResetPassword} />,
        },
        {
          path: "dashboard",
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
                { index: true, element: <LazyPage Component={Dashboard} /> },
                {
                  path: "payment-methods",
                  element: <LazyPage Component={PaymentMethods} />,
                },
                {
                  path: "subscriptions",
                  element: <LazyPage Component={Subscriptions} />,
                },
                {
                  path: "delivery-tracking",
                  element: <LazyPage Component={DeliveryTracking} />,
                },
              ],
            },
            {
              path: "packages",
              element: <LazyPage Component={DashboardPackages} />,
            },
            {
              path: "lines",
              element: <LazyPage Component={LinesPage} />,
            },
            {
              path: "edit-details",
              element: <LazyPage Component={AccountDetails} />,
            },
          ],
        },
        {
          path: "/contact",
          element: <LazyPage Component={Contact} />,
        },
        {
          path: "/terms-and-conditions",
          element: <LazyPage Component={TermsAndConditions} />,
        },
        {
          path: "/terms",
          element: <LazyPage Component={TermsAndConditions} />,
        },
        {
          path: "/fair-usage-policy",
          element: <LazyPage Component={FairUsagePolicy} />,
        },
      ],
    },
  ],
  {
    basename: (import.meta.env.BASE_URL || "/").replace(/\/$/, ""),
  },
);

function AuthLoadingScreen() {
  return <PageLoader />;
}

export default function App() {
  const { ready } = useAuthState();
  if (!ready) {
    return <AuthLoadingScreen />;
  }
  return <RouterProvider router={router} />;
}
