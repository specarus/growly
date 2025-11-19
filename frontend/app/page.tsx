"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "./components/AuthModal";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          router.push("/dashboard");
        }
      } catch (err) {}
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <main className="w-full min-h-screen relative">
      <div className="w-full h-screen absolute top-0 left-0 grid place-items-center z-50 bg-black/20">
        <AuthModal />
      </div>
    </main>
  );
}
