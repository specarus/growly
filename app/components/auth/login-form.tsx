"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "@/lib/actions/auth-actions";

import { useSession } from "@/app/context/session-context";

import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import Label from "./label";
import Input from "./input";
import Button from "../ui/button";

type Session = typeof import("@/lib/auth").auth.$Infer.Session;

const getSessionFromResult = (result: unknown): Session | null => {
  if (
    typeof result === "object" &&
    result !== null &&
    "session" in result &&
    (result as { session?: Session | null }).session
  ) {
    return (result as { session?: Session | null }).session ?? null;
  }

  return null;
};

interface FormProps {
  setIsLogin: (isLogin: boolean) => void;
}

const LoginForm: React.FC<FormProps> = ({ setIsLogin }) => {
  const router = useRouter();
  const { setSession } = useSession();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password, rememberMe);

      if (!result.user) {
        setError("Invalid email or password");
        return;
      }

      const session = getSessionFromResult(result);
      if (session) {
        setSession(session);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        `Authentication error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <h2 className="lg:text-2xl xl:text-3xl 2xl:text-4xl font-extrabold lg:mb-1 xl:mb-2 text-foreground">
        Log In
      </h2>
      <p className="lg:text-xs xl:text-sm 2xl:text-base text-muted-foreground lg:mb-6 2xl:mb-8">
        Welcome back! Please enter your details.
      </p>

      <form onSubmit={handleLogin} className="lg:space-y-4 2xl:space-y-6">
        <div className="flex flex-col lg:gap-1.5 xl:gap-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute lg:left-3 xl:left-5 top-1/2 -translate-y-1/2 lg:w-3 lg:h-3 xl:h-4 xl:w-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col lg:gap-1.5 xl:gap-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute lg:left-3 xl:left-5 top-1/2 -translate-y-1/2 lg:w-3 lg:h-3 xl:h-4 xl:w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              className="absolute top-1/2 -translate-y-1/2 lg:right-3 xl:right-4 cursor-pointer text-primary"
            >
              {showPassword ? (
                <Eye className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
              ) : (
                <EyeOff className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="remember"
            className="flex items-center lg:gap-1.5 xl:gap-2 cursor-pointer select-none"
          >
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="sr-only peer"
            />
            <span
              className={`lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 rounded-full lg:border xl:border-2 transition-all duration-200 ${
                rememberMe
                  ? "border-primary bg-primary"
                  : "border-primary bg-white"
              }`}
            />
            <span className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
              Remember me
            </span>
          </label>
          <a
            href="#"
            className="lg:text-[11px] xl:text-xs 2xl:text-sm text-primary font-medium hover:underline transition-colors duration-150"
          >
            Forgot Password?
          </a>
        </div>

        {error ? (
          <p
            className="lg:text-[11px] xl:text-xs 2xl:text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white lg:h-8 xl:h-10 2xl:h-12 w-full lg:text-sm xl:text-base 2xl:text-lg font-semibold hover:bg-white border border-primary hover:text-primary transition-all duration-200 disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>

        <div className="flex items-center justify-center lg:gap-1.5 xl:gap-2 lg:pt-1 xl:pt-2 lg:text-[11px] xl:text-[13px] 2xl:text-sm">
          <p className="text-center text-muted-foreground">New user?</p>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className="text-primary hover:underline font-semibold transition-colors duration-150"
          >
            Create an account
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
