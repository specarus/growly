import { AuthModal } from "./components/AuthModal";

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen relative">
      <div className="w-full h-screen absolute top-0 left-0 grid place-items-center z-50 bg-black/20">
        <AuthModal />
      </div>
    </main>
  );
}
