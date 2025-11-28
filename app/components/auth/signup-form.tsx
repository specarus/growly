"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/app/context/session-context";

import { signUp } from "@/lib/actions/auth-actions";

import Button from "../ui/button";

import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

import Label from "./label";
import Input from "./input";

interface FormProps {
  setIsLogin: (isLogin: boolean) => void;
}

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
      </form>
    </div>
  );
};

export default SignupForm;
