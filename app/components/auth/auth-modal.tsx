"use client";

import { useState } from "react";

import LoginForm from "./login-form";
import SignupForm from "./signup-form";

type AuthModalProps = Record<string, never>;

export const AuthModal: React.FC<AuthModalProps> = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div className="w-full xl:max-w-md 2xl:max-w-lg overflow-hidden shadow-2xl rounded-2xl bg-white border-2 border-primary/50">
      <div className="xl:p-8 2xl:p-10 flex items-center justify-center w-full">
        {isLogin ? (
          <LoginForm setIsLogin={setIsLogin} />
        ) : (
          <SignupForm setIsLogin={setIsLogin} />
        )}
      </div>
    </div>
  );
};
