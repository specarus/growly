import { ReactNode } from "react";
import Header from "./Header";
import Footer from "@/layout/Footer";

interface LayoutProps {
  children: ReactNode;
  loading?: boolean;
}

const Layout = ({ children, loading = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white relative">
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <span className="loader"></span>
        </div>
      )}
      <Header />
      <main>{children}</main>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
