import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Link from "next/link";

import Header from "./components/layout/header";
import NavigationLoader from "./components/navigation-loader";
import { ModalProvider } from "./context/modal-context";
import { XPProvider } from "./context/xp-context";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { SessionProvider } from "./context/session-context";
import Footer from "./components/layout/footer";
import CelebrationToast from "./components/celebration-toast";
import { ThemeProvider } from "./context/theme-context";

import { LayoutPanelTop } from "lucide-react";

const montserrat = localFont({
  src: [
    {
      path: "../public/fonts/montserrat/Montserrat-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/montserrat/Montserrat-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/montserrat/Montserrat-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/montserrat/Montserrat-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growly",
  description: "Habit Tracker App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body>
        <SessionProvider initialSession={session}>
          <ThemeProvider>
            <XPProvider>
              <ModalProvider>
                <div className="min-h-screen flex flex-col text-foreground">
                  <NavigationLoader />
                  <Header />
                  <main className="flex-1 w-full h-full">{children}</main>
                  <Footer />
                  <CelebrationToast />
                  {session ? (
                    <Link
                      href="/dashboard"
                      className="fixed lg:bottom-4 lg:right-4 xl:bottom-5 xl:right-5 z-50 grid place-items-center rounded-full bg-primary lg:p-2 xl:p-3 2xl:p-4 font-semibold text-white shadow-md shadow-primary transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      aria-label="Open dashboard"
                    >
                      <LayoutPanelTop className="lg:w-5 xl:w-6 lg:h-5 xl:h-6" />
                    </Link>
                  ) : null}
                </div>
              </ModalProvider>
            </XPProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
