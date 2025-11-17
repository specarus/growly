import { AuthModal } from "@/components/AuthModal";
import Hero from "@/components/Hero";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main className="w-full h-full relative bg-white">
      <header className="sticky top-0 left-0 h-32 bg-transparent px-28 py-6 z-40">
        <div className="bg-white h-full rounded-full border-[1px] shadow-inner border-gray-50 flex justify-between items-center pl-14 pr-8">
          <h1>Logo</h1>
          <Link
            to="/dashboard"
            className="bg-primary rounded-full text-white px-8 py-2"
          >
            Log in
          </Link>
        </div>
      </header>
      <section className="h-screen">
        <Hero />
      </section>
      {/*<Footer />*/}
      <div className="w-full h-screen absolute top-0 left-0 grid place-items-center z-50 bg-black/20">
        <AuthModal />
      </div>
    </main>
  );
};

export default Index;
