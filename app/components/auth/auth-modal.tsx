"use client";

import { useState } from "react";

import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

import Button from "../ui/button";

import { signIn, signUp } from "@/lib/actions/auth-actions";
import { useSession } from "@/app/context/session-context";

import { useRouter } from "next/navigation";
import Image from "next/image";

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

interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
}

export const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label
      className="text-foreground xl:text-[12px] 2xl:text-[14px] font-medium"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ ...props }) => {
  return (
    <input
      className="xl:pl-12 2xl:pl-14 pr-3 flex xl:h-10 w-full rounded-full border border-input shadow-inner bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 xl:text-xs 2xl:text-sm"
      {...props}
    />
  );
};

interface FormProps {
  setIsLogin: (isLogin: boolean) => void;
}

const LoginForm: React.FC<FormProps> = ({ setIsLogin }) => {
  const router = useRouter();
  const { setSession } = useSession();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);

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
      <h2 className="xl:text-3xl 2xl:text-4xl font-extrabold mb-2 text-foreground">
        Log In
      </h2>
      <p className="xl:text-sm 2xl:text-base text-muted-foreground xl:mb-6 2xl:mb-8">
        Welcome back! Please enter your details.
      </p>

      <form onSubmit={handleLogin} className="xl:space-y-4 2xl:space-y-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer text-primary"
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 border-2 border-primary rounded-full cursor-pointer bg-white hover:bg-indigo-50" />
            <label
              htmlFor="remember"
              className="xl:text-xs 2xl:text-sm text-muted-foreground cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
          <a
            href="#"
            className="xl:text-xs 2xl:text-sm text-primary font-medium hover:underline transition-colors duration-150"
          >
            Forgot Password?
          </a>
        </div>

        {error ? (
          <p className="xl:text-xs 2xl:text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white xl:h-10 2xl:h-12 w-full xl:text-base 2xl:text-lg font-semibold hover:bg-white border border-primary hover:text-primary transition-all duration-200 disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>

        <div className="flex items-center justify-center gap-2 pt-2 xl:text-[13px] 2xl:text-sm">
          <p className="text-center text-muted-foreground">New user?</p>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className="text-primary hover:underline font-semibold transition-colors duration-150"
          >
            Create an account
          </button>
        </div>
        <SocialLoginDividers />
      </form>
    </div>
  );
};

const SignupForm: React.FC<FormProps> = ({ setIsLogin }) => {
  const router = useRouter();
  const { setSession } = useSession();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp(email, password, name);

      if (!result.user) {
        setError("Failed to create account");
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
      <h2 className="xl:text-3xl 2xl:text-4xl font-extrabold mb-2 text-foreground">
        Sign Up
      </h2>
      <p className="xl:text-sm 2xl:text-base text-muted-foreground xl:mb-6 2xl:mb-8">
        Join the community and create your account.
      </p>

      <form onSubmit={handleSignup} className="xl:space-y-4 2xl:space-y-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-name">Name</Label>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer text-primary"
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary border border-primary text-white xl:h-10 2xl:h-12 w-full xl:text-base 2xl:text-lg font-semibold hover:bg-white hover:text-primary transition-all duration-200 disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Sign Up"}
        </Button>

        <div className="flex justify-center items-center gap-2 pt-2 xl:text-[13px] 2xl:text-sm">
          <p className="text-muted-foreground">Already have an account?</p>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className="text-primary cursor-pointer hover:underline font-semibold transition-colors duration-150"
          >
            Log in
          </button>
        </div>

        <SocialLoginDividers />
      </form>
    </div>
  );
};

const SocialLoginDividers: React.FC = () => (
  <div className="space-y-4">
    <div className="relative xl:my-4 2xl:my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-muted" />
      </div>
      <div className="relative flex justify-center xl:text-xs 2xl:text-sm">
        <span className="px-4 bg-white text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>

    <Button
      type="button"
      className="flex items-center xl:gap-2 xl:text-sm 2xl:text-base xl:h-10 2xl:h-12 border border-muted text-foreground hover:bg-gray-50 bg-white"
    >
      <Image
        src={"/google-icon.png"}
        height={100}
        width={100}
        alt="Google"
        className="xl:w-6 xl:h-6 2xl:w-8 2xl:h-8"
      />
      <p>Google</p>
    </Button>
  </div>
);

type AuthModalProps = Record<string, never>;

export const AuthModal: React.FC<AuthModalProps> = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div className="w-full xl:max-w-3xl 2xl:max-w-4xl overflow-hidden shadow-2xl rounded-2xl bg-white">
      <div className="grid grid-cols-2 h-full">
        <div className="bg-white"></div>

        <div className="xl:p-8 2xl:p-10 flex items-center justify-center w-full">
          {isLogin ? (
            <LoginForm setIsLogin={setIsLogin} />
          ) : (
            <SignupForm setIsLogin={setIsLogin} />
          )}
        </div>
      </div>
    </div>
  );
};
