import React, { ReactNode } from "react";
import NavBar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative bg-[#1a191f]">
      {/* Remove min-h-screen and flex-col unless you're building a full-height layout */}
      <NavBar />
      {children}
    </div>
  );
};

export default Layout;
