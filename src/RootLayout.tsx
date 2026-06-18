import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SEO from "./components/SEO";
import MobileTabBar from "./components/MobileTabBar";

export default function RootLayout() {
  const { pathname, hash } = useLocation();
  const isLanding = pathname === "/";

  useLayoutEffect(() => {
    const hasLandingSectionHash = pathname === "/" && hash.length > 1;
    if (hasLandingSectionHash) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <SEO />
      {/* pb-20 accounts for the fixed bottom tab bar — hidden on landing */}
      <div className={isLanding ? "" : "pb-20 lg:pb-0"}>
        <div key={pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </div>
      {/* Tab bar hidden on landing (full-screen immersive) */}
      {!isLanding && (
        <div className="lg:hidden">
          <MobileTabBar />
        </div>
      )}
    </>
  );
}
