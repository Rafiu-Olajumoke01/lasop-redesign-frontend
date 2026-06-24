"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX } from "react-icons/fi";


const courses = [
  {
    title: "Full-stack Web Software Development & AI",
    duration: "6 Months",
    fee: "₦450K",
    path: "/courses/full-stack-ai",
  },
  {
    title: "Data Science with Python & R",
    duration: "5 Months",
    fee: "₦450K",
    path: "/courses/data-science",
  },
  {
    title: "AI Automation",
    duration: "2 Months",
    fee: "₦250K",
    path: "/courses/ai-automation",
  },
  {
    title: "Business Startup & Growth to ₦50M",
    duration: "6 Months",
    fee: "₦450K",
    path: "/courses/business-growth",
  },
  {
    title: "Computer & Mobile Phone Repair",
    duration: "6 Months",
    fee: "₦550K",
    path: "/courses/phone-repair",
  },
  {
    title: "Car Diagnosis & Programming",
    duration: "2 Months",
    fee: "₦250K",
    path: "/courses/car-diagnosis",
  },
  {
    title: "Artificial Intelligence Engineering",
    duration: "4 Months",
    fee: "₦450K",
    path: "/courses/ai-engineering",
  },
  {
    title: "Cyber Security",
    duration: "5 Months",
    fee: "₦450K",
    path: "/courses/cyber-security",
  },
  {
    title: "Project Management & Business Development",
    duration: "2 Months",
    fee: "₦250K",
    path: "/courses/project-management",
  },
  {
    title: "Automobile Rewire & Electricals",
    duration: "6 Months",
    fee: "₦450K",
    path: "/courses/automobile-electricals",
  },
];

export default function Navbar() {

  const [isOpen, setIsOpen] = useState(false);
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#071224]/95 via-[#0B1730]/95 to-[#0A1A38]/95 backdrop-blur-xl border-b border-blue-900/40 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
      <div className="container-width h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.webp" alt="LASOP Logo" width={45} height={45} />
          <h1 className="text-2xl font-bold text-[#8BB8FF] tracking-wide">LASOP</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">

          {/* Courses Dropdown */}
          <div className="relative">
            <div className="group">
              <button className="h-20 flex items-center gap-1 font-medium text-slate-200 hover:text-[#60A5FA] transition duration-300">
                Courses
                <FiChevronDown className="group-hover:rotate-180 transition duration-300" />
              </button>

              <div className="absolute left-1/2 top-full -translate-x-1/2 pt-1 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                <div className="w-[850px] bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-md shadow-2xl shadow-blue-200/40 p-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#004ac6]">
                      Explore LASOP Programs
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <Link
                        key={course.title}
                        href={course.path}
                        className="group/item bg-white/70 border border-blue-100 rounded-md p-2 hover:bg-[#004ac6] hover:shadow-lg transition duration-300"
                      >
                        <h3 className="font-semibold text-slate-800 group-hover/item:text-white transition">
                          {course.title}
                        </h3>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-blue-200 mt-6 pt-5 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Find the perfect career path for you.
                    </p>
                    <Link href="/courses" className="font-semibold text-[#004ac6] hover:underline">
                      View All Courses →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <Link href="/webinar" className="text-slate-200 hover:text-[#60A5FA] transition duration-300">
            Webinar
          </Link>
          <Link href="/calendar" className="text-slate-200 hover:text-[#60A5FA] transition duration-300">
            Calendar
          </Link>
          <Link href="/about" className="text-slate-200 hover:text-[#60A5FA] transition duration-300">
            About
          </Link>
          <Link href="/faqs" className="text-slate-200 hover:text-[#60A5FA] transition duration-300">
            FAQs
          </Link>
          <Link href="/contact" className="text-slate-200 hover:text-[#60A5FA] transition duration-300">
            Contact
          </Link>
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/signup"
          className="hidden lg:flex items-center justify-center bg-[#0057E7] text-white px-5 py-2 rounded-lg font-semibold shadow-[0_10px_30px_rgba(0,87,231,0.35)] hover:bg-[#0A66FF] hover:-translate-y-[2px] transition-all duration-300"
        >
          Sign Up
        </Link>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-3xl cursor-pointer text-white"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-screen w-[90%] max-w-[380px] bg-[#071224] border-l border-white/10 z-50 p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-white text-xl font-bold">LASOP</h2>
                <button onClick={() => setIsOpen(false)} className="text-white text-3xl">
                  <FiX />
                </button>
              </div>

              {/* Courses Accordion */}
              <div className="border-b border-white/10 pb-4">
                <button
                  onClick={() => setShowCourses(!showCourses)}
                  className="w-full flex justify-between items-center text-white font-medium py-3"
                >
                  Courses
                  <FiChevronDown className={`transition-transform duration-300 ${showCourses ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCourses && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 pt-2 pl-3">
                        {courses.map((course) => (
                          <Link
                            key={course.title}
                            href={course.path}
                            onClick={() => setIsOpen(false)}
                            className="text-slate-300 hover:text-blue-400 text-sm"
                          >
                            {course.title}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col mt-4">
                <Link href="/webinar" onClick={() => setIsOpen(false)} className="py-4 text-white border-b border-white/10">
                  Webinar
                </Link>
                <Link href="/calendar" onClick={() => setIsOpen(false)} className="py-4 text-white border-b border-white/10">
                  Calendar
                </Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="py-4 text-white border-b border-white/10">
                  About
                </Link>
                <Link href="/faqs" onClick={() => setIsOpen(false)} className="py-4 text-white border-b border-white/10">
                  FAQs
                </Link>
                <Link href="/contact" onClick={() => setIsOpen(false)} className="py-4 text-white border-b border-white/10">
                  Contact
                </Link>
              </div>

              {/* Mobile CTA */}
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="w-full mt-8 flex items-center justify-center bg-[#0057E7] hover:bg-[#0A66FF] text-white py-4 rounded-xl font-semibold transition"
              >
                Sign Up
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}