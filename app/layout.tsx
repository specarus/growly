import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import Header from "./components/layout/header";
import { ModalProvider } from "./context/ModalContext";
import { auth } from "../lib/auth";
import { headers } from "next/headers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
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
        <ModalProvider>
          <section>
            <Header session={session} />
          </section>
          <section className="w-full h-full">{children}</section>
        </ModalProvider>
      </body>
    </html>
  );
}
