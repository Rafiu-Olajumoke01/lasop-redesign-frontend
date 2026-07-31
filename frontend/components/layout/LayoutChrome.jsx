"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsapp from "@/components/shared/FloatingWhatsapp";

const HIDDEN_ROUTES = ["/backstage", "/tutor", "/student"];

export default function LayoutChrome({ children }) {
  const pathname = usePathname();

  const hideChrome = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (hideChrome) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>
        {children}
        <FloatingWhatsapp />
      </main>
      <Footer />
    </>
  );
}