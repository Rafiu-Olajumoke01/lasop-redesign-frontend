"use client";

import Image from "next/image";
import Reveal from "../shared/Reveal";

const stories = [
  {
    name: "Marvelous E.",
    role: "Frontend Engineer @ Fintech Hub",
    image: "/student2.PNG",
    skills: ["React", "JavaScript"],
    story:
      "LASOP didn't just teach me how to code; they taught me how to think like a builder. I moved from a clerical role to building financial platforms.",
  },
  {
    name: "Victoria N.",
    role: "Backend Developer @ Cloud Solutions",
    image: "/student1.jpg",
    skills: ["Python", "Django"],
    story:
      "The mentor support was the game changer for me. Solving complex logic problems became second nature through rigorous training.",
  },
  {
    name: "Grace A.",
    role: "Fullstack Developer @ Global Tech",
    image: "/student3.PNG",
    skills: ["Node.js", "Next.js"],
    story:
      "I went from zero coding knowledge to deploying full-stack applications. The community at LASOP accelerated my career growth.",
  },
];

export default function SuccessStories() {
  return (
    <section className="bg-[#071224] py-28">

      <div className="container-width">

        {/* Heading */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">

            <span className="inline-flex px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-6">
              Student Success Stories
            </span>

            <h2 className="text-5xl lg:text-6xl font-bold text-white">
              Real People.
              <span className="block text-[#5EA2FF]">
                Real Transformations.
              </span>
            </h2>

            <p className="text-slate-400 text-lg mt-6">
              Discover how LASOP students transformed
              their careers through practical learning.
            </p>

          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mt-20">

          {stories.map((story, index) => (
            <Reveal key={story.name} delay={index * 0.1}>

              <div className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden hover:-translate-y-3 hover:border-blue-500/40 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-[350px]">

                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover"
                  />

                  {/* Floating Card */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl"
                  >
                    <h3 className="font-bold text-lg text-[#004ac6]">
                      {story.name}
                    </h3>

                    <p className="text-sm text-slate-600">
                      {story.role}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-7">

                  {/* Skills */}
                  <div className="flex gap-2 flex-wrap mb-6">

                    {story.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-blue-900/20 text-blue-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))}

                  </div>

                  {/* Story */}
                  <p className="text-slate-300 leading-8 italic">
                    {`"${story.story}"`}
                  </p>

                </div>

              </div>

            </Reveal>
          ))}

        </div>

        {/* Stats Bar */}

        <Reveal>
          <div className="mt-20 grid grid-cols-3 bg-white/5 border border-white/10 rounded-[24px] overflow-hidden">

            <div className="text-center py-10 border-r border-white/10">
              <h3 className="text-4xl font-bold text-[#5EA2FF]">
                2500+
              </h3>

              <p className="text-slate-400 mt-2">
                Graduates
              </p>
            </div>

            <div className="text-center py-10 border-r border-white/10">
              <h3 className="text-4xl font-bold text-[#5EA2FF]">
                85%
              </h3>

              <p className="text-slate-400 mt-2">
                Job Placement
              </p>
            </div>

            <div className="text-center py-10">
              <h3 className="text-4xl font-bold text-[#5EA2FF]">
                100+
              </h3>

              <p className="text-slate-400 mt-2">
                Hiring Partners
              </p>
            </div>

          </div>
        </Reveal>

      </div>

    </section>
  );
}