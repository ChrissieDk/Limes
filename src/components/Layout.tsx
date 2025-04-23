// Layout.tsx
import React, { ReactNode } from "react";
import NavBar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#1a191f]">
      <NavBar />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
