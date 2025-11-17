import { ReactNode } from "react";
import { Search, Bell, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  loading?: boolean;
}

const Layout = ({ children, loading = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white relative">
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      <header className="left-0 shadow-sm border-b border-gray-50 border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="2xl:max-w-[1750px] xl:px-8 mx-auto xl:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm truncate">
              <span className="font-medium">Dashboard</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-muted-foreground hidden sm:inline">
                Schedule
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="xl:px-8 xl:pt-4 2xl:pt-6 pb-10 2xl:max-w-[1750px] mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="h-32 border-[1px] shadow-sm border-gray-50">
        Footer
      </footer>
    </div>
  );
};

export default Layout;
