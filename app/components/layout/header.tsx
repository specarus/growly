"use client";

import { useContext } from "react";

import { Search, Bell, HelpCircle } from "lucide-react";

import Button from "@/app/components/ui/button";

import { ModalContext } from "@/app/context/ModalContext";

import { auth } from "@/lib/auth";

import { signOut } from "@/lib/actions/auth-actions";

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

type Session = typeof auth.$Infer.Session;

export default function Header({ session }: { session: Session | null }) {
  const context = useContext(ModalContext);
  if (!context) return null;

  const { setShowModal } = context;

  return (
    <header className="fixed top-0 left-0 w-full shadow-sm border-b border-gray-50 backdrop-blur-sm z-40">
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
          {session ? (
            <Button
              onClick={signOut}
              className="xl:text-sm 2xl:text-[16px] hover:bg-primary hover:text-white transition-all duration-100 xl:min-w-20 2xl:min-w-24 xl:h-8 2xl:h-10 border border-primary text-primary"
            >
              Log out
            </Button>
          ) : (
            <Button
              onClick={() => setShowModal(true)}
              className="xl:text-sm 2xl:text-[16px] hover:bg-primary hover:text-white transition-all duration-100 xl:min-w-20 2xl:min-w-24 xl:h-8 2xl:h-10 border border-primary text-primary"
            >
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
