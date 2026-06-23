import Link from "next/link";
import Image from "next/image";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaLinkedin, FaWhatsapp, FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

const socials = [
  { name: "LinkedIn", href: "https://linkedin.com/company/lasopdotnet", icon: FaLinkedin },
  { name: "WhatsApp", href: "https://wa.me/+2347025713326", icon: FaWhatsapp },
  { name: "Twitter", href: "https://twitter.com/Lasopdotnet", icon: FaTwitter },
  { name: "Facebook", href: "https://www.facebook.com/lasopdotnet", icon: FaFacebookF },
  { name: "Instagram", href: "https://www.instagram.com/lasopdotnet", icon: FaInstagram },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#040B18] border-t border-white/10">

      <div className="container-width py-12 md:py-20 px-4 md:px-6">

        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">

          {/* Logo - full width on mobile */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.webp"
                alt="LASOP"
                width={45}
                height={45}
              />
              <h2 className="text-xl font-bold text-white">
                LASOP
              </h2>
            </div>
          </div>

          {/* Contact - full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold text-sm mb-5">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2.5">
                <FiPhone className="text-blue-400 mt-0.5 shrink-0 text-sm" />
                <span className="text-slate-400 text-sm">
                  +234 702 571 3326
                </span>
              </div>
              <div className="flex gap-2.5">
                <FiMail className="text-blue-400 mt-0.5 shrink-0 text-sm" />
                <span className="text-slate-400 text-sm">
                  info@lasop.net
                </span>
              </div>
              <div className="flex gap-2.5">
                <FiMapPin className="text-blue-400 mt-0.5 shrink-0 text-sm" />
                <span className="text-slate-400 text-sm">
                  No. 86, Olowoira Road, Solomon Avenue
                  Junction, Olowoira, off Ojodu-Berger,
                  Lagos, Nigeria
                </span>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-sm mb-5">
              Pages
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/webinar" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  Webinar
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-sm mb-5">
              Courses
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/courses/full-stack-ai" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  Full Stack Development & AI
                </Link>
              </li>
              <li>
                <Link href="/courses/data-science" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  Data Science
                </Link>
              </li>
              <li>
                <Link href="/courses/cyber-security" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  Cyber Security
                </Link>
              </li>
              <li>
                <Link href="/courses/ai-engineering" className="text-slate-400 text-sm hover:text-blue-400 transition">
                  AI Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-sm mb-5">
              Socials
            </h3>
            <ul className="space-y-3">
              {socials.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-slate-400 text-sm hover:text-blue-400 transition"
                  >
                    <Icon className="text-sm shrink-0" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-10 md:my-12" />

        {/* Bottom */}
        <p className="text-slate-500 text-sm text-center">
          © 2026 LASOP. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}