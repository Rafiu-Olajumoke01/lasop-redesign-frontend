import Reveal from "@/components/shared/Reveal";

import { FiCode, FiCpu, FiBriefcase, FiUsers } from "react-icons/fi";

const features = [
  {
    icon: <FiCode />,
    title: "Practical Learning",
    description: "Build real-world projects instead of learning only theory.",
  },
  {
    icon: <FiCpu />,
    title: "Industry-Relevant Skills",
    description:
      "Learn software development, AI, cybersecurity, automation, and more.",
  },
  {
    icon: <FiBriefcase />,
    title: "Career-Focused Programs",
    description:
      "Designed to help you build employable skills and business opportunities.",
  },
  {
    icon: <FiUsers />,
    title: "Experienced Mentors",
    description:
      "Learn directly from experienced instructors and professionals.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative bg-[#071224] py-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

      <Reveal>
        <div className="container-width relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-flex px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-6">
                Why LASOP?
              </span>

              <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                Why Students Choose
                <span className="text-[#5EA2FF] block">LASOP</span>
              </h2>

              <p className="text-slate-400 text-lg mt-6 leading-8 max-w-xl">
                We focus on practical, career-focused education that helps
                students build valuable technical skills, launch businesses, and
                secure better opportunities.
              </p>

              <button className="mt-8 bg-[#0057E7] hover:bg-[#0A66FF] text-white px-7 py-4 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,87,231,0.35)] cursor-pointer">
                Learn More
              </button>
            </div>

            {/* Right Content */}
            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((feature, index) => (
                <Reveal key={feature.title} delay={index * 0.1}>
                  <div
                    className="bg-white/5 border border-white/10 rounded-[28px] p-7 backdrop-blur-md hover:border-blue-500/40 hover:bg-blue-900/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-900/40 flex items-center justify-center text-blue-400 text-2xl mb-5">
                      {feature.icon}
                    </div>

                    <h3 className="text-md font-semibold text-white mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-slate-400 leading-7">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
