"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsapp from "@/components/shared/FloatingWhatsapp";
import AuthHeader from "@/components/layout/AuthHeader";

const HIDDEN_ROUTES = ["/backstage", "/tutor", "/student"];
const LOGO_ONLY_ROUTES = ["/login", "/signup"];

export default function LayoutChrome({ children }) {
  const pathname = usePathname();

  const hideChrome = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const logoOnly = LOGO_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (hideChrome) {
    return <main>{children}</main>;
  }

  if (logoOnly) {
    return (
      <>
        <AuthHeader />
        <main className="flex flex-col min-h-screen">{children}</main>
      </>
    );
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