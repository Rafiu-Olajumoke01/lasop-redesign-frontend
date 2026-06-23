"use client";

import { FiBookOpen, FiMonitor, FiBriefcase } from "react-icons/fi";
import Reveal from "../shared/Reveal";

const journey = [
  {
    icon: <FiBookOpen />,
    title: "Learn",
    description:
      "Gain practical knowledge from experienced instructors using a structured curriculum designed for real-world success.",
  },
  {
    icon: <FiMonitor />,
    title: "Study",
    description:
      "Build projects, participate in workshops, and receive mentorship that reinforces your learning experience.",
  },
  {
    icon: <FiBriefcase />,
    title: "Work",
    description:
      "Apply your skills in employment, freelancing, entrepreneurship, or further professional growth.",
  },
];

export default function LearnStudyWork() {
  return (
    <section className="relative bg-[#071224] py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-blue-600/10 blur-[100px] sm:blur-[120px] rounded-full" />

      <div className="container-width relative z-10 px-4 sm:px-6">
        {/* Heading */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-5 sm:mb-6">
              The LASOP Journey
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
              Learn.
              <span className="text-[#5EA2FF]"> Study.</span>
              <span className="block">Work.</span>
            </h2>

            <p className="text-slate-400 text-base sm:text-lg mt-5 sm:mt-6 leading-7 sm:leading-8">
              Our approach combines practical learning, project-based
              experience, and career-focused training to help students achieve
              meaningful outcomes.
            </p>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-12 sm:mt-16">
          {journey.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.15}>
              <div className="bg-white/5 border border-white/10 rounded-[20px] sm:rounded-[22px] p-6 sm:p-8 backdrop-blur-md hover:border-blue-500/40 hover:bg-blue-900/10 transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-900/40 flex items-center justify-center text-blue-400 text-2xl sm:text-3xl mb-5 sm:mb-6">
                  {item.icon}
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  {item.title}
                </h3>

                <p className="text-slate-400 leading-7 sm:leading-8 text-sm sm:text-base">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}