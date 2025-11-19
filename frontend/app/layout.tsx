import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import HeaderWrapper from "./layout/header-wrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Growly",
  description: "Habit Tracker App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body>
        <section>
          <HeaderWrapper />
        </section>
        <section className="w-full h-full">{children}</section>
      </body>
    </html>
  );
}
