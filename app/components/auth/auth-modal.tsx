"use client";

import { useState } from "react";

import LoginForm from "./login-form";
import SignupForm from "./signup-form";

type AuthModalProps = Record<string, never>;

export const AuthModal: React.FC<AuthModalProps> = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div className="w-full lg:max-w-sm xl:max-w-md 2xl:max-w-lg overflow-hidden shadow-xl rounded-2xl bg-white lg:border-1.5 xl:border-2 border-primary/50">
      <div className="lg:p-4 xl:p-6 2xl:p-8 flex items-center justify-center w-full">
        {isLogin ? (
          <LoginForm setIsLogin={setIsLogin} />
        ) : (
          <SignupForm setIsLogin={setIsLogin} />
        )}
      </div>
    </div>
  );
};
