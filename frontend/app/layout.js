import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsapp from "@/components/shared/FloatingWhatsapp";

import { Plus_Jakarta_Sans, Inter } from "next/font/google";


const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "LASOP | Learn. Study. Work.",
  description:
    "Practical technology, business and vocational training programs designed to prepare students for real opportunities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body  className={`${plusJakarta.variable} ${inter.variable}`}>
        <Navbar />

        <main>
          {children}
          <FloatingWhatsapp />
        </main>
        
        <Footer />
      </body>
    </html>
  );
}