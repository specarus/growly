import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

import Header from "./components/layout/header";
import { ModalProvider } from "./context/modal-context";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { SessionProvider } from "./context/session-context";
import Footer from "./components/layout/footer";

const montserrat = localFont({
  src: [
    { path: "../public/fonts/montserrat/Montserrat-400.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/montserrat/Montserrat-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/montserrat/Montserrat-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/montserrat/Montserrat-700.ttf", weight: "700", style: "normal" },
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
          <ModalProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 w-full h-full">{children}</main>
              <Footer />
            </div>
          </ModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
