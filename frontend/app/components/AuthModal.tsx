"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import Button from "./ui/Button";

interface AuthModalProps {}

interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
}

export const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label
      className="text-foreground text-[14px] font-medium"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ ...props }) => {
  return (
    <input
      className="pl-14 pr-3 flex h-10 w-full rounded-full border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      {...props}
    />
  );
};

export const AuthModal: React.FC<AuthModalProps> = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? "Login" : "Sign up", { email, password, name });
  };

  return (
    <div className="w-full max-w-4xl overflow-hidden shadow-2xl rounded-2xl">
      <div className="grid grid-cols-2 h-full">
        <div className="bg-white"></div>

        <div className="p-10 bg-white">
          <div className="max-w-sm mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-card-foreground">
              {isLogin ? "Log In" : "Sign Up"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-primary rounded-full cursor-pointer" />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="bg-primary text-white h-12 hover:bg-white hover:text-primary transiton-all duration-200 border border-primary"
              >
                {isLogin ? "Log in" : "Sign Up"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "New user? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">
                    Or log in with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button type="button" className="w-full">
                  G
                </Button>
                <Button type="button" className="w-full">
                  F
                </Button>
                <Button type="button" className="w-full">
                  Git
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
