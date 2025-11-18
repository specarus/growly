import { Search, Bell, HelpCircle, User } from "lucide-react";
import Button from "../components/ui/Button";

interface IconButtonProps {
  children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({ children }) => {
  return (
    <Button className="hover:text-white hover:bg-green-soft p-2 transition duration-100">
      {children}
    </Button>
  );
};

export default function Header() {
  return (
    <header className="sticky top-0 left-0 shadow-sm border-b border-gray-50 backdrop-blur-sm z-40">
      <div className="2xl:px-28 xl:px-8 mx-auto xl:h-16 flex items-center justify-between">
        <div className="flex items-center xl:gap-2 2xl:gap-4 flex-1 min-w-0">
          <div className="flex items-center xl:gap-2 2xl:gap-3">
            <div className="xl:w-2 xl:h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-red-500" />
            <div className="xl:w-2 xl:h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-yellow-500" />
            <div className="xl:w-2 xl:h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center xl:gap-1.5 2xl:gap-2 xl:text-xs 2xl:text-sm truncate">
            <span className="font-medium">Dashboard</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline text-muted-foreground">
              Overview
            </span>
          </div>
        </div>

        <div className="flex items-center xl:gap-2 2xl:gap-4">
          <IconButton>
            <Search className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
          </IconButton>
          <IconButton>
            <Bell className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
          </IconButton>
          <IconButton>
            <HelpCircle className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
          </IconButton>
          <IconButton>
            <User className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
