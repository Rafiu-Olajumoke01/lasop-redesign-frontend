"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "../shared/Reveal";

export default function About() {
  return (
    <section className="relative bg-[#071224] py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Glow */}
      <div className="absolute right-0 top-0 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-blue-600/10 blur-[100px] sm:blur-[120px] rounded-full" />

      <div className="container-width relative z-10 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
          {/* LEFT IMAGE */}
          <Reveal>
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-[18px] sm:rounded-[22px] overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/lasop-study.jpg"
                  alt="LASOP students learning"
                  width={700}
                  height={800}
                  className="w-full h-[280px] sm:h-[420px] lg:h-[650px] object-cover"
                />
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-5 -right-3 sm:-bottom-8 sm:-right-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-md p-4 sm:p-6 shadow-xl">
                <h3 className="text-xl sm:text-3xl font-bold text-white">
                  17+
                </h3>

                <p className="text-slate-300 mt-1 text-xs sm:text-base">
                  Years of Excellence
                </p>
              </div>
            </div>
          </Reveal>

          {/* RIGHT CONTENT */}
          <Reveal delay={0.2}>
            <div className="mt-6 sm:mt-0">
              {/* Badge */}
              <span className="inline-flex px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-5 sm:mb-6">
                About LASOP
              </span>

              {/* Heading */}
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight">
                Empowering Students With
                <span className="text-[#5EA2FF] block">
                  Practical Skills
                </span>
              </h2>

              {/* Story */}
              <p className="text-slate-400 text-sm sm:text-md leading-7 sm:leading-8 mt-5 sm:mt-7">
                LASOP has spent years helping students gain
                practical, career-focused skills in technology,
                innovation, business and technical trades.
              </p>

              <p className="text-slate-400 text-sm sm:text-md leading-7 sm:leading-8 mt-4 sm:mt-5">
                Our mission is simple — equip students with
                relevant skills that create employment,
                entrepreneurship and long-term career growth.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    5K+
                  </h3>

                  <p className="text-slate-400 mt-2 text-sm sm:text-base">
                    Students Trained
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    10+
                  </h3>

                  <p className="text-slate-400 mt-2 text-sm sm:text-base">
                    Career Programs
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/about"
                className="inline-flex items-center justify-center mt-8 sm:mt-10 bg-[#0057E7] hover:bg-[#0A66FF] text-white px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,87,231,0.35)] text-sm sm:text-base w-full sm:w-auto"
              >
                Learn More About LASOP
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}