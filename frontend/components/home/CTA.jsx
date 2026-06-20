"use client";

import Link from "next/link";
import Reveal from "../shared/Reveal";
import { FiArrowRight } from "react-icons/fi";

export default function CTA() {
  return (
    <section className="bg-[#071224] py-24">

      <div className="container-width">

        <Reveal>
          <div
            className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#0057E7] via-[#004ac6] to-[#003b9e] px-8 py-20 lg:px-20 text-center"
          >
            {/* Glow Effects */}

            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-300/20 blur-[120px] rounded-full" />

            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 blur-[120px] rounded-full" />

            {/* Content */}

            <div className="relative z-10 max-w-4xl mx-auto">

              <span
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6"
              >
                Take The Next Step
              </span>

              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Ready To Start
                <span className="block">
                  Your Journey?
                </span>
              </h2>

              <p
                className="text-blue-100 text-lg leading-8 mt-6 max-w-3xl mx-auto"
              >
                Whether you are looking to build a technology career,
                start a business, master AI, or learn practical vocational
                skills, LASOP provides the training, mentorship and support
                you need to succeed.
              </p>

              {/* Buttons */}

              <div
                className="flex flex-col md:flex-row justify-center gap-4 mt-10"
              >
                <Link
                  href="/courses"
                  className="bg-white text-[#0057E7] px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
                >
                  Explore Programs
                  <FiArrowRight />
                </Link>

                <Link
                  href="/webinar"
                  className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Attend Webinar
                </Link>

                <Link
                  href="/contact"
                  className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>

            </div>

          </div>
        </Reveal>

      </div>

    </section>
  );
}