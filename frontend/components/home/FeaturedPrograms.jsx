"use client";

import Link from "next/link";
import Reveal from "../shared/Reveal";

const programs = [
  {
    title: "Full-stack Web Development & AI",
    duration: "6 Months",
    fee: "₦450K",
    description:
      "Learn React, JavaScript, Python, APIs and modern software development.",
  },
  {
    title: "Data Science",
    duration: "5 Months",
    fee: "₦450K",
    description: "Master data analytics, machine learning and visualization.",
  },
  {
    title: "Artificial Intelligence Engineering",
    duration: "4 Months",
    fee: "₦450K",
    description: "Build intelligent systems and practical AI solutions.",
  },
  {
    title: "Cyber Security",
    duration: "5 Months",
    fee: "₦450K",
    description: "Learn ethical hacking, system security and cyber defense.",
  },
  {
    title: "AI Automation",
    duration: "2 Months",
    fee: "₦250K",
    description: "Automate workflows and businesses using AI tools.",
  },
  {
    title: "Car Diagnosis & Programming",
    duration: "2 Months",
    fee: "₦250K",
    description: "Master modern vehicle diagnostics and programming.",
  },
];

export default function FeaturedPrograms() {
  return (
    <section className="relative bg-[#071224] py-28 overflow-hidden">
      {/* Glow */}
      <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="container-width relative z-10">
        {/* Heading */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-6">
              Programs
            </span>

            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              Explore Our
              <span className="text-[#5EA2FF] block">Featured Programs</span>
            </h2>

            <p className="text-slate-400 text-lg mt-6 leading-8">
              Career-focused programs designed to help students gain practical
              skills and thrive in today fast-changing world.
            </p>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {programs.map((program, index) => (
            <Reveal key={program.title} delay={index * 0.1}>
              <div
                className="h-full bg-white/5 border border-white/10 rounded-[18px] p-7 backdrop-blur-md hover:border-blue-500/40 hover:bg-blue-900/10 transition-all duration-300 hover:-translate-y-2 flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-blue-400 text-sm">
                    {program.duration}
                  </span>

                  <span className="text-white font-bold">{program.fee}</span>
                </div>

                <h3 className="text-xl font-semibold text-white leading-snug">
                  {program.title}
                </h3>

                <p className="text-slate-400 mt-4 leading-7 flex-grow">
                  {program.description}
                </p>

                <Link
                  href="/courses"
                  className="text-[#5EA2FF] font-medium mt-6 inline-block hover:translate-x-1 transition"
                >
                  Learn More
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal>
          <div className="flex justify-center mt-14">
            <Link
              href="/courses"
              className="
              bg-[#0057E7]
              hover:bg-[#0A66FF]
              text-white
              px-7 py-4
              rounded-xl
              font-semibold
              transition-all duration-300
              hover:-translate-y-1
              shadow-[0_12px_40px_rgba(0,87,231,0.35)]
              "
            >
              View All Programs
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
