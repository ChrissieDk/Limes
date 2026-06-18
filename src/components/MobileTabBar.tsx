import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  Home,
  ShoppingBag,
  BookOpen,
  Users,
  LogIn,
  LayoutDashboard,
  PlusCircle,
  Truck,
  User,
} from "lucide-react";

type Tab = {
  label: string;
  path: string;
  matchPattern: string;
  Icon: typeof Home;
};

const loggedOutTabs: Tab[] = [
  { label: "Home", path: "/", matchPattern: "/", Icon: Home },
  { label: "Plans", path: "/#packages", matchPattern: "/", Icon: ShoppingBag },
  { label: "How To", path: "/how-to", matchPattern: "/how-to", Icon: BookOpen },
  {
    label: "Partners",
    path: "/partners",
    matchPattern: "/partners",
    Icon: Users,
  },
  { label: "Sign In", path: "/signin", matchPattern: "/signin", Icon: LogIn },
];

const loggedInTabs: Tab[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    matchPattern: "/dashboard",
    Icon: LayoutDashboard,
  },
  {
    label: "Top Up",
    path: "/dashboard",
    matchPattern: "/dashboard/topup",
    Icon: PlusCircle,
  },
  {
    label: "Plans",
    path: "/dashboard/packages",
    matchPattern: "/dashboard/packages",
    Icon: ShoppingBag,
  },
  {
    label: "Delivery",
    path: "/dashboard/delivery-tracking",
    matchPattern: "/dashboard/delivery-tracking",
    Icon: Truck,
  },
  {
    label: "Account",
    path: "/dashboard/edit-details",
    matchPattern: "/dashboard/edit-details",
    Icon: User,
  },
];

export default function MobileTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return unsub;
  }, []);

  const tabs = isLoggedIn ? loggedInTabs : loggedOutTabs;

  const isActive = (tab: Tab) => {
    if (tab.matchPattern === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(tab.matchPattern);
  };

  const handleTap = (tab: Tab) => {
    // If already on this tab, scroll to top
    if (isActive(tab)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // For hash-based landing page links, use anchor navigation
    if (tab.path.includes("#")) {
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(tab.path.replace("/", ""));
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    navigate(tab.path);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-[#1A1920]/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.label}
              onClick={() => handleTap(tab)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full py-1"
            >
              <tab.Icon
                className={`w-5 h-5 transition-colors ${
                  active ? "text-[#ABFF63]" : "text-neutral-500"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium truncate transition-colors ${
                  active ? "text-[#ABFF63]" : "text-neutral-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
