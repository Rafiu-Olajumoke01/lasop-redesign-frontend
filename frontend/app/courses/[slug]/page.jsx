import { courses } from "@/data/courses";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function CourseDetailsPage({ params }) {
  const { slug } = await params;

  const course = courses.find(
    (course) => course.slug === slug
  );

  if (!course) {
    notFound();
  }

  return (
    <main className="bg-[#071224] min-h-screen">
      <section className="pt-40 pb-20">
        <div className="container-width">

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                className="inline-block px-4 py-2 rounded-full bg-blue-900/30 text-blue-300 mb-6"
              >
                {course.category}
              </span>

              <h1
                className="text-5xl lg:text-6xl font-bold text-white"
              >
                {course.title}
              </h1>

              <p
                className="mt-6 text-slate-400 leading-8 text-lg"
              >
                {course.description}
              </p>

              <div className="flex gap-8 mt-8">

                <div>
                  <p className="text-slate-500">
                    Duration
                  </p>

                  <h3 className="text-white text-2xl font-bold">
                    {course.duration}
                  </h3>
                </div>

                <div>
                  <p className="text-slate-500">
                    Fee
                  </p>

                  <h3 className="text-white text-2xl font-bold">
                    {course.fee}
                  </h3>
                </div>

              </div>

            </div>

            <div
              className="relative h-[500px] rounded-[32px] overflow-hidden"
            >
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-width">

          <h2 className="text-4xl font-bold text-white mb-8">
            Course Overview
          </h2>

          <div
            className="bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <p className="text-slate-300 leading-8 text-lg">
              {course.overview}
            </p>
          </div>

        </div>
      </section>

      <section className="pb-24">
        <div className="container-width">

          <h2 className="text-4xl font-bold text-white mb-8">
            Skills You will Learn
          </h2>

          <div className="flex flex-wrap gap-4">

            {course.skills.map((skill) => (
              <span
                key={skill}
                className="px-5 py-3 rounded-full bg-blue-900/20 text-blue-300 border border-blue-500/20"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>
      </section>

      <section className="pb-24">
        <div className="container-width">

          <h2 className="text-4xl font-bold text-white mb-10">
            Course Curriculum
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {course.modules.map((module, index) => (
              <div
                key={module}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <span className="text-blue-400 font-bold">
                  Module {index + 1}
                </span>

                <h3 className="text-white mt-2 text-lg">
                  {module}
                </h3>
              </div>
            ))}

          </div>

        </div>
      </section>

      <section className="pb-24">
        <div className="container-width">

          <h2 className="text-4xl font-bold text-white mb-10">
            Career Opportunities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {course.outcomes.map((job) => (
              <div
                key={job}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold">
                  {job}
                </h3>
              </div>
            ))}

          </div>

        </div>
      </section>

      <section className="pb-24">
        <div className="container-width">

          <h2 className="text-4xl font-bold text-white mb-8">
            Requirements
          </h2>

          <div className="space-y-4">

            {course.requirements.map((item) => (
              <div
                key={item}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-300"
              >
                ✓ {item}
              </div>
            ))}

          </div>

        </div>
      </section>

      <section className="pb-24">
        <div className="container-width">

          <div
            className="rounded-[32px] bg-gradient-to-r from-[#0057E7] to-[#004AC6] p-12 text-center"
          >
            <h2 className="text-5xl font-bold text-white">
              Ready To Start Your Journey?
            </h2>

            <p className="text-blue-100 mt-4 max-w-2xl mx-auto">
              Join LASOP and gain the practical skills needed to build a successful career.
            </p>

            <button
              className="mt-8 bg-white text-[#0057E7] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition cursor-pointer"
            >
              Apply Now
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}