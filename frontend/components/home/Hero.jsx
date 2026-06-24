"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/lasopTwo.jfif"
          alt="LASOP students"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050D1A] via-[#050D1A]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A]/80 via-transparent to-[#050D1A]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-width min-h-screen flex flex-col px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32">
        <div className="flex-1 flex items-center">
          <div className="max-w-lg py-8 sm:py-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 mb-5 sm:mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs text-blue-300 font-medium tracking-wide">
                Career-focused tech training · Est. 2021
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-5">
              Build a tech career
              <span className="text-[#60A5FA] block mt-1">
                that actually pays.
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-7 sm:mb-9 max-w-md">
              LASOP has trained 5,000+ students across Nigeria in software
              development, cybersecurity, AI, and data science — with real
              mentors and real career outcomes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(37,99,235,0.4)] text-sm sm:text-base"
              >
                Explore Courses
                <span>→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center text-slate-300 hover:text-white border border-white/15 hover:border-white/30 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}